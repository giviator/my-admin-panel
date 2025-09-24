import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    axios.get('https://trea-jiuf197lc-givis-projects-8ac5d93b.vercel.app/api/homepage')
      .then(response => {
        setTitle(response.data.title);
        setDescription(response.data.description);
      })
      .catch(error => {
        console.error('Error fetching homepage data:', error);
      });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="mt-4">{description}</p>
    </div>
  );
}

export default App;