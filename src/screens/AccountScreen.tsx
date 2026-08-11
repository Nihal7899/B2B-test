import { useEffect, useState } from 'react';
import { ChevronRight, MapPin, Heart, WalletCards, HelpCircle, Settings, LogOut, Building2, Star, ShieldCheck, Package } from 'lucide-react';
import type { ScreenName } from '@/types';
import { useAuth } from '@/auth';
import { fetchProfile, updateProfile, fetchOrders } from '@/services/catalog';

interface AccountScreenProps { onNavigate: (screen: ScreenName) => void; }

export function AccountScreen({ onNavigate }: AccountScreenProps) {
  const { user, role, signOut } = useAuth();
  const [profile, setProfile] = useState<{ full_name: string; business_name: string; phone: string } | null>(null);
  const [orderCount, setOrderCount] = useState(0);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBusiness, setEditBusiness] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      const p = await fetchProfile();
      if (p) setProfile(p as typeof profile);
      const orders = await fetchOrders();
      setOrderCount(orders.length);
    })();
  }, []);

  const initials = (profile?.full_name || user?.phone || 'U').slice(0, 2).toUpperCase();

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ full_name: editName, business_name: editBusiness });
      setProfile({ full_name: editName, business_name: editBusiness, phone: profile?.phone ?? '' });
      setEditing(false);
    } catch (err) { console.error('Failed to update profile', err); }
    setSaving(false);
  };

  const roleLabel: Record<string, string> = { admin: 'Administrator', warehouse_manager: 'Warehouse Manager', delivery_partner: 'Delivery Partner', customer: 'Business Customer' };

  const items: { icon: typeof MapPin; label: string; detail: string; screen: ScreenName }[] = [
    { icon: MapPin, label: 'Saved addresses', detail: 'Manage delivery locations', screen: 'addresses' },
    { icon: Heart, label: 'Wishlist', detail: 'Your saved products', screen: 'wishlist' },
    { icon: WalletCards, label: 'Payment methods', detail: 'Manage payments', screen: 'account' },
    { icon: HelpCircle, label: 'Help & support', detail: 'We are here to help', screen: 'account' },
    { icon: Settings, label: 'Settings', detail: 'Notifications & preferences', screen: 'account' },
  ];

  const staffItems: { icon: typeof ShieldCheck; label: string; screen: ScreenName }[] = [];
  if (role === 'admin') staffItems.push({ icon: ShieldCheck, label: 'Admin Panel', screen: 'admin' });
  if (role === 'warehouse_manager') staffItems.push({ icon: Package, label: 'Warehouse Panel', screen: 'warehouse' });
  if (role === 'delivery_partner') staffItems.push({ icon: Package, label: 'Delivery Panel', screen: 'delivery' });

  return (
    <div className="px-4 pb-6 space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-ink-900 tracking-tight">Account</h1>
        <p className="text-xs text-ink-500 mt-1">Manage your Stackknit profile</p>
      </div>
      <section className="rounded-2xl bg-brand-950 p-4 text-white relative overflow-hidden">
        <div className="flex items-center gap-3 relative z-10">
          <div className="h-14 w-14 rounded-2xl bg-brand-500 flex items-center justify-center text-xl font-extrabold">{initials}</div>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-extrabold truncate">{profile?.full_name || 'New User'}</p>
            <p className="text-xs text-brand-200 mt-0.5 truncate">{profile?.business_name || roleLabel[role ?? 'customer']}</p>
            <div className="flex items-center gap-1 mt-1">
              <Star size={11} className="fill-amber-300 text-amber-300" />
              <span className="text-[10px] text-brand-200">{roleLabel[role ?? 'customer']}</span>
            </div>
          </div>
        </div>
        <div className="absolute -right-8 -bottom-12 h-40 w-40 rounded-full bg-brand-800" />
      </section>
      <section className="bg-white border border-ink-100 rounded-2xl shadow-card overflow-hidden">
        <div className="p-3.5 border-b border-ink-100 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center"><Building2 size={18} /></div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-ink-400 uppercase tracking-wide font-semibold">Business profile</p>
            {editing ? (
              <div className="mt-1 space-y-2">
                <input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Full name" className="w-full h-9 rounded-lg border border-ink-200 px-3 text-sm outline-none focus:border-brand-500" />
                <input value={editBusiness} onChange={(e) => setEditBusiness(e.target.value)} placeholder="Business name" className="w-full h-9 rounded-lg border border-ink-200 px-3 text-sm outline-none focus:border-brand-500" />
              </div>
            ) : (
              <p className="text-sm font-bold text-ink-800 mt-0.5 truncate">{profile?.business_name || 'Not set'}</p>
            )}
          </div>
          {editing ? (
            <button onClick={handleSave} disabled={saving} className="text-xs font-bold text-brand-600">{saving ? 'Saving...' : 'Save'}</button>
          ) : (
            <button onClick={() => { setEditName(profile?.full_name ?? ''); setEditBusiness(profile?.business_name ?? ''); setEditing(true); }} className="text-xs font-bold text-brand-600">Edit</button>
          )}
        </div>
        <div className="grid grid-cols-3 divide-x divide-ink-100 py-3">
          <div className="text-center"><p className="text-base font-extrabold text-ink-900">{orderCount}</p><p className="text-[10px] text-ink-400 mt-0.5">Orders placed</p></div>
          <div className="text-center"><p className="text-base font-extrabold text-brand-700">₹0</p><p className="text-[10px] text-ink-400 mt-0.5">Saved so far</p></div>
          <div className="text-center"><p className="text-base font-extrabold text-ink-900">{role === 'admin' ? 'Admin' : 'B2B'}</p><p className="text-[10px] text-ink-400 mt-0.5">Member tier</p></div>
        </div>
      </section>
      {staffItems.length > 0 && (
        <section className="bg-white border border-ink-100 rounded-2xl shadow-card overflow-hidden">
          {staffItems.map(({ icon: Icon, label, screen }, index) => (
            <button key={label} onClick={() => onNavigate(screen)} className={`w-full flex items-center gap-3 p-3.5 text-left ${index < staffItems.length - 1 ? 'border-b border-ink-100' : ''}`}>
              <div className="h-9 w-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center"><Icon size={17} /></div>
              <div className="flex-1"><p className="text-sm font-bold text-ink-800">{label}</p><p className="text-[10px] text-ink-400 mt-0.5">Staff access</p></div>
              <ChevronRight size={16} className="text-ink-300" />
            </button>
          ))}
        </section>
      )}
      <section className="bg-white border border-ink-100 rounded-2xl shadow-card overflow-hidden">
        {items.map(({ icon: Icon, label, detail, screen }, index) => (
          <button key={label} onClick={() => onNavigate(screen)} className={`w-full flex items-center gap-3 p-3.5 text-left ${index < items.length - 1 ? 'border-b border-ink-100' : ''}`}>
            <div className="h-9 w-9 rounded-xl bg-ink-50 text-ink-600 flex items-center justify-center"><Icon size={17} /></div>
            <div className="flex-1"><p className="text-sm font-semibold text-ink-800">{label}</p><p className="text-[10px] text-ink-400 mt-0.5">{detail}</p></div>
            <ChevronRight size={16} className="text-ink-300" />
          </button>
        ))}
      </section>
      <button onClick={() => void signOut()} className="w-full flex items-center justify-center gap-2 h-11 rounded-xl border border-red-100 bg-red-50 text-red-600 text-sm font-bold"><LogOut size={16} /> Log out</button>
      <p className="text-center text-[10px] text-ink-400">Stackknit v1.0.0 · Made for growing businesses</p>
    </div>
  );
}
