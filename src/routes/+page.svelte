<svelte:head>
	<title>Learning the Useless</title>
	<meta
		name="description"
		content="Memorize digits of π and country flags. No practical use whatsoever."
	/>
	<meta property="og:title" content="Learning the Useless" />
	<meta
		property="og:description"
		content="Memorize digits of π and country flags. No practical use whatsoever."
	/>
	<meta property="og:type" content="website" />
	<meta property="og:image" content="/og-image.png" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:image" content="/og-image.png" />
</svelte:head>

<div class="home">
	<p class="tagline">Memorize digits of π and country flags. No practical use whatsoever.</p>

	<ul class="game-list" role="list">
		<li>
			<a href="/pi" class="game-row">
				<div class="game-info">
					<span class="game-name">Digits of Pi</span>
					<span class="game-desc">How many digits of π can you type from memory?</span>
				</div>
				<span class="game-cta" aria-hidden="true">Play →</span>
			</a>
		</li>
		<li>
			<a href="/flags" class="game-row">
				<div class="game-info">
					<span class="game-name">Country Flags</span>
					<span class="game-desc">Name every country's flag. Five minutes on the clock.</span>
				</div>
				<span class="game-cta" aria-hidden="true">Play →</span>
			</a>
		</li>
	</ul>
</div>

<style>
	.home {
		padding-top: 2rem;
	}

	.tagline {
		color: var(--fg-muted);
		font-size: 0.95rem;
		margin-bottom: 2.5rem;
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
		color: var(--fg-subtle);
		flex-shrink: 0;
	}
</style>
