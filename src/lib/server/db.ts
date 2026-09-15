// Databaslager. Läser DATABASE_URL från process.env (inte $env) så att modulen
// även kan importeras av jobben under jobs/ som körs utanför SvelteKit.
import postgres from 'postgres';
import { fall as seedFall, nyckeltal as seedNyckeltal, type Flytt, type Nyckeltal } from '../data';

export type FlyttStatus = 'kandidat' | 'publicerad' | 'avfardad';

export interface FlyttRad extends Flytt {
	id: number;
	status: FlyttStatus;
	skapad: string;
}

let sql: postgres.Sql | null = null;

/** Returnerar en delad klient, eller null när DATABASE_URL saknas (seed-läge i dev). */
export function getDb(): postgres.Sql | null {
	if (!process.env.DATABASE_URL) return null;
	if (!sql) {
		sql = postgres(process.env.DATABASE_URL, { max: 5, onnotice: () => {} });
	}
	return sql;
}

let schemaKlar: Promise<void> | null = null;

/** Idempotent: skapar tabellerna och seedar från src/lib/data.ts om de är tomma. */
export function ensureSchema(db: postgres.Sql): Promise<void> {
	schemaKlar ??= (async () => {
		await db`
			CREATE TABLE IF NOT EXISTS flytt (
				id SERIAL PRIMARY KEY,
				namn TEXT NOT NULL,
				bolag TEXT NOT NULL,
				ar INT NOT NULL,
				fran TEXT NOT NULL,
				till TEXT NOT NULL,
				aterflytt INT,
				kommentar TEXT NOT NULL DEFAULT '',
				kalla TEXT,
				verifierad BOOLEAN NOT NULL DEFAULT false,
				status TEXT NOT NULL DEFAULT 'publicerad'
					CHECK (status IN ('kandidat', 'publicerad', 'avfardad')),
				skapad TIMESTAMPTZ NOT NULL DEFAULT now(),
				UNIQUE (namn, ar, till)
			)`;
		await db`
			CREATE TABLE IF NOT EXISTS nyckeltal (
				id TEXT PRIMARY KEY,
				varde INT NOT NULL,
				etikett TEXT NOT NULL,
				kalla TEXT NOT NULL,
				url TEXT,
				noten TEXT NOT NULL DEFAULT '',
				uppdaterad TIMESTAMPTZ NOT NULL DEFAULT now()
			)`;

		const [{ antal }] = await db<[{ antal: string }]>`SELECT count(*)::text AS antal FROM flytt`;
		if (antal === '0') {
			for (const f of seedFall) {
				await db`
					INSERT INTO flytt (namn, bolag, ar, fran, till, aterflytt, kommentar, kalla, verifierad, status)
					VALUES (${f.namn}, ${f.bolag}, ${f.ar}, ${f.fran}, ${f.till}, ${f.aterflytt},
						${f.kommentar}, ${f.kalla}, ${f.verifierad}, 'publicerad')
					ON CONFLICT (namn, ar, till) DO NOTHING`;
			}
			for (const n of seedNyckeltal) {
				await db`
					INSERT INTO nyckeltal (id, varde, etikett, kalla, url, noten)
					VALUES (${n.id}, ${n.varde}, ${n.etikett}, ${n.kalla}, ${n.url}, ${n.not})
					ON CONFLICT (id) DO NOTHING`;
			}
		}
	})();
	return schemaKlar;
}

export async function hamtaPublicerade(db: postgres.Sql): Promise<FlyttRad[]> {
	const rader = await db<
		Array<Omit<FlyttRad, 'skapad'> & { skapad: Date }>
	>`SELECT id, namn, bolag, ar, fran, till, aterflytt, kommentar, kalla, verifierad, status, skapad
		FROM flytt WHERE status = 'publicerad' ORDER BY ar, namn`;
	return rader.map((r) => ({ ...r, skapad: r.skapad.toISOString() }));
}

export async function raknaKandidater(db: postgres.Sql): Promise<number> {
	const [{ antal }] = await db<[{ antal: string }]>`
		SELECT count(*)::text AS antal FROM flytt WHERE status = 'kandidat'`;
	return Number(antal);
}

export async function hamtaNyckeltal(db: postgres.Sql): Promise<Nyckeltal[]> {
	const rader = await db<
		Array<{ id: string; varde: number; etikett: string; kalla: string; url: string | null; noten: string }>
	>`SELECT id, varde, etikett, kalla, url, noten FROM nyckeltal ORDER BY id`;
	return rader.map((r) => ({ ...r, not: r.noten }));
}
