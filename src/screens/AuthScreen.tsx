import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, LockKeyhole, Phone, RefreshCw, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/auth';

const groceryImage = 'https://images.pexels.com/photos/7363163/pexels-photo-7363163.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

function normalizeIndianPhone(value: string): string {
  return value.replace(/\D/g, '').replace(/^91/, '').slice(0, 10);
}

export function AuthScreen() {
  const { sendOtp, verifyOtp, resendOtp } = useAuth();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (seconds <= 0) return undefined;
    const timer = window.setInterval(() => setSeconds((c) => Math.max(c - 1, 0)), 1000);
    return () => window.clearInterval(timer);
  }, [seconds]);

  const isPhoneValid = phone.length === 10;
  const canVerify = otp.length === 6;
  const formattedPhone = useMemo(() => `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`.trim(), [phone]);

  const handleSendOtp = async () => {
    if (!isPhoneValid) { setError('Enter a valid 10-digit mobile number.'); return; }
    setBusy(true); setError('');
    const result = await sendOtp(`+91${phone}`);
    setBusy(false);
    if (result.error) { setError(result.error); return; }
    setSent(true); setStep('otp'); setSeconds(30);
  };

  const handleVerify = async () => {
    if (!canVerify) { setError('Enter the 6-digit code sent to your phone.'); return; }
    setBusy(true); setError('');
    const result = await verifyOtp(`+91${phone}`, otp);
    setBusy(false);
    if (result.error) setError(result.error);
  };

  const handleResend = async () => {
    if (seconds > 0) return;
    setBusy(true); setError('');
    const result = await resendOtp(`+91${phone}`);
    setBusy(false);
    if (result.error) { setError(result.error); return; }
    setSeconds(30); setOtp('');
  };

  return (
    <div className="min-h-screen bg-ink-100 flex items-center justify-center p-0 sm:p-5">
      <div className="relative min-h-screen sm:min-h-[720px] w-full max-w-[430px] overflow-hidden bg-white sm:rounded-[2rem] sm:shadow-2xl">
        <div className="relative h-[250px] overflow-hidden">
          <img src={groceryImage} alt="Fresh grocery supplies" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-900/35 to-brand-900/10" />
          <div className="absolute top-6 left-6 flex items-center gap-2 text-white">
            <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center">
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#0f7760" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7l9-4 9 4-9 4-9-4z" /><path d="M3 12l9 4 9-4" /><path d="M3 17l9 4 9-4" />
              </svg>
            </div>
            <span className="text-lg font-extrabold tracking-tight">Stackknit</span>
          </div>
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-200">Business essentials, simplified</p>
            <h1 className="mt-2 text-[27px] font-extrabold leading-tight tracking-tight">
              All your restaurant needs,<br /><span className="text-brand-300">delivered next day.</span>
            </h1>
          </div>
        </div>

        <div className="px-6 pt-6 pb-8">
          {step === 'phone' ? (
            <>
              <div className="mb-5">
                <h2 className="text-xl font-extrabold text-ink-900">Welcome to Stackknit</h2>
                <p className="mt-1 text-sm text-ink-500">Sign in with your mobile number to continue.</p>
              </div>
              <label className="block text-xs font-bold text-ink-700">Mobile number</label>
              <div className="mt-2 flex h-12 overflow-hidden rounded-xl border border-ink-200 bg-ink-50 focus-within:border-brand-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-50">
                <div className="flex items-center gap-1.5 border-r border-ink-200 px-3 text-sm font-bold text-ink-700">
                  <span className="text-base">🇮🇳</span><span>+91</span>
                </div>
                <div className="relative flex-1">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                  <input inputMode="numeric" value={phone} onChange={(e) => setPhone(normalizeIndianPhone(e.target.value))} placeholder="10-digit mobile number" className="h-full w-full bg-transparent pl-9 pr-3 text-sm outline-none" />
                </div>
              </div>
              <button disabled={busy} onClick={handleSendOtp} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 text-sm font-bold text-white shadow-soft transition hover:bg-brand-700 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-60">
                {busy ? 'Sending code...' : 'Continue'} {!busy && <ArrowRight size={17} />}
              </button>
              <p className="mt-3 text-center text-[10px] text-ink-400">By continuing, you agree to Stackknit&apos;s terms and privacy policy.</p>
            </>
          ) : (
            <>
              <button onClick={() => { setStep('phone'); setError(''); }} className="flex items-center gap-1 text-xs font-bold text-brand-700">
                <ArrowLeft size={14} /> Change number
              </button>
              <div className="mt-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><LockKeyhole size={21} /></div>
                <h2 className="mt-4 text-xl font-extrabold text-ink-900">Verify your number</h2>
                <p className="mt-1 text-sm leading-relaxed text-ink-500">We sent a 6-digit code to <span className="font-bold text-ink-700">{formattedPhone}</span></p>
              </div>
              <label className="mt-5 block text-xs font-bold text-ink-700">One-time password</label>
              <input autoFocus inputMode="numeric" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Enter 6-digit OTP" className="mt-2 h-12 w-full rounded-xl border border-ink-200 bg-ink-50 px-4 text-center text-lg font-extrabold tracking-[0.5em] text-ink-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-50" />
              <button disabled={busy} onClick={handleVerify} className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 text-sm font-bold text-white shadow-soft transition hover:bg-brand-700 active:scale-[.98] disabled:opacity-60">
                {busy ? 'Verifying...' : 'Verify & continue'} {!busy && <Check size={17} />}
              </button>
              <button disabled={seconds > 0 || busy} onClick={handleResend} className="mx-auto mt-4 flex items-center gap-1.5 text-xs font-bold text-brand-700 disabled:text-ink-400">
                {seconds > 0 ? `Resend code in ${seconds}s` : 'Resend OTP'} <RefreshCw size={13} />
              </button>
              {sent && (
                <div className="mt-4 flex items-start gap-2 rounded-xl bg-brand-50 p-3 text-xs text-brand-800">
                  <ShieldCheck size={16} className="mt-0.5 shrink-0 text-brand-600" />Check your SMS inbox for the verification code.
                </div>
              )}
            </>
          )}
        </div>

        {error && (
          <div className="absolute bottom-3 left-6 right-6 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-center text-xs font-semibold text-red-600">{error}</div>
        )}
      </div>
    </div>
  );
}
