<script lang="ts">
	export let title: string
	export let iconSrc: string
	export let description: string
	export let href: string
</script>

<a class="game-tile" {href}>
	<div class="icon-wrap">
		<img src={iconSrc} alt="" aria-hidden="true" />
	</div>
	<h2>{title}</h2>
	<p>{description}</p>
	<span class="play-badge">Play →</span>
</a>

<style lang="scss">
	.game-tile {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: var(--space-8) var(--space-6);
		background-color: var(--color-surface);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-xl);
		text-decoration: none;
		transition: transform var(--transition-base), box-shadow var(--transition-base),
			border-color var(--transition-base);
		cursor: pointer;
		min-width: 200px;
		max-width: 280px;
		flex: 1;

		&:hover {
			transform: translateY(-6px);
			border-color: var(--color-border);
			box-shadow: var(--shadow-glow);
			text-decoration: none;
		}
	}

	.icon-wrap {
		width: 64px;
		height: 64px;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--color-accent-dim);
		border-radius: var(--radius-lg);
		margin-bottom: var(--space-4);

		img {
			width: 36px;
			height: 36px;
			filter: brightness(0) saturate(100%) invert(58%) sepia(90%) saturate(3000%)
				hue-rotate(240deg) brightness(110%);
		}
	}

	h2 {
		font-size: var(--text-lg);
		margin: 0 0 var(--space-2);
		color: var(--color-text);
	}

	p {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin: 0 0 var(--space-4);
		line-height: 1.5;
	}

	.play-badge {
		font-size: var(--text-xs);
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-accent-light);
		background-color: var(--color-accent-dim);
		padding: var(--space-1) var(--space-3);
		border-radius: var(--radius-full);
		margin-top: auto;
	}

	@media (max-width: 600px) {
		.game-tile {
			padding: var(--space-5) var(--space-4);
			min-width: 140px;
		}

		h2 {
			font-size: var(--text-md);
		}
	}
</style>
