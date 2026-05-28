# Atlas CMS

Atlas CMS es un sistema de gesti?n de contenidos moderno, modular y escalable construido con Laravel, React, Inertia, Tailwind y PrimeReact. Est? pensado para ofrecer una experiencia editorial m?s limpia y r?pida, inspirada en CMS cl?sicos como WordPress y Joomla, pero con una interfaz de administraci?n m?s tipo SaaS.

## Estado actual del proyecto

Atlas CMS ya cuenta con una base funcional s?lida para una V1:

- Instalador inicial por pasos
- Dashboard administrativo
- Gesti?n de p?ginas
- Gesti?n de posts
- Categor?as y etiquetas
- Biblioteca multimedia
- Men?s jer?rquicos
- Temas
- Plugins
- Configuraci?n general
- Revisiones de contenido
- Roles, permisos y permisos por usuario
- Navegaci?n administrativa desde base de datos
- Activity log en los modelos Atlas principales

## Stack t?cnico

- PHP 8.4
- Laravel 13
- React + Inertia
- Tailwind CSS
- PrimeReact para el panel administrativo
- MySQL o MariaDB
- Spatie Permission para RBAC
- Spatie Activitylog para auditor?a

## Arquitectura principal

### Backend

- `app/Domain/Content`
- `app/Domain/Menus`
- `app/Domain/Plugins`
- `app/Domain/Themes`
- `app/Support/Cms`

### Frontend

- `resources/js/layouts`
- `resources/js/pages/admin`
- `resources/js/pages/install`
- `resources/js/pages/site`
- `resources/js/editor`
- `resources/js/components`

### Extensiones

- Temas: `resources/views/themes`
- Plugins: `modules/plugins`

## Instalaci?n

### Requisitos

- PHP 8.3 o superior
- Node.js con `nvm use v24`
- Composer
- MySQL/MariaDB

### Pasos

1. Instalar dependencias PHP y Node.
2. Configurar `.env` con la base de datos.
3. Ejecutar migraciones y seeders.
4. Levantar la aplicaci?n.
5. Abrir `/install` si Atlas a?n no est? marcado como instalado.

### Comandos base

```bash
composer install
npm install
php artisan migrate --seed
php artisan serve
```

### Compilaci?n frontend

```bash
source ~/.nvm/nvm.sh
nvm use v24
npm run build
```

## Sistema de men?s

El panel administrativo usa navegaci?n basada en la tabla legacy `menu`. El sidebar no est? hardcodeado: se construye desde base de datos y permisos.

### Crear un submen?

1. Entra a `Content > Menus`.
2. Selecciona el men? que quieres editar.
3. Crea o edita un item.
4. Elige `Parent item` si quieres que quede dentro de otro enlace.
5. Guarda.

### Drag and drop jer?rquico

Atlas ya soporta jerarqu?a real por ?rbol en el builder:

- puedes arrastrar un item encima de otro para convertirlo en hijo
- puedes cambiar orden dentro del mismo nivel
- Atlas soporta hasta 4 niveles

## Permisos granulares actuales

### Contenido

- `atlas.pages.view`
- `atlas.pages.create`
- `atlas.pages.edit`
- `atlas.pages.delete`
- `atlas.pages.restore`
- `atlas.posts.view`
- `atlas.posts.create`
- `atlas.posts.edit`
- `atlas.posts.delete`
- `atlas.posts.restore`
- `atlas.taxonomies.view`
- `atlas.taxonomies.create`
- `atlas.taxonomies.edit`
- `atlas.taxonomies.delete`

### Multimedia y navegaci?n

- `atlas.media.view`
- `atlas.media.create`
- `atlas.media.edit`
- `atlas.media.delete`
- `atlas.menus.view`
- `atlas.menus.create`
- `atlas.menus.edit`
- `atlas.menus.delete`
- `atlas.menus.reorder`

### Apariencia y sistema

- `atlas.themes.view`
- `atlas.themes.activate`
- `atlas.plugins.view`
- `atlas.plugins.toggle`
- `atlas.settings.view`
- `atlas.settings.edit`

### Administraci?n

- `admin.users.view`
- `admin.users.create`
- `admin.users.edit`
- `admin.users.delete`
- `admin.roles_permissions.manage`
- `admin.user_permissions.manage`
- `admin.navigation.manage`

## Temas

