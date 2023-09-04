<!-- src/routes/+page.svelte -->
<script lang="ts">
	import { Auth } from '@supabase/auth-ui-svelte'
	import { ThemeSupa } from '@supabase/auth-ui-shared'

	export let data
</script>

<svelte:head>
	<title>User Management</title>
</svelte:head>

<div class="column">
	<Auth
		supabaseClient={data.supabase}
		view="sign_up"
		redirectTo={`${data.url}/auth/callback`}
		showLinks={true}
		appearance={{
			theme: ThemeSupa,
			style: { input: 'color: #fff' }
		}}
		socialLayout="horizontal"
		theme="dark"
		additionalData={{}}
		providers={['google', 'discord']}
	/>
</div>

<style lang="scss">
	.column {
		display: block;
		width: 50%;
		margin: 5% auto 0 auto;
	}
</style>
