// Kurerad dataset för prototypen "Flytten".
//
// VIKTIGT: Detta är en PRELIMINÄR dataset som demonstrerar konceptet.
// Varje post är baserad på brett rapporterade uppgifter men ska verifieras
// mot angiven källa (fältet `verifierad`) innan publicering.
//
// Datamodellen är medvetet enkel: en rad per person och flytt-händelse.
// En person som flyttat ut och senare tillbaka får `aterflytt`-fält.

window.FLYTTEN_DATA = {
  meta: {
    uppdaterad: "2026-09-15",
    status: "prototyp – exempeldata, ej faktagranskad",
    beskrivning:
      "Dokumenterade fall där svenska miljardärer (SEK eller USD) folkbokfört sig utomlands.",
  },

  // Nyckeltal från externa källor (med källkritik i `not`).
  nyckeltal: [
    {
      id: "forbes-antal",
      varde: 45,
      etikett: "svenskar på Forbes dollarmiljardärslista 2025",
      kalla: "Forbes World's Billionaires 2025",
      url: "https://www.forbes.com/billionaires/",
      not: "Inkluderar svenskar bosatta utomlands.",
    },
    {
      id: "henley-netto",
      varde: -50,
      etikett: "nettoutflöde av dollarmiljonärer från Sverige 2025 (prognos)",
      kalla: "Henley Private Wealth Migration Report 2025",
      url: "https://www.henleyglobal.com/publications/henley-private-wealth-migration-report-2025",
      not: "Avser miljonärer (USD 1M+), inte miljardärer. Metodiken är ifrågasatt av bl.a. Tax Justice Network.",
    },
  ],

  // En rad per dokumenterad utflytt. `verifierad: false` = uppgiften är
  // brett rapporterad men ännu inte kontrollerad mot primärkälla.
  fall: [
    {
      namn: "Ingvar Kamprad",
      bolag: "IKEA",
      ar: 1973,
      fran: "Sverige",
      till: "Danmark",
      aterflytt: null,
      kommentar: "Flyttade vidare till Schweiz 1976; återvände till Sverige 2014.",
      verifierad: false,
    },
    {
      namn: "Ingvar Kamprad",
      bolag: "IKEA",
      ar: 1976,
      fran: "Danmark",
      till: "Schweiz",
      aterflytt: 2014,
      kommentar: "Bodde i Epalinges i nära 40 år. Flyttade hem till Småland 2014.",
      verifierad: false,
    },
    {
      namn: "Hans Rausing",
      bolag: "Tetra Pak",
      ar: 1982,
      fran: "Sverige",
      till: "Storbritannien",
      aterflytt: null,
      kommentar: "Bosatte sig i East Sussex. Ofta citerat exempel i förmögenhetsskattedebatten.",
      verifierad: false,
    },
    {
      namn: "Gad Rausing",
      bolag: "Tetra Pak",
      ar: 1984,
      fran: "Sverige",
      till: "Storbritannien",
      aterflytt: null,
      kommentar: "Flyttade till London under 1980-talet.",
      verifierad: false,
    },
    {
      namn: "Bertil Hult",
      bolag: "EF Education First",
      ar: 1993,
      fran: "Sverige",
      till: "Schweiz",
      aterflytt: null,
      kommentar: "Bosatt i Luzern. Årtalet ungefärligt – verifiera.",
      verifierad: false,
    },
    {
      namn: "Frederik Paulsen",
      bolag: "Ferring Pharmaceuticals",
      ar: 1996,
      fran: "Sverige",
      till: "Schweiz",
      aterflytt: null,
      kommentar: "Bosatt i Lausanne. Årtalet ungefärligt – verifiera.",
      verifierad: false,
    },
    {
      namn: "Roger Akelius",
      bolag: "Akelius Fastigheter",
      ar: 1994,
      fran: "Sverige",
      till: "Bahamas",
      aterflytt: null,
      kommentar: "Senare bosatt på Cypern. Årtal och länder ska verifieras.",
      verifierad: false,
    },
    {
      namn: "Jan Stenbeck",
      bolag: "Kinnevik",
      ar: 1985,
      fran: "Sverige",
      till: "Luxemburg",
      aterflytt: null,
      kommentar: "Bosatt i Luxemburg och New York. Årtalet ungefärligt – verifiera.",
      verifierad: false,
    },
  ],
};
