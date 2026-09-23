<script lang="ts">
	import { enhance } from '$app/forms'

	import { downloadAvatar } from '$lib/utils'

	import Friends from './Friends.svelte'
	import IconFriends from '~icons/tabler/friends'
	import IconClock from '~icons/tabler/clock'

	export let data

	let { session, supabase, profile, user, followers, following } = data
	$: ({ session, supabase, profile, user, followers, following } = data)

	let username: string = profile.username ?? user.email?.split('@')[0] ?? ''
	let avatar: string = profile.avatar_url ?? ''
	let avatarUrl: string
	let createdAt = new Date(user.created_at ?? 0)
	let createdAtString = createdAt.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long'
	})

	let signOutLoading = false
	const handleSignOut = () => {
		signOutLoading = true
		return async ({ update }: { update: any }) => {
			signOutLoading = false
			update()
		}
	}

	$: if (avatar) downloadAvatar(supabase, avatar).then((u) => (avatarUrl = u))
</script>

<svelte:head>
	<title>Account — Learning the Useless</title>
</svelte:head>

<div class="account">
	<div class="user-header">
		<div class="left">
			<h1 class="username">{username}</h1>
			<p class="meta"><IconClock /> Joined {createdAtString}</p>
			<p class="meta"><IconFriends /> {following.length} following · {followers.length} followers</p>
		</div>
		{#if avatarUrl}
			<img class="avatar" src={avatarUrl} alt="avatar" />
		{/if}
	</div>

	<div class="actions">
		<a class="button" href="account/edit">Edit profile</a>
		<form method="post" action="?/signout" use:enhance={handleSignOut}>
			<button class="button" disabled={signOutLoading}>Sign out</button>
		</form>
	</div>

	<hr />
	<Friends user={{ ...profile, followers, following }} {supabase} />
</div>

<style lang="scss">
	.account {
		max-width: 560px;

		hr {
			border: none;
			border-top: 1px solid var(--border);
			margin: 1.5rem 0;
		}
	}

	.user-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 1.25rem;
	}

	.username {
		font-size: 1.375rem;
		font-weight: 700;
		margin: 0 0 0.4rem;
		text-align: left;
	}

	.meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: var(--fg-muted);
		margin: 0 0 0.25rem;
	}

	.avatar {
		width: 5rem;
		height: 5rem;
		border-radius: 8px;
		object-fit: cover;
		flex-shrink: 0;
	}

	.actions {
		display: flex;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
	}
</style>
