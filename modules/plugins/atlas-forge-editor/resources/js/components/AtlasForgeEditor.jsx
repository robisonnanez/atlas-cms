import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import '../../css/editor.css';

const DEFAULT_CONFIG = {
  defaultHeight: 560,
  stickyToolbar: true,
  allowHtmlMode: true,
  allowTables: true,
  allowMedia: true,
  contentCss: '',
};

const BUTTONS = [
  { key: 'undo', label: '↶', title: 'Deshacer', command: 'undo' },
  { key: 'redo', label: '↷', title: 'Rehacer', command: 'redo' },
  { divider: true },
  { key: 'bold', label: 'B', title: 'Negrita', command: 'bold' },
  { key: 'italic', label: 'I', title: 'Cursiva', command: 'italic' },
  { key: 'underline', label: 'U', title: 'Subrayado', command: 'underline' },
  { key: 'strikeThrough', label: 'S', title: 'Tachado', command: 'strikeThrough' },
  { divider: true },
  { key: 'insertUnorderedList', label: '• Lista', title: 'Lista', command: 'insertUnorderedList' },
  { key: 'insertOrderedList', label: '1. Lista', title: 'Lista numerada', command: 'insertOrderedList' },
  { key: 'outdent', label: '⇤', title: 'Reducir sangría', command: 'outdent' },
  { key: 'indent', label: '⇥', title: 'Aumentar sangría', command: 'indent' },
  { divider: true },
  { key: 'justifyLeft', label: '⟸', title: 'Alinear izquierda', command: 'justifyLeft' },
  { key: 'justifyCenter', label: '≡', title: 'Centrar', command: 'justifyCenter' },
  { key: 'justifyRight', label: '⟹', title: 'Alinear derecha', command: 'justifyRight' },
  { key: 'justifyFull', label: '☰', title: 'Justificar', command: 'justifyFull' },
];

function cleanWordHtml(html) {
  return html
    .replace(/<!--([\s\S]*?)-->/g, '')
    .replace(/<\/?(meta|link|style|script)[^>]*>/gi, '')
    .replace(/\sclass=("|')?Mso[^\s>"']+("|')?/gi, '')
    .replace(/\sstyle=("|')?[^"']*mso-[^"']*("|')?/gi, '');
}

function insertHtmlAtCursor(html) {
  document.execCommand('insertHTML', false, html);
}

export default function AtlasForgeEditor({
  value = '',
  onChange,
  config = {},
  name = 'content',
  placeholder = 'Escribe tu contenido...',
}) {
  const settings = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config]);
  const editorRef = useRef(null);
  const [html, setHtml] = useState(value || '');
  const [mode, setMode] = useState('visual');
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (value !== html) setHtml(value || '');
  }, [value]);

  useEffect(() => {
    if (mode === 'visual' && editorRef.current && editorRef.current.innerHTML !== html) {
      editorRef.current.innerHTML = html || '';
    }
  }, [html, mode]);

  const emitChange = useCallback((next) => {
    setHtml(next);
    onChange?.(next);
  }, [onChange]);

  const syncFromEditor = useCallback(() => {
    const next = cleanWordHtml(editorRef.current?.innerHTML || '');
    emitChange(next);
  }, [emitChange]);

  const run = useCallback((command, value = null) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    syncFromEditor();
  }, [syncFromEditor]);

  const setBlock = (tag) => run('formatBlock', tag);

  const createLink = () => {
    const url = window.prompt('URL del enlace');
    if (!url) return;
    run('createLink', url);
    const links = editorRef.current?.querySelectorAll(`a[href="${url}"]`) || [];
    links.forEach((link) => {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    });
    syncFromEditor();
  };

  const insertImage = () => {
    const url = window.prompt('URL de la imagen');
    if (!url) return;
    const alt = window.prompt('Texto alternativo') || '';
    insertHtmlAtCursor(`<figure><img src="${url}" alt="${alt}" /><figcaption></figcaption></figure>`);
    syncFromEditor();
  };

  const insertTable = () => {
    const rows = Number(window.prompt('Filas', '3') || 3);
    const cols = Number(window.prompt('Columnas', '3') || 3);
    const body = Array.from({ length: rows }).map(() => `<tr>${Array.from({ length: cols }).map(() => '<td><br></td>').join('')}</tr>`).join('');
    insertHtmlAtCursor(`<table><tbody>${body}</tbody></table><p><br></p>`);
    syncFromEditor();
  };

  const insertCode = () => {
    insertHtmlAtCursor('<pre><code>// Código</code></pre><p><br></p>');
    syncFromEditor();
  };

  const clearFormat = () => run('removeFormat');

  const toolbarClass = settings.stickyToolbar ? 'afe-toolbar afe-toolbar--sticky' : 'afe-toolbar';

  return (
    <div className="afe-shell" style={{ '--afe-min-height': `${settings.defaultHeight}px` }}>
      <style>{`.afe-content{${settings.contentCss || ''}}`}</style>

      <div className={toolbarClass} role="toolbar" aria-label="Herramientas del editor">
        <select className="afe-select" onChange={(event) => setBlock(event.target.value)} defaultValue="p" title="Formato">
          <option value="p">Párrafo</option>
          <option value="h1">Título 1</option>
          <option value="h2">Título 2</option>
          <option value="h3">Título 3</option>
          <option value="blockquote">Cita</option>
          <option value="pre">Preformateado</option>
        </select>

        {BUTTONS.map((button, index) => button.divider ? (
          <span key={`divider-${index}`} className="afe-divider" />
        ) : (
          <button key={button.key} type="button" title={button.title} onClick={() => run(button.command)}>{button.label}</button>
        ))}

        <span className="afe-divider" />
        <button type="button" onClick={createLink}>Enlace</button>
        {settings.allowMedia && <button type="button" onClick={insertImage}>Imagen</button>}
        {settings.allowTables && <button type="button" onClick={insertTable}>Tabla</button>}
        <button type="button" onClick={insertCode}>Código</button>
        <button type="button" onClick={clearFormat}>Limpiar</button>

        <span className="afe-spacer" />
        <button type="button" onClick={() => setPreview(!preview)}>{preview ? 'Editar' : 'Preview'}</button>
        {settings.allowHtmlMode && <button type="button" onClick={() => setMode(mode === 'visual' ? 'html' : 'visual')}>{mode === 'visual' ? 'HTML' : 'Visual'}</button>}
      </div>

      <input type="hidden" name={name} value={html} />

      {preview ? (
        <article className="afe-content afe-preview" dangerouslySetInnerHTML={{ __html: html }} />
      ) : mode === 'html' ? (
        <textarea className="afe-html" value={html} onChange={(event) => emitChange(event.target.value)} spellCheck="false" />
      ) : (
        <div
          ref={editorRef}
          className="afe-content afe-editable"
          contentEditable
          suppressContentEditableWarning
          data-placeholder={placeholder}
          onInput={syncFromEditor}
          onBlur={syncFromEditor}
          onPaste={() => window.setTimeout(syncFromEditor, 0)}
        />
      )}
    </div>
  );
}
