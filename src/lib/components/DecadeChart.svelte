<script lang="ts">
	import { countBy, type Flytt } from '$lib/data';
	import Tooltip from './Tooltip.svelte';
	import type { TipState } from '$lib/tip';

	let { fall }: { fall: Flytt[] } = $props();

	const W = 840;
	const H = 220;
	const padL = 28;
	const padB = 26;
	const padT = 12;
	const plotW = W - padL - 8;
	const plotH = H - padT - padB;

	const byDecade = $derived(countBy(fall, (f) => Math.floor(f.ar / 10) * 10));
	// fyll igen tomma decennier så tidsaxeln blir ärlig
	const decades = $derived.by(() => {
		const ds = [...byDecade.keys()].map(Number).sort((a, b) => a - b);
		const all: number[] = [];
		for (let d = ds[0]; d <= ds[ds.length - 1]; d += 10) all.push(d);
		return all;
	});
	const max = $derived(Math.max(...decades.map((d) => byDecade.get(d) ?? 0)));
	const slot = $derived(plotW / decades.length);
	const barW = $derived(Math.min(48, slot * 0.55));

	let wrap: HTMLDivElement;
	let tip = $state<TipState | null>(null);

	function barPath(x: number, y: number, w: number, bottom: number): string {
		const r = Math.min(4, bottom - y);
		return `M${x},${bottom} V${y + r} Q${x},${y} ${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${bottom} Z`;
	}

	function showTip(e: MouseEvent, d: number, v: number) {
		const rect = wrap.getBoundingClientRect();
		tip = {
			text: `${d}-talet`,
			varde: v,
			x: Math.min(e.clientX - rect.left + 12, wrap.clientWidth - 160),
			y: e.clientY - rect.top - 34
		};
	}
</script>

<div class="chart-wrap" bind:this={wrap}>
	<svg
		viewBox="0 0 {W} {H}"
		role="img"
		aria-label="Kolumndiagram över antal dokumenterade utflyttar per decennium"
	>
		{#each { length: max + 1 } as _, g}
			{@const gy = padT + plotH - (g / max) * plotH}
			<line x1={padL} x2={W - 8} y1={gy} y2={gy} class={g === 0 ? 'axisline' : 'gridline'} />
			<text x={padL - 8} y={gy + 4} text-anchor="end" class="ticktext">{g}</text>
		{/each}
		{#each decades as d, i}
			{@const v = byDecade.get(d) ?? 0}
			{@const x = padL + slot * i + (slot - barW) / 2}
			{@const y = padT + plotH - (v / max) * plotH}
			{#if v > 0}
				<path
					class="bar"
					d={barPath(x, y, barW, padT + plotH)}
					onmousemove={(e) => showTip(e, d, v)}
					onmouseleave={() => (tip = null)}
					role="presentation"
				/>
				<text x={x + barW / 2} y={y - 6} text-anchor="middle" class="barlabel">{v}</text>
			{/if}
			<text x={padL + slot * i + slot / 2} y={H - 8} text-anchor="middle" class="ticktext">
				{d}-tal
			</text>
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
	.gridline {
		stroke: var(--grid);
		stroke-width: 1;
	}
	.axisline {
		stroke: var(--baseline);
		stroke-width: 1;
	}
	.ticktext {
		fill: var(--text-muted);
		font-size: 11px;
		font-family: inherit;
	}
	.barlabel {
		fill: var(--text-secondary);
		font-size: 11px;
		font-family: inherit;
	}
</style>
