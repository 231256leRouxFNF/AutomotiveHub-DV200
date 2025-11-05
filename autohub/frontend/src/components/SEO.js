import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({
  title = 'AutoHub',
  description = 'Your automotive community for buying, selling, and managing vehicles',
  url = 'https://automotivehub-dv200.vercel.app',
  image = '/images/logo.png',
  type = 'website',
  twitterCard = 'summary_large_image',

  // Just thought i'd expand the keywords a bit for better SEO to see if it acttually helps
  keywords = 'cars, automotive, marketplace, buy car, sell car, vehicle management, car community, AutoHub, car events, car listings, Africa, Asia, Europe, North America, South America, Australia, Antarctica, United States, Canada, Mexico, Brazil, Argentina, United Kingdom, Germany, France, Italy, Spain, Russia, China, Japan, India, Australia, South Africa, Nigeria, Egypt, Morocco, Kenya, Saudi Arabia, Turkey, Indonesia, Thailand, Malaysia, Philippines, Vietnam, Singapore, South Korea, Pakistan, Bangladesh, Ukraine, Poland, Netherlands, Belgium, Sweden, Norway, Denmark, Finland, Switzerland, Austria, Greece, Portugal, Ireland, Czech Republic, Hungary, Romania, Bulgaria, Serbia, Croatia, Slovakia, Slovenia, Estonia, Latvia, Lithuania, Belarus, Moldova, Georgia, Armenia, Azerbaijan, Kazakhstan, Uzbekistan, Turkmenistan, Kyrgyzstan, Tajikistan, Mongolia, New Zealand, Chile, Colombia, Peru, Venezuela, Ecuador, Bolivia, Paraguay, Uruguay, Costa Rica, Panama, Guatemala, Honduras, El Salvador, Nicaragua, Cuba, Dominican Republic, Haiti, Jamaica, Trinidad and Tobago, Bahamas, Barbados, Saint Lucia, Saint Vincent, Grenada, Antigua, Dominica, Saint Kitts, Belize, Guyana, Suriname',
}) => (
  <Helmet>
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta name="keywords" content={keywords} />
    <link rel="canonical" href={url} />

    {/* Open Graph */}
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content={type} />
    <meta property="og:url" content={url} />
    <meta property="og:image" content={image} />

    {/* Twitter Card */}
    <meta name="twitter:card" content={twitterCard} />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={image} />
  </Helmet>
);

export default SEO;