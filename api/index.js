import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// Дозволяємо CORS для фронтенду
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept'],
}));

// Отримання даних головної сторінки
app.get('/api/homepage', async (req, res) => {
  try {
    const homepage = await prisma.homepage.findFirst();
    res.json(homepage || { title: 'Default Title', description: 'Default Description' });
  } catch (error) {
    console.error('Error fetching homepage:', error);
    res.status(500).json({ error: 'Failed to fetch homepage' });
  }
});

// Оновлення даних головної сторінки
app.put('/api/homepage', async (req, res) => {
  const { title, description } = req.body;
  try {
    const homepage = await prisma.homepage.upsert({
      where: { id: 1 },
      update: { title, description },
      create: { title, description },
    });
    res.json(homepage);
  } catch (error) {
    console.error('Error updating homepage:', error);
    res.status(500).json({ error: 'Failed to update homepage' });
  }
});

// Отримання всіх продуктів
app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Створення нового продукту
app.post('/api/products', async (req, res) => {
  const { name, price } = req.body;
  try {
    const product = await prisma.product.create({
      data: { name, price },
    });
    res.json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});