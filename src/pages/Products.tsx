import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface SearchTreeNode {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parentId?: number;
  children?: SearchTreeNode[];
}

interface Characteristic {
  id?: number;
  name: string;
  value: string;
}

interface ProductImage {
  id?: number;
  url: string;
}

interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  characteristics: Characteristic[];
  images: ProductImage[];
  searchTreeId?: number | null;
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Форма для нового товару
  const [newProduct, setNewProduct] = useState<Product>({
    name: '',
    description: '',
    price: 0,
    characteristics: [],
    images: [],
    searchTreeId: null
  });
  
  // Стан для дерева пошуку
  const [searchTreeNodes, setSearchTreeNodes] = useState<SearchTreeNode[]>([]);
  const [loadingSearchTree, setLoadingSearchTree] = useState<boolean>(false);
  
  // Тимчасове поле для нової характеристики
  const [newCharacteristic, setNewCharacteristic] = useState<Characteristic>({
    name: '',
    value: ''
  });
  
  // Тимчасове поле для нового зображення
  const [newImageUrl, setNewImageUrl] = useState<string>('');
  
  // Завантаження списку товарів
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/api/products');
      setProducts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Помилка при завантаженні товарів');
    } finally {
      setLoading(false);
    }
  };

  // Завантаження дерева пошуку
  const fetchSearchTree = async () => {
    try {
      setLoadingSearchTree(true);
      const response = await axios.get('http://localhost:3000/api/search-tree/tree/root');
      setSearchTreeNodes(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching search tree:', error);
      toast.error('Помилка при завантаженні дерева пошуку');
    } finally {
      setLoadingSearchTree(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchSearchTree();
  }, []);
  
  // Додавання нової характеристики до форми
  const addCharacteristic = () => {
    if (newCharacteristic.name && newCharacteristic.value) {
      if (editingProduct) {
        setEditingProduct({
          ...editingProduct,
          characteristics: [...editingProduct.characteristics, { ...newCharacteristic }]
        });
      } else {
        setNewProduct({
          ...newProduct,
          characteristics: [...newProduct.characteristics, { ...newCharacteristic }]
        });
      }
      setNewCharacteristic({ name: '', value: '' });
    }
  };
  
  // Видалення характеристики
  const removeCharacteristic = (index: number) => {
    if (editingProduct) {
      const updatedCharacteristics = [...editingProduct.characteristics];
      updatedCharacteristics.splice(index, 1);
      setEditingProduct({
        ...editingProduct,
        characteristics: updatedCharacteristics
      });
    } else {
      const updatedCharacteristics = [...newProduct.characteristics];
      updatedCharacteristics.splice(index, 1);
      setNewProduct({
        ...newProduct,
        characteristics: updatedCharacteristics
      });
    }
  };
  
  // Додавання нового зображення
  const addImage = () => {
    if (newImageUrl) {
      if (editingProduct) {
        if (editingProduct.images.length < 5) {
          setEditingProduct({
            ...editingProduct,
            images: [...editingProduct.images, { url: newImageUrl }]
          });
        } else {
          toast.error('Максимальна кількість зображень - 5');
        }
      } else {
        if (newProduct.images.length < 5) {
          setNewProduct({
            ...newProduct,
            images: [...newProduct.images, { url: newImageUrl }]
          });
        } else {
          toast.error('Максимальна кількість зображень - 5');
        }
      }
      setNewImageUrl('');
    }
  };
  
  // Видалення зображення
  const removeImage = (index: number) => {
    if (editingProduct) {
      const updatedImages = [...editingProduct.images];
      updatedImages.splice(index, 1);
      setEditingProduct({
        ...editingProduct,
        images: updatedImages
      });
    } else {
      const updatedImages = [...newProduct.images];
      updatedImages.splice(index, 1);
      setNewProduct({
        ...newProduct,
        images: updatedImages
      });
    }
  };
  
  // Збереження товару (створення або оновлення)
  const saveProduct = async () => {
    try {
      const productToSave = editingProduct || newProduct;
      
      if (!productToSave.name) {
        toast.error('Назва товару обов\'язкова');
        return;
      }
      
      // Переконуємося, що ціна є числом
      const productData = {
        ...productToSave,
        price: Number(productToSave.price)
      };
      
      if (editingProduct && editingProduct.id) {
        // Оновлення існуючого товару
        await axios.put(`http://localhost:3000/api/products/${editingProduct.id}`, productData);
        toast.success('Товар успішно оновлено');
      } else {
        // Створення нового товару
        await axios.post('http://localhost:3000/api/products', productData);
        toast.success('Товар успішно створено');
      }
      
      // Скидання форми і оновлення списку
      setShowForm(false);
      setEditingProduct(null);
      setNewProduct({
        name: '',
        description: '',
        price: 0,
        characteristics: [],
        images: [],
        searchTreeId: null
      });
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Помилка при збереженні товару');
    }
  };
  
  // Редагування товару
  const editProduct = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };
  
  // Копіювання товару
  const duplicateProduct = (product: Product) => {
    const duplicatedProduct = {
      ...product,
      id: undefined,
      name: `${product.name} (копія)`,
      characteristics: [...product.characteristics],
      images: [...product.images]
    };
    setEditingProduct(duplicatedProduct);
    setShowForm(true);
  };
  
  // Видалення товару
  const deleteProduct = async (id: number) => {
    if (window.confirm('Ви впевнені, що хочете видалити цей товар?')) {
      try {
        await axios.delete(`http://localhost:3000/api/products/${id}`);
        toast.success('Товар успішно видалено');
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Помилка при видаленні товару');
      }
    }
  };
  
  // Отримання назви вузла дерева пошуку за ID
  const getSearchTreeNodeName = (nodeId: number): string => {
    const findNodeName = (nodes: SearchTreeNode[]): string => {
      for (const node of nodes) {
        if (node.id === nodeId) {
          return node.name;
        }
        if (node.children && node.children.length > 0) {
          const childName = findNodeName(node.children);
          if (childName) return childName;
        }
      }
      return '';
    };
    
    return findNodeName(searchTreeNodes) || 'Невідома категорія';
  };

  // Рендеринг опцій дерева пошуку
  const renderSearchTreeOptions = (nodes: SearchTreeNode[], level: number = 0): JSX.Element[] => {
    const options: JSX.Element[] = [];
    
    nodes.forEach(node => {
      const indent = '—'.repeat(level);
      options.push(
        <option key={node.id} value={node.id}>
          {indent} {node.name}
        </option>
      );
      
      if (node.children && node.children.length > 0) {
        options.push(...renderSearchTreeOptions(node.children, level + 1));
      }
    });
    
    return options;
  };

  // Завантаження файлу зображення
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const formData = new FormData();
    formData.append('image', files[0]);
    
    try {
      const response = await axios.post('http://localhost:3000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setNewImageUrl(response.data.url);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Помилка при завантаженні зображення');
    }
  };
  
  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Управління товарами</h1>
        <button 
          onClick={() => {
            setEditingProduct(null);
            setShowForm(!showForm);
            setNewProduct({
              name: '',
              description: '',
              price: 0,
              characteristics: [],
              images: [],
              searchTreeId: null
            });
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          {showForm && !editingProduct ? 'Скасувати' : 'Додати товар'}
        </button>
      </div>
      
      {/* Форма для додавання/редагування товару */}
      {showForm && (
        <div className="bg-white p-6 rounded shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingProduct ? 'Редагувати товар' : 'Додати новий товар'}
          </h2>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Назва товару</label>
            <input
              type="text"
              value={editingProduct ? (editingProduct.name || '') : (newProduct.name || '')}
              onChange={(e) => 
                editingProduct 
                  ? setEditingProduct({...editingProduct, name: e.target.value})
                  : setNewProduct({...newProduct, name: e.target.value})
              }
              className="w-full p-2 border rounded"
              placeholder="Введіть назву товару"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Опис товару</label>
            <textarea
              value={editingProduct ? (editingProduct.description || '') : (newProduct.description || '')}
              onChange={(e) => 
                editingProduct 
                  ? setEditingProduct({...editingProduct, description: e.target.value})
                  : setNewProduct({...newProduct, description: e.target.value})
              }
              className="w-full p-2 border rounded"
              rows={4}
              placeholder="Введіть опис товару"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Ціна</label>
            <input
              type="number"
              value={editingProduct ? (editingProduct.price || 0) : (newProduct.price || 0)}
              onChange={(e) => {
                const price = parseFloat(e.target.value) || 0;
                editingProduct 
                  ? setEditingProduct({...editingProduct, price})
                  : setNewProduct({...newProduct, price});
              }}
              className="w-full p-2 border rounded"
              placeholder="Введіть ціну"
              min="0"
              step="0.01"
            />
          </div>
          
          {/* Дерево пошуку */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Категорія дерева пошуку</label>
            <select
              value={editingProduct ? (editingProduct.searchTreeId ?? '') : (newProduct.searchTreeId ?? '')}
              onChange={(e) => {
                const searchTreeId = e.target.value ? parseInt(e.target.value) : null;
                editingProduct 
                  ? setEditingProduct({...editingProduct, searchTreeId})
                  : setNewProduct({...newProduct, searchTreeId});
              }}
              className="w-full p-2 border rounded"
            >
              <option value="">Оберіть категорію (необов'язково)</option>
              {renderSearchTreeOptions(searchTreeNodes)}
            </select>
            {loadingSearchTree && (
              <p className="text-sm text-gray-500 mt-1">Завантаження дерева пошуку...</p>
            )}
          </div>
          
          {/* Характеристики товару */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Характеристики</label>
            
            <div className="mb-2">
              {(editingProduct ? editingProduct.characteristics : newProduct.characteristics).map((char, index) => (
                <div key={char.id || `edit-char-${index}`} className="flex items-center mb-2">
                  <div className="flex-1 bg-gray-100 p-2 rounded">
                    <strong>{char.name}:</strong> {char.value}
                  </div>
                  <button
                    onClick={() => removeCharacteristic(index)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    Видалити
                  </button>
                </div>
              ))}
            </div>
            
            <div className="flex space-x-2">
              <input
                type="text"
                value={newCharacteristic.name}
                onChange={(e) => setNewCharacteristic({...newCharacteristic, name: e.target.value})}
                className="flex-1 p-2 border rounded"
                placeholder="Назва характеристики"
              />
              <input
                type="text"
                value={newCharacteristic.value}
                onChange={(e) => setNewCharacteristic({...newCharacteristic, value: e.target.value})}
                className="flex-1 p-2 border rounded"
                placeholder="Значення характеристики"
              />
              <button
                onClick={addCharacteristic}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                Додати
              </button>
            </div>
          </div>
          
          {/* Зображення товару */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Зображення (максимум 5)</label>
            
            <div className="grid grid-cols-5 gap-4 mb-2">
              {(editingProduct ? editingProduct.images : newProduct.images).map((img, index) => (
                <div key={img.id || `edit-img-${index}`} className="relative">
                  <img src={img.url} alt={`Product ${index}`} className="w-full h-32 object-cover rounded" />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            
            <div className="flex space-x-2">
              <input
                type="text"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="flex-1 p-2 border rounded"
                placeholder="URL зображення"
              />
              <button
                onClick={addImage}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                disabled={(editingProduct ? editingProduct.images.length : newProduct.images.length) >= 5}
              >
                Додати URL
              </button>
            </div>
            
            <div className="mt-2">
              <label className="block text-gray-700 mb-2">Або завантажте файл:</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={() => {
                setShowForm(false);
                setEditingProduct(null);
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded mr-2"
            >
              Скасувати
            </button>
            <button
              onClick={saveProduct}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              {editingProduct ? 'Оновити товар' : 'Створити товар'}
            </button>
          </div>
        </div>
      )}
      
      {/* Список товарів */}
      {loading ? (
        <div className="text-center py-4">Завантаження...</div>
      ) : (
        <div className="bg-white rounded shadow-md overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">ID</th>
                <th className="py-2 px-4 text-left">Назва</th>
                <th className="py-2 px-4 text-left">Ціна</th>
                <th className="py-2 px-4 text-left">Категорія</th>
                <th className="py-2 px-4 text-left">Характеристики</th>
                <th className="py-2 px-4 text-left">Зображення</th>
                <th className="py-2 px-4 text-left">Дії</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4">Немає товарів</td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="border-t">
                    <td className="py-2 px-4">{product.id}</td>
                    <td className="py-2 px-4">{product.name}</td>
                    <td className="py-2 px-4">{product.price} грн</td>
                    <td className="py-2 px-4">
                      {product.searchTreeId ? (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                          {getSearchTreeNodeName(product.searchTreeId)}
                        </span>
                      ) : (
                        <span className="text-gray-500">Без категорії</span>
                      )}
                    </td>
                    <td className="py-2 px-4">
                      {product.characteristics && product.characteristics.length > 0 ? (
                        <ul className="list-disc pl-4">
                          {product.characteristics.map((char, index) => (
                            <li key={char.id || `char-${index}`}>
                              {char.name}: {char.value}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-gray-500">Немає характеристик</span>
                      )}
                    </td>
                    <td className="py-2 px-4">
                      {product.images && product.images.length > 0 ? (
                        <div className="flex space-x-1">
                          {product.images.map((img, index) => (
                            <img 
                              key={img.id || `img-${index}`} 
                              src={img.url} 
                              alt={`${product.name} ${index}`} 
                              className="w-10 h-10 object-cover rounded"
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500">Немає зображень</span>
                      )}
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => editProduct(product)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          Редагувати
                        </button>
                        <button
                          onClick={() => duplicateProduct(product)}
                          className="text-green-500 hover:text-green-700"
                        >
                          Копіювати
                        </button>
                        <button
                          onClick={() => product.id && deleteProduct(product.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Видалити
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Products;