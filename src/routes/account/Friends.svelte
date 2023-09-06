<script lang="ts">
	import { enhance } from '$app/forms'
	import type { UserProfile, UserProfileFull } from '../../app'

	import Friend from './Friend.svelte'
	import type { SupabaseClient } from '@supabase/supabase-js'

	let friendsNavSelected = 0

	export let supabase: SupabaseClient

	export let user: UserProfileFull

	let friendSearchLoading = false
	let friendSearchResults: UserProfile[] = []

	function handleFriendSearch() {
		friendSearchLoading = true
		return async ({ result, update }: { result: any; update: any }) => {
			friendSearchLoading = false
			if (result.type === 'success') {
				if (result.data) friendSearchResults = result.data.profiles
				update()
			}
		}
	}
</script>

<div class="friends">
	<div class="nav">
		{#each ['Following', 'Followers', 'Find Friends'] as text, index}
			<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
			<div
				class:selected={friendsNavSelected === index}
				on:click={() => {
					friendsNavSelected = index
				}}
			>
				{text}
			</div>
		{/each}
	</div>
	<div class="contents">
		{#if friendsNavSelected === 0}
			<div class="friendList">
				{#each user.following as friend}
					<Friend {friend} {supabase} bind:user />
				{/each}
			</div>
		{:else if friendsNavSelected === 1}
			<div class="friendList">
				{#each user.followers as friend}
					<Friend {friend} {supabase} bind:user />
				{/each}
			</div>
		{:else if friendsNavSelected === 2}
			<form action="?/searchFriends" method="post" use:enhance={handleFriendSearch}>
				<input
					name="search"
					class="findFriendsInput input"
					type="text"
					placeholder="Username/Email"
				/>
			</form>
			<div class="searchResults">
				{#each friendSearchResults as friend}
					<Friend {friend} {supabase} bind:user />
				{/each}
			</div>
		{/if}
	</div>
</div>

<style lang="scss">
	.friends {
		margin-top: 1rem;
		padding-top: 1rem;
		text-align: left;

		.nav {
			display: flex;
			justify-content: space-between;
			margin-bottom: 1rem;
			font-size: 1.1rem;
			font-weight: 900;
			text-transform: uppercase;

			div {
				cursor: pointer;

				&.selected {
					border-bottom: 5px solid var(--color-1);
				}
			}
		}

		.contents {
			.searchResults {
				margin: 10px;
			}
		}
	}
</style>
