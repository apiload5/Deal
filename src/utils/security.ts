import bcrypt from 'bcryptjs';

// Advanced Security Utility Module for DealFast Real Estate Portal

// 1. DANGEROUS FILE UPLOAD SHIELD (Blocks EXE, BAT, VBS, DLL, SCR, etc.)
const BLOCKED_EXTENSIONS = [
  'exe', 'bat', 'sh', 'vbs', 'msi', 'com', 'cmd', 'scr', 'pif', 'application',
  'gadget', 'msp', 'hta', 'cpl', 'msc', 'jar', 'ps1', 'ps1xml', 'ps2', 'ps2xml',
  'psc1', 'psc2', 'exe', 'dll', 'sys', 'drv', 'sct', 'wsc', 'wsf', 'wsh'
];

const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'application/pdf', 'image/svg+xml'
];

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  cleanName?: string;
}

export function validateFileUpload(file: File, maxSizeBytes: number = 10 * 1024 * 1024): FileValidationResult {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  // Size Check
  if (file.size > maxSizeBytes) {
    return { valid: false, error: `File size exceeds the max allowed limit (${Math.round(maxSizeBytes / (1024 * 1024))}MB).` };
  }

  // Extension Check
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  if (BLOCKED_EXTENSIONS.includes(extension)) {
    return { valid: false, error: `🚨 SECURITY SHIELD BLOCKED: Executable/Binary file type (.${extension}) is strictly prohibited for system safety.` };
  }

  // MIME Type Check
  if (file.type && !ALLOWED_MIME_TYPES.includes(file.type.toLowerCase()) && !file.type.startsWith('image/')) {
    return { valid: false, error: `🚨 Invalid File Format: Only clean Images (JPG, PNG, WEBP) and PDF documents are allowed.` };
  }

  // Sanitize Filename to prevent Directory Traversal or Code Injection
  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

  return { valid: true, cleanName };
}

// 2. AES-256 SIMULATED / BASE64 ENCRYPTION FOR SENSITIVE ESCROW & CNIC DATA
export function encryptSensitiveData(data: string, secretKey: string = 'DealFast-Escrow-SecKey-9921'): string {
  try {
    if (!data) return '';
    // Custom XOR + Base64 Transformation for client-side storage obfuscation
    const textBytes = new TextEncoder().encode(data);
    const keyBytes = new TextEncoder().encode(secretKey);
    const encrypted = new Uint8Array(textBytes.length);
    for (let i = 0; i < textBytes.length; i++) {
      encrypted[i] = textBytes[i] ^ keyBytes[i % keyBytes.length];
    }
    return 'ENC_' + btoa(String.fromCharCode(...encrypted));
  } catch (e) {
    console.error('Encryption failed', e);
    return data;
  }
}

export function decryptSensitiveData(encryptedData: string, secretKey: string = 'DealFast-Escrow-SecKey-9921'): string {
  try {
    if (!encryptedData || !encryptedData.startsWith('ENC_')) return encryptedData;
    const rawB64 = encryptedData.replace('ENC_', '');
    const binaryStr = atob(rawB64);
    const encryptedBytes = new Uint8Array(binaryStr.length).map((_, i) => binaryStr.charCodeAt(i));
    const keyBytes = new TextEncoder().encode(secretKey);
    const decrypted = new Uint8Array(encryptedBytes.length);
    for (let i = 0; i < encryptedBytes.length; i++) {
      decrypted[i] = encryptedBytes[i] ^ keyBytes[i % keyBytes.length];
    }
    return new TextDecoder().decode(decrypted);
  } catch (e) {
    console.error('Decryption failed', e);
    return encryptedData;
  }
}

// 3. BRUTE FORCE LOCKOUT MANAGER (10 Failed Attempts = 1 Hour Lockout)
const LOCKOUT_KEY = 'dealfast_login_attempts';
const MAX_FAILED_ATTEMPTS = 10;
const LOCKOUT_DURATION_MS = 60 * 60 * 1000; // 1 Hour in milliseconds

export interface LockoutStatus {
  isLocked: boolean;
  remainingMinutes: number;
  remainingSeconds: number;
  attemptsCount: number;
}

