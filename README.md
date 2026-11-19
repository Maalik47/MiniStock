# MiniStock

## 1. Descripción y objetivo

MiniStock es una aplicación web académica para la **gestión básica de productos e inventario**. Su objetivo es demostrar la integración de tres tecnologías en un proyecto pequeño y easy de entender:

- Un frontend en **React** que consume una API REST.
- Un backend en **Spring Boot 3** con autenticación **JWT**.
- Una base de datos no relacional **MongoDB Atlas**.

El alcance está limitado a: inicio de sesión, panel principal y CRUD de productos. No hay registro de usuarios, roles múltiples, estadísticas, reportes ni módulos adicionales.

---

## 2. Tecnologías utilizadas

| Capa | Tecnología |
| --- | --- |
| Backend | Java 17, Spring Boot 3.3.5, Spring Web, Spring Data MongoDB, Spring Security, JJWT 0.12.6, Maven |
| Frontend | React 18, Vite 7, JavaScript, Axios, CSS básico responsive |
| Base de datos | MongoDB Atlas (MongoDB como servicio) |
| Seguridad | JWT HS256, contraseñas cifradas con BCrypt, CORS para desarrollo |

---

## 3. Arquitectura general del sistema

El frontend **nunca** accede a MongoDB: se comunica únicamente con el backend mediante peticiones HTTP REST/JSON. El backend es el único que habla con Atlas a través de Spring Data MongoDB.

- El token JWT se genera en el backend al iniciar sesión.
- El frontend guarda el token en `localStorage` (`ministock_token`).
- Axios adjunta `Authorization: Bearer <token>` en cada petición protegida.
- Un filtro de Spring Security valida el token antes de permitir el acceso a los endpoints del CRUD.
- La sesión es **stateless**: el servidor no guarda sesiones HTTP.

---

## 4. Diagrama de arquitectura

```mermaid
flowchart LR
    U[Usuario] -->|Interfaz web| FE[React + Vite<br/>Frontend :5173]
    FE -->|REST / JSON<br/>Authorization: Bearer JWT| BE[Spring Boot 3<br/>Backend :8080]
    BE -->|Spring Data MongoDB| DB[(MongoDB Atlas<br/>products / users)]
    BE -.->|JWT + BCrypt| SEC[Spring Security]
    SEC -.->|Filtro de autenticación| BE
```

---

## 5. Diagrama del flujo de autenticación

```mermaid
sequenceDiagram
    participant U as Usuario
    participant FE as React (Vite)
    participant BE as Spring Boot
    participant DB as MongoDB Atlas

    U->>FE: Ingresa correo y contraseña
    FE->>BE: POST /api/auth/login
    BE->>DB: findByEmail(correo)
    DB-->>BE: Documento user con hash BCrypt
    BE->>BE: Compara contraseña y genera JWT (HS256)
    BE-->>FE: 200 { token, email, expiresIn }
    FE->>FE: Guarda token en localStorage
    FE-->>U: Muestra el panel principal

    U->>FE: Gestiona productos
    FE->>BE: GET/POST/PUT/DELETE /api/products + Bearer token
    BE->>BE: JwtAuthenticationFilter valida el token
    BE->>DB: Operación sobre la colección products
    DB-->>BE: Resultado
    BE-->>FE: Respuesta JSON
    FE-->>U: Tabla / mensaje de éxito o error
```

Si el token es inválido o expiró, el backend responde `401`; Axios elimina el token guardado y la aplicación vuelve a mostrar el login.

---

## 6. Estructura de carpetas del proyecto

```text
MiniStock/
├── backend/
│   ├── .env.example
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/ministock/
│       │   ├── MiniStockApplication.java
│       │   ├── config/
│       │   │   ├── AdminInitializer.java     # crea el administrador inicial
│       │   │   ├── MongoConfig.java          # cliente MongoDB desde la URI
│       │   │   └── SecurityConfig.java       # seguridad, JWT y CORS
│       │   ├── controller/
│       │   │   ├── AuthController.java
│       │   │   └── ProductController.java
│       │   ├── model/
│       │   │   ├── AuthResponse.java
│       │   │   ├── LoginRequest.java
│       │   │   ├── Product.java
│       │   │   └── User.java
│       │   ├── repository/
│       │   │   ├── ProductRepository.java
│       │   │   └── UserRepository.java
│       │   ├── security/
│       │   │   ├── JwtAuthenticationFilter.java
│       │   │   ├── JwtTokenProvider.java
│       │   │   └── UserDetailsServiceImpl.java
│       │   └── service/
│       │       ├── AuthService.java
│       │       └── ProductService.java
│       └── resources/application.properties
├── frontend/
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── api/api.js                 # Axios + interceptor JWT
│       ├── components/
│       │   ├── Dashboard.jsx
│       │   ├── LoginPage.jsx
│       │   ├── ProductForm.jsx
│       │   └── ProductsPage.jsx
│       ├── context/AuthContext.jsx
│       └── styles.css
├── README.md
└── .gitignore
```

