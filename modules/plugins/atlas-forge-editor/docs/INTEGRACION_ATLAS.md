# Integración de Atlas Forge Editor en Atlas CMS

## 1. Copiar el plugin

Coloca la carpeta completa en:

```text
modules/plugins/atlas-forge-editor/
```

## 2. Descubrimiento

Entra al panel administrativo:

```text
System > Plugins
```

Atlas debe leer `plugin.json`, detectar el provider y permitir activar el plugin.

## 3. Publicar assets

```bash
php artisan vendor:publish --tag=atlas-forge-editor-assets
npm run build
```

## 4. Registrar el componente en el editor actual

Si Atlas ya tiene un registro global de editores, usa la clave:

```js
window.AtlasEditorRegistry['atlas-forge-editor']
```

Ejemplo de uso en React:

```jsx
import AtlasForgeEditor from '@/plugins/atlas-forge-editor/components/AtlasForgeEditor.jsx';

export default function PageForm({ data, setData }) {
  return (
    <AtlasForgeEditor
      value={data.content}
      onChange={(html) => setData('content', html)}
      config={{ defaultHeight: 620, stickyToolbar: true }}
    />
  );
}
```

## 5. Funcionalidades incluidas

- Toolbar agrupada.
- Formatos: párrafo, títulos, cita y preformateado.
- Negrita, cursiva, subrayado, tachado.
- Listas, sangrías y alineación.
- Enlaces con `target="_blank"` y `rel="noopener noreferrer"`.
- Inserción de imagen por URL.
- Inserción de tablas.
- Bloques de código.
- Modo HTML.
- Vista previa.
- CSS de contenido configurable.
- Limpieza básica de HTML antes de guardar.

## 6. Pendientes recomendados para producción

- Conectar `insertImage` con la biblioteca multimedia real de Atlas.
- Reemplazar la sanitización básica por HTMLPurifier si se necesita máxima seguridad.
- Migrar comandos `document.execCommand` hacia una base más robusta basada en ProseMirror/Tiptap si se desea colaboración, historial avanzado o schema estricto.
- Añadir tests de integración para `content.before_save`.
