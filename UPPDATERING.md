# Månatlig datauppdatering

Denna fil är instruktionen för den schemalagda månadsuppdateringen av
datasetet. Den körs av en Claude-session en gång i månaden, men kan lika
gärna följas manuellt.

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
3. **Uppdatera `src/lib/data.ts`:**
   - Nya rader i `fall` enligt befintligt format (en rad per person och
     flytthändelse). Fyll alltid i `kalla` med URL till bästa källa.
   - Uppdatera `nyckeltal` om nya årsupplagor av Forbes-listan eller Henley
     Private Wealth Migration Report publicerats (behåll källkritiken i
     `not`-fältet).
   - Sätt `meta.uppdaterad` till dagens datum.
4. **Validera:** `npm install && npm run check && npm run build` ska gå
   igenom utan fel.
5. **Leverera:** committa på en gren `data-update-ÅÅÅÅ-MM` och öppna en
   pull request mot grenen där sajten ligger, med en kort sammanfattning av
   nya fall och deras källor. Om inget nytt hittats: ingen commit, ingen PR.

## Avgränsningar

- Definition tills vidare: person som brett omnämns som miljardär (SEK
  eller USD) i svensk affärspress eller står på Forbes-listan.
- Flytt = folkbokföring/stadigvarande bosättning utomlands, inte köp av
  fritidsbostad.
- Återflytt till Sverige registreras via `aterflytt`-fältet på den
  befintliga raden.