---

## 7. Modelo del documento Producto en MongoDB

Colección: `products`. La clase Java `Product` usa `BigDecimal` para el precio, por lo que Spring Data lo persiste como `Decimal128`.

```json
{
  "_id": ObjectId("66f1a2b3c4d5e6f708192a3b"),
  "name": "Laptop Lenovo IdeaPad 3",
  "description": "15.6\" Ryzen 5, 8 GB RAM, 256 GB SSD",
  "price": NumberDecimal("2199000.00"),
  "quantity": 12
}
```

| Campo | Tipo en Java | Tipo en MongoDB | Descripción |
| --- | --- | --- | --- |
| `id` | `String` | `ObjectId` | Identificador generado por MongoDB (`@Id`) |
| `name` | `String` | `String` | Nombre del producto, obligatorio |
| `description` | `String` | `String` | Descripción opcional |
| `price` | `BigDecimal` | `Decimal128` | Precio, no negativo |
| `quantity` | `Integer` | `Int32` | Cantidad disponible, no negativa |

Los usuarios se guardan en la colección `users` con `email` y `password` (hash BCrypt).

---

## 8. Endpoints disponibles

| Método | Ruta | Función | Autenticación |
| --- | --- | --- | --- |
| `POST` | `/api/auth/login` | Valida credenciales y devuelve el JWT | Pública |
| `POST` | `/api/products` | Registra un producto | Bearer JWT |
| `GET` | `/api/products` | Consulta todos los productos | Bearer JWT |
| `GET` | `/api/products/{id}` | Consulta un producto por su ID | Bearer JWT |
| `PUT` | `/api/products/{id}` | Edita un producto existente | Bearer JWT |
| `DELETE` | `/api/products/{id}` | Elimina un producto | Bearer JWT |

**Respuesta de login (200):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "email": "admin@ministock.com",
  "expiresIn": 86400000
}
```

**Cuerpo para registrar/editar:**

```json
{
  "name": "Mouse Logitech M170",
  "description": "Inalámbrico USB",
  "price": 45000.00,
  "quantity": 25
}
```

Códigos de respuesta habituales: `200` operación correcta, `201` creado, `204` eliminado, `400` validación inválida, `401` credenciales/token inválidos, `404` producto no encontrado.

---

## 9. Variables de entorno necesarias

### Backend

| Variable | Obligatoria | Valor por defecto | Descripción |
| --- | --- | --- | --- |
| `MONGODB_URI` | Sí | — | URI de conexión a MongoDB Atlas, con usuario y contraseña |
| `MONGODB_DATABASE` | No | `ministock` | Nombre de la base de datos |
| `JWT_SECRET` | Sí | — | Secreto HS256; **mínimo 32 caracteres** |
| `JWT_EXPIRATION_MS` | No | `86400000` | Vigencia del token en milisegundos (24 h) |
| `ADMIN_EMAIL` | No | `admin@ministock.com` | Correo del administrador inicial |
| `ADMIN_PASSWORD` | No | `admin123` | Contraseña del administrador inicial |
| `CORS_ALLOWED_ORIGINS` | No | `http://localhost:5173` | Orígenes permitidos (separados por coma) |
| `SERVER_PORT` | No | `8080` | Puerto del backend |

### Frontend

| Variable | Obligatoria | Valor por defecto | Descripción |
| --- | --- | --- | --- |
| `VITE_API_URL` | No | `http://localhost:8080/api` | URL base de la API |

> Las credenciales de Atlas **no** están escritas en el código: solo se leen desde `MONGODB_URI`. Los archivos `.env.example` son plantillas sin datos reales y `.env` está ignorado por Git.

> MongoDB no distingue mayúsculas en los nombres de base de datos: si ya existe `MiniStock`, no se puede crear `ministock` (error 13297). Usa un nombre distinto, por ejemplo `ministock_db`, o el nombre exacto ya existente.

