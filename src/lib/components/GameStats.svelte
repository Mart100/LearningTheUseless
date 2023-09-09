<script lang="ts">
	import type { GameLeaderboardFriend, GameStatsData } from '../../app'

	export let supabase: SupabaseClient
	export let stats: GameStatsData
	export let globalStats: Record<string, number>
	export let friendsLeaderboard: GameLeaderboardFriend[]
	let avatarsDownloaded = false

	console.log(friendsLeaderboard)

	if (!avatarsDownloaded) {
		friendsLeaderboard.forEach(async (friend, index) => {
			let url = friend.avatar_url + ''
			friend.avatar_url = '/svg/default-avatar.svg'
			downloadAvatar(supabase, url).then((u) => (friendsLeaderboard[index].avatar_url = u))
		})
		avatarsDownloaded = true
	}

	import { Line } from 'svelte-chartjs'
	import type { ChartData, Point } from 'chart.js/auto'
	import {
		Chart as ChartJS,
		CategoryScale,
		LinearScale,
		PointElement,
		LineElement,
		Legend
	} from 'chart.js'
	import { downloadAvatar } from '$lib/utils'
	import type { SupabaseClient } from '@supabase/supabase-js'
	ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Legend)

	let improvementGraphData: ChartData<'line', (number | Point)[], unknown>
	let statisticsGraphData: ChartData<'line', (number | Point)[], unknown>

	$: {
		if (stats) {
			let scores = stats.previousGames.map((game) => game.score)
			improvementGraphData = {
				labels: scores.map((a) => 'a'),
				datasets: [
					{
						label: 'Score',
						data: scores.reverse(),
						fill: false,
						borderColor: 'rgb(75, 192, 192)',
						tension: 0.5
					}
				]
			}
		}
	}

	$: {
		if (globalStats && stats) {
			let maxScore = Math.max(
				...Object.keys(globalStats).map((a) => +a),
				...stats.previousGames.map((a) => a.score)
			)
			let stepSize = Math.max(Math.ceil(maxScore / 10), 1)
			let scores: number[] = []
			let slices: string[] = []
			for (let i = 0; i <= maxScore; i += 1) {
				let slice = Math.round(i / stepSize)
				if (scores[slice] === undefined) {
					slices.push(`${slice * stepSize}`)
					scores[slice] = 0
				}
				if (globalStats[i]) scores[slice] += globalStats[i]
			}

			// create array with all 0 of the same length as scores
			let yourScores: number[] = Array.from({ length: scores.length }, () => 0)
			for (let score of stats.previousGames) {
				let slice = Math.round(score.score / stepSize)
				yourScores[slice] += 1
			}

			let globalMax = Math.max(...scores)
			scores = scores.map((score) => (score / globalMax) * 100)
			let yourMax = Math.max(...yourScores)
			yourScores = yourScores.map((score) => (score / yourMax) * 100)

			statisticsGraphData = {
				labels: slices,
				datasets: [
					{
						label: 'Average Users',
						data: scores,
						fill: false,
						borderColor: 'rgb(75, 192, 192)',
						tension: 0.5,
						pointRadius: 0
					},
					{
						label: 'You',
						data: yourScores,
						fill: false,
						borderColor: 'rgb(255, 0, 0)',
						tension: 0.5,
						pointRadius: 0
					}
				]
			}
		}
	}

	function dbTimestampToString(time: string) {
		const date = new Date(time)
		return `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}, ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
	}
	function dbTimestampToHowlongago(time: string) {
		const date = new Date(time)
		const now = new Date()
		const diff = now.getTime() - date.getTime()
		const seconds = Math.floor(diff / 1000)
		const minutes = Math.floor(seconds / 60)
		const hours = Math.floor(minutes / 60)
		const days = Math.floor(hours / 24)
		const months = Math.floor(days / 30)
		const years = Math.floor(months / 12)
		if (years > 0) return `${years} years ago`
		if (months > 0) return `${months} months ago`
		if (days > 0) return `${days} days ago`
		if (hours > 0) return `${hours} hours ago`
		if (minutes > 0) return `${minutes} minutes ago`
		if (seconds > 0) return `${seconds} seconds ago`
		return 'just now'
	}
</script>

<div id="stats">
	<div id="previousGames">
		<h2>Previous Scores</h2>

		{#if stats && stats.previousGames.length > 0}
			<table>
				<tbody>
					<tr>
						<th>Date</th>
						<th>Score</th>
					</tr>
					{#each stats.previousGames.slice(0, 5) as game}
						<tr>
							<td class="date">
								<p class="timeago">{dbTimestampToHowlongago(game.played_at)}</p>
								<p class="time">{dbTimestampToString(game.played_at)}</p>
							</td>
							<td class="score">{game.score}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{:else}
			<p>No previous games</p>
		{/if}
	</div>
	<div id="highscore">
		<h2>Highscore</h2>
		{#if stats && stats.highscore}
			<p class="score">{stats.highscore}</p>
		{:else}
			<p>No highscore</p>
		{/if}
	</div>
	<div id="leaderboard">
		<h2>Leaderboard</h2>
		<div class="slider">
			<div class="friends"></div>
			<div class="global"></div>
		</div>
		<div class="users">
			{#each friendsLeaderboard as friend, index}
				<div class="user">
					<p class="rank">{index}</p>
					<img class="avatar" src={friend.avatar_url} alt="avatar" />
					<p class="username">{friend.username}</p>
					<p class="score">{friend.highscore}</p>
				</div>
			{:else}
				<div>You don't have any friends</div>
			{/each}
		</div>
	</div>
	<div id="graphs">
		<div id="improvement">
			<h2>Your Improvement</h2>
			{#if improvementGraphData}
				<Line
					data={improvementGraphData}
					width={200}
					height={100}
					options={{
						maintainAspectRatio: true,
						scales: { x: { display: false } },
						plugins: { legend: { display: false } }
					}}
				/>
			{/if}
		</div>
		<div id="statistics">
			<h2>Global scores</h2>
			{#if statisticsGraphData}
				<Line
					data={statisticsGraphData}
					width={200}
					height={100}
					options={{ maintainAspectRatio: true, scales: { y: { display: false, grace: 1 } } }}
				/>
			{/if}
		</div>
	</div>
</div>

<style lang="scss">
	#stats {
		margin-top: 10vh;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		width: 100%;

		h2 {
			font-size: 1.5rem;
		}

		> div {
			display: inline-block;
			margin: 0 2vw;
		}

		#previousGames {
			text-align: left;
			//margin-left: auto;

			p {
				margin: 0;
			}

			.date {
				.time {
					font-size: 0.8rem;
					color: gray;
				}
			}

			.score {
				font-size: 1.5rem;
				text-align: right;
			}
		}

		#leaderboard {
			.users {
				max-height: 200px;
				overflow-y: auto;
				.user {
					display: flex;
					align-items: center;
					margin-bottom: 1rem;

					p {
						margin: 0;
					}

					.rank {
						font-size: 150%;
						width: 10px;
						margin: auto 1.5rem auto 0;
						font-weight: 800;
					}

					.score {
						font-size: 1.5rem;
						margin: auto 0;
						margin-left: auto;
						margin-right: 1rem;
					}

					.avatar {
						width: 2rem;
						height: 2rem;
						border-radius: 50%;
						margin-right: 1rem;
					}

					.username {
						font-weight: 900;
					}
				}
			}
		}

		#highscore {
			text-align: center;
			//margin-right: auto;

			.score {
				margin-top: 0;
				font-size: 4rem;
				font-weight: bold;
			}
		}

		#graphs {
			margin: 0px;
			display: flex;
			flex-wrap: wrap;
			justify-content: center;
			text-align: center;

			div {
				display: inline-block;
				width: 90%;
				max-width: 400px;
				margin: 0 2vw;
			}
		}
	}
</style>
