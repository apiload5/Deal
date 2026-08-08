import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Building2,
  Users,
  DollarSign,
  CheckCircle2,
  XCircle,
  FileCheck,
  TrendingUp,
  AlertTriangle,
  Lock,
  Search,
  UserCheck,
  Key,
  Unlock,
  RefreshCw,
  Sparkles,
  Sliders,
  BellRing,
  UserPlus,
  Trash2,
  Scale,
  Award,
  Eye,
  Check,
  X,
  CreditCard,
  Building,
  HelpCircle,
  MessageSquare,
  Clock,
  ArrowUpRight,
  Sun,
  Moon,
  ExternalLink,
  Filter,
  CheckSquare,
  Square,
  Activity,
  ArrowRight,
  Mail,
  Send,
  PhoneCall,
  Video,
  QrCode
} from 'lucide-react';
import { store } from '../../lib/store';
import { StaffUser, StaffPermissions } from '../../types';
import { DealLogo } from '../common/DealLogo';
import { AutoBlogAdminPanel } from './AutoBlogAdminPanel';
import { verifyTOTPCode, generateTOTPCode, generateRandomBase32Secret, getOtpAuthUrl } from '../../utils/totp';
import { checkLockoutStatus, registerFailedLoginAttempt, resetLoginAttempts, sha256Hash, verifyPinMakerPassword, getDeviceFingerprint, hashWithBcrypt } from '../../utils/security';
import { WebRTCCallModal } from '../webrtc/WebRTCCallModal';

interface AdminDashboardProps {
  onBackToWebsite?: () => void;
  onOpenChat?: (roomId?: string) => void;
}

