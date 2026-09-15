# Flytten

Prototyp: en webbsida som visar statistik över hur många miljardärer som
flyttar från Sverige, och vart de tar vägen.

**Status: genomförbarhetsstudie med exempeldata.** Siffrorna i
`src/lib/data.ts` är preliminära och ska faktagranskas innan publicering.

## Arkitektur

Allt är [SvelteKit](https://svelte.dev/docs/kit) (Svelte 5 + TypeScript) och
byggt för att köras i Kubernetes med FluxCD:

```
┌─────────────────┐     ┌────────────┐     ┌──────────────────────────┐
│ SvelteKit-webb   │ ←→ │  Postgres  │ ←─  │ CronJob (månadsvis)       │
│ adapter-node,    │     │            │     │ Google News RSS → Claude  │
│ Docker           │     │            │     │ → nya fall som kandidater │
└─────────────────┘     └────────────┘     └──────────────────────────┘
```

- **Webben** (`src/`) läser publicerade fall ur Postgres vid varje anrop
  (`src/routes/+page.server.ts` → `src/lib/server/db.ts`). Utan
  `DATABASE_URL` faller den tillbaka på seed-datat i `src/lib/data.ts`.
- **Databasen** seedas automatiskt från `src/lib/data.ts` när tabellerna är
  tomma; därefter är databasen sanningskällan.
- **Uppdateringsjobbet** (`jobs/uppdatering/`) hämtar nyheter via Google
  News RSS, låter Claude (Anthropic API) extrahera rapporterade genomförda
  flyttar enligt reglerna i `UPPDATERING.md`, och sparar dem med status
  `kandidat`. Kandidater visas inte på sajten förrän de granskats och
  publicerats.

### Lokal utveckling

```bash
npm install
npm run dev                # utan databas – serverar seed-data
docker compose up --build  # med Postgres, som i produktion
npm run check              # typkontroll (svelte-check)
npm run jobb:uppdatering   # kör månadsjobbet manuellt (kräver DATABASE_URL + ANTHROPIC_API_KEY)
```

### Deploy (k8s + FluxCD)

Manifest i `k8s/` (namespace, Postgres, webb-deployment, månatligt CronJob)
med `kustomization.yaml` – peka en Flux `Kustomization` mot katalogen.
Skapa secreten `flytten` (se `k8s/secret.example.yaml`) med SOPS eller
Sealed Secrets: `POSTGRES_PASSWORD`, `DATABASE_URL`, `ANTHROPIC_API_KEY`.
Container-imagen byggs till `ghcr.io/mrboatsman/flytten` av
`.github/workflows/image.yml` vid push till `main`.

## Går det att bygga? Ja – med rätt metod

Det finns **ingen färdig officiell statistik** över just miljardärers
utflyttning från Sverige. SCB har utvandringsdata per år och land, men inte
nedbruten på förmögenhet. Det som finns är:

| Källa | Vad den ger | Begränsning |
|---|---|---|
| [Forbes World's Billionaires](https://www.forbes.com/billionaires/) | Årlig lista med bosättningsland per dollarmiljardär (~45 svenskar 2025) | Endast USD-miljardärer; kräver årlig manuell/skriptad avstämning |
| [Henley Private Wealth Migration Report](https://www.henleyglobal.com/publications/henley-private-wealth-migration-report-2025) | Nettoflöden av dollar**miljonärer** per land (Sverige: −50 prognos 2025) | Gäller miljonärer, inte miljardärer; metodiken kritiserad av [Tax Justice Network](https://taxjustice.net/press/millionaire-exodus-claim-backtracked-but-media-re-run-story-anyway/) och [Tax Policy Associates](https://taxpolicy.org.uk/2025/07/27/henley-partners-millionaire-migration-report-analysis/) |
| SCB utvandringsstatistik | Kontext: total utvandring per destinationsland | Ingen förmögenhetsdimension |
| Akademisk forskning, t.ex. [NBER w32153](https://www.nber.org/system/files/working_papers/w32153/w32153.pdf) | Evidens om skattedriven migration bland förmögna (skandinaviska registerdata) | Forskningsresultat, inte löpande statistik |
| Svenska miljardärslistor (Forbes-baserade sammanställningar, affärspress) | Namn i SEK-miljardärssegmentet | Spretiga definitioner, ingen systematisk flyttdata |

**Slutsats:** eftersom gruppen är liten (tiotals personer) är den bästa
metoden en **kurerad falldatabas** – en rad per person och flytthändelse med
år, destination, källa och verifieringsstatus. Det är så prototypen är byggd.
Aggregat (per decennium, per destinationsland) beräknas automatiskt från
falldatan.

## Struktur

```
src/lib/data.ts               # kurerad dataset: nyckeltal + flytthändelser
src/routes/+page.svelte       # sidan: KPI:er, diagram, falltabell, källkritik
src/lib/components/
  KpiTile.svelte              # nyckeltalsruta
  ChartCard.svelte            # kortram för diagram/sektioner
  DecadeChart.svelte          # kolumndiagram: flyttar per decennium (SVG)
  DestChart.svelte            # liggande staplar: destinationsländer (SVG)
  CaseTable.svelte            # tabell över fallen
  Tooltip.svelte              # hover-tooltip för diagrammen
```

Diagrammen är handskriven SVG utan diagrambibliotek, med stöd för ljust och
mörkt läge via CSS-tokens i `src/app.css`.

## Månatlig uppdatering

CronJobbet i `k8s/cronjob.yaml` kör `jobs/uppdatering/` den 1:a varje månad:
nyheter hämtas, analyseras av Claude enligt kvalitetsreglerna i
[UPPDATERING.md](UPPDATERING.md), och nya fall sparas som **kandidater** i
databasen. Granska och publicera:

```sql
SELECT id, namn, bolag, ar, till, kommentar, kalla FROM flytt WHERE status = 'kandidat';
UPDATE flytt SET status = 'publicerad', verifierad = true WHERE id = ...;  -- godkänn
UPDATE flytt SET status = 'avfardad' WHERE id = ...;                       -- avfärda
```

## Nästa steg

1. **Faktagranska datasetet** – varje rad har `verifierad: false` tills den
   kontrollerats mot primärkälla (biografi, nyhetsarkiv, folkbokföring).
   Lägg till käll-URL per rad.
2. **Komplettera med nutida fall** (2010–2020-tal) – prototypens exempel är
   historiska; de senaste årens flyttar behöver research.
3. **Årlig Forbes-avstämning** – skript som räknar svenskar på listan och hur
   många som är bosatta utomlands, för en trendserie över tid.
4. **Beslut om definition** – USD-miljardär (Forbes) eller SEK-miljardär
   (mycket större grupp, sämre data)?
5. **Publicera via GitHub Pages** när datan är granskad
   (`npm run build` + deploy av `build/`).
