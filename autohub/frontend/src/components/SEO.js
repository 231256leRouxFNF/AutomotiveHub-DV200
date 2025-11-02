import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title = 'AutoHub - Your Automotive Community',
  description = 'Join AutoHub to connect with car enthusiasts, buy and sell vehicles, manage your garage, and discover automotive events.',
  keywords = 'cars, automotive, vehicles, car community, marketplace, garage management, car events',
  author = 'AutoHub',
  image = 'https://automotivehub-dv200.vercel.app/og-image.jpg',
  url = 'https://automotivehub-dv200.vercel.app',
  type = 'website'
}) => {
  const siteTitle = title.includes('AutoHub') ? title : `${title} | AutoHub`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="AutoHub" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="English" />
    </Helmet>
  );
};

export default SEO;