import { useAtlasLocale } from '@/lib/atlas-locale';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';

export type CustomFieldDefinition = {
    id: number;
    name: string;
    slug: string;
    type: 'text' | 'textarea' | 'number' | 'boolean' | 'date' | 'url' | 'select' | 'media';
    target_type?: 'all' | 'page' | 'post';
    options?: string[] | null;
    placeholder?: string | null;
    description?: string | null;
    is_required: boolean;
    sort_order?: number;
    is_active?: boolean;
};

interface CustomFieldsEditorProps {
    fields?: CustomFieldDefinition[];
    values?: Record<string, any>;
    onChange: (slug: string, value: any) => void;
    title?: string;
    description?: string;
}

export default function CustomFieldsEditor({
    fields = [],
    values = {},
    onChange,
    title,
    description,
}: CustomFieldsEditorProps) {
    const { t } = useAtlasLocale();

    if (!fields || fields.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
                <h3 className="text-lg font-semibold text-slate-900">
                    {title ?? t('Campos personalizados', 'Custom fields')}
                </h3>
                <p className="text-xs text-slate-500">
                    {description ?? t('Metadatos y atributos estructurados para esta publicación.', 'Structured metadata and attributes for this content.')}
                </p>
            </div>

            <div className="grid gap-4">
                {fields.map((field) => {
                    const value = values[field.slug];

                    let parsedOptions: Array<{ label: string; value: string }> = [];
                    if (field.type === 'select') {
                        if (Array.isArray(field.options)) {
                            parsedOptions = field.options.map((opt) => ({ label: String(opt), value: String(opt) }));
                        } else if (typeof field.options === 'string') {
                            try {
                                const parsed = JSON.parse(field.options);
                                if (Array.isArray(parsed)) {
                                    parsedOptions = parsed.map((opt) => ({ label: String(opt), value: String(opt) }));
                                }
                            } catch {
                                parsedOptions = (field.options as string).split(',').map((opt) => {
                                    const trimmed = opt.trim();
                                    return { label: trimmed, value: trimmed };
                                });
                            }
                        }
                    }

                    return (
                        <div key={field.id} className="grid gap-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-slate-700">
                                    {field.name}
                                    {field.is_required && <span className="ml-1 text-red-500">*</span>}
                                </label>
                                <span className="text-[11px] font-mono text-slate-400">{field.slug}</span>
                            </div>

                            {field.type === 'text' && (
                                <InputText
                                    value={value ?? ''}
                                    onChange={(e) => onChange(field.slug, e.target.value)}
                                    placeholder={field.placeholder ?? ''}
                                    className="w-full"
                                />
                            )}

                            {field.type === 'textarea' && (
                                <InputTextarea
                                    value={value ?? ''}
                                    onChange={(e) => onChange(field.slug, e.target.value)}
                                    placeholder={field.placeholder ?? ''}
                                    rows={3}
                                    autoResize
                                    className="w-full"
                                />
                            )}

                            {field.type === 'number' && (
                                <InputNumber
                                    value={value !== undefined && value !== null && value !== '' ? Number(value) : null}
                                    onValueChange={(e) => onChange(field.slug, e.value)}
                                    placeholder={field.placeholder ?? ''}
                                    className="w-full"
                                />
                            )}

                            {field.type === 'boolean' && (
                                <div className="flex items-center gap-3 pt-1">
                                    <InputSwitch
                                        checked={Boolean(value)}
                                        onChange={(e) => onChange(field.slug, Boolean(e.value))}
                                    />
                                    <span className="text-xs text-slate-600">
                                        {Boolean(value) ? t('Sí / Activo', 'Yes / Active') : t('No / Inactivo', 'No / Inactive')}
                                    </span>
                                </div>
                            )}

                            {field.type === 'date' && (
                                <InputText
                                    type="date"
                                    value={value ?? ''}
                                    onChange={(e) => onChange(field.slug, e.target.value)}
                                    className="w-full"
                                />
                            )}

                            {field.type === 'url' && (
                                <InputText
                                    type="url"
                                    value={value ?? ''}
                                    onChange={(e) => onChange(field.slug, e.target.value)}
                                    placeholder={field.placeholder ?? 'https://'}
                                    className="w-full"
                                />
                            )}

                            {field.type === 'select' && (
                                <Dropdown
                                    value={value ?? ''}
                                    options={parsedOptions}
                                    onChange={(e) => onChange(field.slug, e.value)}
                                    placeholder={field.placeholder ?? t('Selecciona una opción', 'Select an option')}
                                    className="w-full"
                                />
                            )}

                            {field.type === 'media' && (
                                <InputText
                                    value={value ?? ''}
                                    onChange={(e) => onChange(field.slug, e.target.value)}
                                    placeholder={field.placeholder ?? '/storage/uploads/...'}
                                    className="w-full"
                                />
                            )}

                            {field.description && (
                                <p className="text-[11px] text-slate-500">{field.description}</p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
