import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAtlasLocale } from '@/lib/atlas-locale';
import { Head, router, usePage } from '@inertiajs/react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { useRef, useState } from 'react';

type CustomFieldRecord = {
    id: number;
    name: string;
    slug: string;
    type: 'text' | 'textarea' | 'number' | 'boolean' | 'date' | 'url' | 'select' | 'media';
    target_type: 'all' | 'page' | 'post';
    options?: string[] | null;
    placeholder?: string | null;
    description?: string | null;
    is_required: boolean;
    sort_order: number;
    is_active: boolean;
    created_at?: string | null;
};

type FormState = {
    id?: number;
    name: string;
    slug: string;
    type: 'text' | 'textarea' | 'number' | 'boolean' | 'date' | 'url' | 'select' | 'media';
    target_type: 'all' | 'page' | 'post';
    optionsText: string;
    placeholder: string;
    description: string;
    is_required: boolean;
    sort_order: number;
    is_active: boolean;
};

const emptyForm: FormState = {
    name: '',
    slug: '',
    type: 'text',
    target_type: 'all',
    optionsText: '',
    placeholder: '',
    description: '',
    is_required: false,
    sort_order: 0,
    is_active: true,
};

export default function CustomFieldsIndex({
    fields = [],
    types = ['text', 'textarea', 'number', 'boolean', 'date', 'url', 'select', 'media'],
    targets = ['all', 'page', 'post'],
}: {
    fields: CustomFieldRecord[];
    types: string[];
    targets: string[];
}) {
    const { t } = useAtlasLocale();
    const toast = useRef<Toast>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [formData, setFormData] = useState<FormState>(emptyForm);
    const [isSaving, setIsSaving] = useState(false);

    const showToast = (severity: 'success' | 'warn' | 'error', detail: string) => {
        toast.current?.show({ severity, summary: t('Campos personalizados', 'Custom fields'), detail, life: 3000 });
    };

    const typeOptions = [
        { label: t('Texto simple', 'Simple text'), value: 'text' },
        { label: t('Área de texto', 'Textarea'), value: 'textarea' },
        { label: t('Número', 'Number'), value: 'number' },
        { label: t('Booleano (Sí/No)', 'Boolean (Yes/No)'), value: 'boolean' },
        { label: t('Fecha', 'Date'), value: 'date' },
        { label: t('Enlace URL', 'URL link'), value: 'url' },
        { label: t('Selector múltiple', 'Select options'), value: 'select' },
        { label: t('Archivo / Multimedia', 'Media asset'), value: 'media' },
    ];

    const targetOptions = [
        { label: t('Todas las entidades', 'All entities'), value: 'all' },
        { label: t('Solo Páginas', 'Pages only'), value: 'page' },
        { label: t('Solo Entradas / Artículos', 'Posts only'), value: 'post' },
    ];

    const openCreateDialog = () => {
        setFormData(emptyForm);
        setDialogOpen(true);
    };

    const openEditDialog = (record: CustomFieldRecord) => {
        let optText = '';
        if (Array.isArray(record.options)) {
            optText = record.options.join(', ');
        }

        setFormData({
            id: record.id,
            name: record.name,
            slug: record.slug,
            type: record.type,
            target_type: record.target_type,
            optionsText: optText,
            placeholder: record.placeholder ?? '',
            description: record.description ?? '',
            is_required: Boolean(record.is_required),
            sort_order: Number(record.sort_order ?? 0),
            is_active: Boolean(record.is_active),
        });
        setDialogOpen(true);
    };

    const handleSubmit = () => {
        if (!formData.name.trim()) {
            showToast('warn', t('Ingresa un nombre para el campo.', 'Enter a field name.'));
            return;
        }

        setIsSaving(true);
        const payload: any = {
            name: formData.name.trim(),
            slug: formData.slug.trim() || undefined,
            type: formData.type,
            target_type: formData.target_type,
            placeholder: formData.placeholder.trim() || null,
            description: formData.description.trim() || null,
            is_required: formData.is_required,
            sort_order: formData.sort_order,
            is_active: formData.is_active,
        };

        if (formData.type === 'select' && formData.optionsText.trim()) {
            payload.options = formData.optionsText
                .split(',')
                .map((opt) => opt.trim())
                .filter(Boolean);
        } else {
            payload.options = null;
        }

        if (formData.id) {
            router.put(`/admin/custom-fields/${formData.id}`, payload, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSaving(false);
                    setDialogOpen(false);
                    showToast('success', t('Campo personalizado actualizado.', 'Custom field updated.'));
                },
                onError: () => setIsSaving(false),
            });
        } else {
            router.post('/admin/custom-fields', payload, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSaving(false);
                    setDialogOpen(false);
                    showToast('success', t('Campo personalizado creado.', 'Custom field created.'));
                },
                onError: () => setIsSaving(false),
            });
        }
    };

    const handleDelete = (record: CustomFieldRecord) => {
        if (confirm(t(`¿Eliminar el campo "${record.name}"? Los valores asociados no se perderán pero no se mostrarán.`, `Delete field "${record.name}"? Associated values will not be lost but won't be shown.`))) {
            router.delete(`/admin/custom-fields/${record.id}`, {
                preserveScroll: true,
                onSuccess: () => showToast('success', t('Campo eliminado.', 'Field deleted.')),
            });
        }
    };

    const typeSeverity = (type: string): 'info' | 'success' | 'warning' | 'danger' | null => {
        switch (type) {
            case 'text':
            case 'textarea':
                return 'info';
            case 'number':
                return 'warning';
            case 'boolean':
                return 'success';
            case 'select':
                return 'danger';
            default:
                return null;
        }
    };

    const targetBadge = (target: string) => {
        switch (target) {
            case 'page':
                return <Tag value={t('Páginas', 'Pages')} severity="info" />;
            case 'post':
                return <Tag value={t('Entradas', 'Posts')} severity="warning" />;
            default:
                return <Tag value={t('Todas', 'All')} severity="success" />;
        }
    };

    const activeCount = fields.filter((f) => f.is_active).length;
    const pageFieldsCount = fields.filter((f) => f.target_type === 'page' || f.target_type === 'all').length;
    const postFieldsCount = fields.filter((f) => f.target_type === 'post' || f.target_type === 'all').length;

    return (
        <>
            <Head title={t('Campos Personalizados', 'Custom Fields')} />
            <Toast ref={toast} />

            <div className="space-y-6">
                <section className="grid gap-4 md:grid-cols-4">
                    <Card className="rounded-3xl border border-slate-200/80 shadow-sm md:col-span-2">
                        <CardHeader>
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
                                {t('Estructura de Contenido', 'Content Structure')}
                            </p>
                            <CardTitle className="text-3xl">
                                {t('Campos Personalizados', 'Custom Fields')}
                            </CardTitle>
                            <CardDescription>
                                {t(
                                    'Define atributos adicionales inspirados en com_fields para enriquecer páginas, artículos y modelos de datos dinámicos.',
                                    'Define additional attributes inspired by com_fields to enrich pages, posts and dynamic data models.'
                                )}
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-slate-500 font-normal">
                                {t('Total registrados', 'Total registered')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-baseline justify-between">
                                <span className="text-3xl font-bold text-slate-900">{fields.length}</span>
                                <Tag value={`${activeCount} ${t('activos', 'active')}`} severity="success" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-slate-500 font-normal">
                                {t('Cobertura de contenido', 'Content coverage')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1 text-xs text-slate-600">
                            <div className="flex justify-between">
                                <span>{t('Páginas:', 'Pages:')}</span>
                                <span className="font-semibold text-slate-900">{pageFieldsCount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>{t('Entradas blog:', 'Blog posts:')}</span>
                                <span className="font-semibold text-slate-900">{postFieldsCount}</span>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>{t('Listado de campos', 'Fields list')}</CardTitle>
                            <CardDescription>
                                {t('Administra los esquemas de campos disponibles para editores.', 'Manage field schemas available for editors.')}
                            </CardDescription>
                        </div>
                        <Button
                            label={t('Nuevo campo', 'New field')}
                            icon="pi pi-plus"
                            className="rounded-full"
                            onClick={openCreateDialog}
                        />
                    </CardHeader>

                    <CardContent>
                        <DataTable
                            value={fields}
                            dataKey="id"
                            paginator
                            rows={10}
                            stripedRows
                            className="rounded-2xl border border-slate-200"
                            emptyMessage={t('No hay campos personalizados configurados.', 'No custom fields configured yet.')}
                        >
                            <Column
                                field="name"
                                header={t('Nombre', 'Name')}
                                sortable
                                body={(row: CustomFieldRecord) => (
                                    <div>
                                        <div className="font-medium text-slate-900">{row.name}</div>
                                        {row.description && (
                                            <div className="text-xs text-slate-500">{row.description}</div>
                                        )}
                                    </div>
                                )}
                            />

                            <Column
                                field="slug"
                                header="Slug"
                                sortable
                                body={(row: CustomFieldRecord) => (
                                    <code className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-800">
                                        {row.slug}
                                    </code>
                                )}
                            />

                            <Column
                                field="type"
                                header={t('Tipo', 'Type')}
                                sortable
                                body={(row: CustomFieldRecord) => (
                                    <Tag value={row.type} severity={typeSeverity(row.type)} />
                                )}
                            />

                            <Column
                                field="target_type"
                                header={t('Destino', 'Target')}
                                sortable
                                body={(row: CustomFieldRecord) => targetBadge(row.target_type)}
                            />

                            <Column
                                field="is_required"
                                header={t('Requerido', 'Required')}
                                body={(row: CustomFieldRecord) => (
                                    <Tag
                                        value={row.is_required ? t('Sí', 'Yes') : t('No', 'No')}
                                        severity={row.is_required ? 'danger' : 'info'}
                                    />
                                )}
                            />

                            <Column
                                field="is_active"
                                header={t('Estado', 'Status')}
                                body={(row: CustomFieldRecord) => (
                                    <Tag
                                        value={row.is_active ? t('Activo', 'Active') : t('Inactivo', 'Inactive')}
                                        severity={row.is_active ? 'success' : 'warning'}
                                    />
                                )}
                            />

                            <Column
                                header={t('Acciones', 'Actions')}
                                body={(row: CustomFieldRecord) => (
                                    <div className="flex gap-2">
                                        <Button
                                            icon="pi pi-pencil"
                                            text
                                            rounded
                                            onClick={() => openEditDialog(row)}
                                            tooltip={t('Editar', 'Edit')}
                                        />
                                        <Button
                                            icon="pi pi-trash"
                                            text
                                            rounded
                                            severity="danger"
                                            onClick={() => handleDelete(row)}
                                            tooltip={t('Eliminar', 'Delete')}
                                        />
                                    </div>
                                )}
                            />
                        </DataTable>
                    </CardContent>
                </Card>
            </div>

            <Dialog
                header={formData.id ? t('Editar campo personalizado', 'Edit custom field') : t('Nuevo campo personalizado', 'New custom field')}
                visible={dialogOpen}
                onHide={() => setDialogOpen(false)}
                className="w-full max-w-2xl"
            >
                <div className="grid gap-4 py-3">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium text-slate-700">{t('Nombre del campo', 'Field name')} *</label>
                        <InputText
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder={t('Ej: Color de fondo destacado', 'Ex: Featured background color')}
                            className="w-full"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-slate-700">{t('Tipo de dato', 'Data type')}</label>
                            <Dropdown
                                value={formData.type}
                                options={typeOptions}
                                onChange={(e) => setFormData({ ...formData, type: e.value })}
                                className="w-full"
                            />
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-slate-700">{t('Destino / Asignación', 'Target assignment')}</label>
                            <Dropdown
                                value={formData.target_type}
                                options={targetOptions}
                                onChange={(e) => setFormData({ ...formData, target_type: e.value })}
                                className="w-full"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-slate-700">{t('Slug (opcional)', 'Slug (optional)')}</label>
                            <InputText
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                placeholder="ej: color_fondo"
                                className="w-full"
                            />
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-slate-700">{t('Marcador de posición (Placeholder)', 'Placeholder')}</label>
                            <InputText
                                value={formData.placeholder}
                                onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
                                placeholder={t('Ej: #ffffff o escribe aquí', 'Ex: #ffffff or type here')}
                                className="w-full"
                            />
                        </div>
                    </div>

                    {formData.type === 'select' && (
                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-slate-700">
                                {t('Opciones (separadas por coma)', 'Options (comma-separated)')} *
                            </label>
                            <InputText
                                value={formData.optionsText}
                                onChange={(e) => setFormData({ ...formData, optionsText: e.target.value })}
                                placeholder="Rojo, Verde, Azul, Amarillo"
                                className="w-full"
                            />
                        </div>
                    )}

                    <div className="grid gap-2">
                        <label className="text-sm font-medium text-slate-700">{t('Descripción / Ayuda', 'Description / Help text')}</label>
                        <InputTextarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder={t('Instrucción para los editores sobre este campo.', 'Instructions for editors about this field.')}
                            rows={3}
                            autoResize
                            className="w-full"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-medium text-slate-700">{t('¿Es obligatorio?', 'Is required?')}</span>
                            <InputSwitch
                                checked={formData.is_required}
                                onChange={(e) => setFormData({ ...formData, is_required: Boolean(e.value) })}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-medium text-slate-700">{t('¿Está activo?', 'Is active?')}</span>
                            <InputSwitch
                                checked={formData.is_active}
                                onChange={(e) => setFormData({ ...formData, is_active: Boolean(e.value) })}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-medium text-slate-700">{t('Orden', 'Sort order')}</span>
                            <InputNumber
                                value={formData.sort_order}
                                onValueChange={(e) => setFormData({ ...formData, sort_order: Number(e.value ?? 0) })}
                                className="w-full"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-3">
                        <Button
                            label={t('Cancelar', 'Cancel')}
                            className="p-button-text"
                            onClick={() => setDialogOpen(false)}
                        />
                        <Button
                            label={formData.id ? t('Guardar cambios', 'Save changes') : t('Crear campo', 'Create field')}
                            icon="pi pi-check"
                            loading={isSaving}
                            onClick={handleSubmit}
                        />
                    </div>
                </div>
            </Dialog>
        </>
    );
}
