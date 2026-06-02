import AtlasForgeEditor from './components/AtlasForgeEditor.jsx';

window.AtlasForgeEditor = AtlasForgeEditor;

window.AtlasEditorRegistry = window.AtlasEditorRegistry || {};
window.AtlasEditorRegistry['atlas-forge-editor'] = {
  name: 'Atlas Forge Editor',
  component: AtlasForgeEditor,
};

export default AtlasForgeEditor;