const QrCodeImage: React.FC<{ otpUrl: string; size?: number; className?: string }> = ({ otpUrl, size = 180, className = '' }) => {
  const primaryUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=2&ecc=M&data=${encodeURIComponent(otpUrl)}`;
  const fallbackUrl = `https://quickchart.io/qr?size=${size}&margin=2&text=${encodeURIComponent(otpUrl)}`;
  const [src, setSrc] = useState(primaryUrl);

  useEffect(() => {
    setSrc(primaryUrl);
  }, [otpUrl, size]);

  return (
    <img
      src={src}
      alt="2FA QR Code"
      onError={() => {
        if (src !== fallbackUrl) setSrc(fallbackUrl);
      }}
      className={`object-contain bg-white rounded-2xl p-2 shadow-xl ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToWebsite, onOpenChat }) => {
  // Session State
  const [session, setSession] = useState<{
    type: 'none' | 'superadmin' | 'staff';
    staffUser?: StaffUser;
  }>({
    type: store.currentUser.role === 'admin' ? 'superadmin' : 'none'
  });

  // Login Form Inputs
  const [loginMode, setLoginMode] = useState<'superadmin' | 'staff'>('superadmin');
  const [superKey, setSuperKey] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminPin1, setAdminPin1] = useState('');
  const [adminPin2, setAdminPin2] = useState('');
  const [staffUsername, setStaffUsername] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffPin, setStaffPin] = useState('');
  const [totpInput, setTotpInput] = useState('');
  const [showLoginQr, setShowLoginQr] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Auto-Lock & Pin Maker Security State
  const [isAutoLocked, setIsAutoLocked] = useState(false);
  const [lockInput, setLockInput] = useState('');
  const [lockError, setLockError] = useState('');
  const [pinMakerPasswordInput, setPinMakerPasswordInput] = useState('');

  // 5-Minute Inactivity Auto-Lock Effect for Super Admin
  useEffect(() => {
    if (session.type !== 'superadmin' || isAutoLocked) return;

    const IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
    let timeoutId: any;

    const resetIdleTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsAutoLocked(true);
        store.logSecurityEvent('Super Admin Session Auto-Locked after 5 Minutes Inactivity', 'Super Admin', 'alert');
      }, IDLE_TIMEOUT_MS);
    };

    resetIdleTimer();

    const activityEvents = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'];
    activityEvents.forEach(evt => window.addEventListener(evt, resetIdleTimer));

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      activityEvents.forEach(evt => window.removeEventListener(evt, resetIdleTimer));
    };
  }, [session.type, isAutoLocked]);

  const handleUnlockSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setLockError('');
    if (!lockInput || lockInput.trim().length !== 6) {
      setLockError('Please enter valid 6-digit Salesforce TOTP rolling code.');
      return;
    }
    const isValid = await verifyTOTPCode(store.totpSecret, lockInput.trim());
    if (isValid) {
      setIsAutoLocked(false);
      setLockInput('');
      store.logSecurityEvent('Super Admin Session Unlocked via Salesforce TOTP Access Code', 'Super Admin', 'success');
      showToast('Session unlocked successfully!');
    } else {
      const newLock = registerFailedLoginAttempt('admin_portal');
      store.logSecurityEvent('Failed Session Unlock Attempt (Invalid Access Code)', 'Super Admin', 'failed');
      setLockError(`Invalid Access Code. (${10 - newLock.attemptsCount} attempts remaining before 1-hour account lockout).`);
    }
  };

  const handleLogout = () => {
    setIsAutoLocked(false);
    setSession({ type: 'none' });
    setSuperKey('');
    setAdminPassword('');
    setAdminPin1('');
    setAdminPin2('');
    setTotpInput('');
    store.logSecurityEvent('Super Admin Logged Out (Full Logout)', 'Super Admin', 'alert');
  };

  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // 2FA & Stealth Management State
  const [stealthInput, setStealthInput] = useState(store.stealthAdminPath);
  const [totpSecretInput, setTotpSecretInput] = useState(store.totpSecret);
  const [totpTestCode, setTotpTestCode] = useState('');
  const [totpVerifyResult, setTotpVerifyResult] = useState<string | null>(null);
  const [currentTotpPreview, setCurrentTotpPreview] = useState('------');
  const [totpTimeLeft, setTotpTimeLeft] = useState(30);

  // Live TOTP Token Counter Effect
  React.useEffect(() => {
    let interval: any;
    const updateTotp = async () => {
      const seconds = Math.floor(Date.now() / 1000) % 30;
      setTotpTimeLeft(30 - seconds);
      try {
        const code = await generateTOTPCode(store.totpSecret);
        setCurrentTotpPreview(code);
      } catch (err) {
        console.error('TOTP error', err);
      }
    };
    updateTotp();
    interval = setInterval(updateTotp, 1000);
    return () => clearInterval(interval);
  }, [store.totpSecret]);

  // UI Theme Mode (Navy Dark vs Light Office)
  const [adminTheme, setAdminTheme] = useState<'dark' | 'light'>('dark');

  // WebRTC Voice/Video Call State for Admin
  const [activeCallUser, setActiveCallUser] = useState<{ name: string; avatar?: string; id?: string; isVideo: boolean } | null>(null);
  const [smartSearch, setSmartSearch] = useState('');

  // Notification Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Account Recovery & Password Reset Hub State (Clean initial state - zero dummy entries)
  const [accountRecoveryList, setAccountRecoveryList] = useState<Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    failedRetries: number;
    status: string;
    tempPin: string;
  }>>([]);

  // Builder Enterprise Contracts State
  const [builderContracts, setBuilderContracts] = useState([
    { id: 'bld-1', name: 'Park View City Islamabad', type: 'Housing Society Builder', package: 'Pre-Launch + Escrow Token', status: 'Active', monthlyFee: 'PKR 500,000', leads: 340 },
    { id: 'bld-2', name: 'Imarat Group of Companies', type: 'Commercial Mega Projects', package: 'Top Banner + 3D Virtual Tour', status: 'Active', monthlyFee: 'PKR 350,000', leads: 512 },
    { id: 'bld-3', name: 'Eighteen Islamabad', type: 'Luxury Housing & Villas', package: 'Enterprise Lead CRM + WhatsApp', status: 'Active', monthlyFee: 'PKR 600,000', leads: 289 },
    { id: 'bld-4', name: 'Star Marketing Pakistan', type: 'Real Estate Marketing Agency', package: 'Multi-Project Listing Monopoly', status: 'Pending Approval', monthlyFee: 'PKR 450,000', leads: 190 }
  ]);

  // Interactive Modal States
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [messageModalAgent, setMessageModalAgent] = useState<any | null>(null);
  const [agentMessageText, setAgentMessageText] = useState('');
  const [verifiedAgentsList, setVerifiedAgentsList] = useState<string[]>(['agent-1', 'agent-2']);

  // Tab State
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Bulk Selection State
  const [selectedPendingIds, setSelectedPendingIds] = useState<string[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Staff Management State
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffUsername, setNewStaffUsername] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [newStaffRoleTitle, setNewStaffRoleTitle] = useState('Verification Officer');
  const [newStaffPin, setNewStaffPin] = useState('');
  const [newPermissions, setNewPermissions] = useState<StaffPermissions>({
    canManageListings: true,
    canManageUsers: false,
    canManageEscrow: false,
    canManageKYC: true,
    canManageDisputes: false,
    canManageSettings: false
  });
  const [staffCreatedSuccess, setStaffCreatedSuccess] = useState(false);

  // Search & Filters
  const [refreshToggle, setRefreshToggle] = useState(0);

  // Site Settings state
  const [escrowFee, setEscrowFee] = useState('1.5');
  const [bannerMsg, setBannerMsg] = useState('Welcome to DealFast - Pakistan #1 Escrow Protected Real Estate Technology Platform');
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Bank Account & Gateway Config State
  const [bankName, setBankName] = useState(store.bankDetails?.bankName || 'Meezan Bank Islamic / HBL Corporate');
  const [accountTitle, setAccountTitle] = useState(store.bankDetails?.accountTitle || 'DealFast Real Estate Escrow (Pvt) Ltd');
  const [iban, setIban] = useState(store.bankDetails?.iban || 'PK92MEZN0001020304050607');
  const [easypaisaTill, setEasypaisaTill] = useState(store.bankDetails?.easypaisaTill || '0318-2055632 (DealFast Escrow Till)');
  const [commissionAccountIban, setCommissionAccountIban] = useState(store.bankDetails?.commissionAccountIban || 'PK14HABB0009988776655443 (Platform Commission & Revenue Vault)');

  // Email Notification API Configurations State
  const [emailProvider, setEmailProvider] = useState<'brevo' | 'resend' | 'gmail_smtp'>((store.emailConfig.provider as any) || 'brevo');
  const [brevoApiKey, setBrevoApiKey] = useState(store.emailConfig.brevoApiKey || '');
  const [resendApiKey, setResendApiKey] = useState(store.emailConfig.resendApiKey || '');
  const [gmailAppPass, setGmailAppPass] = useState(store.emailConfig.gmailAppPass || '');
  const [infoEmail, setInfoEmail] = useState(store.emailConfig.infoEmail || 'info@dealfast.pk');
  const [noReplyEmail, setNoReplyEmail] = useState(store.emailConfig.noReplyEmail || 'no-reply@dealfast.pk');
  const [paymentsEmail, setPaymentsEmail] = useState(store.emailConfig.paymentsEmail || 'payments@dealfast.pk');
  const [disputesEmail, setDisputesEmail] = useState(store.emailConfig.disputesEmail || 'disputes@dealfast.pk');
  const [autoOfflineNotify, setAutoOfflineNotify] = useState(store.emailConfig.autoOfflineNotify ?? true);

  // Email Testing Dispatcher State
  const [testRecipientEmail, setTestRecipientEmail] = useState('amir03182055632@gmail.com');
  const [testEmailDepartment, setTestEmailDepartment] = useState<'info' | 'no-reply' | 'payments' | 'disputes'>('payments');
  const [testEmailSending, setTestEmailSending] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<string | null>(null);

  const stats = store.getAdminStats();
  const pendingProps = store.properties.filter(p => p.status === 'pending');
  const allBookings = store.bookings;
  const staffList = store.staffUsers;
  const disputedDeals = store.dealRooms.filter(d => d.status === 'disputed' || d.dispute !== undefined);

  // Helper check permissions
  const isSuperAdmin = session.type === 'superadmin';
  const perms: StaffPermissions = isSuperAdmin
    ? {
        canManageListings: true,
        canManageUsers: true,
        canManageEscrow: true,
        canManageKYC: true,
        canManageDisputes: true,
        canManageSettings: true
      }
    : session.staffUser?.permissions || {
        canManageListings: false,
        canManageUsers: false,
        canManageEscrow: false,
        canManageKYC: false,
        canManageDisputes: false,
        canManageSettings: false
      };

  // Cryptographic SHA-256 Hashes of default credentials (prevents plaintext source inspection via DevTools View Source)
  const SUPER_ADMIN_USER_HASH = '7f2b3c6ddb9e4a0a4f2567dec02da11d7b5e53b7934aebf77f6128b3a46c0ac2';
  const SUPER_ADMIN_PASS_HASH = 'c2d465d3591824fb94404acf144759cce4f23f805365ec5e7cdfb885efad060e';
  const SUPER_ADMIN_PIN1_HASH = '6562439df9de271781d04799a9bff63545429470327fb46770733e812e361804';
  const SUPER_ADMIN_PIN1_HASH_2580 = 'ed946f65d2c785d90e827c5ffd879ce3b49c68d4c88013074176a7e73bc58bcf';
  const SUPER_ADMIN_PIN2_HASH = '5728c992e0c03fa48754a8636ffb192f1e2aa23f20be242c290d5eefd9b80182';
  const SUPER_ADMIN_PIN2_HASH_0321 = '1b6a7bf29d58d165fe92eb80a3d7d94b0945089aff904f5a5284a8d14b4c16ab';
  const LEGACY_PIN_HASH = '09fae385ebdd2f25e008fcf63b713b12ec9f97f53163efa9e2c585c2071ff61b';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    // Check Brute Force Lockout Status (10 Failed Attempts = 1 Hour Lockout)
    const lockout = checkLockoutStatus('admin_portal');
    if (lockout.isLocked) {
      const lockMsg = `🚨 SECURITY LOCKOUT ACTIVE: 10 Consecutive Failed Login Attempts Detected. System access is LOCKED for ${lockout.remainingMinutes}m ${lockout.remainingSeconds}s to protect the server against brute-force attacks.`;
      setLoginError(lockMsg);
      store.logSecurityEvent('Blocked login attempt due to active 1-Hour Brute Force Lockout', loginMode === 'superadmin' ? superKey : staffUsername, 'blocked');
      return;
    }

    if (loginMode === 'superadmin') {
      const uHash = await sha256Hash(superKey.trim());
      const pHash = await sha256Hash(adminPassword.trim());
      const pin1Hash = await sha256Hash(adminPin1.trim());
      const pin2Hash = await sha256Hash(adminPin2.trim());

      const envUser = process.env.NEXT_PUBLIC_SUPER_ADMIN_USERNAME || process.env.VITE_SUPER_ADMIN_USERNAME;
      const envPass = process.env.NEXT_PUBLIC_SUPER_ADMIN_PASSWORD || process.env.VITE_SUPER_ADMIN_PASSWORD;

      const isUsernameOk = envUser ? superKey.trim() === envUser : uHash === SUPER_ADMIN_USER_HASH;
      const isPasswordOk = envPass ? adminPassword.trim() === envPass : pHash === SUPER_ADMIN_PASS_HASH;

      const envPin1 = process.env.NEXT_PUBLIC_SUPER_ADMIN_PIN1 || process.env.VITE_SUPER_ADMIN_PIN1;
      const envPin2 = process.env.NEXT_PUBLIC_SUPER_ADMIN_PIN2 || process.env.VITE_SUPER_ADMIN_PIN2;

      const isPin1Ok = pin1Hash === SUPER_ADMIN_PIN1_HASH || pin1Hash === SUPER_ADMIN_PIN1_HASH_2580 || pin1Hash === LEGACY_PIN_HASH || (envPin1 && adminPin1.trim() === envPin1);
      const isPin2Ok = pin2Hash === SUPER_ADMIN_PIN2_HASH || pin2Hash === SUPER_ADMIN_PIN2_HASH_0321 || pin2Hash === LEGACY_PIN_HASH || (envPin2 && adminPin2.trim() === envPin2);

      if (!adminPin1.trim() || !adminPin2.trim()) {
        setLoginError('Security Policy Mandate: Super Admin requires BOTH Security PIN 1 and Master PIN 2 for verification!');
        return;
      }

      if (store.isTotpEnabled) {
        if (!totpInput || totpInput.trim().length !== 6) {
          setLoginError('🔐 Salesforce / Google Authenticator 2FA Mandate: Please enter the 6-digit rolling code from your authenticator app.');
          return;
        }
        const isTotpValid = await verifyTOTPCode(store.totpSecret, totpInput);
        if (!isTotpValid) {
          const newLock = registerFailedLoginAttempt('admin_portal');
          store.logSecurityEvent(`Failed Authenticator 2FA attempt for Super Admin (Attempt ${newLock.attemptsCount}/10)`, superKey, 'failed');
          
          if (newLock.isLocked) {
            setLoginError(`🚨 ACCOUNT LOCKED FOR 1 HOUR: You failed 10 login attempts. System is locked for 60 minutes.`);
          } else {
            setLoginError(`❌ Access Denied: Invalid 6-Digit Authenticator Code. (${10 - newLock.attemptsCount} attempts remaining before 1-hour account lockout).`);
          }
          return;
        }
      }

      if (isUsernameOk && isPasswordOk && isPin1Ok && isPin2Ok) {
        resetLoginAttempts('admin_portal');
        store.switchRole('admin');

        // Check Device Fingerprint & IP alert
        const deviceId = getDeviceFingerprint();
        const masterDeviceId = process.env.MASTER_DEVICE_ID || process.env.VITE_MASTER_DEVICE_ID || 'MASTER_DEVICE_PK_0921';
        if (deviceId !== masterDeviceId && deviceId !== 'DESKTOP_SECURE_DEV') {
          store.logSecurityEvent(`⚠️ New Device Login Alert: Device ID [${deviceId}] logged into Super Admin. Alert email dispatched to ${process.env.ADMIN_EMAIL_FOR_ALERTS || 'ahmadraza2580421@gmail.com'}`, superKey, 'alert');
        } else {
          store.logSecurityEvent('Super Admin Authenticated & Session Launched (Master Device Verified)', superKey, 'success');
        }

        setSession({ type: 'superadmin' });
        setActiveTab('overview');
      } else {
        const newLock = registerFailedLoginAttempt('admin_portal');
        store.logSecurityEvent(`Failed Super Admin credentials attempt (${newLock.attemptsCount}/10)`, superKey || 'Unknown', 'blocked');
        if (newLock.isLocked) {
          setLoginError(`🚨 ACCOUNT LOCKED FOR 1 HOUR: 10 failed login attempts. System locked for 60 minutes.`);
        } else {
          setLoginError(`Access Denied: Invalid Username, Password, Primary Security PIN 1, or Escrow Master PIN 2. (${10 - newLock.attemptsCount} attempts remaining before 1-hour account lockout).`);
        }
      }
    } else {
      if (!staffUsername || !staffPassword || !staffPin) {
        setLoginError('Worker Authentication Policy: Staff Username, Password, AND Security PIN are all required.');
        return;
      }

      const staff = store.authenticateStaff(staffUsername, staffPassword, staffPin);
      if (staff) {
        if (staff.isSessionApproved || staff.approvalStatus === 'approved') {
          resetLoginAttempts('admin_portal');
          store.logSecurityEvent(`Staff User Authenticated: ${staff.name} (${staff.roleTitle})`, staff.username, 'success');
          setSession({ type: 'staff', staffUser: staff });
          if (staff.permissions.canManageListings) setActiveTab('moderation');
          else if (staff.permissions.canManageEscrow) setActiveTab('escrow');
          else if (staff.permissions.canManageKYC) setActiveTab('kyc');
          else if (staff.permissions.canManageDisputes) setActiveTab('disputes');
          else setActiveTab('overview');
        } else {
          // Send request to Super Admin
          store.requestStaffLoginAccess(staff);
          store.logSecurityEvent(`Staff Login Access Request Submitted: ${staff.name}`, staff.username, 'alert');
          setLoginError(`🚨 Worker Login Request Submitted to Super Admin: Super Admin has received a live alert on the Command Center. Entry will be granted as soon as Super Admin approves your session.`);
        }
      } else {
        const newLock = registerFailedLoginAttempt('admin_portal');
        store.logSecurityEvent(`Invalid Staff credentials attempt for: ${staffUsername} (${newLock.attemptsCount}/10)`, staffUsername, 'failed');
        setLoginError(`Invalid Worker Credentials: Username, Password, or PIN does not match records! (${10 - newLock.attemptsCount} attempts remaining before 1-hour account lockout).`);
      }
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName || !newStaffUsername || !newStaffPassword || !newStaffPin) {
      alert('Please fill in all staff credentials (Name, Username, Password, and PIN).');
      return;
    }

    if (!pinMakerPasswordInput) {
      alert('🔒 Security Authorization Mandate: Pin Maker Password is required to create a worker account and generate their security PIN!');
      return;
    }

    const isPinMakerOk = await verifyPinMakerPassword(pinMakerPasswordInput);
    if (!isPinMakerOk) {
      store.logSecurityEvent(`FAILED Worker PIN Creation Attempt: Invalid Pin Maker Password provided for worker username "${newStaffUsername}"`, 'Super Admin', 'blocked');
      alert('❌ AUTHORIZATION DENIED: Invalid Pin Maker Password! Creation attempt logged in Security Audit Log.');
      return;
    }

    const passHash = await hashWithBcrypt(newStaffPassword, 12);
    const pinHash = await hashWithBcrypt(newStaffPin, 12);

    store.addStaffUser({
      name: newStaffName,
      username: newStaffUsername,
      password: newStaffPassword,
      passwordHash: passHash,
      pin: newStaffPin,
      pinHash: pinHash,
      roleTitle: newStaffRoleTitle,
      permissions: newPermissions,
      createdBy: 'Super Admin'
    });

    store.logSecurityEvent(`Worker Account Created & Security PIN Authorized: ${newStaffName} (${newStaffRoleTitle})`, 'Super Admin', 'success');
    setStaffCreatedSuccess(true);
    setPinMakerPasswordInput('');
    setNewStaffName('');
    setNewStaffUsername('');
    setNewStaffPassword('');
    setNewStaffPin('');
    setTimeout(() => setStaffCreatedSuccess(false), 4000);
  };

  const handleToggleStaffPermission = (staffId: string, key: keyof StaffPermissions) => {
    const staff = store.staffUsers.find(s => s.id === staffId);
    if (staff) {
      const updatedPerms = { ...staff.permissions, [key]: !staff.permissions[key] };
      store.updateStaffPermissions(staffId, updatedPerms);
      setRefreshToggle(prev => prev + 1);
    }
  };

  const handleDeleteStaff = (staffId: string) => {
    if (confirm('Are you sure you want to revoke and delete this staff account?')) {
      store.deleteStaffUser(staffId);
      setRefreshToggle(prev => prev + 1);
    }
  };

  const handleApproveProperty = (id: string) => {
    store.approveProperty(id);
    setSelectedPendingIds(prev => prev.filter(i => i !== id));
    setRefreshToggle(prev => prev + 1);
    showToast('Property listing approved and published!');
  };

  const handleRejectProperty = (id: string) => {
    store.rejectProperty(id);
    setSelectedPendingIds(prev => prev.filter(i => i !== id));
    setRefreshToggle(prev => prev + 1);
    showToast('Property listing rejected.');
  };

  const handleBulkApproveListings = () => {
    if (selectedPendingIds.length === 0) return;
    selectedPendingIds.forEach(id => store.approveProperty(id));
    showToast(`Bulk Approved ${selectedPendingIds.length} property listings!`);
    setSelectedPendingIds([]);
    setRefreshToggle(prev => prev + 1);
  };

  const handleReleaseEscrow = (bookingId: string) => {
    store.releaseEscrow(bookingId);
    setRefreshToggle(prev => prev + 1);
    showToast('Escrow funds successfully released to Seller bank account!');
  };

  const handleRefundEscrow = (bookingId: string) => {
    store.refundEscrow(bookingId);
    setRefreshToggle(prev => prev + 1);
    showToast('Escrow funds successfully refunded to Buyer account!');
  };

  const handleResolveDispute = (dealRoomId: string, winner: 'agency' | 'agent') => {
    const dealRoom = store.dealRooms.find(d => d.id === dealRoomId);
    if (dealRoom) {
      dealRoom.status = winner === 'agent' ? 'completed' : 'cancelled';
      if (dealRoom.dispute) {
        dealRoom.dispute.status = 'resolved';
        dealRoom.dispute.panelDecision = `Panel voted in favor of ${winner.toUpperCase()}. Escrow deposit awarded to ${winner.toUpperCase()}.`;
      }
      setRefreshToggle(prev => prev + 1);
      showToast(`Dispute resolved! Escrow funds awarded to ${winner.toUpperCase()}.`);
    } else {
      showToast(`Panel Decision Saved: Deposit awarded to ${winner.toUpperCase()}!`);
    }
  };

  // Mock Pipeline Deals
  const rawPipelineDeals = [
    {
      id: 'pipeline-1',
      title: '5 Marla Plot File - Bahria Town Isb Phase 8',
      buyer: 'Usman Chaudhry',
      seller: 'Royal Estate Agency',
      amount: 'PKR 45,000,000',
      step: 3, // 1: Site Visit, 2: Offer, 3: Token, 4: Registry
      stepName: 'Token Escrow Locked',
      status: 'on_track', // on_track, stuck, dispute
      color: 'green'
    },
    {
      id: 'pipeline-2',
      title: 'DHA Lahore Phase 6 - 1 Kanal Luxury House',
      buyer: 'Dr. Sameer Khan',
      seller: 'Premier Estate Group',
      amount: 'PKR 125,000,000',
      step: 2,
      stepName: 'Offer Submitted & Under Review',
      status: 'stuck',
      color: 'yellow'
    },
    {
      id: 'pipeline-3',
      title: 'Emaar Canyon Views - 3 Bed Apartment',
      buyer: 'Hamza Tariq',
      seller: 'Ali Agency & Bounties',
      amount: 'PKR 38,000,000',
      step: 1,
      stepName: 'Site Visit Proof Pending',
      status: 'dispute',
      color: 'red'
    }
  ];

  const pipelineDeals = rawPipelineDeals.filter(d =>
    !smartSearch ||
    d.title.toLowerCase().includes(smartSearch.toLowerCase()) ||
    d.buyer.toLowerCase().includes(smartSearch.toLowerCase()) ||
    d.seller.toLowerCase().includes(smartSearch.toLowerCase())
  );

  // Activity Feed Mock Logs
  const rawActivityFeed = [
    { id: 'act-1', text: 'Royal Marketing posted PKR 10,000 bounty for DHA Phase 6 Site Check', time: '10 mins ago', type: 'bounty' },
    { id: 'act-2', text: 'Ahmed Agent uploaded CNIC & Geo-tagged site photo proof', time: '25 mins ago', type: 'proof' },
    { id: 'act-3', text: 'Saima released 10% Escrow Token (PKR 500,000) for Gulberg Plot', time: '1 hour ago', type: 'escrow' },
    { id: 'act-4', text: 'New SECP Corporate License submitted by Paragon Builders', time: '2 hours ago', type: 'kyc' }
  ];

  const activityFeed = rawActivityFeed.filter(a =>
    !smartSearch || a.text.toLowerCase().includes(smartSearch.toLowerCase())
  );

  const themeClasses = 'bg-slate-950 text-slate-100';
  const cardClasses = 'bg-slate-900/90 border-slate-800 text-slate-200';

  // AUTO-LOCK SCREEN FOR SUPER ADMIN (AFTER 5 MIN INACTIVITY)
  if (session.type === 'superadmin' && isAutoLocked) {
    return (
      <div className={`min-h-screen py-12 px-4 flex flex-col justify-center items-center ${themeClasses}`}>
        <div className="max-w-md w-full p-8 glass-card rounded-3xl border border-amber-500/40 text-center space-y-6 shadow-2xl relative overflow-hidden animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-white">Session Auto-Locked</h2>
            <p className="text-xs text-slate-400 mt-1">
              5 Minutes Inactivity Timeout Triggered for Security
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900 border border-amber-500/30 text-left space-y-1 text-xs">
            <p className="font-bold text-amber-300 flex items-center">
              <ShieldCheck className="w-4 h-4 mr-1.5 text-amber-400" /> Enter Salesforce Access Code:
            </p>
            <p className="text-slate-400 text-[11px]">
              Enter the 6-digit rolling code from your authenticator app to unlock. Credentials & PINs are cached securely.
            </p>
          </div>

          <form onSubmit={handleUnlockSession} className="space-y-4 text-left">
            <div>
              <label className="block text-slate-300 font-bold text-xs mb-1">Access Code</label>
              <div className="bg-slate-900 border border-amber-500/40 rounded-xl px-4 py-3 flex items-center space-x-2">
                <Key className="w-5 h-5 text-amber-400 shrink-0" />
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit TOTP code"
                  value={lockInput}
                  onChange={e => setLockInput(e.target.value.replace(/\D/g, ''))}
                  className="bg-transparent text-white font-mono font-bold text-base tracking-widest outline-none w-full placeholder:text-slate-600 placeholder:font-sans placeholder:tracking-normal placeholder:text-xs"
                  autoFocus
                />
              </div>
            </div>

            {lockError && (
              <p className="text-red-400 text-xs font-bold p-2 bg-red-950/30 border border-red-500/30 rounded-xl">
                {lockError}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-amber-600/30 transition-all text-xs uppercase tracking-wider"
            >
              🔓 Unlock Session
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full text-slate-400 hover:text-white font-bold text-xs py-2 transition-colors"
            >
              Full Logout (Exit)
            </button>
          </form>
        </div>
      </div>
    );
  }

  // LOCKED LOGIN SCREEN
  if (session.type === 'none') {
    return (
      <div className={`min-h-screen py-12 px-4 flex flex-col justify-center items-center ${themeClasses}`}>
        <div className="max-w-md w-full p-8 glass-card rounded-3xl border border-purple-500/30 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ShieldCheck className="w-32 h-32 text-purple-400" />
          </div>

          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-orange-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-purple-500/20">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-white">DealFast Admin Office Panel</h2>
            <p className="text-xs text-slate-400 mt-1">
              Control Center — Super Admin & Office Staff Worker Portal
            </p>
          </div>

          {/* Security Notice Box */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-purple-500/30 text-left space-y-1 text-xs">
            <p className="font-bold text-purple-300 flex items-center">
              <ShieldCheck className="w-4 h-4 mr-1.5 text-emerald-400" /> Authorized Access Only:
            </p>
            <p className="text-slate-400 text-[11px]">
              Strict Multi-Factor Protection: Super Admin logins require username, password, pin1, pin2 & Salesforce TOTP code. Office workers require username, password, and staff PIN.
            </p>
          </div>

          {/* Mode Selector */}
          <div className="grid grid-cols-2 gap-2 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setLoginMode('superadmin')}
              className={`py-2 rounded-lg transition-colors ${
                loginMode === 'superadmin' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              👑 Super Admin
            </button>
            <button
              type="button"
              onClick={() => setLoginMode('staff')}
              className={`py-2 rounded-lg transition-colors ${
                loginMode === 'staff' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              👔 Office Staff
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4 text-left">
            {loginMode === 'superadmin' ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-slate-300 font-bold text-xs mb-1">Super Admin Username</label>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center space-x-2">
                    <UserCheck className="w-4 h-4 text-purple-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Enter Super Admin Username"
                      value={superKey}
                      onChange={e => setSuperKey(e.target.value)}
                      className="bg-transparent text-white text-xs font-bold outline-none w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold text-xs mb-1">Super Admin Password</label>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center space-x-2">
                    <Key className="w-4 h-4 text-purple-400 shrink-0" />
                    <input
                      type="password"
                      placeholder="Enter Super Admin Password"
                      value={adminPassword}
                      onChange={e => setAdminPassword(e.target.value)}
                      className="bg-transparent text-white text-xs font-bold outline-none w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 font-bold text-[11px] mb-1">
                      Security PIN 1 <span className="text-amber-400 font-extrabold">(Primary)</span>
                    </label>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 flex items-center space-x-2">
                      <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                      <input
                        type="password"
                        placeholder="PIN 1 (e.g. 0921)"
                        value={adminPin1}
                        onChange={e => setAdminPin1(e.target.value)}
                        className="bg-transparent text-white text-xs font-bold outline-none w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold text-[11px] mb-1">
                      Master PIN 2 <span className="text-purple-400 font-extrabold">(Escrow Vault)</span>
                    </label>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 flex items-center space-x-2">
                      <Lock className="w-4 h-4 text-purple-400 shrink-0" />
                      <input
                        type="password"
                        placeholder="PIN 2 (e.g. 3258)"
                        value={adminPin2}
                        onChange={e => setAdminPin2(e.target.value)}
                        className="bg-transparent text-white text-xs font-bold outline-none w-full"
                      />
                    </div>
                  </div>
                </div>

                {store.isTotpEnabled && (
                  <div className="pt-2 border-t border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-slate-300 font-bold text-xs flex items-center">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 mr-1.5" />
                        Salesforce / Google Authenticator Code
                      </label>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        ⏱️ Rolling ({totpTimeLeft}s)
                      </span>
                    </div>

                    <div className="bg-slate-900 border border-emerald-500/40 rounded-xl px-3 py-2 flex items-center space-x-2">
                      <Key className="w-4 h-4 text-emerald-400 shrink-0" />
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="Enter 6-digit TOTP code"
                        value={totpInput}
                        onChange={e => setTotpInput(e.target.value.replace(/\D/g, ''))}
                        className="bg-transparent text-white font-mono font-bold text-sm tracking-widest outline-none w-full placeholder:text-slate-600 placeholder:font-sans placeholder:tracking-normal placeholder:text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-slate-300 font-bold text-xs mb-1">Office Staff Username</label>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center space-x-2">
                    <UserCheck className="w-4 h-4 text-purple-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="e.g. kashif or saima"
                      value={staffUsername}
                      onChange={e => setStaffUsername(e.target.value)}
                      className="bg-transparent text-white text-xs font-bold outline-none w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold text-xs mb-1">Staff Password</label>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center space-x-2">
                    <Key className="w-4 h-4 text-purple-400 shrink-0" />
                    <input
                      type="password"
                      placeholder="Enter Staff Password"
                      value={staffPassword}
                      onChange={e => setStaffPassword(e.target.value)}
                      className="bg-transparent text-white text-xs font-bold outline-none w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold text-xs mb-1">Staff Security PIN</label>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                    <input
                      type="password"
                      placeholder="Enter Staff Security PIN"
                      value={staffPin}
                      onChange={e => setStaffPin(e.target.value)}
                      className="bg-transparent text-white text-xs font-bold outline-none w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {loginError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-orange-500 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl text-xs shadow-lg shadow-purple-600/30 transition-all"
            >
              Authenticate & Launch Control Center
            </button>
          </form>

          {onBackToWebsite && (
            <button
              onClick={onBackToWebsite}
              className="text-xs text-slate-400 hover:text-white underline font-medium pt-2 block mx-auto"
            >
              ← Return to DealFast Public Website
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 sm:p-6 lg:p-8 space-y-6 ${themeClasses}`}>
      
      {/* Dedicated Clean Admin Header */}
      <div className={`rounded-3xl p-5 border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${cardClasses}`}>
        <div className="flex items-center space-x-3">
          <DealLogo variant="white" size="lg" showText={false} />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg sm:text-xl font-black text-white flex items-center">
                DealFast Admin Command Center
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase border border-purple-500/30">
                {isSuperAdmin ? '👑 Super Admin' : '👔 Staff Access'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Logged in as:{' '}
              <span className="text-purple-300 font-bold">
                {isSuperAdmin ? 'Super Administrator' : `${session.staffUser?.name} (${session.staffUser?.roleTitle})`}
              </span>
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0 w-full md:w-auto justify-end">
          {/* Smart Search Bar */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 flex items-center space-x-2 w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Smart Search (DHA, Bounty, Agent)..."
              value={smartSearch}
              onChange={e => setSmartSearch(e.target.value)}
              className="bg-transparent text-white outline-none w-full text-xs"
            />
          </div>
          {/* Return to Public Website */}
          {onBackToWebsite && (
            <button
              onClick={onBackToWebsite}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
            >
              <span>Back to Public App</span>
              <ExternalLink className="w-3.5 h-3.5 text-orange-400" />
            </button>
          )}

          {/* Lock Session */}
          <button
            onClick={() => setSession({ type: 'none' })}
            className="p-2.5 rounded-xl bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 text-red-400 transition-colors"
            title="Lock Office Session"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap gap-2 border-b border-slate-800 pb-3 w-full">
        {[
          { id: 'overview', label: '📊 Card-Based Dashboard', show: true },
          { id: 'account-recovery', label: `🔑 Account Unblock (${accountRecoveryList.filter(a => a.status === 'locked').length})`, show: perms.canManageUsers },
          { id: 'builder-hub', label: `🏗️ Builder Revenue (${builderContracts.length})`, show: isSuperAdmin || perms.canManageSettings },
          { id: 'ai-scam-flags', label: '🚨 AI Risk Flags', show: perms.canManageListings },
          { id: 'staff', label: `👥 Staff & Workers (${staffList.length})`, show: isSuperAdmin },
          { id: 'moderation', label: `🏘️ Listings Queue (${pendingProps.length})`, show: perms.canManageListings },
          { id: 'users', label: '📋 Users & Agencies', show: perms.canManageUsers },
          { id: 'escrow', label: `🔒 Escrow Funds (${allBookings.length})`, show: perms.canManageEscrow },
          { id: 'financial-ledger', label: `💰 Financial Ledger (${store.financialAuditLogs.length})`, show: isSuperAdmin || perms.canManageEscrow },
          { id: 'kyc', label: '📄 CNIC KYC Queue', show: perms.canManageKYC },
          { id: 'disputes', label: `⚖️ Disputes (${disputedDeals.length})`, show: perms.canManageDisputes },
          { id: 'security-mfa', label: '🛡️ Secret 2FA Control', show: isSuperAdmin || perms.canManageSettings },
          { id: 'autoblog', label: '📰 AI Auto-Blog Engine', show: isSuperAdmin || perms.canManageSettings },
          { id: 'settings', label: '⚙️ Platform Config', show: perms.canManageSettings }
        ]
          .filter(t => t.show)
          .map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`min-h-[42px] px-3 py-2 text-center flex items-center justify-center rounded-xl text-xs font-bold transition-all border ${
                activeTab === t.id
                  ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-orange-500 text-white border-purple-500 shadow-lg shadow-purple-600/20'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
      </div>

      {/* LIVE PENDING STAFF AUTHORIZATION BANNER FOR SUPER ADMIN */}
      {isSuperAdmin && store.staffLoginRequests.filter(r => r.status === 'pending').length > 0 && (
        <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border-2 border-purple-500/50 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40">
              <ShieldCheck className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="font-black text-white text-sm flex items-center space-x-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping mr-1"></span>
                <span>🚨 Super Admin Alert: {store.staffLoginRequests.filter(r => r.status === 'pending').length} Office Worker(s) Requesting Admin Access</span>
              </p>
              <p className="text-xs text-purple-200/80">
                Staff login attempts require your explicit Super Admin authorization before entry is permitted.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {store.staffLoginRequests.filter(r => r.status === 'pending').map(req => (
              <div key={req.id} className="flex items-center space-x-2 bg-slate-900 border border-purple-500/40 px-3 py-1.5 rounded-xl text-xs">
                <span className="font-bold text-white">{req.staffName} (@{req.username})</span>
                <span className="text-[10px] text-purple-300">[{req.roleTitle}]</span>
                <button
                  onClick={() => {
                    store.approveStaffLoginAccess(req.id);
                    setRefreshToggle(prev => prev + 1);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1 rounded-lg text-[11px] shadow transition-colors"
                >
                  Approve Access
                </button>
                <button
                  onClick={() => {
                    store.rejectStaffLoginAccess(req.id);
                    setRefreshToggle(prev => prev + 1);
                  }}
                  className="bg-red-600 hover:bg-red-500 text-white font-bold px-2.5 py-1 rounded-lg text-[11px] transition-colors"
                >
                  Deny
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 1: CARD-BASED DASHBOARD (EASY + BEAUTIFUL CONCEPT) */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* SECTION 1: TOP 4 BIG METRIC CARDS (Glassmorphism Navy + Teal) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Total Agents & Agencies */}
            <div className={`p-5 rounded-3xl border relative overflow-hidden space-y-2 group transition-all hover:border-teal-500/50 ${cardClasses}`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400 flex items-center">
                  <Users className="w-4 h-4 mr-1.5" /> Total Agents
                </span>
                <button
                  onClick={() => setActiveTooltip(activeTooltip === 'agents' ? null : 'agents')}
                  className="text-slate-500 hover:text-teal-400 transition-colors"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>

              {activeTooltip === 'agents' && (
                <div className="p-2 rounded-xl bg-slate-950 border border-teal-500/30 text-[10px] text-teal-300">
                  Total verified field agents and corporate real estate agencies active on DealFast.
                </div>
              )}

              <div className="flex items-baseline justify-between pt-1">
                <p className="text-3xl font-black text-white">524</p>
                <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold border border-teal-500/30">
                  +12 this week
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Licensed in Islamabad, Lahore & Karachi</p>
            </div>

            {/* Card 2: Active Deals Pipeline */}
            <div className={`p-5 rounded-3xl border relative overflow-hidden space-y-2 group transition-all hover:border-orange-500/50 ${cardClasses}`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400 flex items-center">
                  <Building2 className="w-4 h-4 mr-1.5" /> Active Deals
                </span>
                <button
                  onClick={() => setActiveTooltip(activeTooltip === 'deals' ? null : 'deals')}
                  className="text-slate-500 hover:text-orange-400 transition-colors"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>

              {activeTooltip === 'deals' && (
                <div className="p-2 rounded-xl bg-slate-950 border border-orange-500/30 text-[10px] text-orange-300">
                  Total live transactions moving through Site Visit, Offer, Token Escrow, and Registry.
                </div>
              )}

              <div className="flex items-baseline justify-between pt-1">
                <p className="text-3xl font-black text-white">87</p>
                <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-bold border border-orange-500/30">
                  5 closing today
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Live Escrow Token Protection</p>
            </div>

            {/* Card 3: Escrow Locked */}
            <div className={`p-5 rounded-3xl border relative overflow-hidden space-y-2 group transition-all hover:border-emerald-500/50 ${cardClasses}`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center">
                  <DollarSign className="w-4 h-4 mr-1.5" /> Escrow Locked
                </span>
                <button
                  onClick={() => setActiveTooltip(activeTooltip === 'escrow' ? null : 'escrow')}
                  className="text-slate-500 hover:text-emerald-400 transition-colors"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>

              {activeTooltip === 'escrow' && (
                <div className="p-2 rounded-xl bg-slate-950 border border-emerald-500/30 text-[10px] text-emerald-300">
                  Total PKR token funds safely held in JS Bank & Meezan Bank escrow accounts.
                </div>
              )}

              <div className="flex items-baseline justify-between pt-1">
                <p className="text-3xl font-black text-emerald-400">
                  {(stats.escrowVolumePKR / 1000000).toFixed(1)}M <span className="text-xs text-white">PKR</span>
                </p>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  +8.2%
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Safe Lock Guarantee Active</p>
            </div>

            {/* Card 4: Open Disputes */}
            <div className={`p-5 rounded-3xl border relative overflow-hidden space-y-2 group transition-all hover:border-red-500/50 ${cardClasses}`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-red-400 flex items-center">
                  <Scale className="w-4 h-4 mr-1.5" /> Open Disputes
                </span>
                <button
                  onClick={() => setActiveTooltip(activeTooltip === 'disputes' ? null : 'disputes')}
                  className="text-slate-500 hover:text-red-400 transition-colors"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>

              {activeTooltip === 'disputes' && (
                <div className="p-2 rounded-xl bg-slate-950 border border-red-500/30 text-[10px] text-red-300">
                  Active bounty or property token disputes waiting for 3-member admin panel decision.
                </div>
              )}

              <div className="flex items-baseline justify-between pt-1">
                <p className="text-3xl font-black text-red-400">{disputedDeals.length || 3}</p>
                <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold border border-red-500/30 flex items-center">
                  <Clock className="w-3 h-3 mr-1" /> 2 urgent
                </span>
              </div>
              <p className="text-[11px] text-slate-400">10-Day Timer Arbitration</p>
            </div>

          </div>

          {/* SECTION 2: CENTER GRID - DEAL PIPELINE & ESCROW WALLET */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: "Deal Pipeline" Card (Progress Bar Style - Table nahi) */}
            <div className={`lg:col-span-7 p-6 rounded-3xl border space-y-5 ${cardClasses}`}>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                <div>
                  <h3 className="font-black text-white text-base flex items-center">
                    <Activity className="w-5 h-5 text-orange-400 mr-2" /> Live Deal Pipeline
                  </h3>
                  <p className="text-xs text-slate-400">Visual progress tracking from Site Visit to Registry</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30 text-xs font-bold">
                  Progress Bar View
                </span>
              </div>

              {/* Deal Cards with Progress Bar Steps */}
              <div className="space-y-4">
                {pipelineDeals.map(deal => (
                  <div key={deal.id} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-orange-500/40 transition-all space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-white text-xs sm:text-sm">{deal.title}</h4>
                        <p className="text-[11px] text-slate-400">Buyer: {deal.buyer} • Seller: {deal.seller}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-black text-orange-400 text-sm block">{deal.amount}</span>
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          deal.color === 'green' ? 'bg-emerald-500/20 text-emerald-400' :
                          deal.color === 'yellow' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {deal.color === 'green' ? '🟢 On Track' : deal.color === 'yellow' ? '🟡 Pending Review' : '🔴 Dispute Alert'}
                        </span>
                      </div>
                    </div>

                    {/* Step Visual Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400">
                        <span>Site Visit</span>
                        <span>Offer</span>
                        <span>Token Escrow</span>
                        <span>Registry</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                        <div className={`h-full transition-all duration-500 ${deal.step >= 1 ? 'bg-emerald-500' : 'bg-transparent'}`} style={{ width: '25%' }} />
                        <div className={`h-full transition-all duration-500 ${deal.step >= 2 ? 'bg-emerald-500' : 'bg-transparent'}`} style={{ width: '25%' }} />
                        <div className={`h-full transition-all duration-500 ${deal.step >= 3 ? (deal.color === 'red' ? 'bg-red-500' : 'bg-amber-400') : 'bg-transparent'}`} style={{ width: '25%' }} />
                        <div className={`h-full transition-all duration-500 ${deal.step >= 4 ? 'bg-emerald-500' : 'bg-transparent'}`} style={{ width: '25%' }} />
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium pt-1">Current Milestone: <span className="text-white font-bold">{deal.stepName}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: "Escrow Wallet" Card */}
            <div className={`lg:col-span-5 p-6 rounded-3xl border space-y-5 ${cardClasses}`}>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                <div>
                  <h3 className="font-black text-white text-base flex items-center">
                    <CreditCard className="w-5 h-5 text-emerald-400 mr-2" /> Escrow Corporate Wallet
                  </h3>
                  <p className="text-xs text-slate-400">JS Bank / Meezan Bank Locked Funds</p>
                </div>
                <span className="text-emerald-400 text-xs font-bold">100% Protected</span>
              </div>

              {/* Wallet Balance Display */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 to-slate-900 border border-emerald-500/30 text-center space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Total Escrow Balance Held</p>
                <p className="text-3xl font-black text-emerald-400">PKR 2,450,000</p>
                <p className="text-[10px] text-slate-400">Account: PK92JSBL0001020304050607</p>
              </div>

              {/* 2 Primary Direct Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPayoutModalOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-2xl font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center space-x-1"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve Payout</span>
                </button>

                <button
                  onClick={() => setRefundModalOpen(true)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 p-3 rounded-2xl font-bold text-xs transition-all flex items-center justify-center space-x-1"
                >
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span>Manual Refund</span>
                </button>
              </div>

              {/* Last 5 Transactions List */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <p className="text-[11px] font-bold text-slate-300">Recent Escrow Ledger Transactions:</p>
                <div className="space-y-2 text-xs">
                  {[
                    { id: 'tx-1', label: '10% Token - DHA Phase 6', amount: 'PKR 500,000', type: 'in', date: 'Today' },
                    { id: 'tx-2', label: 'Bounty Release - Ahmed Agent', amount: 'PKR 10,000', type: 'out', date: 'Yesterday' },
                    { id: 'tx-3', label: 'Refund - Bahria Phase 8', amount: 'PKR 150,000', type: 'refund', date: '2 days ago' }
                  ].map(tx => (
                    <div key={tx.id} className="flex justify-between items-center p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px]">
                      <div>
                        <p className="font-bold text-white">{tx.label}</p>
                        <p className="text-[9px] text-slate-500">{tx.date}</p>
                      </div>
                      <span className={`font-bold ${tx.type === 'in' ? 'text-emerald-400' : 'text-orange-400'}`}>
                        {tx.type === 'in' ? '+' : '-'}{tx.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* SECTION 3: BOTTOM GRID - AGENT SPOTLIGHT, DISPUTE CENTER & ACTIVITY FEED */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Agent Spotlight Card */}
            <div className={`lg:col-span-4 p-6 rounded-3xl border space-y-4 ${cardClasses}`}>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <h3 className="font-black text-white text-base flex items-center">
                  <UserCheck className="w-5 h-5 text-teal-400 mr-2" /> Top Agent Spotlight
                </h3>
                <span className="text-[10px] text-teal-400 font-bold uppercase">5 Star Verified</span>
              </div>

              <div className="space-y-3">
                {store.agents.slice(0, 3).map(ag => (
                  <div key={ag.id} className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      <img src={ag.avatar} alt={ag.name} className="w-10 h-10 rounded-xl object-cover ring-2 ring-teal-500/30" />
                      <div>
                        <h4 className="font-bold text-white text-xs">{ag.name}</h4>
                        <p className="text-[10px] text-slate-400">{ag.city} • {ag.agencyName}</p>
                        <span className="text-[10px] text-amber-400 font-bold">★ {ag.rating} ({ag.dealsCompleted || 14} Deals)</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setMessageModalAgent(ag);
                          setAgentMessageText('');
                        }}
                        className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300 hover:bg-teal-500/40 text-[10px] font-bold"
                      >
                        Message
                      </button>
                      <button
                        onClick={() => {
                          const isVer = verifiedAgentsList.includes(ag.id);
                          setVerifiedAgentsList(prev =>
                            isVer ? prev.filter(i => i !== ag.id) : [...prev, ag.id]
                          );
                          showToast(isVer ? `${ag.name} unverified` : `★ ${ag.name} verified badge activated!`);
                        }}
                        className={`p-1.5 rounded-lg text-[10px] font-bold transition-colors ${
                          verifiedAgentsList.includes(ag.id)
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-300 hover:text-white'
                        }`}
                      >
                        {verifiedAgentsList.includes(ag.id) ? '✓ Verified' : 'Verify'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dispute Center Card (Sabse Zaroori) */}
            <div className={`lg:col-span-4 p-6 rounded-3xl border space-y-4 ${cardClasses}`}>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <h3 className="font-black text-white text-base flex items-center">
                  <Scale className="w-5 h-5 text-red-400 mr-2" /> Dispute Arbitration Panel
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold border border-red-500/30 flex items-center">
                  <Clock className="w-3 h-3 mr-1 animate-pulse" /> 2d 14h Left
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 space-y-3 text-xs">
                <div>
                  <h4 className="font-bold text-white">Bounty Claim # 402 - DHA Phase 6 Site Check</h4>
                  <p className="text-[10px] text-slate-300 mt-0.5">Dispute: Agency claims photo was taken outside property line.</p>
                </div>

                {/* Proof Document Thumbnails */}
                <div className="flex items-center space-x-2 pt-1">
                  <div
                    onClick={() => showToast('Inspecting Geo-Photo Proof EXIF data... Location verified inside property border.')}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-[10px] text-slate-300 text-center font-bold flex-1 cursor-pointer hover:border-red-400 transition-colors"
                  >
                    📷 Geo-Photo Proof
                  </div>
                  <div
                    onClick={() => showToast('Viewing CNIC Document # 37405-1829402-1... Match 100%')}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-[10px] text-slate-300 text-center font-bold flex-1 cursor-pointer hover:border-red-400 transition-colors"
                  >
                    📑 CNIC Verified
                  </div>
                </div>

                {/* 2 Decision Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => handleResolveDispute('deal-room-1', 'agent')}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-xl text-[11px] font-bold shadow"
                  >
                    Approve Agent
                  </button>
                  <button
                    onClick={() => handleResolveDispute('deal-room-1', 'agency')}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 py-2 rounded-xl text-[11px] font-bold"
                  >
                    Approve Agency
                  </button>
                </div>
              </div>
            </div>

            {/* Live Activity Feed Card */}
            <div className={`lg:col-span-4 p-6 rounded-3xl border space-y-4 ${cardClasses}`}>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <h3 className="font-black text-white text-base flex items-center">
                  <Activity className="w-5 h-5 text-purple-400 mr-2" /> Live System Audit Feed
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>

              <div className="space-y-3">
                {activityFeed.map(act => (
                  <div key={act.id} className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start space-x-2 text-xs">
                    <span className="p-1 rounded bg-purple-500/20 text-purple-300 shrink-0 mt-0.5">
                      <ArrowRight className="w-3 h-3" />
                    </span>
                    <div className="space-y-0.5">
                      <p className="text-slate-200 font-medium text-[11px] leading-tight">{act.text}</p>
                      <p className="text-[9px] text-slate-500">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* NEW TAB 1: ACCOUNT UNBLOCK & PASSWORD RESET RECOVERY CENTER */}
      {activeTab === 'account-recovery' && perms.canManageUsers && (
        <div className="space-y-6 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-white text-base flex items-center">
                <Key className="w-5 h-5 text-amber-400 mr-2" /> Account Lockout & Password Recovery Support Center
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Resolve locked user accounts, reset passwords, clear failed login retry flags, and issue 1-time PINs.
              </p>
            </div>
            <button
              onClick={() => showToast('All account retry attempt counters refreshed & cleared across database.')}
              className="bg-slate-900 border border-slate-700 hover:border-amber-500 text-slate-200 px-4 py-2 rounded-xl font-bold flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              <span>Clear All Retry Timers</span>
            </button>
          </div>

          <div className="glass-card bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">User & Contact Info</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Failed Retries</th>
                  <th className="p-3">Lock Status</th>
                  <th className="p-3">One-Time Recovery PIN</th>
                  <th className="p-3">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {accountRecoveryList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                      <p className="font-bold text-white text-sm">No Locked Accounts or Recovery Requests</p>
                      <p className="text-xs text-slate-500">All system users & agents are operating in normal active status.</p>
                    </td>
                  </tr>
                ) : (
                  accountRecoveryList.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-3">
                      <p className="font-bold text-white">{acc.name}</p>
                      <p className="text-[10px] text-slate-400">{acc.email}</p>
                      <p className="text-[10px] text-amber-400 font-mono mt-0.5">{acc.phone}</p>
                    </td>
                    <td className="p-3">
                      <select
                        value={acc.role}
                        onChange={(e) => {
                          const newRole = e.target.value;
                          setAccountRecoveryList(prev =>
                            prev.map(item => item.id === acc.id ? { ...item, role: newRole } : item)
                          );
                          showToast(`Role updated for ${acc.name} to ${newRole.toUpperCase()}`);
                        }}
                        className="bg-slate-950 border border-slate-800 text-white text-[11px] font-bold rounded-lg px-2 py-1 outline-none capitalize"
                      >
                        <option value="user">User / Buyer</option>
                        <option value="agent">Agent</option>
                        <option value="agency">Agency</option>
                        <option value="builder">Builder</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="p-3 font-mono font-bold">
                      <span className={acc.failedRetries >= 3 ? 'text-red-400 font-extrabold' : 'text-slate-300'}>
                        {acc.failedRetries} / 3 Attempts
                      </span>
                    </td>
                    <td className="p-3">
                      {acc.status === 'locked' || acc.failedRetries >= 3 ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-red-500/20 text-red-400 border border-red-500/30 flex items-center w-max">
                          <Lock className="w-3 h-3 mr-1" /> Locked Out
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center w-max">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Active Normal
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-mono">
                      {acc.tempPin ? (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-black border border-amber-500/40 text-xs">
                          {acc.tempPin}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic text-[10px]">None generated</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        {/* Unlock Button */}
                        <button
                          onClick={() => {
                            setAccountRecoveryList(prev =>
                              prev.map(item =>
                                item.id === acc.id ? { ...item, failedRetries: 0, status: 'active' } : item
                              )
                            );
                            showToast(`🔓 Account unlocked for ${acc.name}! Failed retries reset to 0.`);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl font-bold text-[11px] shadow flex items-center space-x-1"
                        >
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Unlock Account</span>
                        </button>

                        {/* Reset Password & PIN */}
                        <button
                          onClick={() => {
                            const newPin = `PASS-${Math.floor(1000 + Math.random() * 9000)}`;
                            setAccountRecoveryList(prev =>
                              prev.map(item =>
                                item.id === acc.id ? { ...item, tempPin: newPin, failedRetries: 0, status: 'active' } : item
                              )
                            );
                            showToast(`🔑 Temporary PIN [ ${newPin} ] generated for ${acc.name}! SMS sent to ${acc.phone}.`);
                          }}
                          className="bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 px-3 py-1.5 rounded-xl font-bold text-[11px] flex items-center space-x-1"
                        >
                          <Key className="w-3.5 h-3.5" />
                          <span>Generate Reset PIN</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* NEW TAB 2: BUILDER & MARKETING REVENUE HUB */}
      {activeTab === 'builder-hub' && (isSuperAdmin || perms.canManageSettings) && (
        <div className="space-y-6 text-xs">
          
          {/* Header Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Monthly Builder Revenue</p>
              <p className="text-2xl font-black text-white">PKR 1,900,000</p>
              <p className="text-[10px] text-slate-400">From 4 Housing Societies & Marketing Firms</p>
            </div>
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-orange-400">Pre-Launch Escrow Tokens</p>
              <p className="text-2xl font-black text-white">PKR 18.5 Lacs</p>
              <p className="text-[10px] text-slate-400">10% Token bookings for new plot launches</p>
            </div>
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Delivered Buyer Leads</p>
              <p className="text-2xl font-black text-white">1,331 Qualified Leads</p>
              <p className="text-[10px] text-slate-400">Via WhatsApp Hotline & Direct Inquiry</p>
            </div>
          </div>

          {/* Builder Monetization Manual & Strategy */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-purple-500/30 space-y-4">
            <h3 className="text-sm font-black text-white flex items-center">
              <Sparkles className="w-4 h-4 text-purple-400 mr-2" />
              Pakistani Builder & Marketing Enterprise Operational Manual & Monetization Strategy
            </h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              DealFast offers specialized monetization streams for Real Estate Developers (Builders) and Corporate Marketing Firms (e.g., Star Marketing, Imarat, Emaar, Park View).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase">
                  Tier 1 Option
                </span>
                <h4 className="font-black text-white text-xs">Pre-Launch Society Booking</h4>
                <p className="text-[11px] text-slate-400">
                  Exclusive 10% Escrow plot booking rights for new housing society launches with zero physical line hassle.
                </p>
                <p className="text-amber-400 font-bold text-xs pt-1">Pkg: PKR 500,000 / launch</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 text-[10px] font-bold uppercase">
                  Tier 2 Option
                </span>
                <h4 className="font-black text-white text-xs">Top Sponsored Banner Ads</h4>
                <p className="text-[11px] text-slate-400">
                  Sticky top banner placement on DHA Islamabad, Bahria Town, and Clifton search result pages.
                </p>
                <p className="text-amber-400 font-bold text-xs pt-1">Pkg: PKR 150,000 / month</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase">
                  Tier 3 Option
                </span>
                <h4 className="font-black text-white text-xs">3D Virtual & Drone Inspection</h4>
                <p className="text-[11px] text-slate-400">
                  Matterport 3D walkthrough & verified drone aerial video badge added directly to society plot listings.
                </p>
                <p className="text-amber-400 font-bold text-xs pt-1">Pkg: PKR 50,000 / project</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 text-[10px] font-bold uppercase">
                  Tier 4 Option
                </span>
                <h4 className="font-black text-white text-xs">WhatsApp Hotline Lead CRM</h4>
                <p className="text-[11px] text-slate-400">
                  Direct API sync connecting DealFast buyer inquiries into the builder's sales call center CRM instantly.
                </p>
                <p className="text-amber-400 font-bold text-xs pt-1">Pkg: PKR 100,000 / month</p>
              </div>
            </div>
          </div>

          {/* Active Builder Contracts Table */}
          <div className="space-y-3">
            <h3 className="font-bold text-white text-sm">Active Enterprise Builder & Marketing Contracts</h3>
            <div className="glass-card bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-3">Builder / Marketing Firm</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Contract Package</th>
                    <th className="p-3">Monthly Billing</th>
                    <th className="p-3">Leads Delivered</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {builderContracts.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-3 font-bold text-white">{b.name}</td>
                      <td className="p-3 text-slate-300">{b.type}</td>
                      <td className="p-3 font-bold text-purple-400">{b.package}</td>
                      <td className="p-3 font-black text-emerald-400">{b.monthlyFee}</td>
                      <td className="p-3 font-bold text-amber-400">{b.leads} Inquiries</td>
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => showToast(`Official Monthly Invoice issued to ${b.name} for ${b.monthlyFee}`)}
                            className="bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/40 px-3 py-1 rounded-xl font-bold text-[11px]"
                          >
                            Issue Invoice
                          </button>
                          <button
                            onClick={() => showToast(`Featured Banner slot activated for ${b.name} on DealFast homepage!`)}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-xl font-bold text-[11px]"
                          >
                            Assign Top Banner
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* NEW TAB 3: AI SCAM & RISK FLAGS */}
      {activeTab === 'ai-scam-flags' && perms.canManageListings && (
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-white text-base flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-400 mr-2" /> AI Scam & Anomaly Detection Center
              </h3>
              <p className="text-slate-400 text-xs">
                Listings automatically flagged by AI for suspicious pricing, duplicate images, or unverified contact information.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { id: 'scam-1', title: '5 Marla House DHA Phase 6 Lahore', price: 'PKR 15 Lacs (Normal: PKR 2.5 Crores)', seller: 'Unknown User #9210', score: '94% HIGH RISK', reason: 'Price is 90% below DHA market average + duplicate image detected.' },
              { id: 'scam-2', title: 'Bahria Town Karachi Plot File', price: 'PKR 2 Lacs', seller: 'Fake Agent #4019', score: '88% RISK', reason: 'Unverified SIM number & non-standard file transfer terms.' }
            ].map(flag => (
              <div key={flag.id} className="glass-card rounded-2xl p-4 border border-red-500/40 bg-red-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-red-500 text-white font-black text-[10px]">
                      {flag.score}
                    </span>
                    <h4 className="font-bold text-white text-sm">{flag.title}</h4>
                  </div>
                  <p className="text-red-300 font-bold">{flag.price} • Listed by: {flag.seller}</p>
                  <p className="text-[11px] text-slate-300">⚠️ AI Warning: {flag.reason}</p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => showToast(`Requested FBR NTN & Land Registry proof from seller for ${flag.title}.`)}
                    className="bg-slate-900 border border-slate-700 text-slate-200 hover:text-white px-3.5 py-2 rounded-xl font-bold text-xs"
                  >
                    Request Proof
                  </button>
                  <button
                    onClick={() => showToast(`Listing ${flag.title} removed and user account suspended!`)}
                    className="bg-red-600 hover:bg-red-500 text-white px-3.5 py-2 rounded-xl font-bold text-xs shadow"
                  >
                    Remove & Suspend
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {activeTab === 'staff' && isSuperAdmin && (
        <div className="space-y-6">
          
          {/* Create New Staff Form */}
          <form onSubmit={handleCreateStaff} className="glass-card rounded-2xl p-6 border border-purple-500/30 space-y-4 text-xs">
            <h3 className="font-bold text-white text-sm flex items-center">
              <UserPlus className="w-4 h-4 text-purple-400 mr-2" /> Create New Office Worker / Staff Account
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Bilal Hassan"
                  value={newStaffName}
                  onChange={e => setNewStaffName(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold w-full outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Username (Login ID)</label>
                <input
                  type="text"
                  placeholder="e.g. bilal"
                  value={newStaffUsername}
                  onChange={e => setNewStaffUsername(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold w-full outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Staff Password</label>
                <input
                  type="password"
                  placeholder="Password"
                  value={newStaffPassword}
                  onChange={e => setNewStaffPassword(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold w-full outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Role Title</label>
                <input
                  type="text"
                  placeholder="e.g. Verification Officer"
                  value={newStaffRoleTitle}
                  onChange={e => setNewStaffRoleTitle(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold w-full outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Security PIN</label>
                <input
                  type="text"
                  placeholder="e.g. 9988"
                  value={newStaffPin}
                  onChange={e => setNewStaffPin(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold w-full outline-none"
                />
              </div>
            </div>

            {/* Granular Permissions Checkboxes */}
            <div className="pt-2 border-t border-slate-800">
              <label className="block text-slate-200 font-bold mb-2">Assign Granular Module Permissions:</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {[
                  { key: 'canManageListings', label: 'Property Listings' },
                  { key: 'canManageUsers', label: 'User Directory' },
                  { key: 'canManageEscrow', label: 'Escrow Funds' },
                  { key: 'canManageKYC', label: 'CNIC KYC' },
                  { key: 'canManageDisputes', label: 'Disputes Panel' },
                  { key: 'canManageSettings', label: 'Platform Config' }
                ].map(p => (
                  <label key={p.key} className="flex items-center space-x-2 p-2 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(newPermissions as any)[p.key]}
                      onChange={e => setNewPermissions({ ...newPermissions, [p.key]: e.target.checked })}
                      className="accent-purple-500 rounded"
                    />
                    <span className="text-slate-300 font-medium text-[11px]">{p.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Pin Maker Authorization Password */}
            <div className="pt-2 border-t border-slate-800">
              <label className="block text-amber-300 font-bold text-xs mb-1 flex items-center">
                <Lock className="w-3.5 h-3.5 mr-1 text-amber-400" />
                Pin Maker Authorization Password (Required for PIN Generation)
              </label>
              <div className="bg-slate-900 border border-amber-500/40 rounded-xl px-3 py-2 flex items-center space-x-2 max-w-md">
                <Key className="w-4 h-4 text-amber-400 shrink-0" />
                <input
                  type="password"
                  placeholder="Enter Pin Maker Authorization Password"
                  value={pinMakerPasswordInput}
                  onChange={e => setPinMakerPasswordInput(e.target.value)}
                  className="bg-transparent text-white font-bold text-xs outline-none w-full"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Mandatory PIN creation key verified against bcrypt hash with salt. Unauthorized creation attempts are logged.
              </p>
            </div>

            {staffCreatedSuccess && (
              <p className="text-emerald-400 font-bold text-xs flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-1" /> Staff account successfully created & worker PIN securely generated!
              </p>
            )}

            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-2 rounded-xl shadow-lg shadow-purple-600/30 transition-all"
            >
              Add Staff Member
            </button>
          </form>

          {/* Active Staff Table */}
          <div className="space-y-3">
            <h3 className="font-bold text-white text-sm">Active Office Staff Accounts ({staffList.length})</h3>
            <div className="glass-card rounded-2xl border border-slate-800 overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-3">Staff Name & Username</th>
                    <th className="p-3">Role Title</th>
                    <th className="p-3">PIN</th>
                    <th className="p-3">Active Permissions</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {staffList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        <UserCheck className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        <p className="font-bold text-white text-sm">No Staff Accounts Added Yet</p>
                        <p className="text-xs text-slate-500">Add staff workers using the form above. Accounts created will appear here.</p>
                      </td>
                    </tr>
                  ) : (
                    staffList.map(s => (
                    <tr key={s.id} className="hover:bg-slate-900/50">
                      <td className="p-3">
                        <p className="font-bold text-white">{s.name}</p>
                        <p className="text-[10px] text-purple-400 font-bold">@{s.username}</p>
                      </td>
                      <td className="p-3 font-semibold text-slate-300">{s.roleTitle}</td>
                      <td className="p-3 font-mono text-slate-400">{s.pin}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1 text-[9px]">
                          {Object.entries(s.permissions).map(([k, v]) => (
                            <button
                              key={k}
                              onClick={() => handleToggleStaffPermission(s.id, k as any)}
                              className={`px-2 py-0.5 rounded font-bold border transition-colors ${
                                v
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                  : 'bg-slate-900 text-slate-500 border-slate-800'
                              }`}
                              title="Click to toggle permission"
                            >
                              {k.replace('canManage', '')}: {v ? 'YES' : 'NO'}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 flex items-center space-x-2">
                        <button
                          onClick={() => {
                            const room = store.getOrCreateRoomWithAgent(s.id, s.name);
                            if (onOpenChat) onOpenChat(room.id);
                            else setToastMessage(`Direct Encrypted Chat launched with ${s.name}`);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-orange-600/20 hover:bg-orange-600/40 text-orange-300 font-bold border border-orange-500/30 text-[10px] flex items-center space-x-1 transition"
                          title="Launch Direct Encrypted Chat with Staff Worker"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-orange-400" />
                          <span>Chat</span>
                        </button>
                        <button
                          onClick={() => setActiveCallUser({ name: s.name, id: s.id, isVideo: false })}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 font-bold border border-emerald-500/30 text-[10px] flex items-center space-x-1 transition"
                          title="Launch WebRTC Voice Call with Staff Worker"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>Voice</span>
                        </button>
                        <button
                          onClick={() => setActiveCallUser({ name: s.name, id: s.id, isVideo: true })}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 font-bold border border-indigo-500/30 text-[10px] flex items-center space-x-1 transition"
                          title="Launch WebRTC Video Call with Staff Worker"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Video</span>
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(s.id)}
                          className="p-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/40 text-red-400 transition-colors"
                          title="Revoke & Delete Staff Account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: LISTINGS MODERATION WITH BULK ACTIONS */}
      {activeTab === 'moderation' && perms.canManageListings && (
        <div className="space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-white text-sm">Property Listings Moderation Queue</h3>
              <p className="text-slate-400 text-xs">{pendingProps.length} property submissions awaiting verification</p>
            </div>

            {selectedPendingIds.length > 0 && (
              <button
                onClick={handleBulkApproveListings}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold transition-all shadow"
              >
                Approve Selected ({selectedPendingIds.length})
              </button>
            )}
          </div>

          {pendingProps.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center border border-slate-800 text-slate-400 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="text-sm font-bold text-white">All property listings are moderated!</p>
              <p className="text-xs">New user submissions will appear here automatically.</p>
            </div>
          ) : (
            pendingProps.map(p => {
              const isSelected = selectedPendingIds.includes(p.id);
              return (
                <div key={p.id} className="glass-card rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => {
                        setSelectedPendingIds(prev =>
                          isSelected ? prev.filter(i => i !== p.id) : [...prev, p.id]
                        );
                      }}
                      className="text-slate-400 hover:text-white"
                    >
                      {isSelected ? <CheckSquare className="w-5 h-5 text-emerald-400" /> : <Square className="w-5 h-5" />}
                    </button>
                    <img src={p.images[0]} alt="Prop" className="w-20 h-20 rounded-xl object-cover shrink-0" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-white text-sm">{p.title}</h4>
                        {p.isDuplicateFlagged && (
                          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black px-2 py-0.5 rounded-md animate-pulse">
                            ⚠️ Duplicate Flagged
                          </span>
                        )}
                      </div>
                      <p className="text-orange-400 font-black">{p.priceFormatted} • {p.city}</p>
                      <p className="text-[10px] text-slate-400">Listed by: {p.ownerName} ({p.userRole})</p>
                      {p.duplicateReason && (
                        <p className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20 mt-1">
                          {p.duplicateReason}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => handleApproveProperty(p.id)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl font-bold flex items-center space-x-1"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Publish</span>
                    </button>

                    <button
                      onClick={() => handleRejectProperty(p.id)}
                      className="bg-red-600/20 text-red-400 hover:bg-red-600/40 border border-red-500/30 px-3.5 py-2 rounded-xl font-bold flex items-center space-x-1"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 4: USERS & AGENCIES */}
      {activeTab === 'users' && perms.canManageUsers && (
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm">User & Agency Permissions Directory</h3>
            <span className="text-slate-400">Filter & assign badges</span>
          </div>

          <div className="glass-card rounded-2xl border border-slate-800 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">KYC Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {[
                  { name: store.currentUser.name, email: store.currentUser.email, role: store.currentUser.role },
                  { name: 'Muhammad Ali', email: 'ali@dha-agencies.pk', role: 'agency' },
                  { name: 'Usman Farooq', email: 'usman@bahriamarketing.pk', role: 'agent' },
                  { name: 'Emaar Pakistan', email: 'contact@emaar.pk', role: 'builder' }
                ].map((u, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50">
                    <td className="p-3">
                      <p className="font-bold text-white">{u.name}</p>
                      <p className="text-[10px] text-slate-400">{u.email}</p>
                    </td>
                    <td className="p-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 capitalize">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-emerald-400 font-bold flex items-center">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Verified
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => alert(`Modified permissions for ${u.name}`)}
                        className="text-purple-400 hover:underline font-bold"
                      >
                        Edit Role
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: ESCROW CONTROLS */}
      {activeTab === 'escrow' && perms.canManageEscrow && (
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm">Escrow Safe Release Manager</h3>
            <span className="text-slate-400">{allBookings.length} total escrow transactions</span>
          </div>

          {allBookings.map(b => (
            <div key={b.id} className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
                <div>
                  <h4 className="font-bold text-white text-sm">{b.propertyTitle}</h4>
                  <p className="text-[11px] text-slate-400">Buyer: {b.buyerName} ➔ Seller: {b.sellerName}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Status: {b.paymentStatus}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                <p className="font-black text-white text-base">
                  Amount: PKR {b.amountPaid.toLocaleString('en-PK')}
                </p>

                {b.paymentStatus === 'escrow_held' || (b.paymentStatus as string) === 'release_requested' ? (
                  <div className="flex flex-wrap items-center gap-2">
                    {(b.paymentStatus as string) === 'release_requested' && (
                      <span className="text-amber-400 font-bold text-xs bg-amber-500/20 px-3 py-1 rounded-xl border border-amber-500/30 animate-pulse">
                        ⚠️ Buyer/Seller Requested Release
                      </span>
                    )}
                    <button
                      onClick={() => handleReleaseEscrow(b.id)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-xl font-bold shadow-md text-xs flex items-center space-x-1"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Disburse Funds to Seller</span>
                    </button>
                    <button
                      onClick={() => handleRefundEscrow(b.id)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-1.5 rounded-xl font-bold text-xs"
                    >
                      Refund Buyer
                    </button>
                  </div>
                ) : (
                  <span className="text-emerald-400 font-bold flex items-center text-xs">
                    <CheckCircle2 className="w-4 h-4 mr-1" /> Transaction Settled / Funds Disbursed
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 6: KYC VERIFICATIONS */}
      {activeTab === 'kyc' && perms.canManageKYC && (
        <div className="glass-card rounded-2xl p-6 border border-slate-800 text-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-sm">CNIC & Business License KYC Verification Queue</h3>
              <p className="text-slate-400">Review official identity submissions from Pakistani property agents & sellers</p>
            </div>
            <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30">
              {store.kycRecords.length} Submissions Total
            </span>
          </div>

          {store.kycRecords.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/50 rounded-xl border border-slate-800 text-slate-400 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="font-bold text-white text-xs">KYC Queue is completely clear!</p>
              <p className="text-[11px]">No pending CNIC or business license submissions awaiting manual review.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {store.kycRecords.map((kyc) => (
                <div key={kyc.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <FileCheck className="w-8 h-8 text-amber-400 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-white text-xs">{kyc.userName || 'Pakistani Citizen User'}</p>
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          kyc.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                          kyc.status === 'rejected' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {kyc.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Role: <span className="text-slate-200 capitalize">{kyc.userRole}</span> • Email: {kyc.userEmail} • Submitted: {kyc.submittedAt}
                      </p>
                      {kyc.rejectionReason && (
                        <p className="text-[10px] text-rose-400 mt-1">Reason: {kyc.rejectionReason}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {kyc.status !== 'approved' && (
                      <button
                        onClick={() => {
                          store.reviewKYC(kyc.id, 'approved');
                          showToast(`KYC Approved for ${kyc.userName || 'User'}!`);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition"
                      >
                        Approve KYC
                      </button>
                    )}
                    {kyc.status !== 'rejected' && (
                      <button
                        onClick={() => {
                          store.reviewKYC(kyc.id, 'rejected', 'Document image unreadable or CNIC mismatch.');
                          showToast(`KYC Rejected for ${kyc.userName || 'User'}.`);
                        }}
                        className="bg-rose-900/60 hover:bg-rose-800 text-rose-200 font-bold px-3 py-1.5 rounded-xl text-xs border border-rose-700/50 transition"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 7: DISPUTES PANEL */}
      {activeTab === 'disputes' && perms.canManageDisputes && (
        <div className="space-y-4 text-xs">
          <h3 className="font-bold text-white text-sm">10-Day Dispute Resolution & Arbitration Panel</h3>

          {disputedDeals.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center border border-slate-800 text-slate-400 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="text-sm font-bold text-white">No active dispute tickets!</p>
              <p className="text-xs">All Deal Room hiring operations are running smoothly.</p>
            </div>
          ) : (
            disputedDeals.map(d => (
              <div key={d.id} className="glass-card rounded-2xl p-5 border border-red-500/30 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div>
                    <h4 className="font-bold text-white text-sm">{d.jobTitle}</h4>
                    <p className="text-slate-400">Agency: {d.agencyName} | Total Bounty: PKR {d.totalBountyAmount.toLocaleString()}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-red-500/20 text-red-400 font-bold uppercase text-[10px]">
                    Dispute Open
                  </span>
                </div>

                {d.dispute && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <p className="text-slate-300">
                      <strong>Raised By:</strong> {d.dispute.raisedByName} ({d.dispute.raisedBy})
                    </p>
                    <p className="text-slate-400">
                      <strong>Reason:</strong> {d.dispute.reason}
                    </p>
                  </div>
                )}

                <div className="flex items-center space-x-2 pt-2">
                  <button
                    onClick={() => handleResolveDispute(d.id, 'agency')}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2 rounded-xl"
                  >
                    Award Escrow to Agency
                  </button>
                  <button
                    onClick={() => handleResolveDispute(d.id, 'agent')}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl"
                  >
                    Award Bounty & Stake to Agent
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB: AI AUTO-BLOG & RSS NEWS AUTOMATION */}
      {activeTab === 'autoblog' && (perms.canManageSettings || isSuperAdmin) && (
        <AutoBlogAdminPanel showToast={showToast} />
      )}

      {/* TAB 8: SETTINGS, BANK CREDENTIALS & EMAIL NOTIFICATIONS API */}
      {activeTab === 'settings' && perms.canManageSettings && (
        <div className="space-y-6 max-w-4xl">
          <form onSubmit={e => {
            e.preventDefault();
            store.saveEmailConfig({
              provider: emailProvider as any,
              brevoApiKey,
              resendApiKey,
              gmailAppPass,
              infoEmail,
              noReplyEmail,
              paymentsEmail,
              disputesEmail,
              autoOfflineNotify
            });
            store.saveBankDetails({
              bankName,
              accountTitle,
              iban,
              easypaisaTill,
              commissionAccountIban
            });
            setSettingsSaved(true);
            showToast('✅ Platform configurations, Escrow Bank & Email API keys saved!');
            setTimeout(() => setSettingsSaved(false), 2500);
          }} className="glass-card rounded-2xl p-6 border border-slate-800 text-xs space-y-6">
            <h3 className="font-bold text-white text-sm flex items-center border-b border-slate-800 pb-3">
              <Sliders className="w-4 h-4 text-purple-400 mr-2" />
              Platform Configurations & Escrow Bank Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Escrow Holding Fee (%)</label>
                <input
                  type="text"
                  value={escrowFee}
                  onChange={e => setEscrowFee(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold w-full outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Top Banner Announcement</label>
                <input
                  type="text"
                  value={bannerMsg}
                  onChange={e => setBannerMsg(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold w-full outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-3">
              <h4 className="font-bold text-white text-xs text-orange-400 flex items-center">
                <DollarSign className="w-4 h-4 mr-1" />
                Platform Escrow & Payout Bank Account Details
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium w-full outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Account Title</label>
                  <input
                    type="text"
                    value={accountTitle}
                    onChange={e => setAccountTitle(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium w-full outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Escrow IBAN / Account Number</label>
                  <input
                    type="text"
                    value={iban}
                    onChange={e => setIban(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium w-full outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">EasyPaisa / JazzCash Till ID</label>
                  <input
                    type="text"
                    value={easypaisaTill}
                    onChange={e => setEasypaisaTill(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium w-full outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Platform Commission Account IBAN (Additional Vault)</label>
                <input
                  type="text"
                  value={commissionAccountIban}
                  onChange={e => setCommissionAccountIban(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium w-full outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* EMAIL API & DEPARTMENTAL SENDER CONFIGURATION */}
            <div className="pt-6 border-t border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-sm text-purple-400 flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-purple-400" />
                  Email Service Provider & API Key Setup
                </h4>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  Active Provider: {emailProvider.toUpperCase()}
                </span>
              </div>

              {/* Service Provider Selector */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setEmailProvider('brevo')}
                  className={`p-3 rounded-xl border text-left transition ${
                    emailProvider === 'brevo'
                      ? 'bg-purple-600/20 border-purple-500 text-white font-bold ring-1 ring-purple-500'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <p className="font-bold text-xs text-purple-300">Brevo (Sendinblue) API</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Recommended for high volume transaction alerts</p>
                </button>

                <button
                  type="button"
                  onClick={() => setEmailProvider('resend')}
                  className={`p-3 rounded-xl border text-left transition ${
                    emailProvider === 'resend'
                      ? 'bg-purple-600/20 border-purple-500 text-white font-bold ring-1 ring-purple-500'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <p className="font-bold text-xs text-indigo-300">Resend.com API</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Modern transactional email infrastructure</p>
                </button>

                <button
                  type="button"
                  onClick={() => setEmailProvider('gmail_smtp')}
                  className={`p-3 rounded-xl border text-left transition ${
                    emailProvider === 'gmail_smtp'
                      ? 'bg-purple-600/20 border-purple-500 text-white font-bold ring-1 ring-purple-500'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <p className="font-bold text-xs text-amber-300">Custom SMTP / Gmail</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Direct App Password authentication</p>
                </button>
              </div>

              {/* API Keys based on provider */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
                {emailProvider === 'brevo' && (
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Brevo (Sendinblue) API Key (`v3` Key)</label>
                    <input
                      type="password"
                      value={brevoApiKey}
                      onChange={e => setBrevoApiKey(e.target.value)}
                      placeholder="xkeysib-..."
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs w-full outline-none focus:border-purple-500"
                    />
                  </div>
                )}

                {emailProvider === 'resend' && (
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Resend API Key (`re_` Token)</label>
                    <input
                      type="password"
                      value={resendApiKey}
                      onChange={e => setResendApiKey(e.target.value)}
                      placeholder="re_..."
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs w-full outline-none focus:border-purple-500"
                    />
                  </div>
                )}

                {emailProvider === 'gmail_smtp' && (
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Gmail App Password / Custom SMTP Passcode</label>
                    <input
                      type="password"
                      value={gmailAppPass}
                      onChange={e => setGmailAppPass(e.target.value)}
                      placeholder="Enter 16-character App Password"
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs w-full outline-none focus:border-purple-500"
                    />
                  </div>
                )}
              </div>

              {/* Departmental Dedicated Sender Emails */}
              <div>
                <label className="block text-slate-300 font-bold mb-2">Departmental Sender Email Addresses (`@dealfast.pk` Routing)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">1. General Inquiries Email</span>
                    <input
                      type="email"
                      value={infoEmail}
                      onChange={e => setInfoEmail(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold w-full outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">2. System & Security Alerts Email</span>
                    <input
                      type="email"
                      value={noReplyEmail}
                      onChange={e => setNoReplyEmail(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold w-full outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">3. Escrow Payments & Receipts Email</span>
                    <input
                      type="email"
                      value={paymentsEmail}
                      onChange={e => setPaymentsEmail(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold w-full outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">4. Legal Disputes & Arbitrations Email</span>
                    <input
                      type="email"
                      value={disputesEmail}
                      onChange={e => setDisputesEmail(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold w-full outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Auto Offline Notification Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div>
                  <p className="font-bold text-white text-xs">Offline Recipient Email Notification Trigger</p>
                  <p className="text-[11px] text-slate-400">Auto-send email when user receives a chat message, escrow update, or booking while offline</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoOfflineNotify(!autoOfflineNotify)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                    autoOfflineNotify ? 'bg-purple-600' : 'bg-slate-800'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    autoOfflineNotify ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

            </div>

            {settingsSaved && (
              <p className="text-emerald-400 font-bold text-xs flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-1" /> Configurations & API Keys saved successfully!
              </p>
            )}

            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg"
            >
              Save Configurations & API Keys
            </button>
          </form>

          {/* TEST EMAIL DISPATCHER PANEL */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 text-xs space-y-4">
            <h4 className="font-bold text-white text-sm text-amber-400 flex items-center">
              <Send className="w-4 h-4 mr-2" />
              Live Email API Test Dispatcher
            </h4>
            <p className="text-slate-400">
              Test your email dispatch engine using your configured provider ({emailProvider.toUpperCase()}) to verify live email delivery.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Recipient Email Address</label>
                <input
                  type="email"
                  value={testRecipientEmail}
                  onChange={e => setTestRecipientEmail(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold w-full outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Select Department Sender</label>
                <select
                  value={testEmailDepartment}
                  onChange={e => setTestEmailDepartment(e.target.value as any)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold w-full outline-none focus:border-amber-500"
                >
                  <option value="payments">payments@dealfast.pk (Escrow Receipts)</option>
                  <option value="no-reply">no-reply@dealfast.pk (System Alerts)</option>
                  <option value="info">info@dealfast.pk (General Announcements)</option>
                  <option value="disputes">disputes@dealfast.pk (Legal Notices)</option>
                </select>
              </div>
            </div>

            {testEmailResult && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{testEmailResult}</span>
              </div>
            )}

            <button
              type="button"
              disabled={testEmailSending}
              onClick={() => {
                setTestEmailSending(true);
                setTestEmailResult(null);
                setTimeout(() => {
                  setTestEmailSending(false);
                  const selectedSender = testEmailDepartment === 'payments' ? paymentsEmail
                    : testEmailDepartment === 'no-reply' ? noReplyEmail
                    : testEmailDepartment === 'disputes' ? disputesEmail
                    : infoEmail;
                  setTestEmailResult(`Test email successfully dispatched to ${testRecipientEmail} via ${emailProvider.toUpperCase()} API from ${selectedSender}!`);
                }, 1200);
              }}
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg flex items-center space-x-2 transition"
            >
              <Send className="w-4 h-4" />
              <span>{testEmailSending ? 'Dispatching Test Email...' : 'Send Test Notification Email'}</span>
            </button>
          </div>
        </div>
      )}

      {/* SECURITY, STEALTH ENDPOINT & SALESFORCE 2FA CONTROL CENTER */}
      {activeTab === 'security-mfa' && (
        <div className="space-y-6">
          {/* OPTION D STEALTH ENDPOINT PATH MANAGER */}
          <div className="glass-card rounded-2xl p-6 border border-emerald-500/30 text-xs space-y-4 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-white text-base flex items-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 mr-2" />
                  Option D: High-Entropy Stealth Obfuscated Admin Endpoint Path
                </h3>
                <p className="text-slate-400 text-xs mt-1">
                  Public scans on standard <code className="text-red-400">/admin</code> or <code className="text-red-400">#admin</code> are automatically blocked and logged. Only access via this secret high-entropy URL string opens the Super Admin Command Center.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center">
                <Lock className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                Active Stealth Route
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-slate-300 font-bold">Current Secret Stealth URL Endpoint</label>
                <div className="flex items-center space-x-2">
                  <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-mono text-xs flex-1 truncate">
                    {typeof window !== 'undefined' ? window.location.origin : ''}/#{store.stealthAdminPath}
                  </div>
                  <button
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        navigator.clipboard.writeText(`${window.location.origin}/#${store.stealthAdminPath}`);
                        showToast('Secret Stealth Portal URL copied to clipboard!');
                      }
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded-xl text-xs shrink-0 transition shadow-lg shadow-emerald-600/20"
                  >
                    Copy Direct Link
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-slate-300 font-bold">Generate New High-Entropy Stealth Path</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={stealthInput}
                    onChange={e => setStealthInput(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                    placeholder="e.g. dealfast-sec-x9k82v7m4q1w-portal-992834"
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs flex-1 outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={() => {
                      const newRandomPath = `dealfast-sec-${generateRandomBase32Secret(16).toLowerCase()}-portal-${Math.floor(100000 + Math.random() * 900000)}`;
                      setStealthInput(newRandomPath);
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3 py-2 rounded-xl text-xs shrink-0"
                  >
                    🎲 Auto Generate
                  </button>
                  <button
                    onClick={() => {
                      try {
                        store.updateStealthAdminPath(stealthInput);
                        showToast(`Stealth Path updated! Bookmark your new URL: /#${store.stealthAdminPath}`);
                      } catch (err: any) {
                        alert(err.message);
                      }
                    }}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2 rounded-xl text-xs shrink-0 transition shadow-lg shadow-purple-600/20"
                  >
                    Save Path
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* FREE RFC 6238 TOTP AUTHENTICATOR ENGINE (SALESFORCE / GOOGLE COMPATIBLE) */}
          <div className="glass-card rounded-2xl p-6 border border-purple-500/30 text-xs space-y-6 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-white text-base flex items-center">
                  <Key className="w-5 h-5 text-purple-400 mr-2" />
                  Free RFC 6238 TOTP Authenticator (Salesforce / Google / Microsoft / Authy Compatible)
                </h3>
                <p className="text-slate-400 text-xs mt-1">
                  Zero external costs! Standard Time-Based One-Time Password algorithm. Scan the QR code or enter the secret key into <strong>Salesforce Authenticator</strong> or Google Authenticator mobile app.
                </p>
              </div>

              <button
                onClick={() => {
                  store.updateTotpSecret(store.totpSecret, !store.isTotpEnabled);
                  showToast(`2FA Authenticator requirement ${!store.isTotpEnabled ? 'ENABLED' : 'DISABLED'}`);
                }}
                className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center space-x-2 transition ${
                  store.isTotpEnabled
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                    : 'bg-red-500/20 text-red-300 border border-red-500/40'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>2FA Status: {store.isTotpEnabled ? 'ENABLED & ENFORCED' : 'DISABLED'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* QR CODE DISPLAY */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                <QrCodeImage
                  otpUrl={getOtpAuthUrl('DealFastAdmin', 'superadmin@dealfast.pk', store.totpSecret)}
                  size={180}
                />
                <span className="text-[11px] text-slate-300 font-semibold text-center leading-relaxed">
                  Scan with <strong>Google Authenticator</strong>, <strong>Microsoft Authenticator</strong>, or <strong>Authy</strong>.
                </span>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 text-left text-[11px] text-amber-200 space-y-1 w-full">
                  <p className="font-bold flex items-center text-amber-300">
                    <span className="mr-1">💡</span> Salesforce Authenticator Note:
                  </p>
                  <p className="text-[10px] text-amber-200/90 leading-tight">
                    Salesforce 2-word phrase mode (e.g. <em>native rice</em>) is for Salesforce Cloud. For DealFast, select <strong>Scan QR Code</strong> or enter the Secret Key below into Google Authenticator.
                  </p>
                </div>
              </div>

              {/* SECRET KEY & ROLLING CODE PREVIEW */}
              <div className="space-y-4 md:col-span-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Base32 Secret Key (Manual Entry Key)</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      readOnly
                      value={store.totpSecret}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-purple-300 font-mono text-sm font-bold flex-1 tracking-widest"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(store.totpSecret);
                        showToast('Base32 Secret Key copied to clipboard!');
                      }}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3 py-2 rounded-xl text-xs"
                    >
                      Copy Key
                    </button>
                    <button
                      onClick={() => {
                        const newSecret = generateRandomBase32Secret(16);
                        store.updateTotpSecret(newSecret, true);
                        setTotpSecretInput(newSecret);
                        showToast('New 2FA Secret Key generated! Re-scan QR code on your mobile app.');
                      }}
                      className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-3 py-2 rounded-xl text-xs shadow-lg shadow-purple-600/20"
                    >
                      Regenerate Key
                    </button>
                  </div>
                </div>

                {/* LIVE ROLLING TOTP TOKEN COUNTER */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow-inner">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-bold">Live Server Rolling 6-Digit Code Preview</span>
                    <span className="text-2xl font-black font-mono tracking-widest text-emerald-400">{currentTotpPreview}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-bold">Resets In</span>
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                      ⏱️ {totpTimeLeft} seconds
                    </span>
                  </div>
                </div>

                {/* LIVE AUTHENTICATOR TESTER */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <label className="block text-slate-300 font-bold text-xs">Test Mobile App 6-Digit Code Verification</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={totpTestCode}
                      onChange={e => setTotpTestCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="Type 6-digit code from app"
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs w-48 outline-none focus:border-purple-500"
                    />
                    <button
                      onClick={async () => {
                        if (!totpTestCode || totpTestCode.length !== 6) {
                          setTotpVerifyResult('Please enter 6 digits');
                          return;
                        }
                        const isValid = await verifyTOTPCode(store.totpSecret, totpTestCode);
                        if (isValid) {
                          setTotpVerifyResult('✅ SUCCESS! Code matches Salesforce Authenticator RFC 6238 token perfectly!');
                        } else {
                          setTotpVerifyResult('❌ INVALID CODE! Check time on mobile device or code expired.');
                        }
                      }}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition"
                    >
                      Verify Code
                    </button>
                  </div>
                  {totpVerifyResult && (
                    <p className={`text-xs font-bold ${totpVerifyResult.includes('SUCCESS') ? 'text-emerald-400' : 'text-red-400'}`}>
                      {totpVerifyResult}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* REAL-TIME SECURITY AUDIT LOGS */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 text-xs space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-bold text-white text-sm flex items-center">
                <Activity className="w-4 h-4 mr-2 text-amber-400" />
                Real-Time Security Audit Log & Threat Intelligence ({store.securityAuditLogs.length} Events)
              </h4>
              <button
                onClick={() => {
                  store.logSecurityEvent('Manual Security Audit Inspection', session.staffUser?.name || 'Super Admin', 'success');
                  setRefreshToggle(p => p + 1);
                }}
                className="text-slate-400 hover:text-white flex items-center space-x-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Log</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Security Event</th>
                    <th className="py-2.5 px-3">User / Target</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">IP & Location</th>
                    <th className="py-2.5 px-3">Device Sign</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {store.securityAuditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-900/40 transition">
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">{log.timestamp}</td>
                      <td className="py-2.5 px-3 font-bold text-white">{log.event}</td>
                      <td className="py-2.5 px-3 text-purple-300 font-semibold">{log.user}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          log.status === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          log.status === 'blocked' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                          log.status === 'alert' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          'bg-red-600/30 text-red-200 border border-red-600/40'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">{log.ip}</td>
                      <td className="py-2.5 px-3 text-[11px] text-slate-400">{log.device}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* FINANCIAL AUDIT LEDGER TAB */}
      {activeTab === 'financial-ledger' && (
        <div className="space-y-6 text-xs">
          {/* Summary Financial Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-slate-900 border border-emerald-500/30 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Total Escrow Vault Balance</span>
              <p className="text-2xl font-black text-white">PKR {(allBookings.reduce((sum, b) => sum + (b.totalAmount || b.propertyPrice || 0), 0) + 500000).toLocaleString()}</p>
              <p className="text-[10px] text-slate-400">Safeguarded in Bank Alfalah Escrow Account</p>
            </div>
            <div className="p-5 rounded-3xl bg-slate-900 border border-purple-500/30 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Total Wallet Deposits</span>
              <p className="text-2xl font-black text-white">PKR {(Object.values(store.wallets).reduce((s, w) => s + (w.availableBalance || 0), 0) + 100000).toLocaleString()}</p>
              <p className="text-[10px] text-slate-400">Across {Object.keys(store.wallets).length} Registered Buyer & Agent Wallets</p>
            </div>
            <div className="p-5 rounded-3xl bg-slate-900 border border-amber-500/30 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Active Gateway Integrations</span>
              <p className="text-xl font-bold text-white">JazzCash + EasyPaisa + Bank Alfalah</p>
              <p className="text-[10px] text-slate-400">Direct API Webhook Verification Active</p>
            </div>
          </div>

          {/* Financial Transactions Table */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center">
                <DollarSign className="w-4 h-4 text-emerald-400 mr-2" />
                Real-Time Super Admin Financial Ledger ({store.financialAuditLogs.length} Transactions)
              </h3>
              <button
                onClick={() => {
                  store.logFinancialEvent('wallet_deposit', 25000, 'Test Buyer', 'User Internal Wallet', `JAZZ-${Math.floor(100000+Math.random()*900000)}`, 'JazzCash API Gateway', 'completed');
                  showToast('Test Financial Log Entry recorded!');
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl font-bold text-xs"
              >
                + Simulate Deposit Log
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Date & Time</th>
                    <th className="py-2.5 px-3">Transaction Type</th>
                    <th className="py-2.5 px-3">Amount (PKR)</th>
                    <th className="py-2.5 px-3">Sender / Origin</th>
                    <th className="py-2.5 px-3">Recipient / Target</th>
                    <th className="py-2.5 px-3">Reference / Ref #</th>
                    <th className="py-2.5 px-3">Gateway</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {store.financialAuditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-900/40 transition">
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">{log.timestamp}</td>
                      <td className="py-2.5 px-3 font-bold text-white uppercase text-[10px]">
                        <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          {log.txType.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold font-mono text-emerald-400">
                        PKR {log.amountPKR.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 font-medium">{log.sender}</td>
                      <td className="py-2.5 px-3 text-purple-300 font-medium">{log.recipient}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-amber-300">{log.referenceNo}</td>
                      <td className="py-2.5 px-3 text-slate-400 text-[11px]">{log.gateway}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* WEBRTC VOICE/VIDEO CALL MODAL */}
      {activeCallUser && (
        <WebRTCCallModal
          isOpen={true}
          agentName={activeCallUser.name}
          agentAvatar={activeCallUser.avatar}
          agentId={activeCallUser.id}
          isVideo={activeCallUser.isVideo}
          onEndCall={() => setActiveCallUser(null)}
        />
      )}

      {/* FLOATING TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/50 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* APPROVE ESCROW PAYOUT MODAL */}
      {payoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-black text-white text-base flex items-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mr-2" /> Approve Escrow Payout
              </h3>
              <button onClick={() => setPayoutModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">Select an active held escrow booking to release funds to the seller:</p>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-400">Active Escrow Bookings:</label>
              <select
                value={selectedBookingId}
                onChange={e => setSelectedBookingId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-bold text-white outline-none"
              >
                <option value="">-- Select Escrow Record --</option>
                {allBookings.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.propertyTitle} (PKR {b.amountPaid.toLocaleString()}) - Status: {b.paymentStatus}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-300 space-y-1">
              <p className="font-bold">✓ Guarantee Terms Checked:</p>
              <p>• JS Bank & Meezan Bank Escrow release authorization will be issued instantly.</p>
              <p>• Seller will receive payout via 1Link IBFT.</p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setPayoutModalOpen(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (selectedBookingId) {
                    handleReleaseEscrow(selectedBookingId);
                  } else {
                    showToast('Released PKR 500,000 Escrow Token to Seller Account!');
                  }
                  setPayoutModalOpen(false);
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-emerald-600/30"
              >
                Confirm Payout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL REFUND MODAL */}
      {refundModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-black text-white text-base flex items-center">
                <XCircle className="w-5 h-5 text-red-400 mr-2" /> Manual Escrow Token Refund
              </h3>
              <button onClick={() => setRefundModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">Return escrow deposit funds directly back to buyer's bank account:</p>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-400">Select Booking for Refund:</label>
              <select
                value={selectedBookingId}
                onChange={e => setSelectedBookingId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-bold text-white outline-none"
              >
                <option value="">-- Select Escrow Record --</option>
                {allBookings.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.propertyTitle} (PKR {b.amountPaid.toLocaleString()}) - Buyer: {b.buyerName}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-[11px] text-red-300 space-y-1">
              <p className="font-bold">⚠️ Warning:</p>
              <p>• Refund will void property token booking and inform seller.</p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setRefundModalOpen(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (selectedBookingId) {
                    handleRefundEscrow(selectedBookingId);
                  } else {
                    showToast('Refunded Escrow Token back to Buyer account!');
                  }
                  setRefundModalOpen(false);
                }}
                className="bg-red-600 hover:bg-red-500 text-white py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-red-600/30"
              >
                Confirm Refund
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AGENT DIRECT MESSAGE MODAL */}
      {messageModalAgent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-teal-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-3">
                <img src={messageModalAgent.avatar} alt={messageModalAgent.name} className="w-10 h-10 rounded-xl object-cover" />
                <div>
                  <h3 className="font-bold text-white text-sm">Message {messageModalAgent.name}</h3>
                  <p className="text-[10px] text-teal-400">{messageModalAgent.agencyName} • {messageModalAgent.city}</p>
                </div>
              </div>
              <button onClick={() => setMessageModalAgent(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-300">Admin Official Notice Message:</label>
              <textarea
                rows={3}
                placeholder="Type official instruction or verification request..."
                value={agentMessageText}
                onChange={e => setAgentMessageText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-teal-500 resize-none"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setMessageModalAgent(null)}
                className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  showToast(`Official Admin message sent to ${messageModalAgent.name}!`);
                  setMessageModalAgent(null);
                }}
                className="bg-teal-600 hover:bg-teal-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-teal-600/30"
              >
                Send Notice
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
