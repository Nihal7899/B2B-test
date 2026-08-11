import type { Product, Category, PromoBanner, Order } from './types';

export const categories: Category[] = [
  { id: 'rice', name: 'Rice & Grains', image: 'https://images.pexels.com/photos/13788549/pexels-photo-13788549.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', count: 128, color: 'bg-brand-50' },
  { id: 'atta', name: 'Atta & Flour', image: 'https://images.pexels.com/photos/6294374/pexels-photo-6294374.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', count: 64, color: 'bg-amber-50' },
  { id: 'pulses', name: 'Pulses', image: 'https://images.pexels.com/photos/14177776/pexels-photo-14177776.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', count: 92, color: 'bg-orange-50' },
  { id: 'oil', name: 'Cooking Oil', image: 'https://images.pexels.com/photos/31275834/pexels-photo-31275834.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', count: 47, color: 'bg-yellow-50' },
  { id: 'biscuits', name: 'Biscuits', image: 'https://images.pexels.com/photos/7509697/pexels-photo-7509697.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', count: 156, color: 'bg-rose-50' },
  { id: 'snacks', name: 'Snacks', image: 'https://images.pexels.com/photos/13060681/pexels-photo-13060681.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', count: 210, color: 'bg-red-50' },
  { id: 'beverages', name: 'Beverages', image: 'https://images.pexels.com/photos/7414290/pexels-photo-7414290.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', count: 184, color: 'bg-sky-50' },
  { id: 'dairy', name: 'Dairy', image: 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', count: 73, color: 'bg-blue-50' },
  { id: 'spices', name: 'Spices', image: 'https://images.pexels.com/photos/31280796/pexels-photo-31280796.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', count: 118, color: 'bg-orange-50' },
  { id: 'instant', name: 'Instant Foods', image: 'https://images.pexels.com/photos/23228983/pexels-photo-23228983.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', count: 96, color: 'bg-amber-50' },
  { id: 'personal', name: 'Personal Care', image: 'https://images.pexels.com/photos/7303921/pexels-photo-7303921.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', count: 142, color: 'bg-teal-50' },
  { id: 'cleaning', name: 'Cleaning', image: 'https://images.pexels.com/photos/5217889/pexels-photo-5217889.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', count: 88, color: 'bg-emerald-50' },
  { id: 'household', name: 'Household', image: 'https://images.pexels.com/photos/21582448/pexels-photo-21582448.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', count: 67, color: 'bg-indigo-50' },
  { id: 'bakery', name: 'Bakery', image: 'https://images.pexels.com/photos/5657400/pexels-photo-5657400.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', count: 54, color: 'bg-yellow-50' },
];

export const products: Product[] = [
  {
    id: 'p1', brand: 'Fortune', name: 'Sunflower Oil', packSize: '1 L', mrp: 145, price: 128,
    image: 'https://images.pexels.com/photos/31275834/pexels-photo-31275834.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    category: 'oil', moq: 6, rating: 4.5, inStock: true,
    description: 'Refined sunflower oil with Vitamin A & D. Ideal for daily cooking across commercial kitchens. Light, odorless and rich in polyunsaturates.',
  },
  {
    id: 'p2', brand: 'Aashirvaad', name: 'Whole Wheat Atta', packSize: '5 kg', mrp: 320, price: 289,
    image: 'https://images.pexels.com/photos/6294374/pexels-photo-6294374.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    category: 'atta', moq: 4, rating: 4.7, inStock: true,
    description: '100% whole wheat atta ground using traditional chakki method for soft, fluffy rotis. No maida added. Sourced from premium wheat grains.',
  },
  {
    id: 'p3', brand: 'India Gate', name: 'Basmati Rice', packSize: '5 kg', mrp: 620, price: 549,
    image: 'https://images.pexels.com/photos/13788549/pexels-photo-13788549.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    category: 'rice', moq: 3, rating: 4.8, inStock: true,
    description: 'Premium long-grain aged basmati rice. Aged for 24 months for enhanced aroma and elongation. Perfect for biryani and pulao preparations.',
  },
  {
    id: 'p4', brand: 'Tata', name: 'Toor Dal', packSize: '1 kg', mrp: 165, price: 142,
    image: 'https://images.pexels.com/photos/14177776/pexels-photo-14177776.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    category: 'pulses', moq: 8, rating: 4.4, inStock: true,
    description: 'Unpolished toor dal rich in protein and dietary fiber. Sortex cleaned and hygienically packed. No artificial polishing agents.',
  },
  {
    id: 'p5', brand: 'Parle-G', name: 'Glucose Biscuits', packSize: '800 g', mrp: 80, price: 68,
    image: 'https://images.pexels.com/photos/7509697/pexels-photo-7509697.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    category: 'biscuits', moq: 12, rating: 4.6, inStock: true,
    description: 'Classic glucose biscuits enriched with wheat, milk and glucose. A staple tea-time snack. Long shelf life, ideal for bulk stocking.',
  },
  {
    id: 'p6', brand: 'Lay\'s', name: 'Classic Salted Chips', packSize: '52 g', mrp: 20, price: 16,
    image: 'https://images.pexels.com/photos/13060681/pexels-photo-13060681.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    category: 'snacks', moq: 24, rating: 4.3, inStock: true,
    description: 'Crispy potato chips with classic salted flavor. Thin-sliced and perfectly crunchy. Best-seller for retail and canteen supply.',
  },
  {
    id: 'p7', brand: 'Coca-Cola', name: 'Soft Drink', packSize: '750 ml', mrp: 65, price: 52,
    image: 'https://images.pexels.com/photos/5497998/pexels-photo-5497998.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    category: 'beverages', moq: 12, rating: 4.5, inStock: true,
    description: 'Refreshing carbonated soft drink with the original Coca-Cola taste. Best served chilled. Pack of 12 bottles for wholesale supply.',
  },
  {
    id: 'p8', brand: 'Amul', name: 'Taaza Toned Milk', packSize: '500 ml', mrp: 27, price: 24,
    image: 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    category: 'dairy', moq: 24, rating: 4.6, inStock: true,
    description: 'Fresh toned milk pasteurized and homogenized. Rich in calcium and protein. Requires refrigeration. Daily delivery available.',
  },
  {
    id: 'p9', brand: 'MDH', name: 'Garam Masala', packSize: '100 g', mrp: 85, price: 72,
    image: 'https://images.pexels.com/photos/31280796/pexels-photo-31280796.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    category: 'spices', moq: 10, rating: 4.7, inStock: true,
    description: 'Authentic blended garam masala made from premium whole spices. Ground and packed hygienically. Adds rich aroma to curries and gravies.',
  },
  {
    id: 'p10', brand: 'Maggi', name: 'Instant Noodles', packSize: '70 g', mrp: 14, price: 11,
    image: 'https://images.pexels.com/photos/23228983/pexels-photo-23228983.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    category: 'instant', moq: 48, rating: 4.5, inStock: true,
    description: '2-minute instant noodles with classic masala tastemaker. A household favorite. Carton of 48 packs ideal for retail and canteen.',
  },
  {
    id: 'p11', brand: 'Colgate', name: 'Strong Teeth Toothpaste', packSize: '200 g', mrp: 145, price: 119,
    image: 'https://images.pexels.com/photos/7622555/pexels-photo-7622555.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    category: 'personal', moq: 12, rating: 4.4, inStock: true,
    description: 'Anti-cavity toothpaste with calcium and fluoride for strong teeth. Fresh mint flavor. Family pack size for wholesale distribution.',
  },
  {
    id: 'p12', brand: 'Surf Excel', name: 'Detergent Powder', packSize: '2 kg', mrp: 380, price: 329,
    image: 'https://images.pexels.com/photos/5217889/pexels-photo-5217889.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    category: 'cleaning', moq: 6, rating: 4.5, inStock: true,
    description: 'Powerful detergent powder that removes tough stains in one wash. Works in both top and front load machines. Bulk pack savings.',
  },
  {
    id: 'p13', brand: 'Saffola', name: 'Active Cooking Oil', packSize: '1 L', mrp: 175, price: 152,
    image: 'https://images.pexels.com/photos/38490934/pexels-photo-38490934.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    category: 'oil', moq: 6, rating: 4.6, inStock: true,
    description: 'Blended rice bran and refined oil with Oryzanol. Heart-friendly cooking oil suitable for daily use. Cholesterol management blend.',
  },
  {
    id: 'p14', brand: 'Pillsbury', name: 'Chakki Fresh Atta', packSize: '10 kg', mrp: 580, price: 499,
    image: 'https://images.pexels.com/photos/6287219/pexels-photo-6287219.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    category: 'atta', moq: 3, rating: 4.5, inStock: true,
    description: 'Stone-ground whole wheat atta retaining natural fiber and nutrients. Makes soft and tasty rotis. Large 10 kg bag for commercial use.',
  },
  {
    id: 'p15', brand: 'Daawat', name: 'Brown Rice', packSize: '5 kg', mrp: 480, price: 419,
    image: 'https://images.pexels.com/photos/3737694/pexels-photo-3737694.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    category: 'rice', moq: 4, rating: 4.3, inStock: true,
    description: 'Nutritious whole grain brown rice rich in fiber and minerals. Unpolished for maximum health benefits. Slightly chewy texture.',
  },
  {
    id: 'p16', brand: 'Patanjali', name: 'Moong Dal', packSize: '1 kg', mrp: 145, price: 122,
    image: 'https://images.pexels.com/photos/6086414/pexels-photo-6086414.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    category: 'pulses', moq: 8, rating: 4.2, inStock: true,
    description: 'Split yellow moong dal, easy to digest and quick to cook. High protein content. Hygienically cleaned and packed for wholesale.',
  },
  {
    id: 'p17', brand: 'Britannia', name: 'Marie Gold Biscuits', packSize: '250 g', mrp: 45, price: 38,
    image: 'https://images.pexels.com/photos/5702698/pexels-photo-5702698.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    category: 'biscuits', moq: 18, rating: 4.4, inStock: true,
    description: 'Tea-time marie biscuits with wheat and milk. Light, crisp and low in sugar. A staple for offices, canteens and retail shelves.',
  },
  {
    id: 'p18', brand: 'Kurkure', name: 'Masala Munch', packSize: '90 g', mrp: 20, price: 16,
    image: 'https://images.pexels.com/photos/7033644/pexels-photo-7033644.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    category: 'snacks', moq: 24, rating: 4.1, inStock: true,
    description: 'Crunchy corn puffs with tangy masala flavor. A popular snack for all ages. Carton pack ideal for retail and vending supply.',
  },
  {
    id: 'p19', brand: 'Pepsi', name: 'Soft Drink Can', packSize: '250 ml', mrp: 40, price: 32,
    image: 'https://images.pexels.com/photos/12690445/pexels-photo-12690445.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    category: 'beverages', moq: 24, rating: 4.2, inStock: true,
    description: 'Chilled cola in a convenient 250 ml can. Perfect for events, canteens and retail. Pack of 24 cans for wholesale pricing.',
  },
  {
    id: 'p20', brand: 'Mother Dairy', name: 'Curd', packSize: '1 kg', mrp: 75, price: 64,
    image: 'https://images.pexels.com/photos/37377279/pexels-photo-37377279.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    category: 'dairy', moq: 12, rating: 4.3, inStock: true,
    description: 'Fresh thick curd set naturally with live cultures. Rich and creamy texture. Requires refrigeration. Best before 3 days of delivery.',
  },
  {
    id: 'p21', brand: 'Everest', name: 'Haldi Powder', packSize: '200 g', mrp: 78, price: 64,
    image: 'https://images.pexels.com/photos/7208238/pexels-photo-7208238.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    category: 'spices', moq: 12, rating: 4.6, inStock: true,
    description: 'Pure turmeric powder with natural curcumin content. Adds golden color and earthy flavor. Hygienically ground and packed.',
  },
  {
    id: 'p22', brand: 'Knorr', name: 'Soup Packet', packSize: '44 g', mrp: 50, price: 42,
    image: 'https://images.pexels.com/photos/7990284/pexels-photo-7990284.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    category: 'instant', moq: 24, rating: 4.0, inStock: true,
    description: 'Instant mixed vegetable soup ready in 3 minutes. Just add hot water. Carton of 24 packets ideal for office and canteen supply.',
  },
  {
    id: 'p23', brand: 'Dove', name: 'Shampoo', packSize: '340 ml', mrp: 320, price: 269,
    image: 'https://images.pexels.com/photos/5629136/pexels-photo-5629136.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    category: 'personal', moq: 12, rating: 4.5, inStock: true,
    description: 'Moisturizing shampoo with 1/4 moisturizing cream for soft, smooth hair. Gentle on scalp. Large bottle for salon and retail.',
  },
  {
    id: 'p24', brand: 'Vim', name: 'Dishwash Bar', packSize: '500 g', mrp: 95, price: 79,
    image: 'https://images.pexels.com/photos/5217896/pexels-photo-5217896.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    category: 'cleaning', moq: 12, rating: 4.3, inStock: true,
    description: 'Powerful dishwash bar with lemon and grease-cutting action. Removes tough stains. Economy pack for commercial kitchen supply.',
  },
  {
    id: 'p25', brand: 'Modern', name: 'Sandwich Bread', packSize: '400 g', mrp: 45, price: 38,
    image: 'https://images.pexels.com/photos/5657400/pexels-photo-5657400.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    category: 'bakery', moq: 18, rating: 4.2, inStock: true,
    description: 'Soft and fluffy sandwich bread baked fresh. Ideal for sandwiches and toast. Best consumed within 3 days. Daily delivery available.',
  },
  {
    id: 'p26', brand: 'Tata', name: 'Salt', packSize: '1 kg', mrp: 28, price: 23,
    image: 'https://images.pexels.com/photos/15268898/pexels-photo-15268898.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    category: 'spices', moq: 24, rating: 4.7, inStock: true,
    description: 'Iodised table salt for everyday cooking. Free-flowing and finely ground. Carton of 24 packs for commercial kitchen supply.',
  },
  {
    id: 'p27', brand: 'Nescafé', name: 'Classic Coffee', packSize: '100 g', mrp: 320, price: 279,
    image: 'https://images.pexels.com/photos/3847479/pexels-photo-3847479.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    category: 'beverages', moq: 12, rating: 4.6, inStock: true,
    description: 'Instant coffee with rich aroma and smooth taste. Soluble granules for quick preparation. Jar pack for office and retail supply.',
  },
  {
    id: 'p28', brand: 'Kellogg\'s', name: 'Corn Flakes', packSize: '875 g', mrp: 385, price: 329,
    image: 'https://images.pexels.com/photos/34338679/pexels-photo-34338679.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    category: 'instant', moq: 8, rating: 4.4, inStock: true,
    description: 'Crunchy corn flakes fortified with 8 vitamins and iron. A quick and nutritious breakfast. Family pack for retail and canteen.',
  },
  {
    id: 'p29', brand: 'Amul', name: 'Pure Ghee', packSize: '1 L', mrp: 720, price: 649,
    image: 'https://images.pexels.com/photos/20689436/pexels-photo-20689436.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    category: 'dairy', moq: 6, rating: 4.8, inStock: true,
    description: 'Pure cow ghee with rich aroma and granular texture. Made from fresh cream. Ideal for cooking and sweets. Premium quality.',
  },
  {
    id: 'p30', brand: 'Cadbury', name: 'Dairy Milk', packSize: '150 g', mrp: 99, price: 82,
    image: 'https://images.pexels.com/photos/14456511/pexels-photo-14456511.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    category: 'snacks', moq: 24, rating: 4.7, inStock: true,
    description: 'Smooth and creamy milk chocolate bar. A timeless favorite for all ages. Carton of 24 bars for retail and event distribution.',
  },
];

export const promoBanners: PromoBanner[] = [
  {
    id: 'b1', headline: 'Bulk Orders, Better Prices', subtext: 'Save up to 25% on wholesale quantities. Minimum order value ₹5,000.',
    cta: 'Order Now', image: 'https://images.pexels.com/photos/33366959/pexels-photo-33366959.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    bgClass: 'bg-gradient-to-br from-brand-700 to-brand-900', textClass: 'text-white', badge: 'WHOLESALE',
  },
  {
    id: 'b2', headline: 'Fresh Grocery Deals', subtext: 'Daily essentials at unbeatable B2B rates. Restock your shelves today.',
    cta: 'Shop Deals', image: 'https://images.pexels.com/photos/37321079/pexels-photo-37321079.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    bgClass: 'bg-gradient-to-br from-accent-500 to-accent-700', textClass: 'text-white', badge: 'FRESH',
  },
  {
    id: 'b3', headline: 'Special Wholesale Offers', subtext: 'Exclusive pricing on bulk packs. Tiered discounts for large orders.',
    cta: 'View Offers', image: 'https://images.pexels.com/photos/38866541/pexels-photo-38866541.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    bgClass: 'bg-gradient-to-br from-ink-800 to-ink-900', textClass: 'text-white', badge: 'EXCLUSIVE',
  },
  {
    id: 'b4', headline: 'Save More on Bulk Purchases', subtext: 'The more you buy, the more you save. Volume-based pricing tiers.',
    cta: 'Explore', image: 'https://images.pexels.com/photos/7363163/pexels-photo-7363163.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    bgClass: 'bg-gradient-to-br from-brand-600 to-brand-800', textClass: 'text-white', badge: 'BULK SAVINGS',
  },
  {
    id: 'b5', headline: 'B2B Exclusive Prices', subtext: 'Registered businesses get additional 5% off on first bulk order.',
    cta: 'Claim Offer', image: 'https://images.pexels.com/photos/35285849/pexels-photo-35285849.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    bgClass: 'bg-gradient-to-br from-accent-600 to-brand-800', textClass: 'text-white', badge: 'NEW BUSINESS',
  },
];

export const orders: Order[] = [
  {
    id: 'o1', orderNo: 'SK-2024-1847', date: 'Aug 8, 2024', itemCount: 12, total: 4287,
    status: 'Delivered', items: ['Fortune Sunflower Oil', 'Aashirvaad Atta', 'India Gate Basmati', 'Tata Toor Dal'],
  },
  {
    id: 'o2', orderNo: 'SK-2024-1846', date: 'Aug 5, 2024', itemCount: 8, total: 2156,
    status: 'Out for Delivery', items: ['Parle-G Biscuits', 'Lay\'s Chips', 'Coca-Cola', 'Maggi Noodles'],
  },
  {
    id: 'o3', orderNo: 'SK-2024-1845', date: 'Aug 3, 2024', itemCount: 24, total: 6890,
    status: 'Processing', items: ['Surf Excel Detergent', 'Vim Dishwash', 'Colgate Toothpaste', 'Dove Shampoo'],
  },
  {
    id: 'o4', orderNo: 'SK-2024-1844', date: 'Jul 30, 2024', itemCount: 6, total: 1840,
    status: 'Delivered', items: ['Amul Ghee', 'Mother Dairy Curd', 'Modern Bread', 'Saffola Oil'],
  },
  {
    id: 'o5', orderNo: 'SK-2024-1843', date: 'Jul 28, 2024', itemCount: 15, total: 3420,
    status: 'Cancelled', items: ['Kellogg\'s Corn Flakes', 'Nescafé Coffee', 'Cadbury Dairy Milk'],
  },
  {
    id: 'o6', orderNo: 'SK-2024-1842', date: 'Jul 25, 2024', itemCount: 18, total: 5240,
    status: 'Delivered', items: ['MDH Garam Masala', 'Everest Haldi', 'Tata Salt', 'Knorr Soup'],
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(categoryId: string): Product[] {
  return products.filter((p) => p.category === categoryId);
}

export function getRelatedProducts(product: Product, count = 6): Product[] {
  return products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, count);
}
