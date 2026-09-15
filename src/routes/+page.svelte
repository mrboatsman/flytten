<script lang="ts">
	import type { PageData } from './$types';
	import KpiTile from '$lib/components/KpiTile.svelte';
	import ChartCard from '$lib/components/ChartCard.svelte';
	import DecadeChart from '$lib/components/DecadeChart.svelte';
	import DestChart from '$lib/components/DestChart.svelte';
	import CaseTable from '$lib/components/CaseTable.svelte';

	let { data }: { data: PageData } = $props();
	const fall = $derived(data.fall);
	const nyckeltal = $derived(data.nyckeltal);
</script>

<svelte:head>
	<title>Flytten</title>
	<meta
		name="description"
		content="Statistik över svenska miljardärer som flyttar utomlands – dokumenterade fall, destinationer och källkritik."
	/>
</svelte:head>

<main>
	<header>
		<h1>Flytten</h1>
		<p class="tagline">Hur många miljardärer lämnar Sverige – och vart tar de vägen?</p>
	</header>

	<div class="banner">
		<strong>Prototyp med exempeldata.</strong> Siffrorna nedan är preliminära och ska
		faktagranskas mot angivna källor innan publicering. Sidan demonstrerar koncept och
		datamodell, inte färdig statistik.
	</div>

	<div class="kpi-row">
		{#each nyckeltal as n}
			<KpiTile varde={n.varde} etikett={n.etikett} kalla={n.kalla} url={n.url} not={n.not} />
		{/each}
		<KpiTile
			varde={fall.length}
			etikett="dokumenterade flytthändelser i prototypens dataset"
			kalla="egen sammanställning"
		/>
	</div>

	<ChartCard
		title="Dokumenterade utflyttar per decennium"
		sub="Antal flytthändelser i prototypens kurerade dataset. En person kan förekomma flera gånger."
	>
		<DecadeChart {fall} />
	</ChartCard>

	<ChartCard title="Vart flyttar de?" sub="Destinationsländer i datasetet, flest först.">
		<DestChart {fall} />
	</ChartCard>

	<ChartCard
		title="Fallen i datasetet"
		sub="En rad per dokumenterad flytt. ”Ej verifierad” = brett rapporterad uppgift som ännu inte kontrollerats mot primärkälla."
	>
		<CaseTable {fall} />
	</ChartCard>

	<section class="card sources">
		<h2>Datakällor och källkritik</h2>
		<ul>
			<li>
				<strong>Forbes World's Billionaires</strong> – enda återkommande lista med bosättningsland
				per dollarmiljardär. Kan följas årligen för att räkna svenskar bosatta i respektive
				utanför Sverige.
				<a href="https://www.forbes.com/billionaires/">forbes.com/billionaires</a>
			</li>
			<li>
				<strong>Henley Private Wealth Migration Report</strong> – publicerar nettoflöden av
				dollarmiljonärer per land (Sverige: −50 prognos för 2025). Obs: gäller
				<em>miljonärer</em>, inte miljardärer, och metodiken har kritiserats av
				<a
					href="https://taxjustice.net/press/millionaire-exodus-claim-backtracked-but-media-re-run-story-anyway/"
					>Tax Justice Network</a
				>
				och
				<a href="https://taxpolicy.org.uk/2025/07/27/henley-partners-millionaire-migration-report-analysis/"
					>Tax Policy Associates</a
				>. Bör redovisas med tydlig brasklapp.
			</li>
			<li>
				<strong>SCB</strong> – har utvandringsstatistik per år och destinationsland, men
				<em>inte</em> nedbruten på förmögenhet. Kan ge kontext men inte svara på huvudfrågan.
			</li>
			<li>
				<strong>Akademisk forskning</strong> – t.ex.
				<a href="https://www.nber.org/system/files/working_papers/w32153/w32153.pdf"
					>NBER w32153, ”Taxing Top Wealth: Migration Responses”</a
				>
				(skandinaviska registerdata) för evidensläget kring skattedriven utflytt.
			</li>
			<li>
				<strong>Kurerad falldatabas</strong> (denna sida) – för just miljardärer är gruppen så
				liten (~45 svenskar på Forbeslistan) att den bästa metoden är att följa varje individ:
				namn, år, destination, källa. Det är så här sidan är byggd.
			</li>
		</ul>
	</section>

	<footer>
		{#if data.kandidater > 0}
			{data.kandidater} kandidat{data.kandidater === 1 ? '' : 'er'} väntar på granskning innan publicering. ·
		{/if}
		Datakälla: {data.datakalla === 'databas' ? 'databas' : 'exempeldata (ingen databas ansluten)'} ·
		Uppdaterad {data.uppdaterad}.
	</footer>
</main>

<style>
	main {
		max-width: 880px;
		margin: 0 auto;
		padding-block: 40px 64px;
	}
	h1 {
		font-size: 28px;
		margin: 0 0 4px;
		letter-spacing: -0.01em;
	}
	.tagline {
		color: var(--text-secondary);
		margin: 0 0 8px;
		font-size: 15px;
	}
	.banner {
		background: var(--warn-bg);
		border-left: 3px solid var(--warn-border);
		border-radius: 6px;
		padding: 10px 14px;
		margin: 20px 0 28px;
		color: var(--text-secondary);
		font-size: 13px;
	}
	.banner strong {
		color: var(--text-primary);
	}
	.kpi-row {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		margin-bottom: 28px;
	}
	.card {
		background: var(--surface-1);
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 20px 22px;
		margin-bottom: 24px;
	}
	.sources h2 {
		font-size: 16px;
		margin: 0 0 2px;
	}
	.sources ul {
		padding-left: 18px;
		margin: 8px 0 0;
		color: var(--text-secondary);
	}
	.sources li {
		margin-bottom: 8px;
	}
	.sources a {
		color: var(--series-1);
	}
	footer {
		color: var(--text-muted);
		font-size: 12px;
		margin-top: 32px;
	}
</style>
