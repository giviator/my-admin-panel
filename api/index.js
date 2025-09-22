import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

// Перевірка підключення до бази даних
async function checkDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('Successfully connected to Neon PostgreSQL');
  } catch (error) {
    console.error('Failed to connect to Neon PostgreSQL:', error);
    process.exit(1); // Завершуємо процес із помилкою
  }
}

// API: Отримати контент
app.get('/api/homepage', async (req, res) => {
  try {
    const homepage = await prisma.homepage.findFirst();
    res.json(homepage || { title: 'Welcome to My Store', description: 'Best products for you!' });
  } catch (error) {
    console.error('Error fetching homepage:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API: Оновити контент
app.put('/api/homepage', async (req, res) => {
  try {
    const { title, description } = req.body;
    const homepage = await prisma.homepage.upsert({
      where: { id: 1 },
      update: { title, description, updatedAt: new Date() },
      create: { id: 1, title, description, updatedAt: new Date() },
    });
    res.json(homepage);
  } catch (error) {
    console.error('Error updating homepage:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Для локального тестування
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  checkDatabaseConnection().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  });
}

export default app;