<script lang="ts">
	export let session: boolean
</script>

<header>
	<div>
		<a href="/">🤔 Learning The Useless</a>
		<a href="/pi">PI</a>
		<a href="/flags">Flags</a>
		{#if session}
			<a href="/account">Account</a>
		{:else}
			<a href="/signup">Signup</a>
		{/if}
	</div>
</header>

<style lang="scss">
	header {
		width: 100%;
		padding: 0;
		background: rgba(0, 0, 0, 0.1);
		height: 48px;
		box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.25);
	}

	header > div {
		position: relative;
		display: flex;
		justify-content: flex-start;
		max-width: 1010px;
		height: 100%;
		margin: 0 auto;

		a {
			display: flex;
			height: 100%;
			align-items: center;
			padding: 0 1rem;
			color: var(--color-text);
			font-weight: 600;
			font-size: 1.3rem;
			text-decoration: none;
			transition: color 0.2s linear;
			position: relative;
			height: 100%;

			&:hover {
				background-color: rgba(0, 0, 0, 0.2);
			}

			&:last-child {
				margin-left: auto;
				justify-content: flex-end;
			}
		}
	}

	@media (max-width: 767px) {
		header > div {
			a {
				font-size: 0.8rem;
				padding: 0 0.3rem;
			}

			:first-child {
				width: 6rem;
			}
		}
	}
</style>
