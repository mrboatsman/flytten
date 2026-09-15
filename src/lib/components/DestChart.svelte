<script lang="ts">
	import { countBy, type Flytt } from '$lib/data';
	import Tooltip from './Tooltip.svelte';
	import type { TipState } from '$lib/tip';

	let { fall }: { fall: Flytt[] } = $props();

	const W = 840;
	const padL = 118;
	const rowH = 30;
	const barH = 16;
	const plotW = W - padL - 40;

	const rows = $derived(
		[...countBy(fall, (f) => f.till).entries()]
			.map(([land, n]) => ({ land: String(land), n }))
			.sort((a, b) => b.n - a.n || a.land.localeCompare(b.land, 'sv'))
	);
	const max = $derived(Math.max(...rows.map((r) => r.n)));
	const H = $derived(rows.length * rowH + 8);

	let wrap: HTMLDivElement;
	let tip = $state<TipState | null>(null);

	function barPath(y: number, w: number): string {
		const r = Math.min(4, w);
		return `M${padL},${y} H${padL + w - r} Q${padL + w},${y} ${padL + w},${y + r} V${y + barH - r} Q${padL + w},${y + barH} ${padL + w - r},${y + barH} H${padL} Z`;
	}

	function showTip(e: MouseEvent, land: string, n: number) {
		const rect = wrap.getBoundingClientRect();
		tip = {
			text: land,
			varde: n,
			x: Math.min(e.clientX - rect.left + 12, wrap.clientWidth - 160),
			y: e.clientY - rect.top - 34
		};
	}
</script>

<div class="chart-wrap" bind:this={wrap}>
	<svg viewBox="0 0 {W} {H}" role="img" aria-label="Stapeldiagram över destinationsländer">
		<line x1={padL} x2={padL} y1={0} y2={H - 4} class="axisline" />
		{#each rows as r, i}
			{@const y = i * rowH + 6}
			{@const w = (r.n / max) * plotW}
			<text x={padL - 10} y={y + barH - 3} text-anchor="end" class="barlabel">{r.land}</text>
			<path
				class="bar"
				d={barPath(y, w)}
				onmousemove={(e) => showTip(e, r.land, r.n)}
				onmouseleave={() => (tip = null)}
				role="presentation"
			/>
			<text x={padL + w + 8} y={y + barH - 3} class="barlabel">{r.n}</text>
		{/each}
	</svg>
	<Tooltip {tip} />
</div>

<style>
	.chart-wrap {
		position: relative;
	}
	svg {
		display: block;
		width: 100%;
		height: auto;
	}
	.bar {
		fill: var(--series-1);
	}
	.bar:hover {
		opacity: 0.85;
	}
	.axisline {
		stroke: var(--baseline);
		stroke-width: 1;
	}
	.barlabel {
		fill: var(--text-secondary);
		font-size: 11px;
		font-family: inherit;
	}
</style>
