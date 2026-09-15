<script lang="ts">
	import type { Snippet } from 'svelte';

	let { title, sub, children }: { title: string; sub: string; children: Snippet } = $props();
</script>

<section class="card">
	<h2>{title}</h2>
	<p class="sub">{sub}</p>
	{@render children()}
</section>

<style>
	.card {
		background: var(--surface-1);
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 20px 22px;
		margin-bottom: 24px;
	}
	h2 {
		font-size: 16px;
		margin: 0 0 2px;
	}
	.sub {
		color: var(--text-muted);
		font-size: 12.5px;
		margin: 0 0 16px;
	}
</style>