> Si el puerto 8080 está ocupado, define `SERVER_PORT=8081` y `VITE_API_URL=http://localhost:8081/api` en el frontend. Del mismo modo, si Vite termina en el puerto 5174, inclúyelo en `CORS_ALLOWED_ORIGINS`.

---

## 10. Instalación y ejecución

### Etapa 1 — Configurar MongoDB Atlas

1. Crea una cuenta y un cluster en [MongoDB Atlas](https://www.mongodb.com/atlas) (el tier gratuito M0 es suficiente).
2. En **Database Access**, crea un usuario con contraseña y el rol *Read and write to any database*.
3. En **Network Access**, agrega tu IP pública. Para pruebas rápidas se puede usar `0.0.0.0/0`, pero **no** es recomendable en producción.
4. En **Connect → Drivers**, copia la URI. Tiene este aspecto:
   `mongodb+srv://<usuario>:<password>@cluster0.xxxxx.mongodb.net/`
5. Reemplaza `<usuario>` y `<password>` por los reales. Si la contraseña tiene caracteres especiales, codifícalos en URL (por ejemplo `@` → `%40`).

### Etapa 2 — Backend

En PowerShell, desde la carpeta `MiniStock/backend`:

```powershell
$env:MONGODB_URI = "mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/"
$env:MONGODB_DATABASE = "ministock"
$env:JWT_SECRET = "clave-secreta-de-al-menos-32-caracteres-cambiar"
mvn spring-boot:run
```

En Linux/macOS usa `export MONGODB_URI="..."` antes de ejecutar Maven.

Al arrancar, `AdminInitializer` crea el usuario administrador si aún no existe. Comprueba el login:

```powershell
curl.exe -X POST http://localhost:8080/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"admin@ministock.com","password":"admin123"}'
```

Debe devolver un JSON con `token`, `email` y `expiresIn`. Prueba ahora un endpoint protegido (sustituye `<TOKEN>`):

```powershell
curl.exe -H "Authorization: Bearer <TOKEN>" http://localhost:8080/api/products
```

Con la base de datos vacía devuelve `[]`. Sin el encabezado `Authorization` debe devolver `401`.

Para compilar sin arrancar: `mvn -DskipTests package`.

### Etapa 3 — Frontend

En otra terminal, desde `MiniStock/frontend`:

```powershell
npm install
npm run dev
```

Abre **http://localhost:5173**. Para generar el build de producción: `npm run build`.

### Etapa 4 — Verificación funcional desde la interfaz

1. Inicia sesión con las credenciales de prueba → se muestra el panel.
2. Entra en **Productos** → **Nuevo producto**, completa el formulario y guarda → aparece el mensaje de éxito y la fila en la tabla.
3. Pulsa **Editar**: se consulta el producto por ID (`GET /api/products/{id}`), se abre el formulario con sus datos y al guardar se actualiza la fila.
4. Pulsa **Eliminar**: aparece la confirmación; al aceptar, el producto desaparece.
5. Pulsa **Cerrar sesión**: vuelve al login. Si se expira o elimina el token, las peticiones protegidas devuelven `401` y la app vuelve al login.

**Verificación ejecutada en esta sesión (resultados reales):**

- `mvn -DskipTests package` y `mvn test`: correctos; se generó el JAR ejecutable.
- `npm run build`: correcto; `npm audit`: 0 vulnerabilidades.
- Backend arrancado contra MongoDB Atlas (base `ministock_db`): `POST /api/auth/login` → 200 con token; `GET /api/products` → 200 con `[]`. Sin token y con token inválido → 401.
- Prueba end-to-end en el navegador sobre `http://localhost:5174`: login correcto, alta de producto, edición (que consulta el producto por ID), eliminación con confirmación, mensajes de éxito visibles, cierre de sesión y token eliminado. Sin errores en la consola del navegador.
- El producto usado en la prueba fue eliminado al final, por lo que la colección `products` queda vacía.

No se han inventado resultados: todo lo anterior se ejecutó con la URI de Atlas proporcionada para esta sesión.

---

## 11. Credenciales de prueba del administrador

| Correo | Contraseña |
| --- | --- |
| `admin@ministock.com` | `admin123` |

Se crean automáticamente al primer arranque. Puedes cambiarlas con las variables `ADMIN_EMAIL` y `ADMIN_PASSWORD` (si cambias el correo después de haber arrancado, el usuario anterior seguirá existiendo en la base de datos).
