// Månatligt uppdateringsjobb. Körs som Kubernetes CronJob (se k8s/cronjob.yaml)
// eller manuellt med `npm run jobb:uppdatering`.
//
// Flöde:
//   1. Hämta nyhetskandidater via Google News RSS (svenska + engelska sökningar).
//   2. Låt Claude analysera artiklarna mot de hårda reglerna i UPPDATERING.md
//      och extrahera endast rapporterade GENOMFÖRDA flyttar.
//   3. Spara nya fall i databasen med status 'kandidat' – de publiceras på
//      sajten först efter manuell granskning (UPDATE flytt SET status='publicerad').
//
// Kräver env: DATABASE_URL, ANTHROPIC_API_KEY. Valfritt: ANTHROPIC_MODEL.

import { pathToFileURL } from 'node:url';
import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { XMLParser } from 'fast-xml-parser';
import { z } from 'zod';
import { getDb, ensureSchema } from '../../src/lib/server/db';

const MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-opus-5';
const MAX_ARTIKLAR = 50;
const MAX_ALDER_DAGAR = 45;

const SOKNINGAR = [
	'miljardär flyttar utomlands',
	'miljardär lämnar Sverige',
	'miljardär flyttar Schweiz skatt',
	'grundare folkbokförd utomlands skatt',
	'entreprenör lämnar Sverige kapitalbeskattning',
	'Swedish billionaire leaves Sweden tax'
];

interface Artikel {
	titel: string;
	url: string;
	publicerad: string;
	kalla: string;
}

const KandidatSchema = z.object({
	fall: z.array(
		z.object({
			namn: z.string(),
			bolag: z.string(),
			ar: z.number().int(),
			fran: z.string(),
			till: z.string(),
			kommentar: z.string(),
			kalla: z.string(),
			sakerhet: z.enum(['hog', 'lag'])
		})
	),
	sammanfattning: z.string()
});

export async function hamtaArtiklar(): Promise<Artikel[]> {
	const parser = new XMLParser();
	const perUrl = new Map<string, Artikel>();
	const aldsta = Date.now() - MAX_ALDER_DAGAR * 24 * 3600 * 1000;

	for (const sokning of SOKNINGAR) {
		const url =
			'https://news.google.com/rss/search?q=' +
			encodeURIComponent(sokning) +
			'&hl=sv&gl=SE&ceid=SE:sv';
		try {
			const svar = await fetch(url, { headers: { 'user-agent': 'flytten-uppdatering/1.0' } });
			if (!svar.ok) {
				console.warn(`RSS-sökning "${sokning}" gav HTTP ${svar.status} – hoppar över.`);
				continue;
			}
			const xml = parser.parse(await svar.text());
			const poster = xml?.rss?.channel?.item ?? [];
			for (const post of Array.isArray(poster) ? poster : [poster]) {
				const publicerad = new Date(post.pubDate ?? 0);
				if (publicerad.getTime() < aldsta) continue;
				perUrl.set(post.link, {
					titel: String(post.title ?? ''),
					url: String(post.link ?? ''),
					publicerad: publicerad.toISOString().slice(0, 10),
					kalla: String(post.source?.['#text'] ?? post.source ?? 'okänd')
				});
			}
		} catch (fel) {
			console.warn(`RSS-sökning "${sokning}" misslyckades:`, fel);
		}
	}
	return [...perUrl.values()]
		.sort((a, b) => b.publicerad.localeCompare(a.publicerad))
		.slice(0, MAX_ARTIKLAR);
}

async function analysera(artiklar: Artikel[], befintliga: string[]) {
	const client = new Anthropic();

	const system = `Du underhåller en faktadatabas över svenska miljardärer (SEK eller USD)
som flyttat från Sverige. Du får en lista med nyhetsrubriker och ska extrahera
NYA fall enligt dessa hårda regler:

- Endast rapporterade GENOMFÖRDA flyttar (folkbokföring/stadigvarande bosättning
  utomlands). Aldrig spekulationer, planer eller uttalanden om att "överväga att flytta".
- Endast personer som brett omnämns som miljardärer i affärspress eller står på
  Forbes-listan. Köp av fritidsbostad räknas inte.
- Hoppa över personer som redan finns i databasen (lista följer).
- sakerhet: "hog" bara när rubriken/källan otvetydigt rapporterar en genomförd
  flytt av en namngiven miljardär; annars "lag". Vid minsta tvekan: ta inte med fallet.
- kalla: URL:en till artikeln. ar: året flytten rapporteras ha skett (eller
  publiceringsåret om oklart). fran är normalt "Sverige".
- Svara med tom fall-lista om inget kvalificerar – det är ett helt normalt utfall.
- sammanfattning: 2–4 meningar på svenska om vad du hittade respektive valde bort och varför.`;

	const underlag =
		`Befintliga personer i databasen (hoppa över dessa):\n${befintliga.join(', ') || '(inga)'}\n\n` +
		`Nyhetsrubriker (titel | källa | datum | url):\n` +
		artiklar.map((a) => `- ${a.titel} | ${a.kalla} | ${a.publicerad} | ${a.url}`).join('\n');

	const svar = await client.messages.parse({
		model: MODEL,
		max_tokens: 16000,
		system,
		messages: [{ role: 'user', content: underlag }],
		output_config: { format: zodOutputFormat(KandidatSchema) }
	});

	if (svar.stop_reason === 'refusal') {
		throw new Error(`Modellen avböjde analysen: ${svar.stop_details?.explanation ?? 'okänd orsak'}`);
	}
	if (!svar.parsed_output) {
		throw new Error('Kunde inte tolka modellens svar som strukturerad output.');
	}
	return svar.parsed_output;
}

async function main() {
	const db = getDb();
	if (!db) throw new Error('DATABASE_URL saknas – jobbet kräver en databas.');
	await ensureSchema(db);

	const artiklar = await hamtaArtiklar();
	console.log(`Hittade ${artiklar.length} artiklar från de senaste ${MAX_ALDER_DAGAR} dagarna.`);
	if (artiklar.length === 0) {
		console.log('Inget att analysera denna månad.');
		await db.end();
		return;
	}

	const befintliga = await db<Array<{ namn: string }>>`SELECT DISTINCT namn FROM flytt`;
	const resultat = await analysera(
		artiklar,
		befintliga.map((r) => r.namn)
	);
	console.log(`Analys: ${resultat.sammanfattning}`);

	let nya = 0;
	for (const f of resultat.fall) {
		const inserted = await db`
			INSERT INTO flytt (namn, bolag, ar, fran, till, kommentar, kalla, verifierad, status)
			VALUES (${f.namn}, ${f.bolag}, ${f.ar}, ${f.fran}, ${f.till},
				${f.kommentar + (f.sakerhet === 'lag' ? ' [AI: låg säkerhet]' : '')},
				${f.kalla}, false, 'kandidat')
			ON CONFLICT (namn, ar, till) DO NOTHING
			RETURNING id`;
		if (inserted.length > 0) {
			nya++;
			console.log(`Ny kandidat: ${f.namn} (${f.bolag}) → ${f.till} ${f.ar} [${f.sakerhet}]`);
		}
	}
	console.log(
		nya === 0
			? 'Inga nya kandidater denna månad.'
			: `${nya} nya kandidater sparade med status 'kandidat'. Granska och publicera med: UPDATE flytt SET status='publicerad' WHERE id=...;`
	);
	await db.end();
}

// Kör bara main när filen exekveras direkt (inte vid import i test).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	main().catch((fel) => {
		console.error('Uppdateringsjobbet misslyckades:', fel);
		process.exit(1);
	});
}
