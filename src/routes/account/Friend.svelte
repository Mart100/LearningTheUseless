<script lang="ts">
	import { downloadAvatar } from '$lib/utils'
	import type { SupabaseClient } from '@supabase/supabase-js'
	import { createEventDispatcher } from 'svelte'

	import IconUserPlus from '~icons/tabler/user-plus'
	import IconUserMinus from '~icons/tabler/user-minus'
	import type { UserProfile, UserProfileFull } from '../../app'

	export let supabase: SupabaseClient

	export let user: UserProfileFull
	export let friend: UserProfile

	$: following = user.following.map((u) => u.id).includes(friend.id)
	$: follower = friend.following.includes(user.id)

	let avatar_url: string | null = null

	$: if (friend.avatar_url)
		downloadAvatar(supabase, friend.avatar_url).then((u) => (avatar_url = u))

	async function followFriend(event: MouseEvent) {
		user.following = [...user.following, friend]
		updateFollowing()
	}

	async function unfollowFriend(event: MouseEvent) {
		let index = user.following.indexOf(friend)
		user.following.splice(index, 1)
		user.following = user.following
		updateFollowing()
	}

	async function updateFollowing() {
		const { error, status } = await supabase
			.from('profiles')
			.update({ following: user.following.map((u) => u.id) })
			.eq('id', user.id)
		if (error) console.log(error)
	}
</script>

<div class="friend">
	<img class="avatar" src={avatar_url} alt="avatar" />
	<h2 class="username">{friend.username}</h2>
	{#if following}
		<button class="button primary" on:click={unfollowFriend}
			><IconUserMinus font-size={18} /><span>Unfollow</span></button
		>
	{:else if follower}
		<button class="button primary" on:click={followFriend}
			><IconUserPlus font-size={18} /><span>Follow Back</span></button
		>
	{:else}
		<button class="button primary" on:click={followFriend}
			><IconUserPlus font-size={18} /><span>Follow</span></button
		>
	{/if}
</div>

<style lang="scss">
	.friend {
		display: flex;
		align-items: center;
		margin-bottom: 1rem;

		.avatar {
			width: 3rem;
			height: 3rem;
			border-radius: 50%;
			margin-right: 1rem;
		}

		.username {
			font-weight: 900;
		}

		.button {
			display: flex;
			align-items: center;
			margin-left: auto;
			font-size: 12px;
			font-weight: 600;
			padding: 5px;

			span {
				margin-left: 0.5rem;
			}
		}
	}
</style>
