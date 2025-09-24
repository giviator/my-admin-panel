import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const app = express();
const prisma = new PrismaClient();

// Створюємо директорію для завантажень, якщо вона не існує
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Налаштування multer для завантаження файлів
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

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
    const products = await prisma.product.findMany({
      include: {
        characteristics: true,
        images: true
      }
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Створення нового продукту
app.post('/api/products', async (req, res) => {
  const { name, price, description, characteristics, images, searchTreeId } = req.body;
  try {
    const productData = {
      name,
      price,
      characteristics: {
        create: characteristics.map(char => ({
          name: char.name,
          value: char.value
        }))
      },
      images: {
        create: images.map(img => ({
          url: img.url
        }))
      }
    };
    
    // Додаємо description тільки якщо воно існує
    if (description) {
      productData.description = description;
    }
    
    // Додаємо searchTreeId (може бути null для очищення категорії)
    productData.searchTreeId = searchTreeId || null;
    
    const product = await prisma.product.create({
      data: productData,
      include: {
        characteristics: true,
        images: true
      }
    });
    res.json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Отримання продукту за ID
app.get('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: {
        characteristics: true,
        images: true
      }
    });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Оновлення продукту
app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const { name, price, description, characteristics, images, searchTreeId } = req.body;
  try {
    // Видаляємо існуючі характеристики та зображення
    await prisma.productCharacteristic.deleteMany({
      where: { productId: Number(id) }
    });
    await prisma.productImage.deleteMany({
      where: { productId: Number(id) }
    });

    // Оновлюємо продукт з новими даними
    const productData = {
      name,
      price,
      characteristics: {
        create: characteristics.map(char => ({
          name: char.name,
          value: char.value
        }))
      },
      images: {
        create: images.map(img => ({
          url: img.url
        }))
      }
    };
    
    // Додаємо description тільки якщо воно існує
    if (description) {
      productData.description = description;
    }
    
    // Додаємо searchTreeId (може бути null для очищення категорії)
    productData.searchTreeId = searchTreeId || null;
    
    const product = await prisma.product.update({
      where: { id: Number(id) },
      data: productData,
      include: {
        characteristics: true,
        images: true
      }
    });
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Видалення продукту
app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Видаляємо пов'язані характеристики та зображення
    await prisma.productCharacteristic.deleteMany({
      where: { productId: Number(id) }
    });
    await prisma.productImage.deleteMany({
      where: { productId: Number(id) }
    });
    
    // Видаляємо сам продукт
    await prisma.product.delete({
      where: { id: Number(id) }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Ендпоінт для завантаження зображень
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ url: imageUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// ===== CATEGORIES API =====

// Отримання всіх категорій з деревом
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        children: {
          include: {
            children: {
              include: {
                children: true // Підтримка до 4 рівнів вкладеності
              }
            }
          }
        },
        parent: true,
        _count: {
          select: {
            products: true,
            children: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Отримання категорії за ID
app.get('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const category = await prisma.category.findUnique({
      where: { id: Number(id) },
      include: {
        children: true,
        parent: true,
        products: {
          include: {
            images: true,
            characteristics: true
          }
        },
        _count: {
          select: {
            products: true,
            children: true
          }
        }
      }
    });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// Створення нової категорії
app.post('/api/categories', async (req, res) => {
  const { name, description, image, imageUrl, parentId, seoTitle, seoDescription, seoKeywords } = req.body;
  try {
    // Генеруємо slug з назви (підтримка українських символів)
    let slug = name.toLowerCase()
      .replace(/[^a-z0-9а-яёії\s-]/gi, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    // Якщо slug порожній, використовуємо транслітерацію
    if (!slug) {
      const translitMap = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'є': 'ye', 'ж': 'zh', 'з': 'z',
        'и': 'y', 'і': 'i', 'ї': 'yi', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
        'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch',
        'ш': 'sh', 'щ': 'shch', 'ь': '', 'ю': 'yu', 'я': 'ya', "'": ''
      };
      slug = name.toLowerCase()
        .split('')
        .map(char => translitMap[char] || char)
        .join('')
        .replace(/[^a-z0-9\s-]/gi, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
    
    const categoryData = {
      name,
      slug,
      description,
      image,
      imageUrl,
      seoTitle,
      seoDescription,
      seoKeywords
    };
    
    if (parentId) {
      categoryData.parentId = Number(parentId);
    }
    
    const category = await prisma.category.create({
      data: categoryData,
      include: {
        children: true,
        parent: true,
        _count: {
          select: {
            products: true,
            children: true
          }
        }
      }
    });
    res.json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Category with this name already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create category' });
    }
  }
});

// Оновлення категорії
app.put('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, image, imageUrl, parentId, seoTitle, seoDescription, seoKeywords } = req.body;
  
  // Debug logging to check what data is received
  console.log('=== CATEGORY UPDATE REQUEST ===');
  console.log('Updating category ID:', id);
  console.log('Received data:', JSON.stringify(req.body, null, 2));
  console.log('Image URL received:', imageUrl);
  console.log('================================');
  
  try {
    // Генеруємо slug з назви (підтримка українських символів)
    let slug = name.toLowerCase()
      .replace(/[^a-z0-9а-яёії\s-]/gi, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    // Якщо slug порожній, використовуємо транслітерацію
    if (!slug) {
      const translitMap = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'є': 'ye', 'ж': 'zh', 'з': 'z',
        'и': 'y', 'і': 'i', 'ї': 'yi', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
        'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch',
        'ш': 'sh', 'щ': 'shch', 'ь': '', 'ю': 'yu', 'я': 'ya', "'": ''
      };
      slug = name.toLowerCase()
        .split('')
        .map(char => translitMap[char] || char)
        .join('')
        .replace(/[^a-z0-9\s-]/gi, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
    
    const categoryData = {
      name,
      slug,
      description,
      image,
      imageUrl,
      seoTitle,
      seoDescription,
      seoKeywords
    };
    
    if (parentId) {
      categoryData.parentId = Number(parentId);
    } else {
      categoryData.parentId = null;
    }
    
    const category = await prisma.category.update({
      where: { id: Number(id) },
      data: categoryData,
      include: {
        children: true,
        parent: true,
        _count: {
          select: {
            products: true,
            children: true
          }
        }
      }
    });
    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Category with this name already exists' });
    } else {
      res.status(500).json({ error: 'Failed to update category' });
    }
  }
});

// Видалення категорії
app.delete('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Перевіряємо чи є дочірні категорії
    const childrenCount = await prisma.category.count({
      where: { parentId: Number(id) }
    });
    
    if (childrenCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category with subcategories. Please delete subcategories first.' 
      });
    }
    
    // Перевіряємо чи є товари в категорії
    const productsCount = await prisma.product.count({
      where: { categoryId: Number(id) }
    });
    
    if (productsCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category with products. Please move or delete products first.' 
      });
    }
    
    await prisma.category.delete({
      where: { id: Number(id) }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// Отримання дерева категорій (тільки батьківські категорії)
app.get('/api/categories/tree/root', async (req, res) => {
  try {
    const rootCategories = await prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: {
            children: {
              include: {
                children: true
              }
            }
          }
        },
        _count: {
          select: {
            products: true,
            children: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    res.json(rootCategories);
  } catch (error) {
    console.error('Error fetching category tree:', error);
    res.status(500).json({ error: 'Failed to fetch category tree' });
  }
});

// ===== SEARCH TREE ENDPOINTS =====

// Отримання всіх елементів дерева пошуку
app.get('/api/search-tree', async (req, res) => {
  try {
    // Отримуємо всі вузли дерева пошуку
    const allNodes = await prisma.searchTree.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(allNodes);
  } catch (error) {
    console.error('Error fetching search trees:', error);
    res.status(500).json({ error: 'Failed to fetch search trees' });
  }
});

// Отримання конкретного елемента дерева пошуку
app.get('/api/search-tree/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const searchTree = await prisma.searchTree.findUnique({
      where: { id: parseInt(id) },
      include: {
        parent: true,
        children: {
          include: {
            children: true,
            _count: {
              select: { products: true }
            }
          }
        },
        products: {
          include: {
            category: true,
            images: true
          }
        },
        _count: {
          select: { products: true }
        }
      }
    });

    if (!searchTree) {
      return res.status(404).json({ error: 'Search tree not found' });
    }

    res.json(searchTree);
  } catch (error) {
    console.error('Error fetching search tree:', error);
    res.status(500).json({ error: 'Failed to fetch search tree' });
  }
});

// Створення нового елемента дерева пошуку
app.post('/api/search-tree', async (req, res) => {
  try {
    const { name, description, icon, parentId } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Генеруємо slug з назви (підтримка українських символів)
    let slug = name.toLowerCase()
      .replace(/[^a-z0-9а-яёії\s-]/gi, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    // Якщо slug порожній, використовуємо транслітерацію
    if (!slug) {
      const translitMap = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'є': 'ye', 'ж': 'zh', 'з': 'z',
        'и': 'y', 'і': 'i', 'ї': 'yi', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
        'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch',
        'ш': 'sh', 'щ': 'shch', 'ь': '', 'ю': 'yu', 'я': 'ya', "'": ''
      };
      slug = name.toLowerCase()
        .split('')
        .map(char => translitMap[char] || char)
        .join('')
        .replace(/[^a-z0-9\s-]/gi, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    const searchTree = await prisma.searchTree.create({
      data: {
        name,
        slug,
        description,
        icon,
        parentId: parentId ? parseInt(parentId) : null
      },
      include: {
        parent: true,
        children: true,
        _count: {
          select: { products: true }
        }
      }
    });

    res.status(201).json(searchTree);
  } catch (error) {
    console.error('Error creating search tree:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Search tree with this slug already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create search tree' });
    }
  }
});

// Оновлення елемента дерева пошуку
app.put('/api/search-tree/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon, parentId } = req.body;

    console.log('=== SEARCH TREE UPDATE REQUEST ===');
    console.log('ID:', id);
    console.log('Request body:', req.body);

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Генеруємо slug з назви (підтримка українських символів)
    let slug = name.toLowerCase()
      .replace(/[^a-z0-9а-яёії\s-]/gi, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    // Якщо slug порожній, використовуємо транслітерацію
    if (!slug) {
      const translitMap = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'є': 'ye', 'ж': 'zh', 'з': 'z',
        'и': 'y', 'і': 'i', 'ї': 'yi', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
        'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch',
        'ш': 'sh', 'щ': 'shch', 'ь': '', 'ю': 'yu', 'я': 'ya', "'": ''
      };
      slug = name.toLowerCase()
        .split('')
        .map(char => translitMap[char] || char)
        .join('')
        .replace(/[^a-z0-9\s-]/gi, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    const searchTree = await prisma.searchTree.update({
      where: { id: parseInt(id) },
      data: {
        name,
        slug,
        description,
        icon,
        parentId: parentId ? parseInt(parentId) : null
      },
      include: {
        parent: true,
        children: true,
        _count: {
          select: { products: true }
        }
      }
    });

    console.log('Updated search tree:', searchTree);
    res.json(searchTree);
  } catch (error) {
    console.error('Error updating search tree:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Search tree with this slug already exists' });
    } else if (error.code === 'P2025') {
      res.status(404).json({ error: 'Search tree not found' });
    } else {
      res.status(500).json({ error: 'Failed to update search tree' });
    }
  }
});

// Видалення елемента дерева пошуку
app.delete('/api/search-tree/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Перевіряємо, чи є дочірні елементи
    const childrenCount = await prisma.searchTree.count({
      where: { parentId: parseInt(id) }
    });

    if (childrenCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete search tree with children. Please delete children first.' 
      });
    }

    // Перевіряємо, чи є прив\'язані товари
    const productsCount = await prisma.product.count({
      where: { searchTreeId: parseInt(id) }
    });

    if (productsCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete search tree with assigned products. Please reassign products first.' 
      });
    }

    await prisma.searchTree.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Search tree deleted successfully' });
  } catch (error) {
    console.error('Error deleting search tree:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Search tree not found' });
    } else {
      res.status(500).json({ error: 'Failed to delete search tree' });
    }
  }
});

