<script lang="ts">
	export let session: boolean
</script>

<nav aria-label="Main navigation">
	<div class="inner">
		<a href="/" class="brand">
			<span class="brand-icon">🧠</span>
			<span class="brand-text">Learning The Useless</span>
		</a>

		<div class="links">
			<a href="/pi">π Digits</a>
			<a href="/flags">Flags</a>
			{#if session}
				<a href="/account" class="account-link">Account</a>
			{:else}
				<a href="/signup" class="cta-link">Sign up</a>
			{/if}
		</div>
	</div>
</nav>

<style lang="scss">
	nav {
		position: sticky;
		top: 0;
		z-index: 100;
		width: 100%;
		height: var(--nav-height);
		background: rgba(13, 13, 26, 0.85);
		backdrop-filter: blur(12px);
		border-bottom: 1px solid var(--color-border-subtle);
	}

	.inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 100%;
		max-width: var(--max-width);
		margin: 0 auto;
		padding: 0 var(--space-4);
	}

	.brand {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-weight: 700;
		font-size: var(--text-base);
		color: var(--color-text);
		text-decoration: none;
		letter-spacing: -0.01em;
		white-space: nowrap;

		&:hover {
			text-decoration: none;
			color: var(--color-accent-light);
		}
	}

	.brand-icon {
		font-size: 1.3rem;
	}

	.brand-text {
		@media (max-width: 480px) {
			display: none;
		}
	}

	.links {
		display: flex;
		align-items: center;
		gap: var(--space-1);

		a {
			display: flex;
			align-items: center;
			height: 36px;
			padding: 0 var(--space-3);
			border-radius: var(--radius-md);
			font-weight: 600;
			font-size: var(--text-sm);
			color: var(--color-text-muted);
			text-decoration: none;
			transition: color var(--transition-fast), background-color var(--transition-fast);

			&:hover {
				color: var(--color-text);
				background-color: var(--color-surface-hover);
				text-decoration: none;
			}
		}

		.cta-link {
			background-color: var(--color-accent-dim);
			color: var(--color-accent-light);
			border: 1px solid var(--color-border);

			&:hover {
				background-color: var(--color-accent);
				color: #fff;
			}
		}

		.account-link {
			color: var(--color-accent-light);
		}
	}
</style>
