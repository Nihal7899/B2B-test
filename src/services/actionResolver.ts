// services/actionResolver.ts
import type { ActionType, FilterConfig, Category, Product, PromoBanner, ScreenName } from '@/types';

export interface ActionContext {
  setScreen: (screen: ScreenName) => void;
  setSearch: (query: string) => void;
  openProduct: (product: Product) => void;
  openCategory: (category: Category) => void;
  setFilterConfig: (config: FilterConfig | null) => void;
  setFilterTitle: (title: string) => void;
}

export function handleHomeAction(
  actionType?: string,
  actionConfig?: Record<string, unknown>,
  ctx?: ActionContext
): void {
  if (!actionType || !ctx) return;

  const config = actionConfig || {};

  switch (actionType) {
    case 'VIEW_CATEGORY': {
      const categoryId = config.category_id as string;
      const categoryName = config.category_name as string || 'Category';
      if (categoryId) {
        // Navigate to filtered products with that category
        ctx.setFilterConfig({ category_ids: [categoryId] });
        ctx.setFilterTitle(categoryName);
        ctx.setScreen('filteredProducts');
      }
      break;
    }

    case 'VIEW_PRODUCT': {
      const productId = config.product_id as string;
      // We need to fetch the product by ID – but we don't have the product object here.
      // Alternatively, we can navigate to product detail if we have the product ID.
      // For simplicity, we can use the product_name to search.
      if (productId) {
        // You can either set search to the product name or navigate directly.
        // Since we have openProduct, we need the full product object – not available here.
        // Better: use search to find the product.
        const productName = config.product_name as string || '';
        if (productName) {
          ctx.setSearch(productName);
          ctx.setScreen('home');
        } else {
          // fallback: search by ID (not recommended)
          ctx.setSearch(productId);
          ctx.setScreen('home');
        }
      }
      break;
    }

    case 'VIEW_BRAND': {
      const brand = config.brand as string;
      if (brand) {
        ctx.setFilterConfig({ brand_ids: [brand] });
        ctx.setFilterTitle(brand);
        ctx.setScreen('filteredProducts');
      }
      break;
    }

    case 'VIEW_OFFER': {
      const query = config.query as string || '';
      ctx.setSearch(query);
      ctx.setScreen('home');
      break;
    }

    case 'SEARCH': {
      const query = config.query as string || '';
      ctx.setSearch(query);
      ctx.setScreen('home');
      break;
    }

    case 'FILTER_PRODUCTS': {
      // Build filter config from actionConfig
      const filter: FilterConfig = {};

      if (config.category_ids && Array.isArray(config.category_ids)) {
        filter.category_ids = config.category_ids as string[];
      }
      if (config.brand_ids && Array.isArray(config.brand_ids)) {
        filter.brand_ids = config.brand_ids as string[];
      }
      if (config.product_ids && Array.isArray(config.product_ids)) {
        filter.product_ids = config.product_ids as string[];
      }
      if (config.discount_min !== undefined && config.discount_min !== null) {
        filter.discount_min = Number(config.discount_min);
      }
      if (config.discount_max !== undefined && config.discount_max !== null) {
        filter.discount_max = Number(config.discount_max);
      }
      if (config.price_min !== undefined && config.price_min !== null) {
        filter.price_min = Number(config.price_min);
      }
      if (config.price_max !== undefined && config.price_max !== null) {
        filter.price_max = Number(config.price_max);
      }
      if (config.stock_only !== undefined) {
        filter.stock_only = Boolean(config.stock_only);
      }
      if (config.sort) {
        filter.sort = config.sort as FilterConfig['sort'];
      }

      const title = config.title as string || 'Products';
      ctx.setFilterConfig(filter);
      ctx.setFilterTitle(title);
      ctx.setScreen('filteredProducts');
      break;
    }

    case 'OPEN_SMART_COLLECTION': {
      const collectionId = config.collection_id as string;
      const collectionName = config.name as string || 'Collection';
      // For simplicity, we can apply the filter from the collection's filter_config.
      // This would require fetching the collection from DB – we can skip for now.
      // Instead, navigate to filteredProducts with some placeholder.
      if (collectionId) {
        ctx.setFilterConfig({}); // you'd fetch the actual filter config
        ctx.setFilterTitle(collectionName);
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
      const screen = config.screen as ScreenName;
      if (screen) {
        ctx.setScreen(screen);
      }
      break;
    }

    case 'OPEN_EXTERNAL_URL': {
      const url = config.url as string;
      if (url) {
        window.open(url, '_blank');
      }
      break;
    }

    default:
      console.warn('Unknown action type:', actionType);
  }
}