// Отримання кореневих елементів дерева пошуку
app.get('/api/search-tree/tree/root', async (req, res) => {
  try {
    const rootSearchTrees = await prisma.searchTree.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: {
            children: {
              include: {
                children: true
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.json(rootSearchTrees);
  } catch (error) {
    console.error('Error fetching root search trees:', error);
    res.status(500).json({ error: 'Failed to fetch root search trees' });
  }
});

// Отримання товарів за вузлом дерева пошуку
app.get('/api/search-tree/:id/products', async (req, res) => {
  try {
    const { id } = req.params;
    const nodeId = parseInt(id);
    
    // Рекурсивна функція для отримання всіх дочірніх вузлів
    async function getAllChildNodes(parentId) {
      const children = await prisma.searchTree.findMany({
        where: { parentId: parentId }
      });
      
      let allNodes = [parentId];
      for (const child of children) {
        const childNodes = await getAllChildNodes(child.id);
        allNodes = allNodes.concat(childNodes);
      }
      
      return allNodes;
    }
    
    // Отримуємо всі вузли (поточний + всі дочірні)
    const allNodeIds = await getAllChildNodes(nodeId);
    
    // Отримуємо товари, що належать до цього вузла та всіх його дочірніх вузлів
    const products = await prisma.product.findMany({
      where: { 
        searchTreeId: {
          in: allNodeIds
        }
      },
      include: {
        category: true,
        images: true,
        characteristics: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(products);
  } catch (error) {
    console.error('Error fetching products by search tree node:', error);
    res.status(500).json({ error: 'Failed to fetch products by search tree node' });
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});