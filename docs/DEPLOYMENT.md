# Guía de Despliegue en Producción

## Requisitos Previos

- ✅ Tests unitarios pasando (coverage > 50%)
- ✅ Tests de integración pasando
- ✅ Build de producción sin errores
- ✅ Lighthouse Performance > 80
- ✅ Verificación cross-browser completada

## Checklist Pre-Despliegue

```bash
# 1. Ejecutar tests
npm run test:ci

# 2. Build de producción
npm run build

# 3. Analizar bundles
npm run build:analyze

# 4. Verificar no hay warnings/errors
npm run build 2>&1 | grep -i "error\|warning"

# 5. Lighthouse (si es posible)
npm run lighthouse
```

## Opciones de Despliegue

### Opción 1: Docker en VPS (Recomendado)

#### Paso 1: Preparar Servidor
```bash
# SSH al servidor
ssh user@your-server.com

# Instalar Docker y Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Agregar usuario a grupo docker (opcional)
sudo usermod -aG docker $USER
newgrp docker
```

#### Paso 2: Configurar Dominio
```bash
# Registrar dominio en registrar (GoDaddy, Namecheap, etc.)
# Apuntar DNS a IP del servidor

# Verificar DNS
nslookup tu-dominio.com
```

#### Paso 3: Configurar SSL con Let's Encrypt
```bash
# Instalar Certbot
sudo apt-get install certbot

# Generar certificado (reemplazar dominio)
sudo certbot certonly --standalone -d tu-dominio.com -d www.tu-dominio.com

# El certificado se genera en:
# /etc/letsencrypt/live/tu-dominio.com/
```

#### Paso 4: Actualizar docker-compose.yml
```yaml
version: '3'
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "443:443"
      - "80:80"
    volumes:
      - /etc/letsencrypt:/etc/letsencrypt:ro
    environment:
      - DOMAIN=tu-dominio.com
      - CERT_PATH=/etc/letsencrypt/live/tu-dominio.com
    restart: always

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=docker
    restart: always
```

#### Paso 5: Configurar nginx.conf para HTTPS
```nginx
upstream backend {
    server backend:8080;
}

server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;
    
    # Redirigir HTTP a HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tu-dominio.com www.tu-dominio.com;

    # Certificados SSL
    ssl_certificate /etc/letsencrypt/live/tu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tu-dominio.com/privkey.pem;

    # Configuración SSL recomendada
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # HSTS header (seguridad)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Compression
    gzip on;
    gzip_types application/javascript text/css text/xml;
    gzip_min_length 1000;
    gzip_proxied any;

    # Servir archivos estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing - redirigir todas las rutas a index.html
    location / {
        try_files $uri $uri/ /index.html;
        
        # No cachear HTML
        add_header Cache-Control "no-cache, no-store, must-revalidate" always;
        
        # Headers de seguridad
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
    }

    # Proxy a backend
    location /api/ {
        proxy_pass http://backend/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
    }

    # Deny access to sensitive files
    location ~ /\. {
        deny all;
    }
    location ~ ~$ {
        deny all;
    }
}
```

#### Paso 6: Renovación Automática de Certificados
```bash
# Crear script de renovación
sudo tee /usr/local/bin/renew-certs.sh > /dev/null <<EOF
#!/bin/bash
certbot renew --quiet --renew-hook "cd /home/user/proyecto && docker-compose restart frontend"
EOF

sudo chmod +x /usr/local/bin/renew-certs.sh

# Agregar a crontab para ejecutar diariamente
sudo crontab -e
# Agregar línea:
0 3 * * * /usr/local/bin/renew-certs.sh
```

#### Paso 7: Desplegar
```bash
# Clonar repositorio
git clone tu-repo.git proyecto
cd proyecto

# Build y inicio de servicios
docker-compose up -d

# Verificar que está corriendo
docker-compose ps

# Ver logs
docker-compose logs -f frontend
docker-compose logs -f backend
```

#### Paso 8: Verificar Despliegue
```bash
# Verificar HTTPS
curl -I https://tu-dominio.com

# Verificar que redirecciona correctamente
curl -I http://tu-dominio.com

# Verificar API
curl https://tu-dominio.com/api/medicamentos

# Verificar health
curl https://tu-dominio.com/api/health
```

### Opción 2: Vercel

Vercel es ideal para desplegar solo el frontend.

