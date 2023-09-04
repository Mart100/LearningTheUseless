<!-- src/routes/account/+page.svelte -->
<script lang="ts">
	import Avatar from './Avatar.svelte'
	import { enhance } from '$app/forms'

	export let data
	export let form

	let { session, supabase, profile } = data
	$: ({ session, supabase, profile } = data)

	$: console.log(form)

	let profileForm: HTMLFormElement
	let loading = false
	let updateErrorMsg = ''
	let username: string = profile?.username ?? ''
	let avatarUrl: string = profile?.avatar_url ?? ''

	const handleSignOut = () => {
		loading = true
		return async ({ update }: { update: any }) => {
			loading = false
			update()
		}
	}
</script>

<div class="form-widget">
	<form
		class="form-widget"
		method="post"
		action="?/update"
		use:enhance={(event) => {
			loading = true
			return async ({ result, update }) => {
				loading = false

				if (result.type === 'failure') {
					if (typeof result.data?.errorMsg == 'string') updateErrorMsg = result.data?.errorMsg
				} else if (result.type === 'success') {
					updateErrorMsg = ''
				}
			}
		}}
		bind:this={profileForm}
	>
		<Avatar
			{supabase}
			bind:url={avatarUrl}
			on:upload={() => {
				profileForm.requestSubmit()
			}}
		/>
		<div>
			<label for="email">Email</label>
			<input id="email" class="input" type="text" value={session.user.email} disabled />
		</div>

		<div>
			<label for="username">Username</label>
			<input
				id="username"
				class="input"
				name="username"
				type="text"
				value={form?.username ?? username}
			/>
		</div>
		<div>
			<input
				type="submit"
				class="button primary"
				value={loading ? 'Loading...' : 'Update'}
				disabled={loading}
			/>
			{#if updateErrorMsg}
				<p class="error">{updateErrorMsg}</p>
			{/if}
		</div>
	</form>

	<form method="post" action="?/signout" use:enhance={handleSignOut}>
		<div>
			<button class="button" disabled={loading}>Sign Out</button>
		</div>
	</form>
</div>

<style lang="scss">
	.error {
		margin: 0;
		text-align: center;
		color: red;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	.form-widget {
		display: flex;
		flex-direction: column;
		gap: 20px;

		label {
			display: block;
			margin: 5px 0;
			color: var(--custom-color-secondary);
			font-size: 0.8rem;
			text-transform: uppercase;
		}

		.input {
			padding: 8px;
			display: block;

			&[disabled] {
				color: var(--custom-color-secondary);
			}
		}

		.button {
			display: block;
			width: 100%;
		}
	}
</style>
