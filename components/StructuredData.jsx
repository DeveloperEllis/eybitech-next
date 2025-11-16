"use client";
import Script from 'next/script';

export default function StructuredData({ type = 'Organization', data = {} }) {
  const getStructuredData = () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.eybitech.com';
    
    switch (type) {
      case 'Organization':
        return {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Eybitech',
          url: baseUrl,
          logo: `${baseUrl}/logo.png`,
          description: 'Tienda de tecnología en Cuba. Smartphones, laptops, tablets y accesorios con envío a toda Cuba.',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Trinidad',
            addressRegion: 'Sancti Spíritus',
            addressCountry: 'CU',
          },
          geo: {
            '@type': 'GeoCoordinates',
            latitude: '21.8022',
            longitude: '-79.9833',
          },
          sameAs: [
            data.facebook || '',
            data.twitter || 'https://twitter.com/eybitech',
            data.instagram || '',
          ].filter(Boolean),
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'Customer Service',
            availableLanguage: ['Spanish'],
          },
        };
        
      case 'WebSite':
        return {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Eybitech',
          url: baseUrl,
          description: 'Tienda online de tecnología en Cuba',
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${baseUrl}/?search={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          },
        };
        
      case 'Product':
        return {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: data.name,
          description: data.description,
          image: data.image_url,
          sku: data.id,
          brand: {
            '@type': 'Brand',
            name: data.brand || 'Eybitech',
          },
          offers: {
            '@type': 'Offer',
            url: `${baseUrl}/product/${data.id}`,
            priceCurrency: data.currency || 'USD',
            price: data.price,
            ...(data.original_price && {
              priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            }),
            availability: data.stock > 0 
              ? 'https://schema.org/InStock' 
              : 'https://schema.org/OutOfStock',
            seller: {
              '@type': 'Organization',
              name: 'Eybitech',
            },
          },
          ...(data.rating && {
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: data.rating,
              reviewCount: data.reviewCount || 1,
            },
          }),
        };
        
      case 'BreadcrumbList':
        return {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: (data.items || []).map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
          })),
        };
        
      default:
        return null;
    }
  };

  const structuredData = getStructuredData();
  
  if (!structuredData) return null;

  return (
    <Script
      id={`structured-data-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
