// src/components/SEO.jsx
import { Helmet } from 'react-helmet-async'

const BASE_URL = 'https://fragbeats.vercel.app'
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`
const DEFAULT_TITLE = 'FragBeats — Game. Edit. Vibe.'
const DEFAULT_DESCRIPTION = 'Short-form gaming clips for Indian creators. Upload, discover, like, save, and share your best frags.'

function SEO({ title, description, image, url, type = 'website' }) {
  const fullTitle = title ? `${title} | FragBeats` : DEFAULT_TITLE
  const fullDescription = description || DEFAULT_DESCRIPTION
  const fullImage = image || DEFAULT_IMAGE
  const fullUrl = url ? `${BASE_URL}${url}` : BASE_URL

  return (
    <Helmet>
      {/* Base */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={fullImage} />
    </Helmet>
  )
}

export default SEO