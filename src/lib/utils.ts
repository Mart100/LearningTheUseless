import type { SupabaseClient } from '@supabase/supabase-js'

const avatarCache = new Map<string, string>()

export const downloadAvatar = async (supabase: SupabaseClient, path: string) => {
	if (path === '/svg/default-avatar.svg') return path
	if (path.startsWith('https://')) return path
	if (avatarCache.has(path)) return avatarCache.get(path)!

	let url = '/svg/default-avatar.svg'
	try {
		const { data, error } = await supabase.storage.from('avatars').download(path)

		console.log(path)
		if (error) console.log(error)
		else url = URL.createObjectURL(data)
	} catch (error) {
		if (error instanceof Error) {
			console.log('Error downloading image: ', error.message)
		}
	}

	avatarCache.set(path, url)
	return url
}
