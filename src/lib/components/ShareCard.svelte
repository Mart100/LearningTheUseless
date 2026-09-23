<script lang="ts">
	export let headline: string
	export let detail: string = ''

	function drawCard(): HTMLCanvasElement {
		const W = 1200
		const H = 628
		const canvas = document.createElement('canvas')
		canvas.width = W
		canvas.height = H
		const ctx = canvas.getContext('2d')!

		const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif'
		const innerPad = 72
		const PAD = 28

		// Background
		ctx.fillStyle = '#f9f8f6'
		ctx.fillRect(0, 0, W, H)

		// Outer border frame
		ctx.strokeStyle = '#e0ddd8'
		ctx.lineWidth = 1.5
		ctx.strokeRect(PAD + 0.75, PAD + 0.75, W - PAD * 2 - 1.5, H - PAD * 2 - 1.5)

		// Site label
		ctx.fillStyle = '#aaa'
		ctx.font = `500 13px ${FONT}`
		ctx.fillText('LEARNING THE USELESS', innerPad, 104)

		// Divider under label
		ctx.strokeStyle = '#e0ddd8'
		ctx.lineWidth = 1
		ctx.beginPath()
		ctx.moveTo(innerPad, 124)
		ctx.lineTo(W - innerPad, 124)
		ctx.stroke()

		// Headline — big score
		ctx.fillStyle = '#1c1c1a'
		ctx.font = `bold 92px ${FONT}`
		ctx.fillText(headline, innerPad, 308)

		// Detail / sub-line
		if (detail) {
			ctx.fillStyle = '#6b6b6b'
			ctx.font = `400 30px ${FONT}`
			ctx.fillText(detail, innerPad, 376)
		}

		// Divider above footer
		ctx.strokeStyle = '#e0ddd8'
		ctx.lineWidth = 1
		ctx.beginPath()
		ctx.moveTo(innerPad, H - 96)
		ctx.lineTo(W - innerPad, H - 96)
		ctx.stroke()

		// URL
		ctx.fillStyle = '#aaa'
		ctx.font = `400 16px ${FONT}`
		ctx.fillText('learning-the-useless.vercel.app', innerPad, H - 64)

		return canvas
	}

	function downloadCard() {
		const canvas = drawCard()
		const url = canvas.toDataURL('image/png')
		const a = document.createElement('a')
		a.href = url
		a.download = 'score-card.png'
		a.click()
	}

	async function shareCard() {
		const canvas = drawCard()
		canvas.toBlob(async (blob) => {
			if (!blob) return
			if (navigator.share && navigator.canShare) {
				const file = new File([blob], 'score-card.png', { type: 'image/png' })
				if (navigator.canShare({ files: [file] })) {
					try {
						await navigator.share({ files: [file], title: headline })
						return
					} catch (_) {
						// fall through to download
					}
				}
			}
			downloadCard()
		})
	}
</script>

<button class="button share-btn" on:click={shareCard}>↓ Share card</button>

<style>
	.share-btn {
		font-size: 0.875rem;
	}
</style>
