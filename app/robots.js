// Helper para asegurar que la URL tenga protocolo
function ensureHttps(url) {
  if (!url) return 'https://www.eybitech.com';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
}

export default function robots() {
  const baseUrl = ensureHttps(process.env.NEXT_PUBLIC_APP_URL)
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/cart/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
