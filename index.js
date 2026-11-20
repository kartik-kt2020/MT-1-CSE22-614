const express = require('express');
const app = express();
const PORT = 3000;

// Middleware to parse incoming JSON bodies
app.use(express.json());

// In-memory array to store products
let products = [];
let nextId = 1;

// 1. POST /api/products - Create a new product
app.post('/api/products', (req, res) => {
  const { name, price, category } = req.body;

  // Rule: Missing data -> 400
  if (!name || price === undefined || !category) {
    return res.status(400).json({ error: 'Name, price, and category are required.' });
  }

  // Rule: Same name twice -> 409 (case-insensitive check)
  const duplicate = products.find(
    (p) => p.name.toLowerCase() === name.trim().toLowerCase()
  );
  if (duplicate) {
    return res.status(409).json({ error: 'A product with this name already exists.' });
  }

  const newProduct = {
    id: nextId++,
    name: name.trim(),
    price: Number(price),
    category: category.trim(),
  };

  products.push(newProduct);

  // Rule: New added -> 201
  return res.status(201).json(newProduct);
});

// 2. GET /api/products - Get all products (with optional ?category= filter)
app.get('/api/products', (req, res) => {
  const { category } = req.query;

  // Filter: GET /api/products?category=Electronics
  if (category) {
    const filtered = products.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
    return res.status(200).json(filtered);
  }

  return res.status(200).json(products);
});

// 3. GET /api/products/:id - Get a single product by ID
app.get('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const product = products.find((p) => p.id === id);

  // Rule: Wrong id -> 404
  if (!product) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  return res.status(200).json(product);
});

// 4. PUT /api/products/:id - Update an existing product
app.put('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const productIndex = products.findIndex((p) => p.id === id);

  // Rule: Wrong id -> 404
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  const { name, price, category } = req.body;

  // Rule: Missing data -> 400
  if (!name || price === undefined || !category) {
    return res.status(400).json({ error: 'Name, price, and category are required.' });
  }

  // Rule: Same name twice -> 409 (excluding the current product being updated)
  const duplicate = products.find(
    (p) => p.id !== id && p.name.toLowerCase() === name.trim().toLowerCase()
  );
  if (duplicate) {
    return res.status(409).json({ error: 'Another product with this name already exists.' });
  }

  products[productIndex] = {
    id,
    name: name.trim(),
    price: Number(price),
    category: category.trim(),
  };

  return res.status(200).json(products[productIndex]);
});

// 5. DELETE /api/products/:id - Delete a product by ID
app.delete('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const productIndex = products.findIndex((p) => p.id === id);

  // Rule: Wrong id -> 404
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  const deletedProduct = products.splice(productIndex, 1)[0];
  return res.status(200).json({
    message: 'Product deleted successfully.',
    product: deletedProduct,
  });
});

// Start server on port 3000
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});