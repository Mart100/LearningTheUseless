<script lang="ts">
	import GameTile from '$lib/components/GameTile.svelte'
	import { games } from '$lib/games/registry'
</script>

<svelte:head>
	<title>Learning The Useless — Knowledge Arcade</title>
	<meta
		name="description"
		content="An arcade of mini-games for facts nobody asked you to learn — digits of π, world flags, and more. Free, no signup needed to play."
	/>
	<meta property="og:title" content="Learning The Useless — Knowledge Arcade" />
	<meta
		property="og:description"
		content="Master useless (but delightful) knowledge: digits of Pi, world flags, and more. Free arcade games with leaderboards."
	/>
	<meta property="og:type" content="website" />
	<meta property="og:image" content="/og-image.svg" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Learning The Useless — Knowledge Arcade" />
	<meta
		name="twitter:description"
		content="Master useless (but delightful) knowledge: digits of Pi, world flags, and more."
	/>
	<meta name="twitter:image" content="/og-image.svg" />
</svelte:head>

<section class="hero">
	<div class="hero-badge">🧠 Knowledge Arcade</div>
	<h1>
		Learn&nbsp;<span class="accent">useless</span> things.<br />
		Impress nobody.
	</h1>
	<p class="tagline">
		Mini-games that train your brain on facts absolutely no one needs — but you'll never forget.
	</p>
</section>

<section class="games" aria-label="Available games">
	{#each games as game (game.slug)}
		<GameTile
			title={game.title}
			iconSrc={game.iconSrc}
			description={game.description}
			href={game.href}
		/>
	{/each}
</section>

<style lang="scss">
	.hero {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: var(--space-16) var(--space-4) var(--space-10);

		.hero-badge {
			display: inline-flex;
			align-items: center;
			gap: var(--space-2);
			background-color: var(--color-accent-dim);
			color: var(--color-accent-light);
			border: 1px solid var(--color-border);
			border-radius: var(--radius-full);
			padding: var(--space-1) var(--space-4);
			font-size: var(--text-xs);
			font-weight: 700;
			letter-spacing: 0.08em;
			text-transform: uppercase;
			margin-bottom: var(--space-6);
		}

		h1 {
			font-size: clamp(2rem, 6vw, var(--text-3xl));
			font-weight: 800;
			line-height: 1.15;
			color: var(--color-text);
			margin-bottom: var(--space-5);
		}

		.accent {
			color: var(--color-accent-light);
		}

		.tagline {
			max-width: 460px;
			font-size: var(--text-md);
			color: var(--color-text-muted);
			line-height: 1.6;
			margin-bottom: 0;
		}
	}

	.games {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: var(--space-6);
		padding-bottom: var(--space-16);
	}
</style>
