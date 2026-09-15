# Flytten

Prototyp: en webbsida som visar statistik över hur många miljardärer som
flyttar från Sverige, och vart de tar vägen.

**Status: genomförbarhetsstudie med exempeldata.** Siffrorna i `data/data.js`
är preliminära och ska faktagranskas innan publicering.

## Kör lokalt

Ingen byggkedja behövs – öppna `index.html` direkt i webbläsaren, eller:

```bash
python3 -m http.server 8000
# http://localhost:8000
```

Sajten är statisk och kan publiceras direkt på GitHub Pages.

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
index.html      # hela sajten – vanilla JS + SVG, ljust/mörkt läge
data/data.js    # kurerad dataset: nyckeltal + flytthändelser
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
5. **Publicera via GitHub Pages** när datan är granskad.
