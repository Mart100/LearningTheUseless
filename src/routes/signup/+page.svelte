<!-- src/routes/signup/+page.svelte -->
<script lang="ts">
	import { Auth } from '@supabase/auth-ui-svelte'
	import { ThemeSupa } from '@supabase/auth-ui-shared'
	import { goto } from '$app/navigation'

	export let data

	$: {
		if (data.session) {
			goto('/account')
		}
	}
</script>

<svelte:head>
	<title>Sign in — Learning the Useless</title>
	<meta name="description" content="Create an account to save your scores and challenge friends." />
</svelte:head>

<div class="auth-page">
	<h1>Sign in</h1>
	<p class="sub">Save scores and see how you compare.</p>
	<div class="auth-box">
		<Auth
			supabaseClient={data.supabase as any}
			view="sign_up"
			redirectTo={`${data.url}/auth/callback`}
			showLinks={true}
			appearance={{
				theme: ThemeSupa,
				variables: {
					default: {
						colors: {
							brand: '#1c1c1a',
							brandAccent: '#444',
							inputBackground: 'transparent',
							inputBorder: 'var(--border)',
							inputBorderFocus: 'var(--fg)',
							inputText: 'var(--fg)',
							inputPlaceholder: 'var(--fg-muted)'
						}
					}
				}
			}}
			socialLayout="horizontal"
			additionalData={{ provider: 'google' }}
			providers={['google', 'discord']}
		/>
	</div>
</div>

<style>
	.auth-page {
		max-width: 360px;
		padding-top: 1rem;
	}

	h1 {
		margin-bottom: 0.25rem;
	}

	.sub {
		color: var(--fg-muted);
		font-size: 0.875rem;
		margin-bottom: 1.75rem;
	}

	.auth-box {
		width: 100%;
	}
</style>
