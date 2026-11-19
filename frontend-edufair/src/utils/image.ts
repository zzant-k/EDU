import { SUPABASE_URL } from '../api/supabase'

export const getLogoUrl = (logo?: string | null): string => {
  if (!logo) return ''
  if (logo.startsWith('http://') || logo.startsWith('https://')) {
    return logo
  }
  // Remove leading 'logos/' or 'storage/' if present
  const cleanPath = logo.replace(/^(storage\/|logos\/)/, '')
  return `${SUPABASE_URL}/storage/v1/object/public/logos/${cleanPath}`
}

