<script lang="ts">
	import { enhance } from '$app/forms'

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

	const downloadImage = async (path: string) => {
		try {
			const { data, error } = await supabase.storage.from('avatars').download(path)
			if (error) throw error

			const url = URL.createObjectURL(data)
			avatarUrl = url
		} catch (error) {
			if (error instanceof Error) console.log('Error downloading image: ', error.message)
		}
	}

	$: if (avatar) downloadImage(avatar)
</script>

<div class="account">
	<div class="user">
		<div class="left">
			<h1 class="username">{username}</h1>
			<h2 class="friends"><IconClock /><span>Joined {createdAtString}</span></h2>
			<h2 class="friends">
				<IconFriends /><span>{following.length} Following / {followers.length} Followers</span>
			</h2>
		</div>
		<div class="right">
			<img class="avatar" src={avatarUrl} alt="avatar" />
		</div>
	</div>
	<div class="buttons">
		<a class="button" href="account/edit">Edit Profile</a>
		<form method="post" action="?/signout" use:enhance={handleSignOut}>
			<div>
				<button class="button" disabled={signOutLoading}>Sign Out</button>
			</div>
		</form>
	</div>
	<hr />
	<Friends user={{ ...profile, followers, following }} {supabase} />
	<hr />
</div>

<style lang="scss">
	.account {
		max-width: 600px;
		width: 100%;
		margin: 0 auto;

		> .user {
			text-align: left;
			display: flex;
			justify-content: space-between;
			max-width: 100%;

			.username {
				margin: 0;
				font-size: 1.5rem;
				text-align: left;
				font-weight: 900;
			}

			.avatar {
				border-radius: 20%;
				height: 7em;
			}

			h2 {
				font-size: 1.1rem;
				display: flex;
				align-items: center;

				span {
					margin-left: 1rem;
				}
			}
		}

		.buttons {
			display: flex;
			justify-content: space-between;
			margin-top: 1rem;
			text-decoration: none;
		}
	}
</style>
