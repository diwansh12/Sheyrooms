// components/SEO/MetaTags.jsx - SEO Component
import React from 'react';
import { Helmet } from 'react-helmet-async';

const MetaTags = ({
  title = 'SheyRooms - Premium Hotel Booking',
  description = 'Find and book the perfect hotel room with SheyRooms. Premium accommodations, best prices, and exceptional service.',
  image = '/images/og-image.jpg',
  url,
  type = 'website',
  keywords = 'hotel booking, luxury hotels, accommodation, travel, rooms',
  author = 'SheyRooms',
  siteName = 'SheyRooms'
}) => {
  const fullUrl = url ? `${window.location.origin}${url}` : window.location.href;
  const fullImageUrl = image.startsWith('http') ? image : `${window.location.origin}${image}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:site" content="@sheyrooms" />
      <meta name="twitter:creator" content="@sheyrooms" />

      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#3B82F6" />
      <meta name="msapplication-TileColor" content="#3B82F6" />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "TravelAgency",
          "name": siteName,
          "description": description,
          "url": fullUrl,
          "logo": `${window.location.origin}/logo.png`,
          "sameAs": [
            "https://facebook.com/sheyrooms",
            "https://twitter.com/sheyrooms",
            "https://instagram.com/sheyrooms"
          ],
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+91-9876543210",
            "contactType": "customer service"
          }
        })}
      </script>
    </Helmet>
  );
};

export default MetaTags;
