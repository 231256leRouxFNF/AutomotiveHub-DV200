import React from 'react';
import { Helmet } from 'react-helmet-async';

export const WebsiteStructuredData = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "AutoHub",
    "url": "https://automotivehub-dv200.vercel.app",
    "description": "Your automotive community for buying, selling, and managing vehicles",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://automotivehub-dv200.vercel.app/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export const VehicleStructuredData = ({ vehicle }) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Car",
    "name": `${vehicle.make} ${vehicle.model}`,
    "brand": vehicle.make,
    "model": vehicle.model,
    "vehicleModelDate": vehicle.year,
    "color": vehicle.color,
    "description": vehicle.description,
    "image": vehicle.imageUrl
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};