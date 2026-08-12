import { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, Plus, Pencil, Trash2, X, Tag, LayoutGrid, Package, Users, Loader2, Save, Image as ImageIcon, Copy, ArrowUp, ArrowDown, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { DbCategory, DbProduct, DbPromotion } from '@/services/catalog';
import { fetchAllHomeBanners, createHomeBanner, updateHomeBanner, deleteHomeBanner, duplicateHomeBanner } from '@/services/catalog';
import type { HomeBanner, ActionType, FilterConfig } from '@/types';
import { PromoBannerCard } from '@/components/PromoBanner';
import type { PromoBanner } from '@/types';

interface AdminScreenProps { onBack: () => void; }

type Tab = 'banners' | 'promotions' | 'categories' | 'products' | 'roles';

export function AdminScreen({ onBack }: AdminScreenProps) {
  const [tab, setTab] = useState<Tab>('banners');
  const tabs: { id: Tab; label: string; icon: typeof Tag }[] = [
    { id: 'banners', label: 'Banners', icon: Tag },
    { id: 'promotions', label: 'Ads', icon: Tag },
    { id: 'categories', label: 'Categories', icon: LayoutGrid },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'roles', label: 'Roles', icon: Users },
  ];

  return (
    <div className="px-4 pb-6 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="h-9 w-9 rounded-xl bg-white border border-ink-200 flex items-center justify-center"><ArrowLeft size={18} /></button>
        <div>
          <h1 className="text-xl font-extrabold text-ink-900 tracking-tight">Admin Panel</h1>
          <p className="text-xs text-ink-500 mt-0.5">Manage your store catalog and users</p>
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)} className={`shrink-0 flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold ${tab === id ? 'bg-brand-600 text-white' : 'bg-white border border-ink-200 text-ink-600'}`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>
      {tab === 'banners' && <BannersManager />}
      {tab === 'promotions' && <PromotionsManager />}
      {tab === 'categories' && <CategoriesManager />}
      {tab === 'products' && <ProductsManager />}
      {tab === 'roles' && <RolesManager />}
    </div>
  );
}

