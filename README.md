# ORGMedi

**ORGMedi** es una plataforma web pensada para la gestión  y organizacional de medicamentos. Esta aplicación facilita la administración del consumo de pastillas de las personas. 

## Índice

1. [Características Principales](#características-principales)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Guía de Inicio](#guia-de-inicio)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Documentación](#documentacion)
6. [Despliegue](#despliegue)

##  Características Principales  

La aplicación ofrece una gestión integral de usuarios, permitiendo administrar distintas cuentas según las necesidades de cada persona. Además, dispone de un sistema de gestión de medicamentos que posibilita el registro, la modificación y el seguimiento detallado de los medicamentos de cada usuario, facilitando así una organización eficaz y personalizada del tratamiento farmacológico.  

### Estructura del Proyecto

La estructura principal del proyecto está dividida en frontend y backend, así como documentación y archivos de configuración:

```
DWEC-DWES-DIW-Proyecto-ORGMedi/
│
├── .idea/                   # Configuración del entorno de desarrollo (JetBrains)
│
├── backend/                 # Backend (Spring Boot, Java)
│   ├── pom.xml              # Dependencias y configuración Maven
│   ├── mvnw / mvnw.cmd      # Maven Wrapper
│   ├── .gitattributes       # Reglas para manejo de fin de línea en Git
│   └── ...                  # Otros archivos/carpetas backend
│
├── frontend/                # Frontend (Angular)
│   ├── README.md
│   └── src/
│       ├── app/             # Componentes principales Angular
│       ├── styles/          # Estilos y variables SCSS
│       └── index.html       # Entry point de la SPA
│
├── docs/                    # Documentación técnica y de usuario
│
└── README.md                # Esta documentación principal
```

##  Stack Tecnológico

### Frontend
- **Framework**: Angular 21+
- **Lenguaje**: TypeScript
- **Estilos**: CSS3 / SCSS
- **Routing**: Angular Router centralizado
- **Bundler & CLI**: Angular CLI

### Backend
- **Framework**: Spring Boot 3.2.5
- **Lenguaje**: Java 21
- **Base de Datos**: H2 Database
- **Autenticación**: JWT + Spring Security
- **ORM**: JPA/Hibernate
- **Build**: Maven
- **Testing**: JUnit 5, MockMvc
- **OCR**: Tesseract para lectura de recetas
- **API Documentation**: OpenAPI 3.0 / Swagger UI
- **Monitoring**: Spring Boot Actuator

### DevOps & Deployment
- **Containerización**: Docker (backend y frontend optimizados)
- **Orquestación**: Docker Compose para desarrollo
- **CI/CD**: GitHub webhooks → Render
- **Hosting**: Render (free tier)
- **Optimizaciones**: Alpine images, JVM tuning, Nginx optimizado

---

## Guia de Inicio

### Requisitos Previos
- Node.js 18+
- Angular CLI (`npm i -g @angular/cli`)
- Git
- Docker & Docker Compose (opcional, para desarrollo)
- Java 21 + Maven (para backend local)

### Instalación Local

#### Frontend
```bash
git clone https://github.com/Agsergio04/DWEC-DWES-DIW-Proyecto-ORGMedi.git
cd DWEC-DWES-DIW-Proyecto-ORGMedi/frontend
npm install
npm start
# Accesible en http://localhost:80
```

#### Backend
```bash
cd backend
mvn clean install
mvn spring-boot:run
# Accesible en http://localhost:8080/api
```

#### Con Docker Compose
```bash
docker-compose up -d
# Frontend: http://localhost
# Backend: http://localhost:8080/api
```

---

## URL de Producción

🚀 **Aplicación en vivo:** https://dwec-dwes-diw-proyecto-orgmedi.onrender.com

- Frontend: https://dwec-dwes-diw-proyecto-orgmedi.onrender.com
- API Backend: https://dwec-dwes-diw-proyecto-orgmedi-backend.onrender.com/api

### Herramientas de Desarrollo y Monitoreo

#### Swagger UI (Documentación Interactiva)
Interfaz interactiva para explorar y probar todos los endpoints de la API.

- **Desarrollo**: http://localhost:8080/api/swagger-ui.html
- **Producción**: https://dwec-dwes-diw-proyecto-orgmedi-backend.onrender.com/api/swagger-ui.html

#### OpenAPI JSON Spec
Especificación OpenAPI 3.0 en formato JSON para integración con herramientas third-party.

- **Desarrollo**: http://localhost:8080/api/docs
- **Producción**: https://dwec-dwes-diw-proyecto-orgmedi-backend.onrender.com/api/docs

#### Spring Boot Actuator
Endpoints de monitoreo y salud de la aplicación.

| Endpoint | Descripción | Desarrollo |
|----------|-------------|-----------|
| `/actuator/health` | Estado general de la aplicación | http://localhost:8080/actuator/health |
| `/actuator/health/liveness` | Verifica si la app está viva | http://localhost:8080/actuator/health/liveness |
| `/actuator/health/readiness` | Verifica si la app está lista | http://localhost:8080/actuator/health/readiness |
| `/actuator/info` | Información de la aplicación | http://localhost:8080/actuator/info |
| `/actuator/metrics` | Métricas de rendimiento | http://localhost:8080/actuator/metrics |
| `/actuator/prometheus` | Métricas en formato Prometheus | http://localhost:8080/actuator/prometheus |

---

## Documentación
- [Documentación Técnica Completa](docs/DOCUMENTACION_TECNICA.md)
- [Documentación del Backend/API](docs/servidor/Proyecto_API_REST.md)
- [Documentación del Diseño UI/UX](docs/design/DOCUMENTACION_DISEÑO.md)
- [Documentación del Cliente](docs/cliente/Documentacion_cliente.md)
- [Guía de Despliegue en Render](DESPLIEGUE_RENDER_PASO_A_PASO.md)


