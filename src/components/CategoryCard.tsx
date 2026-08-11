import type { Category } from '@/types';

interface CategoryCardProps {
  category: Category;
  onClick: () => void;
  compact?: boolean;
}

export function CategoryCard({ category, onClick, compact = false }: CategoryCardProps) {
  return (
    <button onClick={onClick} className={`group shrink-0 text-center tap-highlight ${compact ? 'w-[76px]' : 'w-[104px]'}`}>
      <div className={`${category.color} ${compact ? 'h-[68px]' : 'h-[88px]'} rounded-2xl overflow-hidden relative border border-white shadow-card group-active:scale-95 transition-transform`}>
        <img src={category.image} alt={category.name} className="h-full w-full object-cover mix-blend-multiply opacity-85" loading="lazy" />
        <div className="absolute inset-0 bg-white/10" />
      </div>
      <p className={`${compact ? 'text-[10px]' : 'text-[11px]'} font-semibold text-ink-700 mt-1.5 leading-tight line-clamp-2`}>{category.name}</p>
      {!compact && <p className="text-[10px] text-ink-400 mt-0.5">{category.count} items</p>}
    </button>
  );
}

interface CategoryCarouselProps {
  categories: Category[];
  onCategoryClick: (category: Category) => void;
}

export function CategoryCarousel({ categories, onCategoryClick }: CategoryCarouselProps) {
  return (
    <div className="flex gap-3 overflow-x-auto no-scrollbar scroll-touch px-4 pb-1">
      {categories.map((category) => <CategoryCard key={category.id} category={category} onClick={() => onCategoryClick(category)} compact />)}
    </div>
  );
}
