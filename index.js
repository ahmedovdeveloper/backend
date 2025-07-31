const express = require('express');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();
app.use(express.json());
const cors = require('cors');
app.use(cors());

const imageSchema = new mongoose.Schema({
  filename: String,
  path: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const Image = mongoose.model('Image', imageSchema);

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  variant: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  category: { type: String, required: true },
  colors: [{ type: String, required: true }],
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  isNew: { type: Boolean, default: false },
  badge: { type: String },
  createdAt: { type: Date, default: Date.now },
  images: [{ type: String }],
});
const Product = mongoose.model('Product', productSchema);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
connectDB();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    return cb(new Error('Only images (jpeg, jpg, png) are allowed!'), false);
  },
});

// Initial Data
const initialProducts = [
  {
    name: 'H1 Roland',
    variant: 'Black/Black',
    price: 15900,
    originalPrice: 19900,
    category: 'sunglasses',
    colors: ['#000000', '#8B4513', '#1E3A8A'],
    rating: 4.8,
    reviews: 124,
    isNew: true,
    badge: 'Новинка',
    images: ['h1-roland-1.jpg', 'h1-roland-2.jpg'],
  },
  {
    name: 'H3 Hampton',
    variant: 'Crystal/Brown',
    price: 18500,
    category: 'sunglasses',
    colors: ['#F5F5DC', '#8B4513', '#000000'],
    rating: 4.9,
    reviews: 89,
    badge: 'Популярные',
    images: ['h3-hampton-1.jpg', 'h3-hampton-2.jpg'],
  },
  {
    name: 'H1A Chelsea',
    variant: 'Tortoise/Blue',
    price: 16700,
    category: 'optical',
    colors: ['#8B4513', '#1E3A8A', '#000000'],
    rating: 4.7,
    reviews: 156,
    badge: 'Скидка -20%',
    images: ['h1a-chelsea-1.jpg', 'h1a-chelsea-2.jpg'],
  },
  {
    name: 'H2 Madison',
    variant: 'Clear/Gold',
    price: 14200,
    originalPrice: 17800,
    category: 'optical',
    colors: ['#F5F5F5', '#FFD700', '#8B4513'],
    rating: 4.6,
    reviews: 73,
    isNew: true,
    images: ['h2-madison-1.jpg', 'h2-madison-2.jpg'],
  },
  {
    name: 'H4 Brooklyn',
    variant: 'Matte Black',
    price: 17300,
    category: 'sunglasses',
    colors: ['#2C2C2C', '#8B4513', '#1E3A8A'],
    rating: 4.8,
    reviews: 92,
    images: ['h4-brooklyn-1.jpg', 'h4-brooklyn-2.jpg'],
  },
  {
    name: 'H5 Venice',
    variant: 'Rose Gold',
    price: 19800,
    category: 'optical',
    colors: ['#E8B4A0', '#FFD700', '#F5F5F5'],
    rating: 4.9,
    reviews: 67,
    badge: 'Эксклюзив',
    images: ['h5-venice-1.jpg', 'h5-venice-2.jpg'],
  },
];

(async () => {
  const count = await Product.countDocuments();
  if (count === 0) {
    await Product.insertMany(initialProducts);
    console.log('Initial products seeded');
  }
})();

