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

	<ul class="game-list" role="list">
		{#each games as game}
			{@const d = dailies?.[game.slug as Game]}
			<li>
				<div class="game-row-wrap">
					<a href={game.href} class="game-row">
						<div class="game-info">
							<span class="game-name">{game.title}</span>
							<span class="game-desc">{game.description}</span>
						</div>
						<span class="play-cta" aria-hidden="true">Play →</span>
					</a>

					{#if game.supportsDaily}
						<div class="daily-cell">
							{#if session && d?.played}
								<span class="daily-done" title="Today's daily — done">✓ {d.score}</span>
							{:else}
								<a href="{game.href}?daily=1" class="daily-btn">Daily</a>
							{/if}
						</div>
					{/if}
				</div>
			</li>
		{/each}
	</ul>

	{#if !session}
		<p class="signin-nudge">
			<a href="/signup">Sign in</a> to track daily challenges and streaks.
		</p>
	{/if}
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

	/* Streak bar — keep as-is from Phase 2 */
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

	/* Unified game list — one row per game */
	.game-list {
		list-style: none;
		padding: 0;
		margin: 0;
		border-top: 1px solid var(--border);
	}

	.game-list li {
		border-bottom: 1px solid var(--border);
	}

	.game-row-wrap {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	/* The free-play link fills all available width */
	.game-row {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex: 1;
		padding: 1.25rem 0;
		text-decoration: none;
		color: inherit;
		min-width: 0;
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
		min-width: 0;
	}

	.game-name {
		font-size: 1rem;
		font-weight: 600;
	}

	.game-desc {
		font-size: 0.875rem;
		color: var(--fg-muted);
	}

	.play-cta {
		font-size: 0.875rem;
		color: var(--fg-subtle, #aaa);
		flex-shrink: 0;
	}

	/* Daily column — fixed width so every row aligns */
	.daily-cell {
		flex-shrink: 0;
		width: 5.5rem;
		display: flex;
		justify-content: flex-end;
	}

	.daily-btn {
		font-size: 0.8rem;
		color: var(--fg-muted);
		text-decoration: none;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm, 3px);
		padding: 0.25rem 0.6rem;
		white-space: nowrap;
		transition: color 0.12s, border-color 0.12s;
	}

	.daily-btn:hover {
		color: var(--fg);
		border-color: var(--fg-muted);
		opacity: 1;
	}

	.daily-done {
		font-size: 0.8rem;
		color: var(--fg-muted);
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}

	.signin-nudge {
		margin-top: 1.75rem;
		font-size: 0.875rem;
		color: var(--fg-muted);
	}
</style>