function BannersManager() {
  const [banners, setBanners] = useState<HomeBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<HomeBanner | null>(null);
  const [previewBanner, setPreviewBanner] = useState<HomeBanner | null>(null);

  const load = useCallback(async () => {
    const data = await fetchAllHomeBanners();
    setBanners(data);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const handleDelete = async (id: string) => {
    await deleteHomeBanner(id);
    void load();
  };

  const handleToggle = async (banner: HomeBanner) => {
    await updateHomeBanner(banner.id, { is_active: !banner.is_active });
    void load();
  };

  const handleDuplicate = async (id: string) => {
    await duplicateHomeBanner(id);
    void load();
  };

  const handleReorder = async (banner: HomeBanner, direction: 'up' | 'down') => {
    const sorted = [...banners].sort((a, b) => a.display_order - b.display_order);
    const idx = sorted.findIndex((b) => b.id === banner.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const swapBanner = sorted[swapIdx];
    await Promise.all([
      updateHomeBanner(banner.id, { display_order: swapBanner.display_order }),
      updateHomeBanner(swapBanner.id, { display_order: banner.display_order }),
    ]);
    void load();
  };

  const toPromoBanner = (b: HomeBanner): PromoBanner => {
    const bgMap: Record<string, string> = {
      brand: 'bg-gradient-to-br from-brand-700 to-brand-900',
      accent: 'bg-gradient-to-br from-accent-500 to-accent-700',
      ink: 'bg-gradient-to-br from-ink-800 to-ink-900',
    };
    return {
      id: b.id,
      headline: b.title,
      subtext: b.description,
      cta: b.button_text,
      image: b.image_url,
      bgClass: bgMap[b.background_color] ?? bgMap.brand,
      textClass: 'text-white',
      badge: b.badge ?? undefined,
      actionType: b.action_type,
      actionConfig: b.action_config,
    };
  };

  if (loading) return <Loader2 className="animate-spin mx-auto text-brand-600" size={24} />;

  return (
    <div className="space-y-3">
      <button onClick={() => { setEditing(null); setShowForm(true); }} className="w-full h-10 rounded-xl bg-brand-600 text-white text-sm font-bold flex items-center justify-center gap-2"><Plus size={16} /> Add banner</button>
      {showForm && <BannerForm initial={editing} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); void load(); }} />}
      {banners.map((banner, i) => (
        <div key={banner.id} className="bg-white border border-ink-100 rounded-2xl p-3.5 shadow-card">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {banner.image_url && <img src={banner.image_url} alt="" className="h-10 w-10 rounded-lg object-cover" />}
                <div className="min-w-0"><p className="text-sm font-bold text-ink-800 truncate">{banner.title}</p><p className="text-[10px] text-ink-400 mt-0.5 truncate">{banner.description}</p></div>
              </div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={`text-[9px] font-bold rounded-full px-2 py-0.5 ${banner.is_active ? 'bg-brand-100 text-brand-700' : 'bg-ink-100 text-ink-500'}`}>{banner.is_active ? 'ACTIVE' : 'HIDDEN'}</span>
                <span className="text-[9px] text-ink-400">Order: {banner.display_order}</span>
                <span className="text-[9px] text-ink-400 bg-ink-50 rounded-full px-2 py-0.5">{banner.action_type}</span>
                {banner.start_at && <span className="text-[9px] text-amber-600">From: {new Date(banner.start_at).toLocaleDateString()}</span>}
                {banner.end_at && <span className="text-[9px] text-amber-600">To: {new Date(banner.end_at).toLocaleDateString()}</span>}
              </div>
            </div>
            <div className="flex gap-1 flex-wrap justify-end">
              <button onClick={() => setPreviewBanner(banner)} className="h-8 w-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center"><Eye size={14} /></button>
              <button onClick={() => void handleReorder(banner, 'up')} disabled={i === 0} className="h-8 w-8 rounded-lg bg-ink-50 text-ink-600 flex items-center justify-center disabled:opacity-40"><ArrowUp size={14} /></button>
              <button onClick={() => void handleReorder(banner, 'down')} disabled={i === banners.length - 1} className="h-8 w-8 rounded-lg bg-ink-50 text-ink-600 flex items-center justify-center disabled:opacity-40"><ArrowDown size={14} /></button>
              <button onClick={() => void handleToggle(banner)} className="h-8 w-8 rounded-lg bg-ink-50 text-ink-600 flex items-center justify-center text-xs font-bold">{banner.is_active ? 'ON' : 'OFF'}</button>
              <button onClick={() => void handleDuplicate(banner.id)} className="h-8 w-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center"><Copy size={14} /></button>
              <button onClick={() => { setEditing(banner); setShowForm(true); }} className="h-8 w-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center"><Pencil size={14} /></button>
              <button onClick={() => void handleDelete(banner.id)} className="h-8 w-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center"><Trash2 size={14} /></button>
            </div>
          </div>
        </div>
      ))}
      {previewBanner && (
        <div className="fixed inset-0 z-[300] bg-black/40 flex items-center justify-center p-4" onClick={() => setPreviewBanner(null)}>
          <div className="max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white rounded-2xl p-3 mb-2 flex items-center justify-between">
              <h3 className="text-sm font-bold text-ink-900">Banner preview</h3>
              <button onClick={() => setPreviewBanner(null)} className="text-ink-400"><X size={18} /></button>
            </div>
            <PromoBannerCard banner={toPromoBanner(previewBanner)} />
          </div>
        </div>
      )}
    </div>
  );
}

const ACTION_TYPES: ActionType[] = ['VIEW_CATEGORY', 'VIEW_PRODUCT', 'VIEW_BRAND', 'VIEW_OFFER', 'SEARCH', 'FILTER_PRODUCTS', 'OPEN_SMART_COLLECTION', 'OPEN_CART', 'OPEN_ORDERS', 'OPEN_WISHLIST', 'OPEN_ADDRESS', 'OPEN_SCREEN', 'OPEN_EXTERNAL_URL'];

