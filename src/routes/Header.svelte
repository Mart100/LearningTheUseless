<script lang="ts">
	export let session: boolean
</script>

<header>
	<nav>
		<a class="site-name" href="/">Learning the Useless</a>
		<div class="links">
			<a href="/pi">Pi</a>
			<a href="/flags">Flags</a>
			<a href="/capitals">Capitals</a>
			<a href="/elements">Elements</a>
			{#if session}
				<a href="/account">Account</a>
			{:else}
				<a href="/signup">Sign in</a>
			{/if}
		</div>
	</nav>
</header>

<style>
	header {
		border-bottom: 1px solid var(--border);
		padding: 0 1.5rem;
	}

	nav {
		max-width: 56rem;
		margin: 0 auto;
		height: 52px;
		display: flex;
		align-items: center;
	}

	.site-name {
		font-size: 0.875rem;
		font-weight: 600;
		letter-spacing: -0.01em;
		text-decoration: none;
		margin-right: auto;
		color: var(--fg);
	}

	.site-name:hover {
		opacity: 0.65;
	}

	.links {
		display: flex;
		align-items: center;
		gap: 1.75rem;
	}

	.links a {
		font-size: 0.875rem;
		color: var(--fg-muted);
		text-decoration: none;
	}

	.links a:hover {
		color: var(--fg);
		opacity: 1;
	}

	@media (max-width: 600px) {
		header {
			padding: 0 1rem;
		}

		.site-name {
			font-size: 0.8rem;
		}

		.links {
			gap: 0.9rem;
		}

		.links a {
			font-size: 0.8rem;
		}
	}
</style>
