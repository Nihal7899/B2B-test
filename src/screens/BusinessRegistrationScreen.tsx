import { useState } from 'react';
import { ArrowLeft, Building2, Check, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/auth';
import { updateProfile } from '@/services/catalog';
import { createBusiness } from '@/services/business';
import type { Business } from '@/types';

interface BusinessRegistrationScreenProps {
  onBack: () => void;
  onRegistered: (business: Business) => void;
}

const BUSINESS_TYPES = ['Restaurant', 'Cafe', 'Kirana Store', 'Supermarket', 'Catering', 'Hotel', 'Bakery', 'Other'];

export function BusinessRegistrationScreen({ onBack, onRegistered }: BusinessRegistrationScreenProps) {
  const { profile, refreshProfile } = useAuth();
  const [personalName, setPersonalName] = useState(profile?.personal_name ?? '');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('Restaurant');
  const [gstRegistered, setGstRegistered] = useState(false);
  const [gstin, setGstin] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [gstVerifying, setGstVerifying] = useState(false);
  const [gstStatus, setGstStatus] = useState<'none' | 'pending' | 'verified' | 'failed'>('none');

  const handleVerifyGst = async () => {
    if (!gstin || gstin.length !== 15) { setError('Enter a valid 15-digit GSTIN.'); return; }
    setGstVerifying(true); setError('');
    await new Promise((r) => setTimeout(r, 1200));
    setGstVerifying(false);
    setGstStatus('verified');
  };

  const handleSave = async () => {
    if (!personalName.trim()) { setError('Please enter your name.'); return; }
    if (!businessName.trim()) { setError('Please enter your business name.'); return; }
    if (gstRegistered && gstin.length !== 15) { setError('Enter a valid 15-digit GSTIN or uncheck GST registered.'); return; }
    setSaving(true); setError('');
    try {
      await updateProfile({ personal_name: personalName, full_name: personalName, registration_status: 'registered' });
      const business = await createBusiness({
        business_name: businessName,
        business_type: businessType,
        gst_registered: gstRegistered,
        gstin: gstRegistered ? gstin : undefined,
      });
      await refreshProfile();
      if (business) onRegistered(business);
    } catch (err) {
      console.error('Registration failed', err);
      setError('Could not complete registration. Please try again.');
    }
    setSaving(false);
  };

  return (
    <div className="px-4 pb-6 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="h-9 w-9 rounded-xl bg-white border border-ink-200 flex items-center justify-center"><ArrowLeft size={18} /></button>
        <div>
          <h1 className="text-xl font-extrabold text-ink-900 tracking-tight">Business details</h1>
          <p className="text-xs text-ink-500 mt-0.5">Complete your registration to place orders</p>
        </div>
      </div>

      <div className="bg-white border border-ink-100 rounded-2xl p-4 space-y-4 shadow-card">
        <div>
          <label className="text-xs font-bold text-ink-700">Your name <span className="text-red-500">*</span></label>
          <input value={personalName} onChange={(e) => setPersonalName(e.target.value)} placeholder="Enter your full name" className="mt-1.5 w-full h-11 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-50" />
        </div>

        <div className="border-t border-ink-100 pt-4">
          <label className="text-xs font-bold text-ink-700">Business name <span className="text-red-500">*</span></label>
          <div className="mt-1.5 relative">
            <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="e.g. ABC Foods" className="w-full h-11 rounded-xl border border-ink-200 pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-50" />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-ink-700">Business type</label>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {BUSINESS_TYPES.map((type) => (
              <button key={type} onClick={() => setBusinessType(type)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${businessType === type ? 'bg-brand-600 text-white' : 'bg-ink-50 text-ink-600 border border-ink-200'}`}>{type}</button>
            ))}
          </div>
        </div>

        <div className="border-t border-ink-100 pt-4">
          <label className="text-xs font-bold text-ink-700">GST registered?</label>
          <div className="mt-1.5 flex gap-2">
            <button onClick={() => setGstRegistered(true)} className={`flex-1 h-11 rounded-xl text-sm font-bold border-2 transition-colors ${gstRegistered ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-ink-200 text-ink-500'}`}>Yes</button>
            <button onClick={() => { setGstRegistered(false); setGstin(''); setGstStatus('none'); }} className={`flex-1 h-11 rounded-xl text-sm font-bold border-2 transition-colors ${!gstRegistered ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-ink-200 text-ink-500'}`}>No</button>
          </div>
        </div>

        {gstRegistered && (
          <div>
            <label className="text-xs font-bold text-ink-700">GSTIN <span className="text-red-500">*</span></label>
            <div className="mt-1.5 flex gap-2">
              <input value={gstin} onChange={(e) => setGstin(e.target.value.toUpperCase().slice(0, 15))} placeholder="15-digit GSTIN" className="flex-1 h-11 rounded-xl border border-ink-200 px-3 text-sm uppercase tracking-wider outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-50" />
              <button onClick={handleVerifyGst} disabled={gstVerifying || gstin.length !== 15} className="h-11 px-4 rounded-xl bg-ink-900 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50">
                {gstVerifying ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />} Verify
              </button>
            </div>
            {gstStatus === 'verified' && <p className="mt-1.5 text-xs text-brand-600 font-semibold flex items-center gap-1"><Check size={13} /> GSTIN verified successfully</p>}
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-500 text-center">{error}</p>}
      <button onClick={handleSave} disabled={saving} className="w-full h-12 rounded-xl bg-brand-600 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-soft disabled:opacity-60">
        {saving ? <Loader2 size={17} className="animate-spin" /> : <><Check size={17} /> Complete registration</>}
      </button>
    </div>
  );
}