export function checkLockoutStatus(identifier: string = 'global_admin'): LockoutStatus {
  if (typeof window === 'undefined') {
    return { isLocked: false, remainingMinutes: 0, remainingSeconds: 0, attemptsCount: 0 };
  }
  try {
    const raw = localStorage.getItem(`${LOCKOUT_KEY}_${identifier}`);
    if (!raw) return { isLocked: false, remainingMinutes: 0, remainingSeconds: 0, attemptsCount: 0 };
    
    const record = JSON.parse(raw);
    const now = Date.now();

    if (record.lockUntil && now < record.lockUntil) {
      const diffMs = record.lockUntil - now;
      const remainingMinutes = Math.floor(diffMs / 60000);
      const remainingSeconds = Math.floor((diffMs % 60000) / 1000);
      return {
        isLocked: true,
        remainingMinutes,
        remainingSeconds,
        attemptsCount: record.count || MAX_FAILED_ATTEMPTS
      };
    }

    // Reset if lockout period passed
    if (record.lockUntil && now >= record.lockUntil) {
      localStorage.removeItem(`${LOCKOUT_KEY}_${identifier}`);
      return { isLocked: false, remainingMinutes: 0, remainingSeconds: 0, attemptsCount: 0 };
    }

    return { isLocked: false, remainingMinutes: 0, remainingSeconds: 0, attemptsCount: record.count || 0 };
  } catch (e) {
    return { isLocked: false, remainingMinutes: 0, remainingSeconds: 0, attemptsCount: 0 };
  }
}

export function registerFailedLoginAttempt(identifier: string = 'global_admin'): LockoutStatus {
  if (typeof window === 'undefined') {
    return { isLocked: false, remainingMinutes: 0, remainingSeconds: 0, attemptsCount: 0 };
  }
  const status = checkLockoutStatus(identifier);
  const now = Date.now();
  const newCount = status.attemptsCount + 1;

  let lockUntil = null;
  if (newCount >= MAX_FAILED_ATTEMPTS) {
    lockUntil = now + LOCKOUT_DURATION_MS;
  }

  const record = { count: newCount, lockUntil, lastAttempt: now };
  localStorage.setItem(`${LOCKOUT_KEY}_${identifier}`, JSON.stringify(record));

  return checkLockoutStatus(identifier);
}

export function resetLoginAttempts(identifier: string = 'global_admin'): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(`${LOCKOUT_KEY}_${identifier}`);
}

export async function sha256Hash(text: string): Promise<string> {
  if (!text) return '';
  const msgBuffer = new TextEncoder().encode(text.trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 4. BCRYPT HASHING & PIN MAKER SECURITY (Salt Rounds: 12)
export async function hashWithBcrypt(plainText: string, saltRounds: number = 12): Promise<string> {
  const salt = await bcrypt.genSalt(saltRounds);
  return bcrypt.hash(plainText, salt);
}

export async function compareWithBcrypt(plainText: string, hash: string): Promise<boolean> {
  if (!plainText || !hash) return false;
  try {
    return await bcrypt.compare(plainText, hash);
  } catch (e) {
    return false;
  }
}

const PIN_MAKER_HASH_KEY = 'PIN_MAKER_PASSWORD_HASH';

export function getStoredPinMakerHash(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(PIN_MAKER_HASH_KEY) || '';
}

export function setStoredPinMakerHash(hash: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PIN_MAKER_HASH_KEY, hash);
}

export async function verifyPinMakerPassword(inputPassword: string): Promise<boolean> {
  if (!inputPassword) return false;
  const pinMakerSalt = process.env.PIN_MAKER_SALT || process.env.VITE_PIN_MAKER_SALT || 'DEALFAST_SALT_2026_SECURE';
  const saltedInput = inputPassword.trim() + pinMakerSalt;

  let storedHash = getStoredPinMakerHash();
  if (!storedHash) {
    const defaultPass = process.env.PIN_MAKER_PASSWORD || process.env.VITE_PIN_MAKER_PASSWORD || 'PinMakerPassword123!';
    const saltedDefault = defaultPass + pinMakerSalt;
    storedHash = await hashWithBcrypt(saltedDefault, 12);
    setStoredPinMakerHash(storedHash);
  }

  return compareWithBcrypt(saltedInput, storedHash);
}

export async function updatePinMakerPassword(newPassword: string): Promise<string> {
  const pinMakerSalt = process.env.PIN_MAKER_SALT || process.env.VITE_PIN_MAKER_SALT || 'DEALFAST_SALT_2026_SECURE';
  const saltedNew = newPassword.trim() + pinMakerSalt;
  const newHash = await hashWithBcrypt(saltedNew, 12);
  setStoredPinMakerHash(newHash);
  return newHash;
}

// 5. DEVICE FINGERPRINTING & IP CHECK
export function getDeviceFingerprint(): string {
  if (typeof window === 'undefined') return 'DESKTOP_SECURE_DEV';
  const ua = navigator.userAgent || '';
  const screenRes = `${window.screen?.width || 0}x${window.screen?.height || 0}`;
  const lang = navigator.language || '';
  const raw = `${ua}_${screenRes}_${lang}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash) + raw.charCodeAt(i);
    hash |= 0;
  }
  return `DEV_${Math.abs(hash).toString(16).toUpperCase()}`;
}


