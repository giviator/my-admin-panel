import React, { useState, useEffect } from 'react';
import CategoryTree from '../../components/CategoryTree';
import CategoryModal from '../../components/CategoryModal';

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

const Catalogs: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [parentCategory, setParentCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Завантаження категорій
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        console.error('Помилка завантаження категорій');
      }
    } catch (error) {
      console.error('Помилка:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Обробники подій
  const handleAddCategory = (parent?: Category) => {
    setParentCategory(parent || null);
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setParentCategory(null);
    setIsModalOpen(true);
  };

  const handleDeleteCategory = async (category: Category) => {
    if (window.confirm(`Ви впевнені, що хочете видалити категорію "${category.name}"?`)) {
      try {
        const response = await fetch(`/api/categories/${category.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          await fetchCategories(); // Перезавантажуємо список
        } else {
          const error = await response.json();
          alert(`Помилка видалення: ${error.error}`);
        }
      } catch (error) {
        console.error('Помилка видалення:', error);
        alert('Помилка видалення категорії');
      }
    }
  };

  const handleSaveCategory = async () => {
    await fetchCategories(); // Перезавантажуємо список після збереження
    setRefreshKey(prev => prev + 1); // Примусово оновлюємо компонент
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="mb-6 flex justify-between items-center">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          Управління каталогами
        </h4>
        <button
          onClick={() => handleAddCategory()}
          className="inline-flex items-center justify-center rounded-md bg-blue-600 py-2 px-4 text-center font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Додати головну категорію
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-500">Завантаження...</div>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            Категорії не знайдено. Додайте першу категорію.
          </div>
          <button
            onClick={() => handleAddCategory()}
            className="inline-flex items-center justify-center rounded-md bg-blue-600 py-3 px-6 text-center font-medium text-white hover:bg-blue-700 transition-all"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Створити першу категорію
          </button>
        </div>
      ) : (
        <CategoryTree
          key={refreshKey}
          categories={categories}
          onAddCategory={handleAddCategory}
          onEditCategory={handleEditCategory}
          onDeleteCategory={handleDeleteCategory}
        />
      )}

      {isModalOpen && (
        <CategoryModal
          isOpen={isModalOpen}
          category={editingCategory}
          parentId={parentCategory?.id}
          categories={categories}
          onSave={handleSaveCategory}
          onClose={() => {
            setIsModalOpen(false);
            setEditingCategory(null);
            setParentCategory(null);
          }}
        />
      )}
    </div>
  );
};

export default Catalogs;