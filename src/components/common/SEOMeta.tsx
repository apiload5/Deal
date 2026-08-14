'use client';

import React, { useEffect } from 'react';
import { Property, Project, Agency, Agent, BlogArticle } from '@/src/types';

interface SEOMetaProps {
  activeTab?: string;
  selectedProperty?: Property | null;
  selectedProject?: Project | null;
  selectedAgency?: Agency | null;
  selectedAgent?: Agent | null;
  selectedBlog?: BlogArticle | null;
  selectedCity?: string;
}

export const SEOMeta: React.FC<SEOMetaProps> = ({
  activeTab = 'properties',
  selectedProperty,
  selectedProject,
  selectedAgency,
  selectedAgent,
  selectedBlog,
  selectedCity,
}) => {
  useEffect(() => {
    let title = "DealFast - Pakistan's Premier Escrow Protected Real Estate Platform";
    let description = "Buy, sell, rent & invest in verified properties, residential projects, societies, and commercial real estate across Pakistan with 100% Escrow buyer protection.";
    let keywords = "real estate pakistan, properties for sale in islamabad, dha lahore plots, bahria town karachi houses, escrow property deal, real estate agents, property verification, noc checking";
    let ogImage = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80";
    let canonicalUrl = typeof window !== 'undefined' ? window.location.href : 'https://dealfast.pk';
    let ogType = "website";

    let schemaData: any = null;

    // 1. Property Detail SEO
    if (selectedProperty) {
      const priceFormatted = selectedProperty.price >= 10000000 
        ? `PKR ${(selectedProperty.price / 10000000).toFixed(2)} Crore`
        : `PKR ${(selectedProperty.price / 100000).toFixed(2)} Lakh`;

      title = `${selectedProperty.title} in ${selectedProperty.area}, ${selectedProperty.city} | ${priceFormatted} - DealFast`;
      description = `Verified ${selectedProperty.type} for ${selectedProperty.purpose} in ${selectedProperty.area}, ${selectedProperty.city}. ${selectedProperty.beds ? `${selectedProperty.beds} Bed, ${selectedProperty.baths} Bath, ` : ''}${selectedProperty.sqft} SqFt. Price: ${priceFormatted}. 100% Escrow Protected.`;
      keywords = `${selectedProperty.title}, ${selectedProperty.type} for ${selectedProperty.purpose} in ${selectedProperty.city}, ${selectedProperty.area} property, dealfast escrow real estate`;
      ogImage = selectedProperty.images[0] || ogImage;
      ogType = "article";

      schemaData = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "RealEstateListing",
            "name": selectedProperty.title,
            "description": description,
            "url": canonicalUrl,
            "image": selectedProperty.images,
            "datePosted": selectedProperty.createdAt || "2026-01-01",
            "validFrom": selectedProperty.createdAt || "2026-01-01",
            "offers": {
              "@type": "Offer",
              "price": selectedProperty.price,
              "priceCurrency": "PKR",
              "availability": selectedProperty.status !== 'sold' && selectedProperty.status !== 'rented' ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
              "validFrom": "2026-01-01",
              "seller": {
                "@type": "RealEstateAgent",
                "name": selectedProperty.ownerName || "DealFast Certified Agent",
                "telephone": selectedProperty.ownerPhone || "+92 300 0000000"
              }
            },
            "itemOffered": {
              "@type": selectedProperty.type === 'house' || selectedProperty.type === 'villa' ? "SingleFamilyResidence" : "Accommodation",
              "name": selectedProperty.title,
              "address": {
                "@type": "PostalAddress",
                "addressLocality": selectedProperty.city,
                "addressRegion": selectedProperty.area,
                "addressCountry": "PK"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": selectedProperty.lat || 33.6844,
                "longitude": selectedProperty.lng || 73.0479
              },
              "numberOfRooms": selectedProperty.beds || 3,
              "numberOfBathroomsTotal": selectedProperty.baths || 3,
              "floorSize": {
                "@type": "QuantitativeValue",
                "value": selectedProperty.sqft,
                "unitCode": "FTK"
              }
            }
          },
          {
            "@type": "Product",
            "name": selectedProperty.title,
            "description": description,
            "image": selectedProperty.images,
            "category": `Real Estate > ${selectedProperty.type}`,
            "offers": {
              "@type": "Offer",
              "price": selectedProperty.price,
              "priceCurrency": "PKR",
              "availability": selectedProperty.status !== 'sold' && selectedProperty.status !== 'rented' ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
              "seller": {
                "@type": "Organization",
                "name": "DealFast Pakistan Real Estate Portal"
              }
            }
          }
        ]
      };
    } 
    // 2. Project Detail SEO
    else if (selectedProject) {
      title = `${selectedProject.title} by ${selectedProject.builderName} in ${selectedProject.city} - DealFast`;
      description = `Official booking & installment plans for ${selectedProject.title} in ${selectedProject.area}, ${selectedProject.city}. RDA/CDA Approved society with 100% Escrow security.`;
      keywords = `${selectedProject.title}, ${selectedProject.builderName}, ${selectedProject.city} mega housing project, RDA CDA approved society, real estate investment pakistan`;
      ogImage = selectedProject.images[0] || ogImage;

      schemaData = {
        "@context": "https://schema.org",
        "@type": "RealEstateAgent",
        "name": selectedProject.title,
        "description": description,
        "url": canonicalUrl,
        "image": selectedProject.images[0],
        "address": {
          "@type": "PostalAddress",
          "addressLocality": selectedProject.city,
          "addressRegion": selectedProject.area,
          "addressCountry": "PK"
        }
      };
    }
    // 3. Agency Detail SEO
    else if (selectedAgency) {
      title = `${selectedAgency.name} - Verified Real Estate Agency in ${selectedAgency.city} | DealFast`;
      description = `${selectedAgency.name} is a certified real estate agency in ${selectedAgency.city} with ${selectedAgency.rating}★ rating. Contact verified agents for buying, selling and escrow property deals.`;
      keywords = `${selectedAgency.name}, real estate agency ${selectedAgency.city}, verified property brokers, property dealers in ${selectedAgency.city}`;
      ogImage = selectedAgency.logo || selectedAgency.coverImage || ogImage;

      schemaData = {
        "@context": "https://schema.org",
        "@type": "RealEstateAgent",
        "name": selectedAgency.name,
        "description": description,
        "url": canonicalUrl,
        "image": selectedAgency.logo,
        "telephone": selectedAgency.phone,
        "email": selectedAgency.email,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": selectedAgency.city,
          "addressCountry": "PK"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": selectedAgency.rating || 4.9,
          "reviewCount": selectedAgency.reviewCount || 45
        }
      };
    }
    // 4. Agent Detail SEO
    else if (selectedAgent) {
      title = `${selectedAgent.name} - Certified Real Estate Agent in ${selectedAgent.city} | DealFast`;
      description = `Connect with ${selectedAgent.name} (${selectedAgent.agencyName || 'Independent Advisor'}), top-rated real estate agent specializing in ${selectedAgent.city} properties and escrow transactions.`;
      keywords = `${selectedAgent.name}, ${selectedAgent.agencyName || 'advisor'}, real estate agent ${selectedAgent.city}, top property consultant ${selectedAgent.city}`;
      ogImage = selectedAgent.avatar || ogImage;

      schemaData = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": selectedAgent.name,
        "jobTitle": "Certified Real Estate Agent",
        "worksFor": {
          "@type": "Organization",
          "name": selectedAgent.agencyName || "DealFast Certified Network"
        },
        "telephone": selectedAgent.phone,
        "email": selectedAgent.email,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": selectedAgent.city,
          "addressCountry": "PK"
        }
      };
    }
    // 5. Blog Detail SEO
    else if (selectedBlog) {
      title = `${selectedBlog.title} | DealFast Real Estate Insights`;
      description = selectedBlog.summary || selectedBlog.excerpt || selectedBlog.title;
      keywords = `${selectedBlog.tags?.join(', ') || 'real estate blog'}, pakistan real estate guide, property investment tips`;
      ogImage = selectedBlog.image || ogImage;
      ogType = "article";

      schemaData = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": selectedBlog.title,
        "description": selectedBlog.summary || selectedBlog.excerpt,
        "image": selectedBlog.image,
        "author": {
          "@type": "Person",
          "name": selectedBlog.authorName || selectedBlog.author || "DealFast Research Team"
        },
        "publisher": {
          "@type": "Organization",
          "name": "DealFast",
          "logo": {
            "@type": "ImageObject",
            "url": "https://dealfast.pk/logo.png"
          }
        },
        "datePublished": selectedBlog.publishedAt || selectedBlog.date || "2026-01-01"
      };
    }
    // 6. City Filter SEO Landing
    else if (selectedCity && selectedCity !== 'All Cities') {
      title = `Properties & Real Estate for Sale in ${selectedCity} | Escrow Guaranteed - DealFast`;
      description = `Find verified houses, plots, apartments, and commercial properties for sale or rent in ${selectedCity}. Safe transactions with 100% Escrow protection.`;
      keywords = `properties in ${selectedCity}, houses for sale in ${selectedCity}, plots in ${selectedCity}, real estate ${selectedCity} pakistan`;
    }
    // 7. General Tab SEO
    else {
      switch (activeTab) {
        case 'projects':
          title = "Top Residential & Commercial Housing Projects in Pakistan | DealFast";
          description = "Discover luxury housing schemes, high-rise apartments, and CDA/RDA approved commercial projects across Islamabad, Lahore, Karachi & Rawalpindi.";
          break;
        case 'agencies':
          title = "Verified Real Estate Agencies & Brokers in Pakistan | DealFast";
          description = "Find certified real estate agencies in Islamabad, Lahore, Karachi & major cities. Verified agents with high ratings & escrow compliance.";
          break;
        case 'agents':
          title = "Certified Real Estate Consultants & Agents in Pakistan | DealFast";
          description = "Browse top-performing real estate consultants, property advisors, and verified agents in Pakistan.";
          break;
        case 'blogs':
        case 'blog':
          title = "Pakistan Real Estate News, Guides & Market Analytics | DealFast";
          description = "Read expert articles on real estate investment strategies, society NOC verification, tax rates, and property market forecasts in Pakistan.";
          break;
        case 'hiring':
          title = "Real Estate Jobs & Agent Talent Network in Pakistan | DealFast";
          description = "Join leading real estate agencies or hire top-tier real estate sales consultants and property managers in Pakistan.";
          break;
      }
    }

    // Default Site Schema if no specific detail schema
    if (!schemaData) {
      schemaData = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "DealFast Pakistan",
        "alternateName": "DealFast Escrow Real Estate Portal",
        "url": "https://dealfast.pk",
        "description": description,
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://dealfast.pk/?search={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      };
    }

    // Set Document Title
    document.title = title;

    // Helper to update or append meta tag
    const setMetaTag = (nameAttr: string, attrVal: string, contentVal: string) => {
      let element = document.querySelector(`meta[${nameAttr}="${attrVal}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(nameAttr, attrVal);
        document.head.appendChild(element);
      }
      element.setAttribute('content', contentVal);
    };

    // Helper to update canonical link
    let canonicalElement = document.querySelector('link[rel="canonical"]');
    if (!canonicalElement) {
      canonicalElement = document.createElement('link');
      canonicalElement.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalElement);
    }
    canonicalElement.setAttribute('href', canonicalUrl);

    // Set Standard Meta
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'keywords', keywords);
    setMetaTag('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

    // Set OpenGraph
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:site_name', 'DealFast Real Estate');

    // Set Twitter Cards
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', ogImage);

    // Inject JSON-LD Schema
    let scriptElement = document.getElementById('json-ld-schema');
    if (!scriptElement) {
      scriptElement = document.createElement('script');
      scriptElement.id = 'json-ld-schema';
      scriptElement.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptElement);
    }
    scriptElement.textContent = JSON.stringify(schemaData);

  }, [activeTab, selectedProperty, selectedProject, selectedAgency, selectedAgent, selectedBlog, selectedCity]);

  return null;
};
