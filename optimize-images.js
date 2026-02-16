#!/usr/bin/env node

/**
 * Script de optimización de imágenes
 * Convierte JPG a WebP y comprime PNG
 * 
 * Requisitos: 
 * - npm install sharp imagemin imagemin-webp imagemin-mozjpeg --save-dev
 * 
 * Uso:
 * node optimize-images.js
 */

const imagemin = require('imagemin');
const imageminWebp = require('imagemin-webp');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const fs = require('fs');
const path = require('path');

async function optimizeImages() {
  try {
    console.log('🖼️  Iniciando optimización de imágenes...\n');

    // Directorio de imágenes públicas
    const publicImgsDir = 'public/imgs';
    const assetsImgsDir = 'src/assets/imgs';

    if (!fs.existsSync(publicImgsDir)) {
      console.log(`⚠️  Directorio ${publicImgsDir} no encontrado. Creando...`);
      fs.mkdirSync(publicImgsDir, { recursive: true });
    }

    // Optimizar JPG → WebP en directorio público
    console.log('📦 Optimizando imágenes en public/imgs...');
    
    const jpgFiles = fs.readdirSync(publicImgsDir)
      .filter(f => /\.(jpg|jpeg)$/i.test(f));

    if (jpgFiles.length > 0) {
      await imagemin([path.join(publicImgsDir, '*.{jpg,jpeg}')], {
        destination: publicImgsDir,
        plugins: [
          imageminWebp({ quality: 75 }),
          imageminMozjpeg({ quality: 85, progressive: true })
        ]
      });
      console.log(`✅ ${jpgFiles.length} imágenes JPG optimizadas a WebP`);
    }

    // Optimizar PNG
    const pngFiles = fs.readdirSync(publicImgsDir)
      .filter(f => /\.png$/i.test(f));

    if (pngFiles.length > 0) {
      await imagemin([path.join(publicImgsDir, '*.png')], {
        destination: publicImgsDir,
        plugins: [
          imageminPngquant({
            quality: [0.6, 0.8],
            strip: true
          })
        ]
      });
      console.log(`✅ ${pngFiles.length} imágenes PNG optimizadas`);
    }

    console.log('\n✨ Optimización completada exitosamente');
    console.log('\n📋 Recomendaciones:');
    console.log('1. Actualiza los elementos <img> para usar WebP con fallback');
    console.log('2. Usa picture elements para soporte de navegadores antiguos');
    console.log('3. Ejemplo:');
    console.log(`
    <picture>
      <source srcset="image.webp" type="image/webp">
      <img src="image.jpg" alt="Descripción">
    </picture>
    `);

  } catch (error) {
    console.error('❌ Error durante la optimización:', error);
    process.exit(1);
  }
}

// Ejecutar script
optimizeImages();
