<script lang="ts">
	import type { Flytt } from '$lib/data';

	let { fall }: { fall: Flytt[] } = $props();

	const sorted = $derived([...fall].sort((a, b) => a.ar - b.ar));
</script>

<div class="table-scroll">
	<table>
		<thead>
			<tr><th>Person</th><th>År</th><th>Till</th><th>Kommentar</th><th>Källa</th><th>Status</th></tr>
		</thead>
		<tbody>
			{#each sorted as f}
				<tr>
					<td>{f.namn}<div class="company">{f.bolag}</div></td>
					<td class="num">{f.ar}</td>
					<td>
						{f.till}
						{#if f.aterflytt}<div class="company">åter {f.aterflytt}</div>{/if}
					</td>
					<td>{f.kommentar}</td>
					<td>
						{#if f.kalla}<a href={f.kalla}>källa</a>{:else}<span class="none">–</span>{/if}
					</td>
					<td><span class="flag">{f.verifierad ? 'Verifierad' : 'Ej verifierad'}</span></td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.table-scroll {
		overflow-x: auto;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 13px;
	}
	th {
		text-align: left;
		color: var(--text-muted);
		font-weight: 550;
		padding: 6px 10px 6px 0;
		border-bottom: 1px solid var(--baseline);
		font-size: 12px;
	}
	td {
		padding: 8px 10px 8px 0;
		border-bottom: 1px solid var(--grid);
		vertical-align: top;
	}
	td.num {
		font-variant-numeric: tabular-nums;
	}
	.company {
		color: var(--text-muted);
		font-size: 12px;
	}
	td a {
		color: var(--series-1);
	}
	.none {
		color: var(--text-muted);
	}
	.flag {
		display: inline-block;
		font-size: 11px;
		color: var(--text-muted);
		border: 1px solid var(--border);
		border-radius: 999px;
		padding: 1px 8px;
		white-space: nowrap;
	}
</style>
