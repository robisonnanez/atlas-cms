# Estructura de un plugin en Atlas CMS

## Ubicaci?n
Cada plugin vive en:

```text
modules/plugins/<slug-del-plugin>/
```

Ejemplo actual:

```text
modules/plugins/contact-form/
modules/plugins/seo-plus/
```

## Archivo m?nimo obligatorio
Todo plugin debe incluir al menos:

```text
modules/plugins/mi-plugin/plugin.json
```

## Estructura recomendada
```text
modules/plugins/mi-plugin/
??? plugin.json
??? src/
?   ??? PluginServiceProvider.php
?   ??? Hooks/
?   ??? Http/
?   ??? Support/
??? resources/
?   ??? views/
?   ??? js/
??? routes/
?   ??? web.php
?   ??? admin.php
??? database/
    ??? migrations/
    ??? seeders/
```

## Ejemplo de `plugin.json`
```json
{
  "name": "Mi Plugin",
  "slug": "mi-plugin",
  "version": "1.0.0",
  "description": "Extiende Atlas con una nueva capacidad.",
  "provider": "Modules\\Plugins\\MiPlugin\\PluginServiceProvider",
  "author": "Tu equipo",
  "requires": [],
  "hooks": ["content.render", "settings.register"],
  "settings_schema": [
    { "key": "enabled", "label": "Activo", "type": "boolean" },
    { "key": "endpoint", "label": "Endpoint", "type": "text" }
  ]
}
```

## Qu? lee Atlas del manifiesto
Atlas toma desde `plugin.json`:
- `name`
- `slug`
- `version`
- `description`
- `provider`
- `author`
- `requires`
- `hooks`
- `settings_schema`

## Flujo recomendado para crear un plugin nuevo
1. Crear la carpeta del plugin en `modules/plugins/`.
2. Crear el archivo `plugin.json`.
3. Definir un `provider` si el plugin necesita bootstrapping real.
4. Organizar c?digo en `src/`, vistas en `resources/` y rutas en `routes/`.
5. Entrar al panel en `System > Plugins`.
6. Dejar que Atlas descubra el plugin.
7. Activarlo o desactivarlo desde el panel.

## Cu?ndo usar un plugin
Usa un plugin cuando quieras agregar:
- formularios especializados
- integraciones externas
- widgets de dashboard
- bloques editoriales nuevos
- l?gica SEO adicional
- anal?tica, newsletter o comercio

## Buenas pr?cticas
- Mantener cada plugin enfocado en una sola responsabilidad.
- Declarar claramente los hooks que toca.
- No acoplar el plugin a un tema espec?fico.
- Dise?ar `settings_schema` para que el plugin pueda configurarse desde UI.
- Si el plugin necesita tablas propias, aislar sus migraciones dentro del plugin.
