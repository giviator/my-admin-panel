import React, { useState } from 'react';
import { PlusIcon, ChevronDownIcon, ChevronUpIcon, TrashBinIcon, PencilIcon, AngleRightIcon } from '../icons';

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  imageUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  parentId?: number;
  children?: Category[];
  _count?: {
    products: number;
    children: number;
  };
}

interface CategoryTreeProps {
  categories: Category[];
  onAddCategory: (parentId?: number) => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: number) => void;
  level?: number;
}

const CategoryTree: React.FC<CategoryTreeProps> = ({
  categories,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  level = 0
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  const toggleExpanded = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const getIndentClass = (level: number) => {
    const indentMap = {
      0: 'pl-0',
      1: 'pl-6',
      2: 'pl-12',
      3: 'pl-18',
    };
    return indentMap[level as keyof typeof indentMap] || 'pl-24';
  };

  return (
    <div className="space-y-1">
      {categories.map((category) => {
        const isExpanded = expandedCategories.has(category.id);
        const hasChildren = category.children && category.children.length > 0;

        return (
          <div key={category.id} className="border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className={`flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 ${getIndentClass(level)}`}>
              <div className="flex items-center space-x-3 flex-1">
                {hasChildren ? (
                  <button
                    onClick={() => toggleExpanded(category.id)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  >
                    {isExpanded ? (
                <ChevronDownIcon className="w-4 h-4" />
              ) : (
                <AngleRightIcon className="w-4 h-4" />
              )}
                  </button>
                ) : (
                  <div className="w-6 h-6" />
                )}

                {(category.imageUrl || category.image) && (
                  <img
                    key={`${category.id}-${category.imageUrl || category.image}-${Date.now()}`}
                    src={
                      category.imageUrl 
                        ? `${category.imageUrl}${category.imageUrl.includes('?') ? '&' : '?'}t=${Date.now()}`
                        : `http://localhost:3000${category.image}`
                    }
                    alt={category.name}
                    className="w-8 h-8 object-cover rounded"
                    onError={(e) => {
                      // Fallback to image field if imageUrl fails
                      const target = e.target as HTMLImageElement;
                      if (category.image && category.imageUrl && !target.src.includes(`http://localhost:3000${category.image}`)) {
                        target.src = `http://localhost:3000${category.image}`;
                      } else {
                        // Hide image if both fail
                        target.style.display = 'none';
                      }
                    }}
                  />
                )}

                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {category.description}
                    </p>
                  )}
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Товарів: {category._count?.products || 0}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Підкатегорій: {category._count?.children || 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onAddCategory(category.id)}
                  className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded-lg transition-colors"
                  title="Додати підкатегорію"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onEditCategory(category)}
                  className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                  title="Редагувати"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteCategory(category.id)}
                  className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                  title="Видалити"
                >
                  <TrashBinIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {isExpanded && hasChildren && (
              <div className="border-t border-gray-200 dark:border-gray-700">
                <CategoryTree
                  categories={category.children!}
                  onAddCategory={onAddCategory}
                  onEditCategory={onEditCategory}
                  onDeleteCategory={onDeleteCategory}
                  level={level + 1}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CategoryTree;