import { Property, SearchFilter } from '../types';

export interface UserAffinityProfile {
  cityCounts: Record<string, number>;
  areaCounts: Record<string, number>;
  typeCounts: Record<string, number>;
  purposeCounts: Record<string, number>;
  priceHistory: number[];
  bedsCounts: Record<number, number>;
  lastUpdated: string;
}

const AFFINITY_STORAGE_KEY = 'dealfast_user_affinities';

export function getUserAffinities(): UserAffinityProfile {
  if (typeof window === 'undefined') {
    return {
      cityCounts: {},
      areaCounts: {},
      typeCounts: {},
      purposeCounts: {},
      priceHistory: [],
      bedsCounts: {},
      lastUpdated: new Date().toISOString()
    };
  }
  try {
    const raw = localStorage.getItem(AFFINITY_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {}

  return {
    cityCounts: {},
    areaCounts: {},
    typeCounts: {},
    purposeCounts: {},
    priceHistory: [],
    bedsCounts: {},
    lastUpdated: new Date().toISOString()
  };
}

export function saveUserAffinities(profile: UserAffinityProfile): void {
  if (typeof window === 'undefined') return;
  try {
    profile.lastUpdated = new Date().toISOString();
    localStorage.setItem(AFFINITY_STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {}
}

/**
 * Silently track user interest ("Khufya tracking") when viewing or interacting with a property
 */
export function trackPropertyView(property: Property): UserAffinityProfile {
  const profile = getUserAffinities();

  if (property.city) {
    profile.cityCounts[property.city] = (profile.cityCounts[property.city] || 0) + 1;
  }
  if (property.area) {
    profile.areaCounts[property.area] = (profile.areaCounts[property.area] || 0) + 1;
  }
  if (property.type) {
    profile.typeCounts[property.type] = (profile.typeCounts[property.type] || 0) + 1;
  }
  if (property.purpose) {
    profile.purposeCounts[property.purpose] = (profile.purposeCounts[property.purpose] || 0) + 1;
  }
  if (property.beds) {
    profile.bedsCounts[property.beds] = (profile.bedsCounts[property.beds] || 0) + 1;
  }
  if (property.price && property.price > 0) {
    profile.priceHistory.push(property.price);
    if (profile.priceHistory.length > 20) {
      profile.priceHistory.shift(); // keep last 20
    }
  }

  saveUserAffinities(profile);
  return profile;
}

/**
 * Track stronger interactions like favorite, call, chat, token inquiry
 */
export function trackPropertyInteraction(property: Property, actionWeight: number = 3): UserAffinityProfile {
  let profile = getUserAffinities();
  for (let i = 0; i < actionWeight; i++) {
    profile = trackPropertyView(property);
  }
  return profile;
}

/**
 * Track search filter changes
 */
export function trackSearchPreference(filters: Partial<SearchFilter>): UserAffinityProfile {
  const profile = getUserAffinities();
  if (filters.city && filters.city !== 'All Cities') {
    profile.cityCounts[filters.city] = (profile.cityCounts[filters.city] || 0) + 2;
  }
  if (filters.area && filters.area.trim()) {
    profile.areaCounts[filters.area] = (profile.areaCounts[filters.area] || 0) + 2;
  }
  if (filters.type && filters.type !== 'all') {
    profile.typeCounts[filters.type] = (profile.typeCounts[filters.type] || 0) + 2;
  }
  if (filters.purpose && filters.purpose !== 'all') {
    profile.purposeCounts[filters.purpose] = (profile.purposeCounts[filters.purpose] || 0) + 2;
  }
  saveUserAffinities(profile);
  return profile;
}

/**
 * Calculate match score for a property based on user's implicit affinities (Facebook-style algorithm)
 */
export function calculateRelevanceScore(property: Property, profile: UserAffinityProfile): number {
  let score = 0;

  // City match (max 40 pts)
  const cityScore = profile.cityCounts[property.city] || 0;
  score += Math.min(cityScore * 10, 40);

  // Area match (max 30 pts)
  const areaScore = profile.areaCounts[property.area] || 0;
  score += Math.min(areaScore * 10, 30);

  // Property Type match (max 25 pts)
  const typeScore = profile.typeCounts[property.type] || 0;
  score += Math.min(typeScore * 8, 25);

  // Purpose match (max 15 pts)
  const purposeScore = profile.purposeCounts[property.purpose] || 0;
  score += Math.min(purposeScore * 5, 15);

  // Beds match (max 15 pts)
  if (property.beds && profile.bedsCounts[property.beds]) {
    score += Math.min(profile.bedsCounts[property.beds] * 5, 15);
  }

  // Price affinity match (max 20 pts)
  if (profile.priceHistory && profile.priceHistory.length > 0) {
    const avgPrice = profile.priceHistory.reduce((a, b) => a + b, 0) / profile.priceHistory.length;
    const ratio = property.price / avgPrice;
    if (ratio >= 0.7 && ratio <= 1.3) {
      score += 20;
    } else if (ratio >= 0.5 && ratio <= 1.6) {
      score += 10;
    }
  }

  return score;
}

/**
 * Facebook + OLX Hybrid Feed Ranking Algorithm:
 * 1. PREMIUM / FEATURED properties that match user's preferences COME FIRST (Rank 1).
 * 2. General PREMIUM / FEATURED properties (Rank 2).
 * 3. STANDARD properties that match user's preferences (Rank 3).
 * 4. General STANDARD properties (Rank 4).
 */
export function sortPropertiesWithOLXAndFBAlgorithm(
  list: Property[],
  sortBy: string = 'newest',
  profile: UserAffinityProfile
): Property[] {
  return [...list].sort((a, b) => {
    const isAPremium = !!(a.isFeatured || a.isPremium);
    const isBPremium = !!(b.isFeatured || b.isPremium);

    const scoreA = calculateRelevanceScore(a, profile);
    const scoreB = calculateRelevanceScore(b, profile);

    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

    let weightA = 0;
    if (isAPremium) {
      weightA = scoreA > 0 ? (3000000000 + scoreA * 100000) : 2000000000;
    } else {
      weightA = scoreA > 0 ? (1000000000 + scoreA * 100000) : 0;
    }

    let weightB = 0;
    if (isBPremium) {
      weightB = scoreB > 0 ? (3000000000 + scoreB * 100000) : 2000000000;
    } else {
      weightB = scoreB > 0 ? (1000000000 + scoreB * 100000) : 0;
    }

    if (weightA !== weightB) {
      return weightB - weightA;
    }

    // Secondary sorting by user's explicit filter choice
    if (sortBy === 'price_low') {
      return a.price - b.price;
    }
    if (sortBy === 'price_high') {
      return b.price - a.price;
    }
    if (sortBy === 'popular') {
      return (b.views || 0) - (a.views || 0);
    }

    // Default by newest
    return timeB - timeA;
  });
}
