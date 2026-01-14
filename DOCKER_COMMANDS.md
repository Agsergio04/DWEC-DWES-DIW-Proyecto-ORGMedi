# Referencia Rápida de Comandos Docker

## 🚀 Despliegue Básico

### Iniciar todo
```bash
docker-compose up -d
```

### Ver estado
```bash
docker-compose ps
```

### Ver logs
```bash
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Detener
```bash
docker-compose down
```

---

## 🏗️ Construcción de Imágenes

### Construir todo
```bash
docker-compose build
```

### Construir solo backend (sin caché)
```bash
docker-compose build --no-cache backend
```

### Construir solo frontend
```bash
docker build -t orgmedi-frontend:latest ./frontend
```

### Construir backend específico
```bash
docker build -t orgmedi-backend:v1.0.0 ./backend
```

---

## 🐳 Comandos de Contenedores

### Listar contenedores en ejecución
```bash
docker-compose ps
# o
docker ps
```

### Listar todos los contenedores
```bash
docker ps -a
```

### Entrar en un contenedor
```bash
docker-compose exec backend bash
docker-compose exec frontend sh
# o
docker exec -it orgmedi-backend bash
```

### Ver logs en tiempo real
```bash
docker logs -f orgmedi-backend
docker logs -f orgmedi-frontend
```

### Reiniciar contenedor
```bash
docker-compose restart backend
docker-compose restart frontend
```

### Detener/Iniciar contenedor específico
```bash
docker-compose stop backend
docker-compose start backend
```

---

## 🔍 Inspección y Solución de Problemas

### Inspeccionar contenedor
```bash
docker inspect orgmedi-backend
```

### Ver estadísticas de contenedor
```bash
docker stats orgmedi-backend
```

### Ver diferencias en imagen
```bash
docker diff orgmedi-backend
```

### Verificar conectividad entre contenedores
```bash
docker-compose exec backend ping frontend
```

### Verificar logs de construcción
```bash
docker build --progress=plain -t orgmedi-backend ./backend
```

---

## 📦 Gestión de Imágenes

### Listar imágenes
```bash
docker images
```

### Eliminar imagen
```bash
docker rmi orgmedi-backend
```

### Etiquetar imagen
```bash
docker tag orgmedi-backend:latest orgmedi-backend:v1.0.0
```

### Buscar en Docker Hub
```bash
docker search nginx
```

---

## 🧹 Limpieza

### Eliminar contenedores detenidos
```bash
docker container prune
```

### Eliminar imágenes no usadas
```bash
docker image prune
```

### Eliminar volúmenes no usados
```bash
docker volume prune
```

### Limpiar todo (contenedores, imágenes, volúmenes, redes)
```bash
docker system prune -a --volumes
```

### Eliminar volúmenes específicos con Docker Compose
```bash
docker-compose down -v
```

---

## 🌐 Redes y Conectividad

### Listar redes
```bash
docker network ls
```

### Inspeccionar red
```bash
docker network inspect orgmedi-network
```

### Probar conectividad
```bash
docker-compose exec backend curl http://frontend:80
docker-compose exec frontend curl http://backend:8080
```

---

## 📊 Monitoreo

### Ver uso de recursos
```bash
docker stats
```

### Ver procesos en contenedor
```bash
docker top orgmedi-backend
```

### Ver eventos en tiempo real
```bash
docker events --filter 'container=orgmedi-backend'
```

---

## 🐛 Debugging

### Ejecutar comando en contenedor
```bash
docker-compose exec backend curl http://localhost:8080/actuator/health
```

### Ver variables de entorno
```bash
docker-compose exec backend env
```

### Ejecutar test en backend
```bash
docker-compose exec backend mvn test
```

### Ejecutar con modo interactivo
```bash
docker-compose run --rm backend bash
```

---

## 📤 Publicar Imágenes

### Etiquetar para registry
```bash
docker tag orgmedi-backend:latest myregistry.azurecr.io/orgmedi-backend:latest
```

### Hacer login
```bash
docker login myregistry.azurecr.io
```

### Push a registry
```bash
docker push myregistry.azurecr.io/orgmedi-backend:latest
```

---

## 📝 Docker Compose Específicos

### Ejecutar comando en servicio
```bash
docker-compose exec backend mvn clean package
```

### Escalar servicio a múltiples instancias
```bash
docker-compose up -d --scale backend=3
```

### Validar docker-compose.yml
```bash
docker-compose config
```

### Ver variables de entorno
```bash
docker-compose exec backend printenv
```

---

## 🔐 Seguridad

### Ejecutar con permisos específicos
```bash
docker run -u nobody orgmedi-backend
```

### Montar volumen en modo read-only
```bash
docker run -v /data:/data:ro orgmedi-backend
```

### Limitar recursos
```bash
docker run -m 512m --cpus="0.5" orgmedi-backend
```

---

## Atajos Útiles

```bash
# Reconstruir y desplegar
docker-compose build && docker-compose up -d

# Ver logs de error
docker-compose logs | grep ERROR

# Limpiar y comenzar de nuevo
docker-compose down -v && docker-compose up -d

# Acceder a MySQL
docker-compose exec mysql mysql -u root -p

# Ver tamaño de imágenes
docker images --format "table {{.Repository}}\t{{.Size}}"

# Listar todos los contenedores con estado
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

---

## 📚 Documentación Oficial

- [Docker CLI Reference](https://docs.docker.com/engine/reference/commandline/cli/)
- [Docker Compose CLI Reference](https://docs.docker.com/compose/reference/)
- [Dockerfile Reference](https://docs.docker.com/engine/reference/builder/)
- [Best Practices](https://docs.docker.com/develop/dev-best-practices/)
