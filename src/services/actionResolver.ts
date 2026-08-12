// services/actionResolver.ts
import type { ActionType, FilterConfig, Category, Product, PromoBanner, ScreenName } from '@/types';
import { fetchSmartCollectionById } from './catalog'; // ✅ import the function

export interface ActionContext {
  setScreen: (screen: ScreenName) => void;
  setSearch: (query: string) => void;
  openProduct: (product: Product) => void;
  openCategory: (category: Category) => void;
  setFilterConfig: (config: FilterConfig | null) => void;
  setFilterTitle: (title: string) => void;
}

export async function handleHomeAction(
  actionType?: string,
  actionConfig?: Record<string, unknown>,
  ctx?: ActionContext
): Promise<void> {
  if (!actionType || !ctx) return;

  const config = actionConfig || {};
  console.log('[Action]', actionType, config);

  switch (actionType) {
    case 'VIEW_CATEGORY': {
      const categoryId = config.category_id as string;
      const categoryIds = config.category_ids as string[];
      const categoryName = config.category_name as string || 'Category';

      if (categoryIds && Array.isArray(categoryIds) && categoryIds.length > 0) {
        ctx.setFilterConfig({ category_ids: categoryIds });
        ctx.setFilterTitle(categoryName || 'Categories');
        ctx.setScreen('filteredProducts');
      } else if (categoryId) {
        ctx.setFilterConfig({ category_ids: [categoryId] });
        ctx.setFilterTitle(categoryName);
        ctx.setScreen('filteredProducts');
      } else {
        console.warn('VIEW_CATEGORY: missing category_id or category_ids');
      }
      break;
    }

    case 'VIEW_PRODUCT': {
      const productId = config.product_id as string;
      const productName = config.product_name as string || '';
      if (productId) {
        ctx.setSearch(productName || productId);
        ctx.setScreen('home');
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

    case 'VIEW_OFFER':
    case 'SEARCH': {
      const query = config.query as string || '';
      ctx.setSearch(query);
      ctx.setScreen('home');
      break;
    }

    case 'FILTER_PRODUCTS': {
      const filter: FilterConfig = {};

      if (config.category_ids && Array.isArray(config.category_ids) && config.category_ids.length > 0) {
        filter.category_ids = config.category_ids as string[];
      }
      if (config.brand_ids && Array.isArray(config.brand_ids) && config.brand_ids.length > 0) {
        filter.brand_ids = config.brand_ids as string[];
      }
      if (config.product_ids && Array.isArray(config.product_ids) && config.product_ids.length > 0) {
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

      const hasFilter = Object.keys(filter).length > 0;
      if (!hasFilter) {
        console.warn('FILTER_PRODUCTS: no filter criteria provided. Showing all products.');
        ctx.setFilterConfig({});
      } else {
        ctx.setFilterConfig(filter);
      }

      const title = (config.title as string) || (filter.category_ids?.length ? 'Categories' : 'Products');
      ctx.setFilterTitle(title);
      ctx.setScreen('filteredProducts');
      break;
    }

    case 'OPEN_SMART_COLLECTION': {
      const collectionId = config.collection_id as string;
      const collectionName = config.name as string || 'Collection';
      if (collectionId) {
        // ✅ Fetch the collection's filter config
        try {
          const collection = await fetchSmartCollectionById(collectionId);
          if (collection) {
            ctx.setFilterConfig(collection.filter_config);
            ctx.setFilterTitle(collection.name);
            ctx.setScreen('filteredProducts');
          } else {
            console.warn('Smart collection not found:', collectionId);
          }
        } catch (err) {
          console.error('Error fetching smart collection:', err);
        }
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