// Swagger Configuration
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Sunglasses API with Image Uploads',
      version: '1.0.0',
      description: 'A REST API for managing products and images for a sunglasses e-commerce platform using Node.js, Express, MongoDB with Mongoose, and Swagger. Current date and time: Thursday, July 31, 2025, 04:32 AM +05',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3001}`,
      },
    ],
  },
  apis: ['index.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - variant
 *         - price
 *         - category
 *         - colors
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the product
 *         name:
 *           type: string
 *           description: The name of the product
 *         variant:
 *           type: string
 *           description: The variant of the product (e.g., color combination)
 *         price:
 *           type: number
 *           description: The current price of the product
 *         originalPrice:
 *           type: number
 *           description: The original price (if on sale)
 *         category:
 *           type: string
 *           description: The product category (e.g., sunglasses, optical)
 *         colors:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of available colors
 *         rating:
 *           type: number
 *           description: The average rating of the product
 *         reviews:
 *           type: number
 *           description: The number of reviews
 *         isNew:
 *           type: boolean
 *           description: Indicates if the product is new
 *         badge:
 *           type: string
 *           description: Special badge (e.g., Новинка, Популярные)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the product was created
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of image filenames (min 2, max 10)
 *     Image:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the image
 *         filename:
 *           type: string
 *           description: The name of the uploaded image file
 *         path:
 *           type: string
 *           description: The server path to the image file
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the image was uploaded
 *         url:
 *           type: string
 *           description: The URL to access the image
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Retrieve all products
 *     responses:
 *       200:
 *         description: A list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
app.get('/api/products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product with images
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               variant:
 *                 type: string
 *               price:
 *                 type: number
 *               originalPrice:
 *                 type: number
 *               category:
 *                 type: string
 *               colors:
 *                 type: array
 *                 items:
 *                   type: string
 *               rating:
 *                 type: number
 *               reviews:
 *                 type: number
 *               isNew:
 *                 type: boolean
 *               badge:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid input or image count
 */
app.post('/api/products', upload.array('images', 10), async (req, res) => {
  const { name, variant, price, originalPrice, category, colors, rating, reviews, isNew, badge } = req.body;
  const images = req.files.map(file => file.filename);
  if (images.length < 2 || images.length > 10) {
    return res.status(400).json({ error: 'Number of images must be between 2 and 10' });
  }
  const productData = {
    name,
    variant,
    price: parseInt(price),
    originalPrice: originalPrice ? parseInt(originalPrice) : undefined,
    category,
    colors: JSON.parse(colors),
    rating: parseFloat(rating) || 0,
    reviews: parseInt(reviews) || 0,
    isNew: !!isNew,
    badge,
    images,
  };
  const product = new Product(productData);
  const savedProduct = await product.save();
  res.status(201).json(savedProduct);
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Retrieve a product by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single product
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
app.get('/api/products/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a product by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
app.put('/api/products/:id', async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 */
app.delete('/api/products/:id', async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.status(204).send();
});

/**
 * @swagger
 * /api/uploads-blog:
 *   post:
 *     summary: Upload an image for the blog
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 filename:
 *                   type: string
 *                 url:
 *                   type: string
 *       400:
 *         description: No file uploaded
 */
app.post('/api/uploads-blog', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({
    message: 'Image uploaded successfully',
    filename: req.file.filename,
    url: `/uploads/${req.file.filename}`,
  });
});

/**
 * @swagger
 * /api/images:
 *   post:
 *     summary: Upload a single image
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 image:
 *                   $ref: '#/components/schemas/Image'
 *       400:
 *         description: No file uploaded or invalid file type
 */
app.post('/api/images', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const image = new Image({
    filename: req.file.filename,
    path: req.file.path,
  });
  await image.save();
  res.json({ message: 'Image uploaded', image: { ...image.toObject(), url: `/uploads/${image.filename}` } });
});

/**
 * @swagger
 * /api/images:
 *   get:
 *     summary: Get all images
 *     responses:
 *       200:
 *         description: List of images
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Image'
 */
app.get('/api/images', async (req, res) => {
  const images = await Image.find();
  res.json(images.map(image => ({ ...image.toObject(), url: `/uploads/${image.filename}` })));
});

/**
 * @swagger
 * /api/images/{id}:
 *   delete:
 *     summary: Delete an image by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 image:
 *                   $ref: '#/components/schemas/Image'
 *       404:
 *         description: Image not found
 *       500:
 *         description: Failed to delete file
 */
app.delete('/api/images/:id', async (req, res) => {
  const image = await Image.findByIdAndDelete(req.params.id);
  if (!image) return res.status(404).json({ message: 'Image not found' });

  const filePath = path.join(process.cwd(), image.path);
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('Failed to delete file:', err.message);
      return res.status(500).json({ message: 'Failed to delete file' });
    }
  });

  res.json({ message: 'Image deleted', image });
});

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} at ${new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Yekaterinburg' })}`);
});