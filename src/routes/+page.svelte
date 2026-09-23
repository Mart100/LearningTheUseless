<script lang="ts">
	import { games } from '$lib/games/registry'
	import type { Game } from '$lib/fetchGameStats'

	export let data

	let { session } = data
	$: ({ session } = data)

	let dailies: Record<Game, { played: boolean; score: number | null }> | null = null
	let streak: { streakCurrent: number; streakBest: number } | null = null

	$: if (data.dailies) {
		Promise.resolve(data.dailies).then((d) => (dailies = d))
	}
	$: if (data.streak) {
		Promise.resolve(data.streak).then((s) => (streak = s))
	}
</script>

<svelte:head>
	<title>Learning the Useless</title>
	<meta
		name="description"
		content="Memorize digits of π, country flags, world capitals, and chemical elements. No practical use whatsoever."
	/>
	<meta property="og:title" content="Learning the Useless" />
	<meta
		property="og:description"
		content="Memorize digits of π, country flags, world capitals, and chemical elements. No practical use whatsoever."
	/>
	<meta property="og:type" content="website" />
	<meta property="og:image" content="/og-image.png" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:image" content="/og-image.png" />
</svelte:head>

<div class="home">
	<p class="tagline">
		Memorize digits of π, country flags, world capitals, and chemical elements. No practical use
		whatsoever.
	</p>

	{#if session && streak}
		<div class="streak-bar">
			<span class="streak-item">🔥 {streak.streakCurrent}-day streak</span>
			<span class="streak-sep">·</span>
			<span class="streak-item muted">Best: {streak.streakBest}</span>
		</div>
	{/if}

	{#if session && dailies}
		<section class="daily-section">
			<h2 class="section-label">Today's dailies</h2>
			<ul class="daily-list" role="list">
				{#each games.filter((g) => g.supportsDaily) as game}
					{@const d = dailies[game.slug as Game]}
					<li class="daily-row">
						<a href="{game.href}?daily=1" class="daily-link">
							<span class="daily-name">{game.title}</span>
							{#if d?.played}
								<span class="daily-score">{d.score} — done ✓</span>
							{:else}
								<span class="daily-cta">Play →</span>
							{/if}
						</a>
					</li>
				{/each}
			</ul>
		</section>
	{:else if !session}
		<p class="daily-guest-nudge">
			<a href="/signup">Sign in</a> to track daily challenges and streaks.
		</p>
	{/if}

	<section>
		<h2 class="section-label">All games</h2>
		<ul class="game-list" role="list">
			{#each games as game}
				<li>
					<a href={game.href} class="game-row">
						<div class="game-info">
							<span class="game-name">{game.title}</span>
							<span class="game-desc">{game.description}</span>
						</div>
						<span class="game-cta" aria-hidden="true">Play →</span>
					</a>
				</li>
			{/each}
		</ul>
	</section>
</div>

<style>
	.home {
		padding-top: 2rem;
	}

	.tagline {
		color: var(--fg-muted);
		font-size: 0.95rem;
		margin-bottom: 2rem;
	}

	.streak-bar {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		margin-bottom: 2rem;
		padding: 0.6rem 0.9rem;
		background: var(--bg-inset, #f4f3f0);
		border: 1px solid var(--border);
		border-radius: 6px;
		width: fit-content;
	}

	.streak-sep {
		color: var(--fg-subtle, #aaa);
	}

	.muted {
		color: var(--fg-muted);
	}

	.section-label {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.07em;
		color: var(--fg-muted);
		margin-bottom: 0.75rem;
	}

	.daily-section {
		margin-bottom: 2.5rem;
	}

	.daily-list {
		list-style: none;
		padding: 0;
		margin: 0;
		border-top: 1px solid var(--border);
	}

	.daily-list li {
		border-bottom: 1px solid var(--border);
	}

	.daily-row {
		display: flex;
	}

	.daily-link {
		display: flex;
		align-items: center;
		width: 100%;
		padding: 0.85rem 0;
		text-decoration: none;
		color: inherit;
		gap: 1rem;
	}

	.daily-link:hover .daily-name {
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.daily-name {
		font-size: 0.9rem;
		font-weight: 600;
		flex: 1;
	}

	.daily-score {
		font-size: 0.875rem;
		color: var(--fg-muted);
		font-variant-numeric: tabular-nums;
	}

	.daily-cta {
		font-size: 0.875rem;
		color: var(--fg-subtle, #aaa);
	}

	.daily-guest-nudge {
		font-size: 0.875rem;
		color: var(--fg-muted);
		margin-bottom: 2rem;
	}

	.game-list {
		list-style: none;
		padding: 0;
		margin: 0;
		border-top: 1px solid var(--border);
	}

	.game-list li {
		border-bottom: 1px solid var(--border);
	}

	.game-row {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.25rem 0;
		text-decoration: none;
		color: inherit;
	}

	.game-row:hover {
		opacity: 1;
	}

	.game-row:hover .game-name {
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.game-info {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		flex: 1;
	}

	.game-name {
		font-size: 1rem;
		font-weight: 600;
	}

	.game-desc {
		font-size: 0.875rem;
		color: var(--fg-muted);
	}

	.game-cta {
		font-size: 0.875rem;
		color: var(--fg-subtle, #aaa);
		flex-shrink: 0;
	}
</style>
