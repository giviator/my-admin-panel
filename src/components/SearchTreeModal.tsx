import React, { useState, useEffect } from 'react';
import { FiX, FiFolder } from 'react-icons/fi';

interface SearchTreeNode {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parentId?: number;
  children?: SearchTreeNode[];
  _count?: {
    products: number;
  };
}

interface SearchTreeModalProps {
  tree: SearchTreeNode | null;
  onClose: () => void;
  onSuccess: () => void;
}

const SearchTreeModal: React.FC<SearchTreeModalProps> = ({ tree, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    parentId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableParents, setAvailableParents] = useState<SearchTreeNode[]>([]);

  const isEditing = tree && !tree.parentId;
  const isCreatingChild = tree && tree.parentId;

  useEffect(() => {
    if (tree && !isCreatingChild) {
      setFormData({
        name: tree.name || '',
        description: tree.description || '',
        icon: tree.icon || '',
        parentId: tree.parentId?.toString() || ''
      });
    } else if (isCreatingChild) {
      setFormData({
        name: '',
        description: '',
        icon: '',
        parentId: tree.id.toString()
      });
    }

    fetchAvailableParents();
  }, [tree, isCreatingChild]);

  const fetchAvailableParents = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/search-tree/tree/root');
      if (!response.ok) {
        throw new Error('Failed to fetch available parents');
      }
      const data = await response.json();
      
      // Фільтруємо, щоб не показувати поточний елемент як батьківський (для редагування)
      const filtered = tree && !isCreatingChild 
        ? data.filter((item: SearchTreeNode) => item.id !== tree.id)
        : data;
      
      setAvailableParents(filtered);
    } catch (err) {
      console.error('Error fetching parents:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value.trim().replace(/[`'"]/g, '')
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const submitData = {
        name: formData.name,
        description: formData.description || undefined,
        icon: formData.icon || undefined,
        parentId: formData.parentId ? parseInt(formData.parentId) : undefined
      };

      const url = tree && !isCreatingChild 
        ? `http://localhost:3000/api/search-tree/${tree.id}`
        : 'http://localhost:3000/api/search-tree';
      
      const method = tree && !isCreatingChild ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save search tree');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderParentOptions = (nodes: SearchTreeNode[], level: number = 0): JSX.Element[] => {
    const options: JSX.Element[] = [];
    
    nodes.forEach(node => {
      const indent = '—'.repeat(level);
      options.push(
        <option key={node.id} value={node.id}>
          {indent} {node.name}
        </option>
      );
      
      if (node.children && node.children.length > 0) {
        options.push(...renderParentOptions(node.children, level + 1));
      }
    });
    
    return options;
  };

  const getModalTitle = () => {
    if (isCreatingChild) {
      return `Додати підкатегорію до "${tree?.name}"`;
    }
    return isEditing ? 'Редагувати категорію' : 'Створити нову категорію';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {getModalTitle()}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Name */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Назва *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Введіть назву категорії"
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Опис
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Введіть опис категорії (необов'язково)"
            />
          </div>

          {/* Icon */}
          <div className="mb-4">
            <label htmlFor="icon" className="block text-sm font-medium text-gray-700 mb-2">
              Іконка (емодзі)
            </label>
            <input
              type="text"
              id="icon"
              name="icon"
              value={formData.icon}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="🏠 (необов'язково)"
              maxLength={2}
            />
          </div>

          {/* Parent Category */}
          {!isCreatingChild && (
            <div className="mb-6">
              <label htmlFor="parentId" className="block text-sm font-medium text-gray-700 mb-2">
                Батьківська категорія
              </label>
              <select
                id="parentId"
                name="parentId"
                value={formData.parentId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Корінь (без батьківської категорії)</option>
                {renderParentOptions(availableParents)}
              </select>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Скасувати
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Збереження...' : (isEditing ? 'Оновити' : 'Створити')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SearchTreeModal;