#### Paso 1: Crear Proyecto en Vercel
```bash
# Instalar CLI
npm i -g vercel

# Deploy inicial
cd frontend
vercel

# Responder a las preguntas:
# - Connect to existing project: No
# - What's your project's name: proyecto
# - In which directory is your code: ./
# - Build command: ng build
# - Output directory: dist/proyecto
```

#### Paso 2: Configurar Variables de Entorno
```bash
# En dashboard de Vercel, agregar:
ANGULAR_API_URL=https://tu-api.com
NODE_ENV=production
```

#### Paso 3: Configurar Rewrites para SPA
Crear `vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

#### Paso 4: Deploy
```bash
# Deploy a producción
vercel --prod

# Ver logs
vercel logs tu-proyecto.vercel.app
```

### Opción 3: Netlify

#### Paso 1: Conectar Repositorio
```bash
# Instalar CLI
npm install -g netlify-cli

# Login
netlify login

# Vincular proyecto
netlify sites:create --name proyecto
```

#### Paso 2: Configurar Deploy
Crear `netlify.toml`:
```toml
[build]
  command = "ng build"
  publish = "dist/proyecto"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
```

#### Paso 3: Deploy
```bash
# Deploy continuo (conecta con Git)
netlify deploy --prod
```

### Opción 4: AWS S3 + CloudFront

#### Paso 1: Crear bucket S3
```bash
# Instalar AWS CLI
pip install awscli

# Configurar credenciales
aws configure

# Crear bucket
aws s3 mb s3://tu-dominio-com --region us-east-1

# Habilitar website hosting
aws s3api put-bucket-website \
  --bucket tu-dominio-com \
  --website-configuration '{
    "IndexDocument": {
      "Suffix": "index.html"
    },
    "ErrorDocument": {
      "Key": "index.html"
    }
  }'
```

#### Paso 2: Crear CloudFront Distribution
```bash
# Crear distribución (via AWS Console)
# 1. CloudFront → Create distribution
# 2. Origin: S3 bucket
# 3. Default root object: index.html
# 4. Error pages: 404 → index.html
# 5. Behaviors: Compress objects automatically
# 6. Viewer certificate: ACM certificate o default
```

#### Paso 3: Deploy
```bash
# Build
npm run build

# Sync a S3
aws s3 sync dist/proyecto/ s3://tu-dominio-com/ --delete

# Invalidar CloudFront
aws cloudfront create-invalidation \
  --distribution-id ABCDEFG \
  --paths "/*"
```

## Monitoreo Post-Despliegue

### 1. Verificar Sitio
```bash
# Cargar página principal
curl -I https://tu-dominio.com

# Probar SPA routing
curl -I https://tu-dominio.com/medicines
curl -I https://tu-dominio.com/profile

# Probar API
curl https://tu-dominio.com/api/medicamentos | jq
```

### 2. Verificar Performance
```bash
# Lighthouse CLI
npm install -g lighthouse
lighthouse https://tu-dominio.com --view

# GTmetrix
# Visitar https://gtmetrix.com y analizar
```

### 3. Verificar Seguridad
```bash
# SSL Labs
https://www.ssllabs.com/ssltest/analyze.html?d=tu-dominio.com

# Verificar headers
curl -I https://tu-dominio.com | grep -E "Security|Cache"
```

### 4. Configurar Monitoring
```typescript
// En main.ts
import * as Sentry from "@sentry/angular";

Sentry.init({
  dsn: "tu-sentry-dsn",
  environment: "production",
  tracesSampleRate: 0.1
});
```

```bash
# Instalar Sentry
npm install --save @sentry/angular
```

### 5. Configurar Alertas
```bash
# Email notification si el sitio cae
# UptimeRobot: https://uptimerobot.com/
# PagerDuty: https://www.pagerduty.com/
```

## Actualización de Aplicación

### Despliegue Continuo con GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:ci
      
      - name: Build production
        run: npm run build
      
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            cd /home/user/proyecto
            git pull origin main
            docker-compose up -d --build
```

## Rollback en Caso de Error

```bash
# Ver versiones anteriores
docker-compose ps

# Revertir a versión anterior
docker-compose down
git checkout HEAD~1
docker-compose up -d

# O usar tags de versión
git tag v1.0.0
git push origin v1.0.0
docker build -t proyecto:v1.0.0 .
```

## Referencias

- [Angular Deployment](https://angular.io/guide/deployment)
- [Docker Best Practices](https://docs.docker.com/develop/development-best-practices/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Nginx Configuration](https://nginx.org/en/docs/)
