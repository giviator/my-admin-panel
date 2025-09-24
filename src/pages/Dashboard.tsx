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

  useEffect(() => {
    axios.get('http://localhost:3000/api/homepage')
      .then(response => {
        setTitle(response.data.title || 'Default Title');
        setDescription(response.data.description || 'Default Description');
      })
      .catch(() => toast.error('Помилка завантаження homepage'));
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card><LineChart data={chartData} /></Card>
        <Card><Table data={tableData} /></Card>
      </div>
    </div>
  );
};

export default Dashboard;