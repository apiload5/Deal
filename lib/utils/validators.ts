export const validatePhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 13;
};

export const validateWhatsApp = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.startsWith('92') && cleaned.length === 12;
};

export const validateTikTokUrl = (url: string): boolean => {
  const pattern = /^https?:\/\/(www\.)?(tiktok\.com|vm\.tiktok\.com)\/.*video\/\d+/;
  return pattern.test(url);
};

export const validatePrice = (price: number): boolean => {
  return price > 0 && price < 10000000000;
};

export const validateImages = (images: string[]): boolean => {
  return images.length >= 1 && images.length <= 10;
};
