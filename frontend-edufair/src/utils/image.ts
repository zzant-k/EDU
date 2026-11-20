export const getLogoUrl = (logo?: string | null): string => {
  if (!logo) return ''
  if (logo.startsWith('http://') || logo.startsWith('https://')) {
    return logo
  }
  // Local static asset path in public folder (e.g. /logos/binus.png)
  if (logo.startsWith('/')) {
    return logo
  }
  // If it's a relative filename like 'binus.png'
  if (!logo.includes('/') && (logo.endsWith('.png') || logo.endsWith('.svg') || logo.endsWith('.webp') || logo.endsWith('.jpg'))) {
    return `/logos/${logo}`
  }
  // Remove leading 'logos/' or 'storage/' if present
  const cleanPath = logo.replace(/^(storage\/|logos\/)/, '')
  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
    return cleanPath
  }
  return `/logos/${cleanPath}`
}

