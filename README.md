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
- **Framework**: Spring Boot 3.5.6
- **Lenguaje**: Java 21
- **Base de Datos**: H2 Database
- **Autenticación**: JWT + Spring Security
- **ORM**: JPA/Hibernate
- **Build**: Maven
- **Testing**: JUnit 5, MockMvc


### DevOps
 - **Todavia en desarrollo**

---

## Guia de Inicio

### Requisitos Previos
- Node.js 18+
- Angular CLI (`npm i -g @angular/cli`)
- Git

### Instalación Frontend
```bash
git clone https://github.com/Agsergio04/DWEC-DWES-DIW-Proyecto-ORGMedi.git
cd DWEC-DWES-DIW-Proyecto-ORGMedi/frontend
npm install
npm start
```

## Documentacion 
- [Documentacion del backend](https://github.com/Agsergio04/DWEC-DWES-DIW-Proyecto-ORGMedi/blob/master/docs/servidor/Proyecto_API_REST.md)
- [Documentacion del Diseño](https://github.com/Agsergio04/DWEC-DWES-DIW-Proyecto-ORGMedi/blob/master/docs/design/DOCUMENTACION_DISE%C3%91O.md)
- [Documentacion del Cliente](https://github.com/Agsergio04/DWEC-DWES-DIW-Proyecto-ORGMedi/blob/master/docs/cliente/Documentacion_cliente.md)

## Despliegue 
El despliegue se ha utilizado render y se pueded acceder por medio de este enlace : https://dwec-dwes-diw-proyecto-orgmedi.onrender.com  

Por otro lado para el previsualizado del login y del registro es mediante estos enlaces,aunque puedes ponerlos tu mismo :  
- [Enlace para el login](https://dwec-dwes-diw-proyecto-orgmedi.onrender.com/login) : https://dwec-dwes-diw-proyecto-orgmedi.onrender.com/login
- [Enlace para el registro](https://dwec-dwes-diw-proyecto-orgmedi.onrender.com/register) : https://dwec-dwes-diw-proyecto-orgmedi.onrender.com/register

Todavian siguen en desarrollo por motivos de reestructuracion del diseño web pero aqui una prueba explicita de que existen   
