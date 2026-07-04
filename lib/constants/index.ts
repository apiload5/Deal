export const PROPERTY_TYPES = [
  { value: 'house', label: 'House' },
  { value: 'flat', label: 'Flat / Apartment' },
  { value: 'plot', label: 'Plot / Land' },
  { value: 'commercial', label: 'Commercial' },
] as const;

export const PURPOSES = [
  { value: 'sale', label: 'For Sale' },
  { value: 'rent', label: 'For Rent' },
] as const;

export const BEDS_OPTIONS = [
  { value: 0, label: 'Any' },
  { value: 1, label: '1+' },
  { value: 2, label: '2+' },
  { value: 3, label: '3+' },
  { value: 4, label: '4+' },
  { value: 5, label: '5+' },
] as const;

export const PRICE_RANGES = [
  { label: 'Any Price', min: 0, max: 999999999 },
  { label: 'Under 50 Lakh', min: 0, max: 5000000 },
  { label: '50 Lakh - 1 Crore', min: 5000000, max: 10000000 },
  { label: '1 - 2 Crore', min: 10000000, max: 20000000 },
  { label: '2 - 5 Crore', min: 20000000, max: 50000000 },
  { label: '5+ Crore', min: 50000000, max: 999999999 },
] as const;

export const CITIES = [
  { id: '1', name: 'Karachi', slug: 'karachi' },
  { id: '2', name: 'Lahore', slug: 'lahore' },
  { id: '3', name: 'Islamabad', slug: 'islamabad' },
  { id: '4', name: 'Rawalpindi', slug: 'rawalpindi' },
  { id: '5', name: 'Peshawar', slug: 'peshawar' },
  { id: '6', name: 'Quetta', slug: 'quetta' },
  { id: '7', name: 'Faisalabad', slug: 'faisalabad' },
  { id: '8', name: 'Multan', slug: 'multan' },
] as const;
