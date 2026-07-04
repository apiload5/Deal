'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Phone, CheckCircle, AlertCircle } from 'lucide-react';
import { validatePhone } from '@/lib/utils/validators';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, verifyOTP } = useAuth();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!validatePhone(phone)) {
      setError('Please enter a valid phone number');
      setLoading(false);
      return;
    }

    const { error: signInError } = await signIn(phone);
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      setStep('otp');
      setLoading(false);
    }, 2000);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      setLoading(false);
      return;
    }

    const { error: verifyError } = await verifyOTP(phone, otp);
    if (verifyError) {
      setError(verifyError.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
  };

  return (
    <div className="container mx-auto flex min-h-[80vh] max-w-md items-center justify-center px-4 py-12">
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
            <Phone className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            {step === 'phone' ? 'Login with Phone' : 'Verify OTP'}
          </CardTitle>
          <CardDescription>
            {step === 'phone'
              ? 'Enter your phone number to receive a verification code'
              : `Enter the 6-digit code sent to ${phone}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              OTP sent successfully!
            </div>
          )}

          {step === 'phone' ? (
            <form onSubmit={handleSendOTP}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="03XX-XXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={loading}
                    className="text-lg"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter your phone number in Pakistani format
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Sending...' : 'Send OTP'}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    disabled={loading}
                    className="text-center text-2xl tracking-widest"
                    maxLength={6}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify & Login'}
                </Button>
                <Button
                  type="button"
                  variant="link"
                  className="w-full"
                  onClick={() => {
                    setStep('phone');
                    setSuccess(false);
                    setError(null);
                  }}
                >
                  Change phone number
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
