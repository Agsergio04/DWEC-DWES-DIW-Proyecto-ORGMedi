const express = require('express');
const path = require('path');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(compression());
app.use(express.static(path.join(__dirname, 'dist/Proyecto/browser'), {
  maxAge: '1d',
  etag: false
}));

// Servir archivos públicos
app.use(express.static(path.join(__dirname, 'public')));

// Health check para Render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'frontend' });
});

// SPA Fallback - redirigir todas las rutas no encontradas a index.html
app.get('*', (req, res) => {
  // No redirigir archivos estáticos (assets, etc)
  if (req.path.startsWith('/assets/') || 
      req.path.match(/\.[^/]*$/) || 
      req.path.startsWith('/public/')) {
    res.status(404).send('Not Found');
  } else {
    res.sendFile(path.join(__dirname, 'dist/Proyecto/browser/index.html'));
  }
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).send('Internal Server Error');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Frontend corriendo en http://0.0.0.0:${PORT}`);
  console.log(`📊 Health check: http://0.0.0.0:${PORT}/health`);
});

