import AtlasForgeEditorPlugin from '../../../modules/plugins/atlas-forge-editor/resources/js/components/AtlasForgeEditor.jsx';

type AtlasForgeEditorProps = {
    value?: string;
    onChange?: (value: string) => void;
    name?: string;
    placeholder?: string;
    config?: Record<string, unknown>;
};

export default function AtlasForgeEditor(props: AtlasForgeEditorProps) {
    return <AtlasForgeEditorPlugin {...props} />;
}
