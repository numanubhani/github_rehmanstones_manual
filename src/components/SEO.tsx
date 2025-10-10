// src/components/SEO.tsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: string;
  canonical?: string;
}

export default function SEO({
  title = "Rehman Stones - Premium Silver Jewelry & Gemstones",
  description = "Discover handcrafted 925 silver rings, gemstone jewelry, and authentic stones. Premium quality silver jewelry with cash on delivery. Shop now!",
  keywords = "silver rings, 925 silver, gemstones, aqeeq ring, dure-e-najaf, handcrafted jewelry, silver jewelry Pakistan",
  image = "/logo.png",
  type = "website",
  canonical,
}: SEOProps) {
  const location = useLocation();
  const siteUrl = "https://rehmanstones.com"; // Update with your actual domain
  const currentUrl = canonical || `${siteUrl}${location.pathname}`;
  const fullTitle = title.includes("Rehman Stones") ? title : `${title} | Rehman Stones`;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, attribute: "name" | "property" = "name") => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.content = content;
    };

    // Update or create link tags
    const updateLinkTag = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      if (!element) {
        element = document.createElement("link");
        element.rel = rel;
        document.head.appendChild(element);
      }
      element.href = href;
    };

    // Basic meta tags
    updateMetaTag("description", description);
    updateMetaTag("keywords", keywords);

    // Open Graph tags
    updateMetaTag("og:title", fullTitle, "property");
    updateMetaTag("og:description", description, "property");
    updateMetaTag("og:type", type, "property");
    updateMetaTag("og:url", currentUrl, "property");
    updateMetaTag("og:image", image.startsWith("http") ? image : `${siteUrl}${image}`, "property");
    updateMetaTag("og:site_name", "Rehman Stones", "property");

    // Twitter Card tags
    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:title", fullTitle);
    updateMetaTag("twitter:description", description);
    updateMetaTag("twitter:image", image.startsWith("http") ? image : `${siteUrl}${image}`);

    // Canonical URL
    updateLinkTag("canonical", currentUrl);

    // Additional SEO tags
    updateMetaTag("robots", "index, follow");
    updateMetaTag("language", "English");
    updateMetaTag("author", "Rehman Stones");
  }, [fullTitle, description, keywords, image, type, currentUrl]);

  return null;
}

