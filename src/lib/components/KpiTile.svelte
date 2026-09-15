<script lang="ts">
	let {
		varde,
		etikett,
		kalla,
		url = null,
		not = ''
	}: {
		varde: number;
		etikett: string;
		kalla: string;
		url?: string | null;
		not?: string;
	} = $props();
</script>

<div class="tile">
	<div class="value">{varde < 0 ? `−${Math.abs(varde)}` : varde}</div>
	<div class="label">{etikett}</div>
	<div class="source">
		{#if url}<a href={url}>{kalla}</a>{:else}{kalla}{/if}{#if not}
			· {not}{/if}
	</div>
</div>

<style>
	.tile {
		flex: 1 1 220px;
		background: var(--surface-1);
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 16px 18px;
	}
	.value {
		font-size: 34px;
		font-weight: 650;
		line-height: 1.1;
	}
	.label {
		color: var(--text-secondary);
		font-size: 13px;
		margin-top: 4px;
	}
	.source {
		color: var(--text-muted);
		font-size: 12px;
		margin-top: 8px;
	}
	.source a {
		color: inherit;
	}
</style>