Cada tema puede incluir un `theme.json` con:

- `name`
- `slug`
- `version`
- `author`
- `description`
- `zones`
- `templates`
- `settings`
- `settings_schema`

## Plugins

Cada plugin puede incluir un `plugin.json` con:

- `name`
- `slug`
- `version`
- `description`
- `provider`
- `author`
- `requires`
- `hooks`
- `settings_schema`

## Pruebas

```bash
php artisan test
```

## Avance estimado hacia V1

Atlas CMS est? aproximadamente entre `82% y 85%` del plan inicial.

### Ya resuelto

- base arquitect?nica del CMS
- panel administrativo moderno
- m?dulos principales del MVP
- permisos granulares base
- navegaci?n p?blica y administrativa
- editor por bloques simple con preview
- men?s jer?rquicos
- soporte base de temas y plugins
- instalador funcional

### Falta para cerrar V1

- terminar QA visual de pantallas administrativas restantes
- pulir todav?a m?s `roles-permissions`, `users-permissions`, `navigation-management` y `taxonomies`
- reforzar instalador con m?s validaciones operativas y mensajes de recuperaci?n
- dejar hooks de temas/plugins m?s completos
- ampliar cobertura de pruebas para frontend p?blico, instalador y ?rbol de men?s
- integrar branding final oficial si se entrega el logo fuente exacto

## C?mo replicar la experiencia de [Sistematizar](https://sistematizar.co/)

Atlas ya puede servir como base para replicar una web corporativa estilo Sistematizar, pero orientada 100% a la marca Atlas.

### Qu? se observa en Sistematizar

Seg?n la navegaci?n y p?ginas p?blicas revisadas:

- men? corporativo amplio con varias categor?as
- secciones de servicios y productos
- p?ginas de costos/planes
- fichas de productos de software
- llamadas a contacto
- estructura muy jer?rquica de contenidos

Fuentes revisadas:

- [Home de Sistematizar](https://sistematizar.co/)
- [P?gina de costos](https://sistematizar.co/sitios-web/costos)
- [Soluciones web](https://sistematizar.co/productos/software-web)

### C?mo aterrizar eso en Atlas

1. Definir la arquitectura p?blica del sitio Atlas:
   - `Inicio`
   - `Nosotros`
   - `Servicios`
   - `Productos`
   - `Sitios web`
   - `Costos`
   - `Blog`
   - `Contacto`

2. Crear las p?ginas base en Atlas:
   - `home`
   - `nosotros`
   - `servicios`
   - `productos`
   - `sitios-web`
   - `costos`
   - `contacto`

3. Construir el men? principal `primary` con submen?s:
   - `Productos` con hijos para soluciones o suites
   - `Sitios web` con hijos como `Clientes`, `Costos`, `Posicionamiento`
   - `Servicios` con sus categor?as

4. Crear una plantilla p?blica Atlas inspirada en esa estructura:
   - hero corporativo
   - bloques de portafolio
   - tarjetas de productos
   - planes de precios
   - CTA de contacto
   - footer con datos corporativos

5. Adaptar el contenido a Atlas, no copiar literal:
   - textos de Atlas CMS
   - productos o soluciones Atlas
   - identidad visual Atlas
   - paleta, logo y narrativa propias

6. Modelar precios y productos como contenido reusable:
   - p?ginas para `costos`
   - posts o p?ginas para cada soluci?n
   - bloques HTML o componentes para planes

7. Crear una fase posterior de tematizaci?n:
   - tema p?blico corporativo `atlas-business`
   - header multinivel
   - landing de planes
   - componentes de producto

### Recomendaci?n pr?ctica

La mejor ruta no es ?copiar? el sitio tal cual, sino usarlo como referencia de:

- mapa de navegaci?n
- densidad de contenido
- jerarqu?a de servicios/productos
- estructura corporativa

Y montar eso sobre Atlas con:

- contenido administrable desde el CMS
- bloques reutilizables
- men?s multinivel
- p?ginas de planes y productos propias

## Nota de branding

Si vas a dejar el branding final de Atlas CMS cerrado, lo ideal es subir el logo fuente en `svg` o `png` con fondo transparente para integrarlo en:

- sidebar admin
- login
- favicon
- header p?blico
- instalador

Mientras tanto, el proyecto puede usar una versi?n aproximada del isotipo y tipograf?a dentro del panel.
