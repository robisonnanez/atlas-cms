# Atlas Forge Editor

Plugin WYSIWYG para Atlas CMS inspirado funcionalmente en TinyMCE, pero construido desde cero para integrarse como extensión nativa de Atlas.

## Ruta esperada

```text
modules/plugins/atlas-forge-editor/
```

## Estructura

```text
atlas-forge-editor/
├── plugin.json
├── config/
│   └── atlas-forge-editor.php
├── src/
│   ├── PluginServiceProvider.php
│   ├── Http/Controllers/Admin/EditorSettingsController.php
│   └── Support/AtlasForgeEditor.php
├── routes/admin.php
├── resources/
│   ├── js/plugin.js
│   ├── js/components/AtlasForgeEditor.jsx
│   ├── css/editor.css
│   └── views/admin/settings.blade.php
├── database/migrations/
├── database/seeders/
└── docs/INTEGRACION_ATLAS.md
```

## Instalar

```bash
cp -R atlas-forge-editor modules/plugins/atlas-forge-editor
php artisan vendor:publish --tag=atlas-forge-editor-assets
npm run build
```

Luego activa el plugin desde `System > Plugins`.

## Filosofía

TinyMCE ofrece HTML5, listas, tablas, formateo, plugins, UI configurable, modos classic/inline y CSS de contenido. Atlas Forge Editor toma esas ideas como referencia funcional, pero implementa una base propia y modular para Atlas CMS.
