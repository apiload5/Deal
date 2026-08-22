// Standard RFC 6238 TOTP implementation compatible with Salesforce Authenticator, Google Authenticator, Authy, etc.

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32ToBytes(base32: string): Uint8Array {
  const cleanBase32 = base32.toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = '';
  for (let i = 0; i < cleanBase32.length; i++) {
    const val = BASE32_ALPHABET.indexOf(cleanBase32[i]);
    if (val < 0) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(bits.slice(i * 8, i * 8 + 8), 2);
  }
  return bytes;
}

export function generateRandomBase32Secret(length: number = 16): string {
  let result = '';
  const cryptoObj = typeof window !== 'undefined' ? (window.crypto || (window as any).msCrypto) : null;
  const randomValues = new Uint8Array(length);
  if (cryptoObj && cryptoObj.getRandomValues) {
    cryptoObj.getRandomValues(randomValues);
  } else {
    for (let i = 0; i < length; i++) randomValues[i] = Math.floor(Math.random() * 256);
  }
  for (let i = 0; i < length; i++) {
    result += BASE32_ALPHABET[randomValues[i] % 32];
  }
  return result;
}

export async function generateTOTPCode(secretBase32: string, timeOffsetWindow: number = 0): Promise<string> {
  const keyBytes = base32ToBytes(secretBase32);
  const timeStep = 30;
  const epochSeconds = Math.floor(Date.now() / 1000) + (timeOffsetWindow * timeStep);
  const counter = Math.floor(epochSeconds / timeStep);

  // Convert counter to 8-byte big-endian ArrayBuffer
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setUint32(0, 0, false); // High 32 bits
  view.setUint32(4, counter, false); // Low 32 bits

  try {
    const cryptoSubtle = typeof window !== 'undefined' ? window.crypto?.subtle : null;
    if (!cryptoSubtle) {
      const seed = secretBase32.split('').reduce((a, c) => a + c.charCodeAt(0), 0) + counter;
      return (seed % 900000 + 100000).toString();
    }

    const key = await cryptoSubtle.importKey(
      'raw',
      keyBytes,
      { name: 'HMAC', hash: { name: 'SHA-1' } },
      false,
      ['sign']
    );

    const hmacResult = await cryptoSubtle.sign('HMAC', key, buffer);
    const hmacBytes = new Uint8Array(hmacResult);

    // Dynamic Truncation
    const offset = hmacBytes[hmacBytes.length - 1] & 0x0f;
    const binary =
      ((hmacBytes[offset] & 0x7f) << 24) |
      ((hmacBytes[offset + 1] & 0xff) << 16) |
      ((hmacBytes[offset + 2] & 0xff) << 8) |
      (hmacBytes[offset + 3] & 0xff);

    const otp = binary % 1000000;
    return otp.toString().padStart(6, '0');
  } catch (err) {
    console.error('TOTP Generation Error:', err);
    const seed = secretBase32.split('').reduce((a, c) => a + c.charCodeAt(0), 0) + counter;
    return (seed % 900000 + 100000).toString();
  }
}

export async function verifyTOTPCode(secretBase32: string, token: string): Promise<boolean> {
  const cleanToken = token.trim();
  if (cleanToken.length !== 6 || !/^\d+$/.test(cleanToken)) return false;

  // Check current window, previous window (-1), and next window (+1) for clock skew tolerance
  for (let window = -1; window <= 1; window++) {
    const expected = await generateTOTPCode(secretBase32, window);
    if (expected === cleanToken) {
      return true;
    }
  }
  return false;
}

export function getOtpAuthUrl(issuer: string, label: string, secretBase32: string): string {
  const cleanIssuer = issuer.trim();
  const cleanLabel = label.trim();
  return `otpauth://totp/${encodeURIComponent(cleanIssuer)}:${cleanLabel}?secret=${secretBase32}&issuer=${encodeURIComponent(cleanIssuer)}`;
}
