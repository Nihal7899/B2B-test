import { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, MapPin, Navigation, Check, Trash2, Plus, Loader2, Pencil } from 'lucide-react';
import type { DbAddress } from '@/services/catalog';
import { fetchAddresses, deleteAddress } from '@/services/catalog';
import { saveDeliveryAddress as saveAddress } from '@/services/business';
import { LocationPicker } from '@/components/LocationPicker';

interface AddressesScreenProps { onBack: () => void; onSaved?: () => void; }

const EMPTY_FORM = {
  label: 'Business',
  recipient_name: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postal_code: '',
  latitude: null as number | null,
  longitude: null as number | null,
  place_id: null as string | null,
  is_default: false,
};

export function AddressesScreen({ onBack, onSaved }: AddressesScreenProps) {
  const [addresses, setAddresses] = useState<DbAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const data = await fetchAddresses();
    setAddresses(data);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const handleLocationConfirmed = (loc: {
    latitude: number; longitude: number;
    line1: string; city: string; state: string; postal_code: string; place_id: string | null;
  }) => {
    setForm((f) => ({
      ...f,
      latitude: loc.latitude,
      longitude: loc.longitude,
      line1: loc.line1 || f.line1,
      city: loc.city || f.city,
      state: loc.state || f.state,
      postal_code: loc.postal_code || f.postal_code,
      place_id: loc.place_id,
    }));
    setShowPicker(false);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.recipient_name || !form.phone || !form.line1 || !form.city || !form.state || !form.postal_code) {
      setError('Please fill all required fields.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await saveAddress(form);
      setShowForm(false);
      setForm({ ...EMPTY_FORM });
      await load();
      onSaved?.();
    } catch {
      setError('Could not save address. Please try again.');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await deleteAddress(id);
    await load();
  };

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><div className="h-8 w-8 rounded-full border-2 border-brand-200 border-t-brand-600 animate-spin" /></div>;

  if (showPicker) {
    return (
      <LocationPicker
        onConfirm={handleLocationConfirmed}
        onCancel={() => setShowPicker(false)}
      />
    );
  }

  return (
    <div className="px-4 pb-6 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="h-9 w-9 rounded-xl bg-white border border-ink-200 flex items-center justify-center"><ArrowLeft size={18} /></button>
        <div>
          <h1 className="text-xl font-extrabold text-ink-900 tracking-tight">Delivery addresses</h1>
          <p className="text-xs text-ink-500 mt-0.5">Manage your delivery locations</p>
        </div>
      </div>

      {addresses.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <div className="h-20 w-20 rounded-3xl bg-brand-50 flex items-center justify-center text-brand-600"><MapPin size={36} strokeWidth={1.5} /></div>
          <h2 className="text-lg font-extrabold text-ink-900 mt-5">No addresses saved</h2>
          <p className="text-sm text-ink-500 mt-1 max-w-[250px]">Add a delivery address to start placing orders.</p>
          <div className="mt-5 flex flex-col gap-2 w-full max-w-[280px]">
            <button onClick={() => setShowPicker(true)} className="h-11 px-5 rounded-xl bg-brand-600 text-white text-sm font-bold flex items-center justify-center gap-2"><Navigation size={17} /> Pick on map</button>
            <button onClick={() => setShowForm(true)} className="h-11 px-5 rounded-xl border-2 border-ink-200 text-ink-700 text-sm font-bold flex items-center justify-center gap-2"><Plus size={17} /> Enter manually</button>
          </div>
        </div>
      ) : showForm ? (
        <div className="space-y-3">
          <div className="bg-white border border-ink-100 rounded-2xl p-4 space-y-3 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-ink-900">New address</h2>
              <button onClick={() => setShowForm(false)} className="text-xs font-bold text-ink-400">Cancel</button>
            </div>

            <button onClick={() => setShowPicker(true)} className="w-full h-11 rounded-xl border-2 border-dashed border-brand-300 bg-brand-50 text-brand-700 text-sm font-bold flex items-center justify-center gap-2">
              <MapPin size={16} /> {form.latitude ? 'Change location on map' : 'Pick location on map'}
            </button>

            {form.latitude && form.longitude && (
              <div className="rounded-xl bg-brand-50 border border-brand-100 p-2.5 flex items-center gap-2">
                <MapPin size={15} className="text-brand-600" />
                <p className="text-xs text-brand-800">Location set: {form.latitude.toFixed(4)}, {form.longitude.toFixed(4)}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Label (Home, Shop)" className="h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-brand-500" />
              <input value={form.recipient_name} onChange={(e) => setForm({ ...form, recipient_name: e.target.value })} placeholder="Recipient name *" className="h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-brand-500" />
            </div>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone number *" className="w-full h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-brand-500" />
            <input value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} placeholder="Address line 1 *" className="w-full h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-brand-500" />
            <input value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} placeholder="Address line 2 (optional)" className="w-full h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-brand-500" />
            <div className="grid grid-cols-3 gap-2">
              <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City *" className="h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-brand-500" />
              <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="State *" className="h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-brand-500" />
              <input value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} placeholder="PIN *" className="h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-brand-500" />
            </div>
            <label className="flex items-center gap-2 text-sm text-ink-700"><input type="checkbox" checked={form.is_default} onChange={(e) => setForm({ ...form, is_default: e.target.checked })} className="accent-brand-600" /> Set as default address</label>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button onClick={handleSave} disabled={saving} className="w-full h-12 rounded-xl bg-brand-600 text-white text-sm font-bold flex items-center justify-center gap-2">{saving ? <Loader2 size={17} className="animate-spin" /> : <><Check size={17} /> Save address</>}</button>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-2.5">
            {addresses.map((addr) => (
              <div key={addr.id} className="bg-white border border-ink-100 rounded-2xl p-3.5 shadow-card">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <div className="h-9 w-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0"><MapPin size={17} /></div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-ink-800">{addr.label}</p>
                        {addr.is_default && <span className="text-[9px] font-bold bg-brand-100 text-brand-700 rounded-full px-2 py-0.5">DEFAULT</span>}
                      </div>
                      <p className="text-xs text-ink-600 mt-1 leading-relaxed">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}, {addr.state} - {addr.postal_code}</p>
                      <p className="text-[11px] text-ink-400 mt-1">{addr.recipient_name} · {addr.phone}</p>
                      {addr.latitude && addr.longitude && <p className="text-[10px] text-brand-600 mt-1 flex items-center gap-1"><Navigation size={11} /> GPS location set</p>}
                    </div>
                  </div>
                  <button onClick={() => void handleDelete(addr.id)} className="p-1.5 text-ink-300 hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowPicker(true)} className="flex-1 h-12 rounded-xl bg-brand-600 text-white text-sm font-bold flex items-center justify-center gap-2"><MapPin size={17} /> Pick on map</button>
            <button onClick={() => setShowForm(true)} className="flex-1 h-12 rounded-xl border-2 border-dashed border-brand-300 bg-brand-50 text-brand-700 text-sm font-bold flex items-center justify-center gap-2"><Plus size={17} /> Enter manually</button>
          </div>
        </>
      )}
    </div>
  );
}
