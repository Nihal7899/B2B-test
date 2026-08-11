import { useState } from 'react';
import { Header } from '@/components/Header';
import { BottomNavigation } from '@/components/BottomNavigation';
import { SplashScreen } from '@/components/SplashScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { CategoriesScreen } from '@/screens/CategoriesScreen';
import { OrdersScreen } from '@/screens/OrdersScreen';
import { CartScreen } from '@/screens/CartScreen';
import { AccountScreen } from '@/screens/AccountScreen';
import { ProductDetailScreen } from '@/screens/ProductDetailScreen';
import { CheckoutScreen } from '@/screens/CheckoutScreen';
import { OrderDetailScreen } from '@/screens/OrderDetailScreen';
import { AddressesScreen } from '@/screens/AddressesScreen';
import { WishlistScreen } from '@/screens/WishlistScreen';
import { AdminScreen } from '@/screens/AdminScreen';
import { WarehouseScreen } from '@/screens/WarehouseScreen';
import { DeliveryScreen } from '@/screens/DeliveryScreen';
import type { Category, Product, ScreenName } from '@/types';
import { useCart } from '@/store';
import { useAuth } from '@/auth';
import { AuthScreen } from '@/screens/AuthScreen';

function App() {
  const cart = useCart();
  const { user, role, loading } = useAuth();
  const [screen, setScreen] = useState<ScreenName>('home');
  const [search, setSearch] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true);

  const goTo = (next: ScreenName) => {
    setScreen(next);
    setSelectedProductId(null);
    setSelectedOrderId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const openProduct = (product: Product) => {
    setSelectedProductId(product.id);
    setScreen('product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const openCategory = (category: Category) => {
    setSearch(category.name);
    setScreen('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const openOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setScreen('orderDetail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const openProtected = (next: ScreenName) => {
    const allowed = next === 'admin' ? role === 'admin' : next === 'warehouse' ? role === 'admin' || role === 'warehouse_manager' : next === 'delivery' ? role === 'admin' || role === 'delivery_partner' : true;
    goTo(allowed ? next : 'home');
  };

  if (loading) return <SplashScreen onFinish={() => undefined} />;
  if (!user) return <>{showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />} {!showSplash && <AuthScreen />}</>;

  let content;
  if (screen === 'home') content = <HomeScreen search={search} onSearchChange={setSearch} onCategory={openCategory} onProduct={openProduct} onViewAll={() => goTo('categories')} cart={cart} />;
  else if (screen === 'categories') content = <CategoriesScreen onCategory={openCategory} />;
  else if (screen === 'orders') content = <OrdersScreen onOrderClick={openOrder} />;
  else if (screen === 'cart') content = <CartScreen cart={cart} onProduct={openProduct} onShop={() => goTo('home')} onCheckout={() => goTo('checkout')} />;
  else if (screen === 'checkout') content = <CheckoutScreen cart={cart} onBack={() => goTo('cart')} onOrderPlaced={openOrder} onAddAddress={() => goTo('addresses')} />;
  else if (screen === 'orderDetail' && selectedOrderId) content = <OrderDetailScreen orderId={selectedOrderId} onBack={() => goTo('orders')} />;
  else if (screen === 'addresses') content = <AddressesScreen onBack={() => goTo('account')} onSaved={() => goTo('checkout')} />;
  else if (screen === 'wishlist') content = <WishlistScreen cart={cart} onProduct={openProduct} onShop={() => goTo('home')} />;
  else if (screen === 'account') content = <AccountScreen onNavigate={openProtected} />;
  else if (screen === 'admin') content = role === 'admin' ? <AdminScreen onBack={() => goTo('account')} /> : <HomeScreen search={search} onSearchChange={setSearch} onCategory={openCategory} onProduct={openProduct} onViewAll={() => goTo('categories')} cart={cart} />;
  else if (screen === 'warehouse') content = role === 'admin' || role === 'warehouse_manager' ? <WarehouseScreen onBack={() => goTo('account')} /> : <HomeScreen search={search} onSearchChange={setSearch} onCategory={openCategory} onProduct={openProduct} onViewAll={() => goTo('categories')} cart={cart} />;
  else if (screen === 'delivery') content = role === 'admin' || role === 'delivery_partner' ? <DeliveryScreen onBack={() => goTo('account')} /> : <HomeScreen search={search} onSearchChange={setSearch} onCategory={openCategory} onProduct={openProduct} onViewAll={() => goTo('categories')} cart={cart} />;
  else if (screen === 'product' && selectedProductId) content = <ProductDetailScreen productId={selectedProductId} cart={cart} onBack={() => goTo('home')} onProduct={openProduct} />;
  else content = <HomeScreen search={search} onSearchChange={setSearch} onCategory={openCategory} onProduct={openProduct} onViewAll={() => goTo('categories')} cart={cart} />;

  return <div className="min-h-screen bg-ink-100">{showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}<div className="mx-auto min-h-screen max-w-[720px] bg-ink-50 shadow-2xl shadow-ink-200/50"><Header cartCount={cart.totalItems} onCartClick={() => goTo('cart')} /><main className="py-4 pb-24 animate-fade-up">{content}</main><BottomNavigation active={screen} cartCount={cart.totalItems} onNavigate={goTo} /></div></div>;
}

export default App;
