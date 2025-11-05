# SEO Implementation Guide for AutoHub

This guide explains how SEO is set up and managed in the AutoHub React application, including meta tags, Open Graph, Twitter Cards, and structured data for rich results.

## 1. Meta Tags and Helmet

AutoHub uses the `react-helmet-async` library to manage meta tags dynamically. The app is wrapped in `<HelmetProvider>` in `src/App.js` to enable safe usage of `<Helmet>` components throughout the app.

### Dynamic Meta Tags
- The reusable `SEO.js` component in `src/components/SEO.js` allows you to set:
  - Page title
  - Description
  - Canonical URL
  - Open Graph tags (for Facebook/social sharing)
  - Twitter Card tags

**Usage Example:**
```jsx
import SEO from '../components/SEO';
<SEO
  title="AutoHub Community Feed"
  description="Join the AutoHub community to share, discuss, and connect with fellow automotive enthusiasts."
  url="https://automotivehub-dv200.vercel.app/community"
  image="/images/logo.png"
/>
```
Add this to the top of any page component to set its meta tags.

## 2. Structured Data (JSON-LD)

Structured data helps search engines understand your content and can enable rich results (like car listings in Google).

- The `StructuredData.js` component in `src/components/StructuredData.js` provides:
  - Website schema (`WebsiteStructuredData`)
  - Vehicle schema (`VehicleStructuredData`)

**Usage Example:**
```jsx
import { VehicleStructuredData } from '../components/StructuredData';
<VehicleStructuredData vehicle={vehicleObject} />
```

## 3. Best Practices
- Always set a unique title and description for each page.
- Use canonical URLs to avoid duplicate content issues.
- Add Open Graph and Twitter tags for better social sharing previews.
- Use structured data for listings, vehicles, and main site info.
- Ensure your app is wrapped in `<HelmetProvider>` (already done in `App.js`).

## 4. Extending SEO
- Add `<SEO />` to all main pages (Marketplace, Profile, Garage, etc.) with relevant props.
- Use structured data for any page with rich content (e.g., vehicle details, user profiles).
- Update meta tags dynamically based on page data (e.g., vehicle info, user info).

## 5. Troubleshooting
- If you see errors like `HelmetDispatcher` or meta tags not updating, ensure `<HelmetProvider>` is present at the top level.
- Check for duplicate imports of `SEO` or `Helmet`.
- Use browser dev tools to inspect meta tags in the `<head>`.

---

For more details, see:
- [react-helmet-async documentation](https://github.com/staylor/react-helmet-async)
- [Google Search Central: SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Schema.org Vehicle](https://schema.org/Vehicle)

AutoHub is now SEO-ready for search engines and social sharing!
