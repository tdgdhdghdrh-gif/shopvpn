export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// Organization Schema
export function OrganizationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '',
    alternateName: '',
    url: 'https://simonvpn.darkx.shop',
    logo: 'https://simonvpn.darkx.shop/icon-512x512.png',
    description: 'บริการ VPN ความเร็วสูงอันดับ 1 ในไทย รองรับ AIS, TRUE, DTAC เล่นเกมลื่น ดูหนังไม่กระตุก ทดลองใช้ฟรี',
    foundingDate: '2024',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: 'Thai',
    },
    sameAs: [],
    areaServed: {
      '@type': 'Country',
      name: 'Thailand',
    },
  }
  return <JsonLd data={data} />
}

// WebSite Schema (สำหรับ Google Sitelinks Search Box)
export function WebSiteJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '',
    alternateName: [''],
    url: 'https://simonvpn.darkx.shop',
    inLanguage: 'th-TH',
    description: 'บริการ VPN ความเร็วสูง เน็ตแรง เสถียร เล่นเกมลื่น ดูหนังไม่กระตุก รองรับ AIS TRUE DTAC',
    publisher: {
      '@type': 'Organization',
      name: '',
      logo: {
        '@type': 'ImageObject',
        url: 'https://simonvpn.darkx.shop/icon-512x512.png',
      },
    },
  }
  return <JsonLd data={data} />
}

// FAQPage Schema
export function FAQPageJsonLd({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
  return <JsonLd data={data} />
}

// Product Schema (สำหรับ VPN แพ็กเกจ)
export function ProductJsonLd({
  name,
  description,
  price,
  currency = 'THB',
  availability = 'https://schema.org/InStock',
}: {
  name: string
  description: string
  price: string
  currency?: string
  availability?: string
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    brand: {
      '@type': 'Brand',
      name: '',
    },
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency: currency,
      availability,
      seller: {
        '@type': 'Organization',
      name: '',
      },
    },
    category: 'VPN Service',
  }
  return <JsonLd data={data} />
}

// BreadcrumbList Schema
export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[]
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
  return <JsonLd data={data} />
}

// SoftwareApplication Schema (VPN เป็น Software)
export function SoftwareApplicationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'VPN',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'iOS, Android, Windows, macOS',
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: '50',
      highPrice: '200',
      priceCurrency: 'THB',
      offerCount: '3',
    },
    description: 'บริการ VPN ความเร็วสูง เน็ตแรง เสถียร รองรับ AIS TRUE DTAC เล่นเกมลื่น ดูหนัง 4K ไม่กระตุก',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '500',
      bestRating: '5',
    },
  }
  return <JsonLd data={data} />
}

// LocalBusiness Schema (สำหรับ Local SEO)
export function LocalBusinessJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: '',
    description: 'บริการ VPN ความเร็วสูงในประเทศไทย เน็ตแรง เสถียร เล่นเกมลื่น ดูหนังไม่กระตุก',
    url: 'https://simonvpn.darkx.shop',
    logo: 'https://simonvpn.darkx.shop/icon-512x512.png',
    image: 'https://simonvpn.darkx.shop/icon-512x512.png',
    priceRange: '฿50 - ฿200',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'TH',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '13.7563',
      longitude: '100.5018',
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '00:00',
      closes: '23:59',
    },
  }
  return <JsonLd data={data} />
}
