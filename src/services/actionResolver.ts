import type { ActionType, FilterConfig, ScreenName, Product, Category } from '@/types';

export interface ActionContext {
  setScreen: (screen: ScreenName) => void;
  setSearch: (search: string) => void;
  openProduct: (product: Product) => void;
  openCategory: (category: Category) => void;
  setFilterConfig: (config: FilterConfig | null) => void;
  setFilterTitle: (title: string) => void;
}

export function handleHomeAction(
  actionType: string | undefined,
  actionConfig: Record<string, unknown> | undefined,
  ctx: ActionContext
): void {
  if (!actionType) return;

  const cfg = actionConfig ?? {};

  switch (actionType as ActionType) {
    case 'VIEW_CATEGORY': {
      const categoryId = cfg.category_id as string | undefined;
      const categoryName = cfg.category_name as string | undefined;
      if (categoryName) {
        ctx.openCategory({ id: categoryId ?? categoryName, name: categoryName, image: '', count: 0, color: 'bg-brand-50' });
      }
      break;
    }
    case 'VIEW_PRODUCT': {
      const productId = cfg.product_id as string | undefined;
      const productName = cfg.product_name as string | undefined;
      if (productId) {
        ctx.openProduct({
          id: productId, brand: '', name: productName ?? '', packSize: '', mrp: 0, price: 0,
          image: '', category: '', moq: 0, rating: 0, description: '', inStock: true,
        });
      }
      break;
    }
    case 'VIEW_BRAND': {
      const brand = cfg.brand as string | undefined;
      if (brand) {
        ctx.setSearch(brand);
        ctx.setScreen('home');
      }
      break;
    }
    case 'VIEW_OFFER':
    case 'SEARCH': {
      const query = cfg.query as string | undefined;
      if (query) {
        ctx.setSearch(query);
        ctx.setScreen('home');
      }
      break;
    }
    case 'FILTER_PRODUCTS': {
      const filter = cfg as unknown as FilterConfig;
      ctx.setFilterConfig(filter);
      ctx.setFilterTitle((cfg.title as string) ?? 'Products');
      ctx.setScreen('filteredProducts');
      break;
    }
    case 'OPEN_SMART_COLLECTION': {
      const filter = cfg.filter_config as FilterConfig | undefined;
      const title = cfg.name as string | undefined;
      if (filter) {
        ctx.setFilterConfig(filter);
        ctx.setFilterTitle(title ?? 'Collection');
        ctx.setScreen('filteredProducts');
      }
      break;
    }
    case 'OPEN_CART':
      ctx.setScreen('cart');
      break;
    case 'OPEN_ORDERS':
      ctx.setScreen('orders');
      break;
    case 'OPEN_WISHLIST':
      ctx.setScreen('wishlist');
      break;
    case 'OPEN_ADDRESS':
      ctx.setScreen('addresses');
      break;
    case 'OPEN_SCREEN': {
      const screen = cfg.screen as ScreenName | undefined;
      if (screen) ctx.setScreen(screen);
      break;
    }
    case 'OPEN_EXTERNAL_URL': {
      const url = cfg.url as string | undefined;
      if (url && typeof window !== 'undefined') {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
      break;
    }
    default:
      break;
  }
}
