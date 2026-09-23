<script lang="ts">
	import type { GameLeaderboardFriend, GameStatsData } from '../../app'

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	export let supabase: any
	export let stats: GameStatsData
	export let globalStats: Record<string, number>
	export let friendsLeaderboard: GameLeaderboardFriend[]
	let avatarsDownloaded = false

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
						borderColor: 'rgb(200, 80, 80)',
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
	<div id="highscore">
		<h2>Best</h2>
		{#if stats && stats.highscore}
			<p class="score">{stats.highscore}</p>
		{:else}
			<p class="no-data">No scores yet</p>
		{/if}
	</div>

	<div id="previousGames">
		<h2>Recent games</h2>
		{#if stats && stats.previousGames.length > 0}
			<table>
				<tbody>
					{#each stats.previousGames.slice(0, 5) as game}
						<tr>
							<td class="date">
								<span class="timeago">{dbTimestampToHowlongago(game.played_at)}</span>
								<span class="time">{dbTimestampToString(game.played_at)}</span>
							</td>
							<td class="score">{game.score}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{:else}
			<p class="no-data">No previous games</p>
		{/if}
	</div>

	{#if friendsLeaderboard.length > 0}
		<div id="leaderboard">
			<h2>Friends</h2>
			<div class="users">
				{#each friendsLeaderboard as friend, index}
					<div class="user">
						<span class="rank">{index + 1}</span>
						<img class="avatar" src={friend.avatar_url} alt="avatar" />
						<span class="username">{friend.username}</span>
						<span class="score">{friend.highscore}</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<div id="graphs">
		{#if improvementGraphData}
			<div class="graph-block">
				<h2>Your improvement</h2>
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
			</div>
		{/if}
		{#if statisticsGraphData}
			<div class="graph-block">
				<h2>Score distribution</h2>
				<Line
					data={statisticsGraphData}
					width={200}
					height={100}
					options={{ maintainAspectRatio: true, scales: { y: { display: false, grace: 1 } } }}
				/>
			</div>
		{/if}
	</div>
</div>

<style lang="scss">
	#stats {
		margin-top: 2.5rem;
		padding-top: 2rem;
		border-top: 1px solid var(--border);
		display: flex;
		flex-wrap: wrap;
		gap: 2rem;
		width: 100%;

		h2 {
			font-size: 0.8rem;
			text-transform: uppercase;
			letter-spacing: 0.06em;
			color: var(--fg-muted);
			margin-bottom: 0.75rem;
		}
	}

	.no-data {
		color: var(--fg-subtle);
		font-size: 0.875rem;
	}

	#highscore {
		.score {
			font-size: 3rem;
			font-weight: 700;
			line-height: 1;
			margin: 0;
			font-variant-numeric: tabular-nums;
		}
	}

	#previousGames {
		table {
			border-collapse: collapse;
			font-size: 0.875rem;
		}

		tr + tr td {
			border-top: 1px solid var(--border);
		}

		td {
			padding: 0.4rem 0.5rem;
			vertical-align: middle;

			&:first-child {
				padding-left: 0;
			}
		}

		.date {
			display: flex;
			flex-direction: column;

			.timeago {
				font-size: 0.875rem;
			}

			.time {
				font-size: 0.75rem;
				color: var(--fg-muted);
			}
		}

		.score {
			font-weight: 600;
			font-variant-numeric: tabular-nums;
			padding-left: 1.5rem;
		}
	}

	#leaderboard {
		.users {
			display: flex;
			flex-direction: column;
			gap: 0.6rem;
		}

		.user {
			display: flex;
			align-items: center;
			gap: 0.75rem;
			font-size: 0.875rem;

			.rank {
				width: 1.25rem;
				text-align: right;
				color: var(--fg-muted);
				font-size: 0.8rem;
			}

			.avatar {
				width: 1.75rem;
				height: 1.75rem;
				border-radius: 50%;
				object-fit: cover;
			}

			.username {
				font-weight: 600;
			}

			.score {
				margin-left: auto;
				font-variant-numeric: tabular-nums;
				color: var(--fg-muted);
			}
		}
	}

	#graphs {
		display: flex;
		flex-wrap: wrap;
		gap: 1.5rem;
		width: 100%;

		.graph-block {
			flex: 1;
			min-width: 200px;
			max-width: 380px;
		}
	}
</style>