function BannerForm({ initial, onClose, onSaved }: { initial: HomeBanner | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    badge: initial?.badge ?? '',
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    image_url: initial?.image_url ?? '',
    background_color: initial?.background_color ?? 'brand',
    button_text: initial?.button_text ?? 'Shop now',
    action_type: (initial?.action_type ?? 'OPEN_SCREEN') as ActionType,
    action_config: (initial?.action_config ?? {}) as Record<string, unknown>,
    display_order: initial?.display_order ?? 0,
    is_active: initial?.is_active ?? true,
    start_at: initial?.start_at ?? '',
    end_at: initial?.end_at ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [smartCollections, setSmartCollections] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    void (async () => {
      const [{ data: cats }, { data: prods }, { data: sc }] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('products').select('*').order('name'),
        supabase.from('smart_collections').select('id, name').eq('is_active', true).order('name'),
      ]);
      setCategories((cats as DbCategory[]) ?? []);
      setProducts((prods as DbProduct[]) ?? []);
      setBrands(Array.from(new Set((prods as DbProduct[] | null)?.map((p) => p.brand) ?? [])).sort());
      setSmartCollections((sc as { id: string; name: string }[]) ?? []);
    })();
  }, []);

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const fileName = `banner-${Date.now()}.${ext}`;
    const { error: uploadErr } = await supabase.storage.from('home-banners').upload(fileName, file, { cacheControl: '3600', upsert: false });
    if (uploadErr) { setUploading(false); return; }
    const { data: urlData } = supabase.storage.from('home-banners').getPublicUrl(fileName);
    setForm((f) => ({ ...f, image_url: urlData.publicUrl }));
    setUploading(false);
  };

  const setActionConfig = (key: string, value: unknown) => {
    setForm((f) => ({ ...f, action_config: { ...f.action_config, [key]: value } }));
  };

  const handleSave = async () => {
    if (!form.title || !form.image_url) return;
    setSaving(true);
    const payload = {
      badge: form.badge || null,
      title: form.title,
      description: form.description,
      image_url: form.image_url,
      background_color: form.background_color,
      button_text: form.button_text,
      action_type: form.action_type,
      action_config: form.action_config,
      display_order: form.display_order,
      is_active: form.is_active,
      start_at: form.start_at || null,
      end_at: form.end_at || null,
    };
    try {
      if (initial) {
        await updateHomeBanner(initial.id, payload);
      } else {
        await createHomeBanner(payload);
      }
      onSaved();
    } catch {
      // error handled by caller
    }
    setSaving(false);
  };

  const needsCategory = form.action_type === 'VIEW_CATEGORY' || form.action_type === 'FILTER_PRODUCTS';
  const needsProduct = form.action_type === 'VIEW_PRODUCT';
  const needsBrand = form.action_type === 'VIEW_BRAND' || form.action_type === 'FILTER_PRODUCTS';
  const needsSmartCollection = form.action_type === 'OPEN_SMART_COLLECTION';
  const needsScreen = form.action_type === 'OPEN_SCREEN';
  const needsUrl = form.action_type === 'OPEN_EXTERNAL_URL';
  const needsSearch = form.action_type === 'SEARCH' || form.action_type === 'VIEW_OFFER';
  const needsFilter = form.action_type === 'FILTER_PRODUCTS';

  return (
    <div className="bg-white border border-brand-200 rounded-2xl p-4 space-y-3 shadow-card">
      <div className="flex items-center justify-between"><h3 className="text-sm font-bold text-ink-900">{initial ? 'Edit' : 'New'} banner</h3><button onClick={onClose}><X size={16} className="text-ink-400" /></button></div>
      <input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="Badge text (e.g. WHOLESALE)" className="w-full h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-brand-500" />
      <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title *" className="w-full h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-brand-500" />
      <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="w-full h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-brand-500" />
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-ink-600">Banner image *</label>
        <div className="flex gap-2">
          <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="Image URL or upload" className="flex-1 h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-brand-500" />
          <label className="h-10 px-3 rounded-xl bg-brand-50 text-brand-600 text-xs font-bold flex items-center gap-1.5 cursor-pointer">
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <><ImageIcon size={14} /> Upload</>}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleImageUpload(f); }} />
          </label>
        </div>
        {form.image_url && <img src={form.image_url} alt="" className="h-20 w-full rounded-xl object-cover" />}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <select value={form.background_color} onChange={(e) => setForm({ ...form, background_color: e.target.value })} className="h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-brand-500">
          <option value="brand">Brand green</option><option value="accent">Accent</option><option value="ink">Dark</option>
        </select>
        <input value={form.button_text} onChange={(e) => setForm({ ...form, button_text: e.target.value })} placeholder="Button text" className="h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-brand-500" />
      </div>
      <div>
        <label className="text-xs font-bold text-ink-600 block mb-1">Action type</label>
        <select value={form.action_type} onChange={(e) => setForm({ ...form, action_type: e.target.value as ActionType, action_config: {} })} className="w-full h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-brand-500">
          {ACTION_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
        </select>
      </div>
      {needsScreen && (
        <select value={(form.action_config.screen as string) ?? ''} onChange={(e) => setActionConfig('screen', e.target.value)} className="w-full h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-brand-500">
          <option value="">Select screen</option>
          <option value="home">Home</option><option value="categories">Categories</option><option value="cart">Cart</option><option value="orders">Orders</option><option value="wishlist">Wishlist</option><option value="addresses">Addresses</option><option value="account">Account</option><option value="businessRegistration">Business registration</option>
        </select>
      )}
      {needsUrl && (
        <input value={(form.action_config.url as string) ?? ''} onChange={(e) => setActionConfig('url', e.target.value)} placeholder="External URL (https://...)" className="w-full h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-brand-500" />
      )}
      {needsSearch && (
        <input value={(form.action_config.query as string) ?? ''} onChange={(e) => setActionConfig('query', e.target.value)} placeholder="Search query" className="w-full h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-brand-500" />
      )}
      {needsProduct && (
        <select value={(form.action_config.product_id as string) ?? ''} onChange={(e) => { setActionConfig('product_id', e.target.value); const p = products.find((x) => x.id === e.target.value); if (p) setActionConfig('product_name', `${p.brand} ${p.name}`); }} className="w-full h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-brand-500">
          <option value="">Select product</option>
          {products.map((p) => <option key={p.id} value={p.id}>{p.brand} {p.name}</option>)}
        </select>
      )}
      {needsCategory && (
        <select multiple value={(form.action_config.category_ids as string[]) ?? []} onChange={(e) => setActionConfig('category_ids', Array.from(e.target.selectedOptions).map((o) => o.value))} className="w-full h-24 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-brand-500" size={4}>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      )}
      {needsBrand && (
        <select multiple value={(form.action_config.brand_ids as string[]) ?? []} onChange={(e) => setActionConfig('brand_ids', Array.from(e.target.selectedOptions).map((o) => o.value))} className="w-full h-24 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-brand-500" size={4}>
          {brands.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      )}
      {needsSmartCollection && (
        <select value={(form.action_config.collection_id as string) ?? ''} onChange={(e) => { const sc = smartCollections.find((x) => x.id === e.target.value); setActionConfig('collection_id', e.target.value); if (sc) setActionConfig('name', sc.name); }} className="w-full h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-brand-500">
          <option value="">Select smart collection</option>
          {smartCollections.map((sc) => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
        </select>
      )}
      {needsFilter && (
        <div className="space-y-2 rounded-xl border border-ink-100 p-3 bg-ink-50/30">
          <p className="text-xs font-bold text-ink-600">Filter options</p>
          <div className="grid grid-cols-2 gap-2">
            <input type="number" value={(form.action_config.discount_min as number) ?? ''} onChange={(e) => setActionConfig('discount_min', e.target.value ? Number(e.target.value) : null)} placeholder="Min discount %" className="h-9 rounded-lg border border-ink-200 px-2 text-sm outline-none focus:border-brand-500" />
            <input type="number" value={(form.action_config.discount_max as number) ?? ''} onChange={(e) => setActionConfig('discount_max', e.target.value ? Number(e.target.value) : null)} placeholder="Max discount %" className="h-9 rounded-lg border border-ink-200 px-2 text-sm outline-none focus:border-brand-500" />
            <input type="number" value={(form.action_config.price_min as number) ?? ''} onChange={(e) => setActionConfig('price_min', e.target.value ? Number(e.target.value) : null)} placeholder="Min price" className="h-9 rounded-lg border border-ink-200 px-2 text-sm outline-none focus:border-brand-500" />
            <input type="number" value={(form.action_config.price_max as number) ?? ''} onChange={(e) => setActionConfig('price_max', e.target.value ? Number(e.target.value) : null)} placeholder="Max price" className="h-9 rounded-lg border border-ink-200 px-2 text-sm outline-none focus:border-brand-500" />
          </div>
          <label className="flex items-center gap-2 text-sm text-ink-700"><input type="checkbox" checked={(form.action_config.stock_only as boolean) ?? false} onChange={(e) => setActionConfig('stock_only', e.target.checked)} className="accent-brand-600" /> In stock only</label>
          <select value={(form.action_config.sort as string) ?? 'newest'} onChange={(e) => setActionConfig('sort', e.target.value)} className="w-full h-9 rounded-lg border border-ink-200 px-2 text-sm outline-none focus:border-brand-500">
            <option value="newest">Newest</option><option value="discount_desc">Discount: high to low</option><option value="discount_asc">Discount: low to high</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option><option value="rating_desc">Top rated</option>
          </select>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs font-bold text-ink-600 block mb-1">Start date</label>
          <input type="datetime-local" value={form.start_at ? form.start_at.slice(0, 16) : ''} onChange={(e) => setForm({ ...form, start_at: e.target.value ? new Date(e.target.value).toISOString() : '' })} className="w-full h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-brand-500" />
        </div>
        <div>
          <label className="text-xs font-bold text-ink-600 block mb-1">End date</label>
          <input type="datetime-local" value={form.end_at ? form.end_at.slice(0, 16) : ''} onChange={(e) => setForm({ ...form, end_at: e.target.value ? new Date(e.target.value).toISOString() : '' })} className="w-full h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-brand-500" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} placeholder="Display order" className="h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-brand-500" />
        <label className="flex items-center gap-2 text-sm text-ink-700 h-10"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="accent-brand-600" /> Active</label>
      </div>
      <button onClick={handleSave} disabled={saving || !form.title || !form.image_url} className="w-full h-11 rounded-xl bg-brand-600 text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60">{saving ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> Save banner</>}</button>
    </div>
  );
}

function PromotionsManager() {
  const [promos, setPromos] = useState<DbPromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<DbPromotion | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.from('promotions').select('*').order('sort_order');
    setPromos((data as DbPromotion[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const handleDelete = async (id: string) => {
    await supabase.from('promotions').delete().eq('id', id);
    void load();
  };

  const handleToggle = async (promo: DbPromotion) => {
    await supabase.from('promotions').update({ is_active: !promo.is_active }).eq('id', promo.id);
    void load();
  };

  if (loading) return <Loader2 className="animate-spin mx-auto text-brand-600" size={24} />;

  return (
    <div className="space-y-3">
      <button onClick={() => { setEditing(null); setShowForm(true); }} className="w-full h-10 rounded-xl bg-brand-600 text-white text-sm font-bold flex items-center justify-center gap-2"><Plus size={16} /> Add promotion</button>
      {showForm && <PromotionForm initial={editing} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); void load(); }} />}
      {promos.map((promo) => (
        <div key={promo.id} className="bg-white border border-ink-100 rounded-2xl p-3.5 shadow-card">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {promo.image_url && <img src={promo.image_url} alt="" className="h-10 w-10 rounded-lg object-cover" />}
                <div className="min-w-0"><p className="text-sm font-bold text-ink-800 truncate">{promo.headline}</p><p className="text-[10px] text-ink-400 mt-0.5 truncate">{promo.subtext}</p></div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-[9px] font-bold rounded-full px-2 py-0.5 ${promo.is_active ? 'bg-brand-100 text-brand-700' : 'bg-ink-100 text-ink-500'}`}>{promo.is_active ? 'ACTIVE' : 'HIDDEN'}</span>
                <span className="text-[9px] text-ink-400">Order: {promo.sort_order}</span>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => void handleToggle(promo)} className="h-8 w-8 rounded-lg bg-ink-50 text-ink-600 flex items-center justify-center text-xs font-bold">{promo.is_active ? 'ON' : 'OFF'}</button>
              <button onClick={() => { setEditing(promo); setShowForm(true); }} className="h-8 w-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center"><Pencil size={14} /></button>
              <button onClick={() => void handleDelete(promo.id)} className="h-8 w-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center"><Trash2 size={14} /></button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PromotionForm({ initial, onClose, onSaved }: { initial: DbPromotion | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    headline: initial?.headline ?? '',
    subtext: initial?.subtext ?? '',
    cta_label: initial?.cta_label ?? 'Shop now',
    image_url: initial?.image_url ?? '',
    background: initial?.background ?? 'brand',
    badge: initial?.badge ?? '',
    sort_order: initial?.sort_order ?? 0,
    is_active: initial?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    if (initial) {
      await supabase.from('promotions').update(form).eq('id', initial.id);
    } else {
      await supabase.from('promotions').insert(form);
    }
    setSaving(false);
    onSaved();
  };

  return (
    <div className="bg-white border border-brand-200 rounded-2xl p-4 space-y-3 shadow-card">
      <div className="flex items-center justify-between"><h3 className="text-sm font-bold text-ink-900">{initial ? 'Edit' : 'New'} promotion</h3><button onClick={onClose}><X size={16} className="text-ink-400" /></button></div>
      <input value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} placeholder="Headline *" className="w-full h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-brand-500" />
      <input value={form.subtext} onChange={(e) => setForm({ ...form, subtext: e.target.value })} placeholder="Subtext" className="w-full h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-brand-500" />
      <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="Image URL" className="w-full h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-brand-500" />
      <div className="grid grid-cols-2 gap-2">
        <input value={form.cta_label} onChange={(e) => setForm({ ...form, cta_label: e.target.value })} placeholder="CTA label" className="h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-brand-500" />
        <input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="Badge text" className="h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-brand-500" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <select value={form.background} onChange={(e) => setForm({ ...form, background: e.target.value })} className="h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-brand-500">
          <option value="brand">Brand green</option><option value="accent">Accent</option><option value="ink">Dark</option>
        </select>
        <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} placeholder="Sort order" className="h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-brand-500" />
      </div>
      <label className="flex items-center gap-2 text-sm text-ink-700"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="accent-brand-600" /> Active</label>
      <button onClick={handleSave} disabled={saving} className="w-full h-11 rounded-xl bg-brand-600 text-white text-sm font-bold flex items-center justify-center gap-2">{saving ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> Save</>}</button>
    </div>
  );
}

function CategoriesManager() {
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<DbCategory | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase.from('categories').select('*').order('sort_order');
    setCategories((data as DbCategory[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const handleDelete = async (id: string) => {
    await supabase.from('categories').delete().eq('id', id);
    void load();
  };

  if (loading) return <Loader2 className="animate-spin mx-auto text-brand-600" size={24} />;

  return (
    <div className="space-y-3">
      <button onClick={() => { setEditing(null); setShowForm(true); }} className="w-full h-10 rounded-xl bg-brand-600 text-white text-sm font-bold flex items-center justify-center gap-2"><Plus size={16} /> Add category</button>
      {showForm && <CategoryForm initial={editing} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); void load(); }} />}
      {categories.map((cat) => (
        <div key={cat.id} className="bg-white border border-ink-100 rounded-2xl p-3.5 shadow-card flex items-center gap-3">
          {cat.image_url && <img src={cat.image_url} alt="" className="h-12 w-12 rounded-xl object-cover" />}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-ink-800 truncate">{cat.name}</p>
            <p className="text-[10px] text-ink-400 mt-0.5">/{cat.slug} · Order {cat.sort_order}</p>
          </div>
          <button onClick={() => { setEditing(cat); setShowForm(true); }} className="h-8 w-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center"><Pencil size={14} /></button>
          <button onClick={() => void handleDelete(cat.id)} className="h-8 w-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center"><Trash2 size={14} /></button>
        </div>
      ))}
    </div>
  );
}

function CategoryForm({ initial, onClose, onSaved }: { initial: DbCategory | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ name: initial?.name ?? '', slug: initial?.slug ?? '', image_url: initial?.image_url ?? '', description: initial?.description ?? '', sort_order: initial?.sort_order ?? 0, is_active: initial?.is_active ?? true });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    if (initial) await supabase.from('categories').update(form).eq('id', initial.id);
    else await supabase.from('categories').insert(form);
    setSaving(false);
    onSaved();
  };

  return (
    <div className="bg-white border border-brand-200 rounded-2xl p-4 space-y-3 shadow-card">
      <div className="flex items-center justify-between"><h3 className="text-sm font-bold text-ink-900">{initial ? 'Edit' : 'New'} category</h3><button onClick={onClose}><X size={16} className="text-ink-400" /></button></div>
      <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name *" className="w-full h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-brand-500" />
      <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} placeholder="Slug *" className="w-full h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-brand-500" />
      <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="Image URL" className="w-full h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-brand-500" />
      <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="w-full h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-brand-500" />
      <div className="grid grid-cols-2 gap-2">
        <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} placeholder="Sort order" className="h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-brand-500" />
        <label className="flex items-center gap-2 text-sm text-ink-700 h-10"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="accent-brand-600" /> Active</label>
      </div>
      <button onClick={handleSave} disabled={saving} className="w-full h-11 rounded-xl bg-brand-600 text-white text-sm font-bold flex items-center justify-center gap-2">{saving ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> Save</>}</button>
    </div>
  );
}

function ProductsManager() {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<DbProduct | null>(null);

  const load = useCallback(async () => {
    const [{ data: prodData }, { data: catData }] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
    ]);
    setProducts((prodData as DbProduct[]) ?? []);
    setCategories((catData as DbCategory[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const handleDelete = async (id: string) => {
    await supabase.from('products').delete().eq('id', id);
    void load();
  };

  if (loading) return <Loader2 className="animate-spin mx-auto text-brand-600" size={24} />;

  return (
    <div className="space-y-3">
      <button onClick={() => { setEditing(null); setShowForm(true); }} className="w-full h-10 rounded-xl bg-brand-600 text-white text-sm font-bold flex items-center justify-center gap-2"><Plus size={16} /> Add product</button>
      {showForm && <ProductForm initial={editing} categories={categories} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); void load(); }} />}
      {products.map((prod) => (
        <div key={prod.id} className="bg-white border border-ink-100 rounded-2xl p-3.5 shadow-card flex items-center gap-3">
          {prod.image_url && <img src={prod.image_url} alt="" className="h-12 w-12 rounded-xl object-cover" />}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-ink-800 truncate">{prod.brand} {prod.name}</p>
            <p className="text-[10px] text-ink-400 mt-0.5">{prod.pack_size} · ₹{prod.wholesale_price} · Stock: {prod.stock_quantity}</p>
          </div>
          <button onClick={() => { setEditing(prod); setShowForm(true); }} className="h-8 w-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center"><Pencil size={14} /></button>
          <button onClick={() => void handleDelete(prod.id)} className="h-8 w-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center"><Trash2 size={14} /></button>
        </div>
      ))}
    </div>
  );
}

function ProductForm({ initial, categories, onClose, onSaved }: { initial: DbProduct | null; categories: DbCategory[]; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    category_id: initial?.category_id ?? categories[0]?.id ?? '',
    brand: initial?.brand ?? '',
    name: initial?.name ?? '',
    slug: initial?.slug ?? '',
    pack_size: initial?.pack_size ?? '',
    mrp: initial?.mrp ?? 0,
    wholesale_price: initial?.wholesale_price ?? 0,
    moq: initial?.moq ?? 1,
    stock_quantity: initial?.stock_quantity ?? 0,
    image_url: initial?.image_url ?? '',
    description: initial?.description ?? '',
    rating: initial?.rating ?? 0,
    is_active: initial?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    if (initial) await supabase.from('products').update(form).eq('id', initial.id);
    else await supabase.from('products').insert(form);
    setSaving(false);
    onSaved();
  };

  return (
    <div className="bg-white border border-brand-200 rounded-2xl p-4 space-y-3 shadow-card">
      <div className="flex items-center justify-between"><h3 className="text-sm font-bold text-ink-900">{initial ? 'Edit' : 'New'} product</h3><button onClick={onClose}><X size={16} className="text-ink-400" /></button></div>
      <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="w-full h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-brand-500">
        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <div className="grid grid-cols-2 gap-2">
        <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Brand *" className="h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-brand-500" />
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name *" className="h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-brand-500" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} placeholder="Slug *" className="h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-brand-500" />
        <input value={form.pack_size} onChange={(e) => setForm({ ...form, pack_size: e.target.value })} placeholder="Pack size *" className="h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-brand-500" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <input type="number" value={form.mrp} onChange={(e) => setForm({ ...form, mrp: Number(e.target.value) })} placeholder="MRP" className="h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-brand-500" />
        <input type="number" value={form.wholesale_price} onChange={(e) => setForm({ ...form, wholesale_price: Number(e.target.value) })} placeholder="Wholesale" className="h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-brand-500" />
        <input type="number" value={form.moq} onChange={(e) => setForm({ ...form, moq: Number(e.target.value) })} placeholder="MOQ" className="h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-brand-500" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input type="number" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: Number(e.target.value) })} placeholder="Stock qty" className="h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-brand-500" />
        <input type="number" step="0.1" value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} placeholder="Rating" className="h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-brand-500" />
      </div>
      <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="Image URL" className="w-full h-10 rounded-xl border border-ink-200 px-3 text-sm outline-none focus:border-brand-500" />
      <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={2} className="w-full rounded-xl border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-500 resize-none" />
      <label className="flex items-center gap-2 text-sm text-ink-700"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="accent-brand-600" /> Active</label>
      <button onClick={handleSave} disabled={saving} className="w-full h-11 rounded-xl bg-brand-600 text-white text-sm font-bold flex items-center justify-center gap-2">{saving ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> Save</>}</button>
    </div>
  );
}

function RolesManager() {
  const [users, setUsers] = useState<{ user_id: string; role: string; full_name: string; phone: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase.from('user_roles').select('user_id, role, profiles!inner(full_name, phone)').order('created_at', { ascending: false });
    if (data) {
      setUsers(data.map((r: Record<string, unknown>) => {
        const p = r.profiles as { full_name: string; phone: string };
        return { user_id: r.user_id as string, role: r.role as string, full_name: p.full_name, phone: p.phone };
      }));
    }
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const handleRoleChange = async (userId: string, role: string) => {
    await supabase.rpc('set_user_role', { p_user_id: userId, p_role: role });
    void load();
  };

  if (loading) return <Loader2 className="animate-spin mx-auto text-brand-600" size={24} />;

  return (
    <div className="space-y-3">
      <p className="text-xs text-ink-500">Change a user's role to grant admin, warehouse, or delivery access.</p>
      {users.map((u) => (
        <div key={u.user_id} className="bg-white border border-ink-100 rounded-2xl p-3.5 shadow-card">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-bold text-ink-800 truncate">{u.full_name || 'Unknown'}</p>
              <p className="text-[10px] text-ink-400 mt-0.5">{u.phone || u.user_id.slice(0, 8)}</p>
            </div>
            <select value={u.role} onChange={(e) => void handleRoleChange(u.user_id, e.target.value)} className="h-9 rounded-lg border border-ink-200 px-2 text-xs font-bold outline-none focus:border-brand-500">
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
              <option value="warehouse_manager">Warehouse</option>
              <option value="delivery_partner">Delivery</option>
            </select>
          </div>
        </div>
      ))}
    </div>
  );
}
