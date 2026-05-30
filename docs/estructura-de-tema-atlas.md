# Estructura de un tema en Atlas CMS

## Ubicaci?n
Cada tema vive en:

```text
resources/views/themes/<slug-del-tema>/
```

Ejemplo actual:

```text
resources/views/themes/atlas-default/
```

## Archivos m?nimos
Un tema funcional de Atlas debe incluir como m?nimo:

```text
resources/views/themes/mi-tema/
??? theme.json
??? home.blade.php
??? page.blade.php
??? post.blade.php
??? partials/
    ??? header.blade.php
    ??? footer.blade.php
```

## Rol de cada archivo
- `theme.json`: manifiesto del tema. Atlas lo descubre y sincroniza hacia la tabla `themes`.
- `home.blade.php`: vista de la portada.
- `page.blade.php`: vista de p?ginas internas.
- `post.blade.php`: vista de entradas o noticias.
- `partials/header.blade.php`: fragmento reutilizable del encabezado.
- `partials/footer.blade.php`: fragmento reutilizable del pie de p?gina.

## Ejemplo de `theme.json`
```json
{
  "name": "Mi Tema Institucional",
  "slug": "mi-tema-institucional",
  "version": "1.0.0",
  "author": "Tu equipo",
  "description": "Tema institucional para Atlas CMS.",
  "zones": ["header", "footer", "sidebar"],
  "templates": ["home", "page", "post"],
  "settings": {
    "accent": "#0f766e",
    "surface": "#ffffff"
  },
  "settings_schema": [
    { "key": "accent", "label": "Color principal", "type": "color" },
    { "key": "surface", "label": "Color de fondo", "type": "color" }
  ]
}
```

## Qu? lee Atlas del manifiesto
Atlas toma desde `theme.json`:
- `name`
- `slug`
- `version`
- `author`
- `description`
- `zones`
- `templates`
- `settings`
- `settings_schema`

## Flujo recomendado para crear un tema nuevo
1. Crear la carpeta del tema en `resources/views/themes/`.
2. Agregar el archivo `theme.json`.
3. Crear `home.blade.php`, `page.blade.php` y `post.blade.php`.
4. Crear `partials/header.blade.php` y `partials/footer.blade.php`.
5. Entrar al panel de Atlas en `System > Temas`.
6. Dejar que Atlas descubra el tema.
7. Activarlo desde el panel.

## Buenas pr?cticas
- No mezclar l?gica de negocio compleja dentro de Blade.
- Mantener el manifiesto como fuente ?nica de metadata del tema.
- Preparar el tema para p?ginas institucionales, blog y portada.
- Pensar el tema como una capa visual intercambiable, no como un m?dulo del core.
