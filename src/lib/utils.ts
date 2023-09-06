import type { SupabaseClient } from '@supabase/supabase-js'

export const downloadAvatar = async (supabase: SupabaseClient, path: string) => {
	try {
		const { data, error } = await supabase.storage.from('avatars').download(path)

		if (error) {
			throw error
		}

		const url = URL.createObjectURL(data)
		return url
	} catch (error) {
		if (error instanceof Error) {
			console.log('Error downloading image: ', error.message)
		}
		return null
	}
}
