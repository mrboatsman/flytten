<script lang="ts">
	import type { TipState } from '$lib/tip';

	let { tip }: { tip: TipState | null } = $props();
</script>

{#if tip}
	<div class="tooltip" style:left="{tip.x}px" style:top="{tip.y}px">
		{tip.text}: <strong>{tip.varde}</strong>
	</div>
{/if}

<style>
	.tooltip {
		position: absolute;
		pointer-events: none;
		background: var(--surface-1);
		border: 1px solid var(--border);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
		border-radius: 6px;
		padding: 6px 10px;
		font-size: 12px;
		color: var(--text-primary);
		white-space: nowrap;
	}
</style>
