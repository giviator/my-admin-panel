import React, { useState, useEffect } from 'react';
import LineChart from '../components/charts/LineChart';
import Table from '../components/ui/Table';
import Card from '../components/ui/Card';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const chartData = { series: [{ name: 'Users', data: [10, 41, 35, 51, 49, 62, 69] }], options: {} };
  const tableData = [{ id: 1, name: 'User 1', email: 'user1@example.com' }];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3000/api/homepage')
      .then(response => {
        setTitle(response.data.title || 'Default Title');
        setDescription(response.data.description || 'Default Description');
      })
      .catch(() => toast.error('Помилка завантаження homepage'));

    axios.get('http://localhost:3000/api/products')
      .then(response => setProducts(response.data))
      .catch(() => toast.error('Помилка завантаження продуктів'));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put('http://localhost:3000/api/homepage', { title, description });
      toast.success('Зміни збережено!');
    } catch {
      toast.error('Помилка збереження');
    }
    setLoading(false);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/products', {
        name: productName,
        price: parseFloat(productPrice),
      });
      toast.success('Товар додано!');
      setProductName('');
      setProductPrice('');
      const response = await axios.get('http://localhost:3000/api/products');
      setProducts(response.data);
    } catch {
      toast.error('Помилка додавання товару');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <Card>
        <h2 className="text-xl font-semibold mb-4">Редагувати головну сторінку</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Заголовок</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Введіть заголовок"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Опис</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Введіть опис"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Збереження...' : 'Зберегти'}
          </button>
        </form>
      </Card>
      <Card>
        <h2 className="text-xl font-semibold mb-4">Додати товар</h2>
        <form onSubmit={handleProductSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Назва товару</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Введіть назву товару"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Ціна</label>
            <input
              type="number"
              value={productPrice}
              onChange={(e) => setProductPrice(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Введіть ціну"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Додати товар
          </button>
        </form>
      </Card>
      <Card className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Список товарів</h2>
        {products.length > 0 ? (
          <ul>
            {products.map((product: any) => (
              <li key={product.id} className="py-2">
                <span>{product.name} - ${product.price}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">Немає товарів.</p>
        )}
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card><LineChart data={chartData} /></Card>
        <Card><Table data={tableData} /></Card>
      </div>
    </div>
  );
};

export default Dashboard;