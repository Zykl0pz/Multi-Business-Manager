Sistema de Gestión Multi-Empresarial (Multi-Business Manager)

Una solución integral y moderna para la administración centralizada de múltiples negocios. Este sistema permite a los propietarios y administradores gestionar inventarios complejos, registrar flujos financieros (ingresos y egresos) y visualizar métricas de rendimiento en tiempo real a través de dashboards interactivos.

📋 Descripción

Este proyecto es un ERP (Enterprise Resource Planning) ligero diseñado para desarrolladores y pequeñas empresas que requieren gestionar varias entidades comerciales bajo una misma plataforma. Facilita el control de stock con alertas automáticas, la categorización de productos por marcas y categorías, y ofrece un desglose financiero claro para evaluar la rentabilidad de cada negocio individualmente.

✨ Características Principales

🏢 Gestión Multi-Negocio

Centralización: Cree y administre perfiles independientes para múltiples negocios.

Aislamiento de Datos: La información de inventario y finanzas está segregada por negocio para mantener la integridad de los datos.

Resumen Global: Vista rápida del estado (conteo de productos, ingresos, gastos) de cada negocio desde el inicio.

📦 Control de Inventario Avanzado

Catálogo Completo: Gestión de Productos con SKU, precio de venta, costo, stock actual y stock mínimo.

Clasificación: Organización mediante Categorías y Marcas reutilizables.

Alertas de Stock: Indicadores visuales y filtrado automático para productos con stock bajo o agotado.

Métricas de Inventario: Cálculo automático del valor total del inventario (costo vs. venta retail) y beneficio potencial.

💰 Gestión Financiera

Registro de Transacciones: Módulos dedicados para Ingresos y Gastos (Egresos).

Cálculo de Rentabilidad: Visualización automática del Beneficio Neto, Margen de Beneficio (%) y Ratio Coste/Beneficio.

Historial: Listado de transacciones con filtros de búsqueda y ordenamiento cronológico.

📊 Reportes y Exportación

Dashboard Interactivo: Gráficos y tarjetas de resumen financiero y operativo.

Exportación CSV: Herramienta robusta para exportar datos (Productos, Ingresos, Gastos o Todo) compatible con Excel/Google Sheets.

🛠️ Tecnologías Utilizadas

Este proyecto utiliza un stack moderno y tipado estáticamente:

Framework: Next.js (App Router)

Lenguaje: TypeScript

Estilos: Tailwind CSS

Componentes UI: shadcn/ui (basado en Radix UI)

Base de Datos / ORM: Prisma (Configurado por defecto para SQLite)

Iconos: Lucide React

Gráficos: Recharts

Manejo de Formularios: React Hook Form (inferido por componentes UI)

📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

Node.js (v18.17.0 o superior recomendado)

npm o un gestor de paquetes equivalente (yarn, pnpm)

Git

🚀 Instalación

Sigue estos pasos para desplegar el proyecto en tu entorno local:

Clonar el repositorio:

git clone <url-del-repositorio>
cd multi-business-manager


Instalar dependencias:

npm install


Configurar Base de Datos:
El proyecto utiliza Prisma con SQLite por defecto. Genera el cliente de Prisma y empuja el esquema a la base de datos local.

npx prisma generate
npx prisma db push


Poblar Datos Iniciales (Seed):
El sistema incluye un endpoint para cargar categorías (ej. Pantallas, Baterías) y marcas (ej. Samsung, Apple) iniciales.

Opción A (cURL):
Una vez el servidor esté corriendo, ejecuta:

curl -X POST http://localhost:3000/api/seed


Ejecutar el servidor de desarrollo:

npm run dev


Abre http://localhost:3000 en tu navegador.

⚙️ Configuración

Crea un archivo .env en la raíz del proyecto si necesitas modificar la conexión a la base de datos (por defecto Prisma usa una ruta relativa en schema.prisma).

# Ejemplo de .env
DATABASE_URL="file:./dev.db"


📖 Uso

1. Crear un Negocio

En la página de inicio, haz clic en "Nuevo Negocio". Ingresa el nombre (ej. "Electrónica Centro"), dirección y sitio web.

2. Gestión de Categorías y Marcas

Antes de agregar productos, es recomendable configurar las categorías y marcas globales desde el menú de configuración o accediendo a /categories.
Nota: Si ejecutaste el seed, ya tendrás datos precargados.

3. Gestión de Inventario

Navega a un negocio y selecciona la pestaña Inventario.

Agregar Producto: Haz clic en "Nuevo Producto". Debes ingresar el Precio (Venta) y Coste para que el sistema calcule los márgenes.

Stock Mínimo: Define un valor (ej. 5). Si el stock real baja de este número, el producto se marcará en rojo en el dashboard.

4. Registro de Finanzas

Ingresos: Registra ventas o entradas de dinero manuales en la sección "Gestionar Ingresos".

Gastos: Registra pagos a proveedores, servicios, etc., en "Gestionar Gastos".

5. Exportación

Desde el dashboard del negocio, utiliza el botón "Exportar a CSV" para descargar reportes completos o parciales de tu actividad.

📂 Estructura del Proyecto

/
├── prisma/
│   ├── schema.prisma      # Definición de modelos de BD (Business, Product, Income, Expense, etc.)
│   └── dev.db             # Base de datos SQLite (generada tras instalación)
├── src/
│   ├── app/
│   │   ├── api/           # Endpoints de la API (Backend Next.js)
│   │   ├── business/      # Rutas dinámicas para gestión de negocios ([id])
│   │   ├── categories/    # Página de gestión de categorías globales
│   │   ├── page.tsx       # Página de inicio (Listado de negocios)
│   │   └── layout.tsx     # Layout raíz y metadatos
│   ├── components/
│   │   ├── export/        # Lógica de exportación (ExportModal)
│   │   └── ui/            # Componentes reutilizables (shadcn/ui)
│   └── lib/
│       ├── db.ts          # Instancia singleton de PrismaClient
│       └── utils.ts       # Utilidades de clases CSS (cn)
├── context.py             # Script de utilidad para análisis de contexto
├── next.config.ts         # Configuración de Next.js
└── tailwind.config.ts     # Configuración de estilos
