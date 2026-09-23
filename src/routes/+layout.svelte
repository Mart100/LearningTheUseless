<script>
	import Nav from './Nav.svelte'
	import './styles.scss'

	import { invalidate } from '$app/navigation'
	import { onMount } from 'svelte'

	export let data

	let { supabase, session } = data
	$: ({ supabase, session } = data)

	onMount(() => {
		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((event, _session) => {
			if (_session?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth')
			}
		})

		return () => subscription.unsubscribe()
	})
</script>

<div class="app">
	<Nav session={session !== null} />

	<main>
		<slot />
	</main>

	<footer>
		<p>Learning The Useless &mdash; because why not.</p>
	</footer>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		width: 100%;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: var(--space-6) var(--space-4);
		width: 100%;
		max-width: var(--max-width);
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		border-top: 1px solid var(--color-border-subtle);
		text-align: center;
		padding: var(--space-4);

		p {
			font-size: var(--text-xs);
			color: var(--color-text-faint);
			margin: 0;
		}
	}
</style>
