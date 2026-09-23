<script>
	import Header from './Header.svelte'
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
	<Header session={session !== null} />

	<main>
		<slot />
	</main>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 2.5rem 1.5rem;
		width: 100%;
		max-width: var(--max-width);
		margin: 0 auto;
		box-sizing: border-box;
	}

	@media (max-width: 480px) {
		main {
			padding: 1.5rem 1rem;
		}
	}
</style>
