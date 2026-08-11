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
import { getProductById, getRelatedProducts } from '@/data';
import type { Category, Product, ScreenName } from '@/types';
import { useCart } from '@/store';
import { useAuth } from '@/auth';
import { AuthScreen } from '@/screens/AuthScreen';

function App() {
  const cart = useCart();
  const { user, loading } = useAuth();
  const [screen, setScreen] = useState<ScreenName>('home');
  const [search, setSearch] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true);

  const goTo = (next: ScreenName) => { setScreen(next); setSelectedProductId(null); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const openProduct = (product: Product) => { setSelectedProductId(product.id); setScreen('product'); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const openCategory = (category: Category) => { setSearch(category.name.split(' ')[0]); setScreen('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const selectedProduct = selectedProductId ? getProductById(selectedProductId) : undefined;

  if (loading) return <SplashScreen onFinish={() => undefined} />;
  if (!user) return <>{showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />} {!showSplash && <AuthScreen />}</>;

  let content;
  if (screen === 'home') content = <HomeScreen search={search} onSearchChange={setSearch} onCategory={openCategory} onProduct={openProduct} onViewAll={() => goTo('categories')} cart={cart} />;
  else if (screen === 'categories') content = <CategoriesScreen onCategory={openCategory} />;
  else if (screen === 'orders') content = <OrdersScreen />;
  else if (screen === 'cart') content = <CartScreen cart={cart} onProduct={openProduct} onShop={() => goTo('home')} />;
  else if (screen === 'account') content = <AccountScreen />;
  else if (selectedProduct) content = <ProductDetailScreen product={selectedProduct} related={getRelatedProducts(selectedProduct)} cart={cart} onBack={() => goTo('home')} onProduct={openProduct} />;
  else content = <HomeScreen search={search} onSearchChange={setSearch} onCategory={openCategory} onProduct={openProduct} onViewAll={() => goTo('categories')} cart={cart} />;

  return <div className="min-h-screen bg-ink-100">{showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}<div className="mx-auto min-h-screen max-w-[720px] bg-ink-50 shadow-2xl shadow-ink-200/50"><Header cartCount={cart.totalItems} onCartClick={() => goTo('cart')} /><main className="py-4 pb-24 animate-fade-up">{content}</main><BottomNavigation active={screen} cartCount={cart.totalItems} onNavigate={goTo} /></div></div>;
}

export default App;
