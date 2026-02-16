const express = require('express');
const path = require('path');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;

// Headers de seguridad y rendimiento globales
app.use((req, res, next) => {
  // Seguridad
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'SAMEORIGIN');
  res.set('X-XSS-Protection', '1; mode=block');
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Rendimiento
  res.set('Accept-Ranges', 'bytes');
  res.set('Connection', 'keep-alive');
  
  next();
});
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Middleware para index.html - Permitir bfcache pero revalidar
app.get('/index.html', (req, res, next) => {
  res.set('Cache-Control', 'public, no-cache, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Middleware para archivos hashed - cache de 1 año
app.use((req, res, next) => {
  // Archivos con hash de Angular (main-XXXXX.js, styles-XXXXX.css, etc)
  if (/\.(js|css|svg|png|jpg|jpeg|gif|woff|woff2|ttf|eot)(\?[a-z0-9=&.]*)?$/i.test(req.path) &&
      /[-_][A-Z0-9]{8,}\.(js|css|svg|png|jpg|jpeg|gif|woff|woff2|ttf|eot)$/i.test(req.path)) {
    res.set('Cache-Control', 'public, max-age=31536000, immutable'); // 1 año
    res.set('ETag', 'W/' + Math.random().toString(36).substring(2)); // Disable etag revalidation
  } else if (/\.(js|css|svg|png|jpg|jpeg|gif|woff|woff2|ttf|eot)$/i.test(req.path)) {
    // Archivos sin hash - cache corto con revalidación (permite bfcache)
    res.set('Cache-Control', 'public, max-age=86400, must-revalidate');
  } else {
    // HTML y otros - cache corto con revalidación (permite bfcache)
    res.set('Cache-Control', 'public, no-cache, must-revalidate');
  }
  
  next();
});

// Servir archivos estáticos con opciones optimizadas
app.use(express.static(path.join(__dirname, 'dist/Proyecto/browser'), {
  maxAge: 0,
  etag: false,
  lastModified: false
}));

// Servir archivos públicos
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: 0,
  etag: false,
  lastModified: false
}));

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

app.listen(PORT, 'localhost', () => {
  console.log(`Frontend corriendo en http://localhost:${PORT}`);
});