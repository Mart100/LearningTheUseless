<script lang="ts">
	type Variant = 'primary' | 'secondary' | 'ghost'
	type Size = 'sm' | 'md' | 'lg'

	export let variant: Variant = 'secondary'
	export let size: Size = 'md'
	export let disabled = false
	export let type: 'button' | 'submit' | 'reset' = 'button'
	export let href: string | undefined = undefined
</script>

{#if href}
	<a {href} class="btn {variant} {size}" class:disabled on:click>
		<slot />
	</a>
{:else}
	<button {type} {disabled} class="btn {variant} {size}" on:click>
		<slot />
	</button>
{/if}

<style lang="scss">
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		border-radius: var(--radius-md);
		font-weight: 600;
		cursor: pointer;
		text-decoration: none;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		transition: background-color var(--transition-base), box-shadow var(--transition-base),
			transform var(--transition-fast);
		border: 1px solid var(--color-border);

		&:hover {
			text-decoration: none;
		}

		&:active {
			transform: scale(0.97);
		}

		&.disabled,
		&:disabled {
			opacity: 0.45;
			cursor: not-allowed;
			transform: none;
			pointer-events: none;
		}

		// Sizes
		&.sm {
			padding: var(--space-1) var(--space-3);
			font-size: var(--text-xs);
		}
		&.md {
			padding: var(--space-2) var(--space-5);
			font-size: var(--text-sm);
		}
		&.lg {
			padding: var(--space-3) var(--space-8);
			font-size: var(--text-base);
		}

		// Variants
		&.primary {
			background-color: var(--color-accent);
			border-color: var(--color-accent);
			color: #fff;

			&:hover {
				background-color: #6d28d9;
				box-shadow: var(--shadow-glow);
			}
		}

		&.secondary {
			background-color: var(--color-surface-2);
			color: var(--color-text);

			&:hover {
				background-color: var(--color-surface-hover);
			}
		}

		&.ghost {
			background-color: transparent;
			border-color: transparent;
			color: var(--color-text-muted);

			&:hover {
				background-color: var(--color-surface-hover);
				color: var(--color-text);
			}
		}
	}
</style>
