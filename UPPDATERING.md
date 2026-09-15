# Månatlig datauppdatering

Denna fil beskriver reglerna för den månatliga uppdateringen av datasetet.
Uppdateringen körs automatiskt av `jobs/uppdatering/` (Kubernetes CronJob,
`k8s/cronjob.yaml`): nyheter hämtas via Google News RSS, analyseras av
Claude enligt reglerna nedan (samma regler ligger i jobbets systemprompt),
och nya fall sparas i databasen med status `kandidat` tills en människa
granskat dem. Processen kan lika gärna följas manuellt.

## Syfte

Fånga upp nyrapporterade fall av svenska miljardärer som flyttat från
Sverige – särskilt flyttar som rapporteras vara en effekt av beskattning av
kapital (utdelningsskatt, 3:12-regler, exitskatt m.m.).

## Process

1. **Research.** Sök efter nyheter från de senaste ~6 veckorna, på svenska
   och engelska, t.ex.:
   - "miljardär flyttar utomlands", "miljardär lämnar Sverige"
   - "flyttar till Schweiz/Monaco/Portugal skatt"
   - "grundare folkbokförd utomlands", "exitskatt kapitalbeskattning flytt"
   - namn från Forbes svenska miljardärslista + "flytt"/"bosatt"
2. **Kvalitetskrav.** Endast rapporterade *genomförda* flyttar läggs in –
   aldrig spekulationer, uttalanden om att "överväga att flytta" eller
   rykten. `verifierad: true` sätts bara när uppgiften stöds av primärkälla
   eller minst två oberoende medier; annars `verifierad: false`.
3. **Spara som kandidater:** nya fall läggs i tabellen `flytt` med status
   `kandidat`, `verifierad = false` och `kalla` satt till artikelns URL.
   Kandidater visas inte på sajten.
4. **Granska och publicera** (människa):

   ```sql
   SELECT id, namn, bolag, ar, till, kommentar, kalla FROM flytt WHERE status = 'kandidat';
   UPDATE flytt SET status = 'publicerad', verifierad = true WHERE id = ...;  -- godkänn
   UPDATE flytt SET status = 'avfardad' WHERE id = ...;                       -- avfärda
   ```

5. **Nyckeltal:** uppdatera tabellen `nyckeltal` manuellt när nya årsupplagor
   av Forbes-listan eller Henley-rapporten publicerats (behåll källkritiken).

## Avgränsningar

- Definition tills vidare: person som brett omnämns som miljardär (SEK
  eller USD) i svensk affärspress eller står på Forbes-listan.
- Flytt = folkbokföring/stadigvarande bosättning utomlands, inte köp av
  fritidsbostad.
- Återflytt till Sverige registreras via `aterflytt`-fältet på den
  befintliga raden.
