import React, { useState, useEffect, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import toast from 'react-hot-toast';

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
}

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  category?: Category;
  parentId?: number;
  categories: Category[];
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  category,
  parentId,
  categories
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    imageUrl: '',
    parentId: parentId || null,
    seoTitle: '',
    seoDescription: '',
    seoKeywords: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (category) {
      console.log('Setting form data from category:', category);
      console.log('Category imageUrl:', category.imageUrl);
      setFormData({
        name: category.name || '',
        description: category.description || '',
        image: category.image || '',
        imageUrl: category.imageUrl || '',
        parentId: category.parentId || null,
        seoTitle: category.seoTitle || '',
        seoDescription: category.seoDescription || '',
        seoKeywords: category.seoKeywords || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        image: '',
        imageUrl: '',
        parentId: parentId || null,
        seoTitle: '',
        seoDescription: '',
        seoKeywords: ''
      });
    }
  }, [category, parentId]);

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    try {
      const response = await axios.post('http://localhost:3000/api/upload', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setFormData(prev => ({ ...prev, image: response.data.url }));
      toast.success('Зображення завантажено успішно');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Помилка завантаження зображення');
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1
  });

  const handleDeleteImage = () => {
    setFormData(prev => ({ 
      ...prev, 
      image: '', 
      imageUrl: '' 
    }));
    toast.success('Зображення видалено');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Назва категорії обов\'язкова');
      return;
    }

    setIsSaving(true);
    try {
      const url = category 
        ? `http://localhost:3000/api/categories/${category.id}`
        : 'http://localhost:3000/api/categories';
      
      const method = category ? 'PUT' : 'POST';
      
      // Debug logging to check what data is being sent
      console.log('Submitting category data:', formData);
      console.log('Image URL in formData:', formData.imageUrl);
      
      await axios({
        method,
        url,
        data: formData
      });

      toast.success(category ? 'Категорію оновлено' : 'Категорію створено');
      onSave();
      onClose();
    } catch (error: any) {
      console.error('Error saving category:', error);
      const errorMessage = error.response?.data?.error || 'Помилка збереження категорії';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const flatCategories = useMemo(() => {
    const flattenCategories = (cats: Category[], level = 0, processedIds?: Set<number>): Array<Category & { level: number }> => {
      // Створюємо новий Set тільки для першого виклику (коли processedIds не передано)
      const ids = processedIds || new Set<number>();
      const result: Array<Category & { level: number }> = [];
      
      console.log(`flattenCategories called with ${cats.length} categories at level ${level}`);
      
      if (Array.isArray(cats)) {
        cats.forEach((cat, index) => {
          console.log(`Processing category ${index}: ID=${cat.id}, Name=${cat.name}, Level=${level}`);
          
          if (category && cat.id === category.id) {
            console.log(`Skipping current category: ${cat.id} - ${cat.name}`);
            return; // Не показуємо поточну категорію як батьківську
          }
          
          if (ids.has(cat.id)) {
            console.warn(`Duplicate category ID found: ${cat.id} - ${cat.name}`);
            return; // Пропускаємо дублікати
          }
          
          ids.add(cat.id);
          console.log(`Added category ID ${cat.id} to processed set. Set size: ${ids.size}`);
          
          // Створюємо копію категорії без циклічних посилань
          const cleanCategory = {
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
            image: cat.image,
            imageUrl: cat.imageUrl,
            seoTitle: cat.seoTitle,
            seoDescription: cat.seoDescription,
            seoKeywords: cat.seoKeywords,
            parentId: cat.parentId,
            children: cat.children,
            _count: cat._count
          };
          
          result.push({ ...cleanCategory, level });
          
          if (cat.children && Array.isArray(cat.children) && cat.children.length > 0) {
            console.log(`Processing ${cat.children.length} children for category ${cat.id}`);
            result.push(...flattenCategories(cat.children, level + 1, ids));
          }
        });
      }
      
      console.log(`flattenCategories returning ${result.length} categories`);
      return result;
    };

    console.log('About to flatten categories:', categories);
    const result = flattenCategories(categories);
    console.log('Flattened categories result:', result);
    return result;
  }, [categories, category]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
        {/* Кнопка закриття */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors duration-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          type="button"
          aria-label="Закрити"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pr-8">
            {category ? 'Редагувати категорію' : 'Додати категорію'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Назва */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Назва категорії *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Введіть назву категорії"
                required
              />
            </div>

            {/* Батьківська категорія */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Батьківська категорія
              </label>
              <select
                value={formData.parentId || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  parentId: e.target.value ? Number(e.target.value) : null 
                }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">Без батьківської категорії</option>
                {flatCategories
                  .filter((cat, index, self) => 
                    self.findIndex(c => c.id === cat.id) === index
                  )
                  .map((cat, index) => (
                    <option key={`category-${cat.id}-${cat.level}-${index}`} value={cat.id}>
                      {'—'.repeat(cat.level)} {cat.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Опис */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Опис
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Введіть опис категорії"
              />
            </div>

            {/* Зображення */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Зображення категорії
              </label>
              
              {/* URL зображення */}
              <div className="mb-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL зображення
                </label>
                {formData.imageUrl && (
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Очистити URL
                  </button>
                )}
              </div>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => {
                    const cleanValue = e.target.value.trim().replace(/[`'"]/g, '');
                    console.log('ImageURL input changed:', cleanValue);
                    setFormData(prev => ({ ...prev, imageUrl: cleanValue }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="https://example.com/image.png або https://example.com/image.webp"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Введіть URL зображення (підтримуються формати: .jpg, .jpeg, .png, .gif, .webp) або завантажте файл нижче
                </p>
              </div>

              {/* Завантаження файлу */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Або завантажте файл
                </label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <input {...getInputProps()} />
                  {isUploading ? (
                    <div className="text-blue-600">Завантаження...</div>
                  ) : formData.image ? (
                    <div className="space-y-2">
                      <div className="relative">
                        <img
                          src={`http://localhost:3000${formData.image}`}
                          alt="Preview"
                          className="mx-auto w-24 h-24 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={handleDeleteImage}
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs transition-colors"
                          title="Видалити зображення"
                        >
                          ×
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Клікніть або перетягніть для заміни
                      </p>
                    </div>
                  ) : formData.imageUrl ? (
                    <div className="space-y-2">
                      <div className="relative">
                        <img
                          src={`${formData.imageUrl}${formData.imageUrl.includes('?') ? '&' : '?'}t=${Date.now()}`}
                          alt="Preview"
                          className="mx-auto w-24 h-24 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleDeleteImage}
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs transition-colors"
                          title="Видалити зображення"
                        >
                          ×
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Попередній перегляд з URL
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-gray-400">
                        <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Клікніть або перетягніть зображення сюди
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SEO поля */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                SEO налаштування
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    SEO заголовок
                  </label>
                  <input
                    type="text"
                    value={formData.seoTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="SEO заголовок для Google"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    SEO опис
                  </label>
                  <textarea
                    value={formData.seoDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="SEO опис для Google (до 160 символів)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ключові слова
                  </label>
                  <input
                    type="text"
                    value={formData.seoKeywords}
                    onChange={(e) => setFormData(prev => ({ ...prev, seoKeywords: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="ключове слово 1, ключове слово 2, ключове слово 3"
                  />
                </div>
              </div>
            </div>

            {/* Кнопки */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Скасувати
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? 'Збереження...' : (category ? 'Оновити' : 'Створити')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;