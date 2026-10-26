import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAtlasLocale } from '@/lib/atlas-locale';
import { Head, router, useForm } from '@inertiajs/react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { MultiSelect } from 'primereact/multiselect';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { useRef, useState } from 'react';

type ModuleTypeDefinition = {
    type: string;
    label: string;
    description: string;
    icon: string;
    default_content: Record<string, unknown>;
};

type PositionDefinition = {
    key: string;
    label: string;
    description?: string;
};

type ContentModuleItem = {
    id: number;
    title: string;
    show_title: boolean;
    type: string;
    position: string;
    theme_slug?: string | null;
    order: number;
    is_active: boolean;
    content: Record<string, any>;
    assignment: { rule?: string; pages?: string[] };
    custom_classes?: string | null;
    created_at: string;
};

type PageItem = { id: number; title: string; slug: string };
type MenuItem = { id: number; name: string; location?: string | null };

type Props = {
    modules: ContentModuleItem[];
    positions: PositionDefinition[];
    types: ModuleTypeDefinition[];
    menus: MenuItem[];
    pages: PageItem[];
    activeTheme?: { name: string; slug: string } | null;
    filters: { position?: string | null; status?: string | null };
    stats: { total: number; active: number; positions_count: number };
};

export default function ContentModulesIndex({
    modules = [],
    positions = [],
    types = [],
    menus = [],
    pages = [],
    activeTheme,
    filters,
    stats,
}: Props) {
    const { t } = useAtlasLocale();
    const toast = useRef<Toast>(null);

    const [modalVisible, setModalVisible] = useState(false);
    const [editingModule, setEditingModule] = useState<ContentModuleItem | null>(null);
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [moduleToDelete, setModuleToDelete] = useState<ContentModuleItem | null>(null);

    const initialFormData = {
        title: '',
        show_title: true,
        type: 'custom_html',
        position: positions[0]?.key || 'sidebar',
        theme_slug: '',
        order: 0,
        is_active: true,
        custom_classes: '',
        content: {
            html: '',
            menu_id: null as number | null,
            layout: 'vertical',
            limit: 5,
            show_date: true,
            show_excerpt: false,
            show_count: true,
            placeholder: 'Buscar en el sitio...',
            email: '',
            phone: '',
            address: '',
            hours: '',
        },
        assignment: {
            rule: 'all',
            pages: [] as string[],
        },
    };

    const form = useForm(initialFormData);

    const openCreateModal = () => {
        setEditingModule(null);
        form.setData({
            ...initialFormData,
            position: positions[0]?.key || 'sidebar',
        });
        setModalVisible(true);
    };

    const openEditModal = (item: ContentModuleItem) => {
        setEditingModule(item);
        form.setData({
            title: item.title,
            show_title: item.show_title,
            type: item.type,
            position: item.position,
            theme_slug: item.theme_slug || '',
            order: item.order,
            is_active: item.is_active,
            custom_classes: item.custom_classes || '',
            content: {
                ...initialFormData.content,
                ...(item.content || {}),
            },
            assignment: {
                rule: item.assignment?.rule || 'all',
                pages: item.assignment?.pages || [],
            },
        });
        setModalVisible(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingModule) {
            form.put(`/admin/content-modules/${editingModule.id}`, {
                onSuccess: () => {
                    setModalVisible(false);
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Guardado',
                        detail: 'Módulo actualizado correctamente.',
                        life: 3000,
                    });
                },
            });
        } else {
            form.post('/admin/content-modules', {
                onSuccess: () => {
                    setModalVisible(false);
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Creado',
                        detail: 'Módulo creado exitosamente.',
                        life: 3000,
                    });
                },
            });
        }
    };

    const confirmDelete = (item: ContentModuleItem) => {
        setModuleToDelete(item);
        setDeleteDialogVisible(true);
    };

    const handleDelete = () => {
        if (!moduleToDelete) return;

        router.delete(`/admin/content-modules/${moduleToDelete.id}`, {
            onSuccess: () => {
                setDeleteDialogVisible(false);
                toast.current?.show({
                    severity: 'info',
                    summary: 'Eliminado',
                    detail: 'El módulo ha sido eliminado.',
                    life: 3000,
                });
            },
        });
    };

    const handleToggle = (item: ContentModuleItem) => {
        router.post(`/admin/content-modules/${item.id}/toggle`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Estado Actualizado',
                    detail: !item.is_active ? 'Módulo activado' : 'Módulo desactivado',
                    life: 2500,
                });
            },
        });
    };

    const assignmentRuleOptions = [
        { label: 'Toda la web (Global)', value: 'all' },
        { label: 'Solo en portada (Home)', value: 'home_only' },
        { label: 'Solo en blog y artículos', value: 'blog_only' },
        { label: 'Solo en páginas seleccionadas', value: 'specific_pages' },
        { label: 'En toda la web excepto páginas seleccionadas', value: 'except_pages' },
    ];

    const positionOptions = positions.map((p) => ({
        label: `${p.label} (${p.key})`,
        value: p.key,
    }));

    const typeOptions = types.map((t) => ({
        label: t.label,
        value: t.type,
    }));

    const pageOptions = pages.map((p) => ({
        label: `${p.title} (/${p.slug})`,
        value: p.slug,
    }));

    const menuOptions = menus.map((m) => ({
        label: `${m.name}${m.location ? ` [${m.location}]` : ''}`,
        value: m.id,
    }));

    return (
        <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto">
            <Head title="Módulos de Contenido y Posiciones - Atlas CMS" />
            <Toast ref={toast} />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                        Módulos de Contenido
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Organiza widgets y bloques dinámicos según las posiciones del tema visual ({activeTheme?.name ?? 'Atlas'}).
                    </p>
                </div>
                <div>
                    <Button
                        label="Nuevo Módulo"
                        icon="pi pi-plus"
                        className="p-button-primary bg-sky-600 border-none px-4 py-2.5 rounded-xl shadow"
                        onClick={openCreateModal}
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-xs uppercase tracking-wider font-semibold text-slate-500">
                            Total de Módulos
                        </CardDescription>
                        <CardTitle className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                            {stats.total}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-slate-500">
                        Instancias configuradas en el sistema
                    </CardContent>
                </Card>

                <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-xs uppercase tracking-wider font-semibold text-slate-500">
                            Módulos Activos
                        </CardDescription>
                        <CardTitle className="text-3xl font-bold text-emerald-600">
                            {stats.active}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-slate-500">
                        Visibles en el sitio público
                    </CardContent>
                </Card>

                <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-xs uppercase tracking-wider font-semibold text-slate-500">
                            Posiciones Disponibles
                        </CardDescription>
                        <CardTitle className="text-3xl font-bold text-sky-600">
                            {stats.positions_count}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-slate-500">
                        Zonas soportadas por el tema activo
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="w-full sm:w-64">
                    <Dropdown
                        value={filters.position || ''}
                        options={[{ label: 'Todas las posiciones', value: '' }, ...positionOptions]}
                        onChange={(e) => router.get('/admin/content-modules', { ...filters, position: e.value || undefined }, { preserveState: true })}
                        placeholder="Filtrar por posición"
                        className="w-full text-sm rounded-xl"
                    />
                </div>
                <div className="w-full sm:w-48">
                    <Dropdown
                        value={filters.status || ''}
                        options={[
                            { label: 'Todos los estados', value: '' },
                            { label: 'Solo activos', value: 'active' },
                            { label: 'Solo inactivos', value: 'inactive' },
                        ]}
                        onChange={(e) => router.get('/admin/content-modules', { ...filters, status: e.value || undefined }, { preserveState: true })}
                        placeholder="Filtrar por estado"
                        className="w-full text-sm rounded-xl"
                    />
                </div>
                {(filters.position || filters.status) && (
                    <Button
                        label="Limpiar filtros"
                        icon="pi pi-filter-slash"
                        className="p-button-text p-button-sm text-slate-600 dark:text-slate-400"
                        onClick={() => router.get('/admin/content-modules')}
                    />
                )}
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <DataTable
                    value={modules}
                    emptyMessage="No se encontraron módulos de contenido configurados."
                    responsiveLayout="stack"
                    className="p-datatable-sm"
                >
                    <Column
                        field="order"
                        header="#"
                        style={{ width: '4rem', textAlign: 'center' }}
                        body={(row: ContentModuleItem) => (
                            <span className="font-mono text-xs text-slate-400 font-semibold">{row.order}</span>
                        )}
                    />
                    <Column
                        field="title"
                        header="Título y Tipo"
                        body={(row: ContentModuleItem) => {
                            const typeDef = types.find((t) => t.type === row.type);
                            return (
                                <div>
                                    <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                        <span>{row.title}</span>
                                        {!row.show_title && (
                                            <span className="text-[10px] uppercase font-bold text-slate-400 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                                                Título oculto
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                                        <i className={`${typeDef?.icon || 'pi pi-box'} text-xs text-sky-600`} />
                                        <span>{typeDef?.label || row.type}</span>
                                    </div>
                                </div>
                            );
                        }}
                    />
                    <Column
                        field="position"
                        header="Posición"
                        body={(row: ContentModuleItem) => (
                            <Tag
                                value={row.position}
                                severity="info"
                                className="font-mono text-xs rounded-lg px-2.5 py-1 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800"
                            />
                        )}
                    />
                    <Column
                        field="assignment"
                        header="Asignación"
                        body={(row: ContentModuleItem) => {
                            const rule = row.assignment?.rule || 'all';
                            const ruleObj = assignmentRuleOptions.find((r) => r.value === rule);
                            return (
                                <div className="text-xs text-slate-600 dark:text-slate-400">
                                    <span className="font-medium">{ruleObj?.label.split('(')[0] || rule}</span>
                                    {row.assignment?.pages?.length ? (
                                        <span className="block text-[11px] text-slate-400">
                                            {row.assignment.pages.length} página(s)
                                        </span>
                                    ) : null}
                                </div>
                            );
                        }}
                    />
                    <Column
                        field="is_active"
                        header="Estado"
                        style={{ width: '8rem' }}
                        body={(row: ContentModuleItem) => (
                            <div className="flex items-center gap-2">
                                <InputSwitch
                                    checked={row.is_active}
                                    onChange={() => handleToggle(row)}
                                />
                                <span className={`text-xs font-medium ${row.is_active ? 'text-emerald-600' : 'text-slate-400'}`}>
                                    {row.is_active ? 'Activo' : 'Pausado'}
                                </span>
                            </div>
                        )}
                    />
                    <Column
                        header="Acciones"
                        style={{ width: '8rem', textAlign: 'right' }}
                        body={(row: ContentModuleItem) => (
                            <div className="flex items-center justify-end gap-1">
                                <Button
                                    icon="pi pi-pencil"
                                    className="p-button-text p-button-rounded p-button-sm text-slate-600 hover:text-sky-600"
                                    tooltip="Editar módulo"
                                    onClick={() => openEditModal(row)}
                                />
                                <Button
                                    icon="pi pi-trash"
                                    className="p-button-text p-button-rounded p-button-sm text-slate-600 hover:text-rose-600"
                                    tooltip="Eliminar"
                                    onClick={() => confirmDelete(row)}
                                />
                            </div>
                        )}
                    />
                </DataTable>
            </div>

            {/* Create/Edit Modal */}
            <Dialog
                header={editingModule ? `Editar Módulo: ${editingModule.title}` : 'Crear Nuevo Módulo de Contenido'}
                visible={modalVisible}
                style={{ width: '90vw', maxWidth: '750px' }}
                onHide={() => setModalVisible(false)}
                footer={
                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            label="Cancelar"
                            className="p-button-text text-slate-600"
                            onClick={() => setModalVisible(false)}
                        />
                        <Button
                            label={editingModule ? 'Guardar Cambios' : 'Crear Módulo'}
                            icon="pi pi-check"
                            className="p-button-primary bg-sky-600 px-4 py-2 rounded-xl"
                            loading={form.processing}
                            onClick={handleSave}
                        />
                    </div>
                }
            >
                <form onSubmit={handleSave} className="space-y-5 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Título del Módulo *
                            </label>
                            <InputText
                                value={form.data.title}
                                onChange={(e) => form.setData('title', e.target.value)}
                                placeholder="Ej: Acerca de nosotros"
                                className="w-full rounded-xl"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Posición en el Tema *
                            </label>
                            <Dropdown
                                value={form.data.position}
                                options={positionOptions}
                                onChange={(e) => form.setData('position', e.value)}
                                className="w-full rounded-xl"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Tipo de Módulo *
                            </label>
                            <Dropdown
                                value={form.data.type}
                                options={typeOptions}
                                onChange={(e) => form.setData('type', e.value)}
                                className="w-full rounded-xl"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Orden en la posición
                            </label>
                            <InputNumber
                                value={form.data.order}
                                onValueChange={(e) => form.setData('order', e.value ?? 0)}
                                className="w-full"
                                min={0}
                            />
                        </div>

                        <div className="space-y-2 pt-2">
                            <div className="flex items-center gap-2">
                                <InputSwitch
                                    checked={form.data.show_title}
                                    onChange={(e) => form.setData('show_title', e.value)}
                                    inputId="switch-show-title"
                                />
                                <label htmlFor="switch-show-title" className="text-xs text-slate-700 dark:text-slate-300">
                                    Mostrar título públicamente
                                </label>
                            </div>
                            <div className="flex items-center gap-2">
                                <InputSwitch
                                    checked={form.data.is_active}
                                    onChange={(e) => form.setData('is_active', e.value)}
                                    inputId="switch-is-active"
                                />
                                <label htmlFor="switch-is-active" className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                                    Módulo activo
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Specific Configuration Section according to Type */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                        <h4 className="text-xs uppercase font-bold tracking-wider text-slate-500">
                            Configuración del contenido ({types.find((t) => t.type === form.data.type)?.label})
                        </h4>

                        {form.data.type === 'custom_html' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Código HTML / Texto enriquecido
                                </label>
                                <InputTextarea
                                    value={form.data.content?.html || ''}
                                    onChange={(e) =>
                                        form.setData('content', { ...form.data.content, html: e.target.value })
                                    }
                                    rows={6}
                                    className="w-full font-mono text-xs rounded-xl"
                                    placeholder="<div class='custom-banner'><p>Tu contenido HTML aquí</p></div>"
                                />
                            </div>
                        )}

                        {form.data.type === 'menu' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Selecciona el menú *
                                    </label>
                                    <Dropdown
                                        value={form.data.content?.menu_id}
                                        options={menuOptions}
                                        onChange={(e) =>
                                            form.setData('content', { ...form.data.content, menu_id: e.value })
                                        }
                                        placeholder="Elige un menú"
                                        className="w-full rounded-xl"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Disposición
                                    </label>
                                    <Dropdown
                                        value={form.data.content?.layout || 'vertical'}
                                        options={[
                                            { label: 'Vertical (Lista)', value: 'vertical' },
                                            { label: 'Horizontal (Fila)', value: 'horizontal' },
                                        ]}
                                        onChange={(e) =>
                                            form.setData('content', { ...form.data.content, layout: e.value })
                                        }
                                        className="w-full rounded-xl"
                                    />
                                </div>
                            </div>
                        )}

                        {form.data.type === 'recent_posts' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Cantidad de artículos
                                    </label>
                                    <InputNumber
                                        value={form.data.content?.limit || 5}
                                        onValueChange={(e) =>
                                            form.setData('content', { ...form.data.content, limit: e.value ?? 5 })
                                        }
                                        min={1}
                                        max={20}
                                        className="w-full"
                                    />
                                </div>
                                <div className="flex items-center gap-2 pt-4">
                                    <InputSwitch
                                        checked={form.data.content?.show_date ?? true}
                                        onChange={(e) =>
                                            form.setData('content', { ...form.data.content, show_date: e.value })
                                        }
                                        inputId="switch-recent-date"
                                    />
                                    <label htmlFor="switch-recent-date" className="text-xs text-slate-700 dark:text-slate-300">
                                        Mostrar fecha
                                    </label>
                                </div>
                                <div className="flex items-center gap-2 pt-4">
                                    <InputSwitch
                                        checked={form.data.content?.show_excerpt ?? false}
                                        onChange={(e) =>
                                            form.setData('content', { ...form.data.content, show_excerpt: e.value })
                                        }
                                        inputId="switch-recent-excerpt"
                                    />
                                    <label htmlFor="switch-recent-excerpt" className="text-xs text-slate-700 dark:text-slate-300">
                                        Mostrar resumen
                                    </label>
                                </div>
                            </div>
                        )}

                        {form.data.type === 'categories' && (
                            <div className="flex items-center gap-2">
                                <InputSwitch
                                    checked={form.data.content?.show_count ?? true}
                                    onChange={(e) =>
                                        form.setData('content', { ...form.data.content, show_count: e.value })
                                    }
                                    inputId="switch-cat-count"
                                />
                                <label htmlFor="switch-cat-count" className="text-xs text-slate-700 dark:text-slate-300">
                                    Mostrar contador de publicaciones por categoría
                                </label>
                            </div>
                        )}

                        {form.data.type === 'search_bar' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Texto de ayuda (Placeholder)
                                </label>
                                <InputText
                                    value={form.data.content?.placeholder || ''}
                                    onChange={(e) =>
                                        form.setData('content', { ...form.data.content, placeholder: e.target.value })
                                    }
                                    className="w-full rounded-xl"
                                    placeholder="Buscar en el sitio..."
                                />
                            </div>
                        )}

                        {form.data.type === 'contact_info' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Teléfono de contacto
                                    </label>
                                    <InputText
                                        value={form.data.content?.phone || ''}
                                        onChange={(e) =>
                                            form.setData('content', { ...form.data.content, phone: e.target.value })
                                        }
                                        placeholder="+1 234 567 890"
                                        className="w-full rounded-xl"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Correo electrónico
                                    </label>
                                    <InputText
                                        value={form.data.content?.email || ''}
                                        onChange={(e) =>
                                            form.setData('content', { ...form.data.content, email: e.target.value })
                                        }
                                        placeholder="contacto@empresa.com"
                                        className="w-full rounded-xl"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Dirección física
                                    </label>
                                    <InputText
                                        value={form.data.content?.address || ''}
                                        onChange={(e) =>
                                            form.setData('content', { ...form.data.content, address: e.target.value })
                                        }
                                        placeholder="Calle 123, Oficina 400"
                                        className="w-full rounded-xl"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Assignment Rules */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                        <h4 className="text-xs uppercase font-bold tracking-wider text-slate-500">
                            Reglas de Asignación y Visibilidad
                        </h4>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Mostrar este módulo en:
                            </label>
                            <Dropdown
                                value={form.data.assignment?.rule || 'all'}
                                options={assignmentRuleOptions}
                                onChange={(e) =>
                                    form.setData('assignment', { ...form.data.assignment, rule: e.value })
                                }
                                className="w-full rounded-xl"
                            />
                        </div>

                        {['specific_pages', 'except_pages'].includes(form.data.assignment?.rule || '') && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Seleccionar páginas:
                                </label>
                                <MultiSelect
                                    value={form.data.assignment?.pages || []}
                                    options={pageOptions}
                                    onChange={(e) =>
                                        form.setData('assignment', { ...form.data.assignment, pages: e.value })
                                    }
                                    placeholder="Elige una o más páginas"
                                    display="chip"
                                    className="w-full rounded-xl"
                                />
                            </div>
                        )}
                    </div>

                    {/* Advanced styling */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Clases CSS adicionales (opcional)
                        </label>
                        <InputText
                            value={form.data.custom_classes || ''}
                            onChange={(e) => form.setData('custom_classes', e.target.value)}
                            placeholder="bg-slate-50 p-4 rounded-2xl"
                            className="w-full rounded-xl text-xs font-mono"
                        />
                    </div>
                </form>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog
                header="Confirmar Eliminación"
                visible={deleteDialogVisible}
                style={{ width: '450px' }}
                onHide={() => setDeleteDialogVisible(false)}
                footer={
                    <div className="flex justify-end gap-2">
                        <Button
                            label="Cancelar"
                            className="p-button-text text-slate-600"
                            onClick={() => setDeleteDialogVisible(false)}
                        />
                        <Button
                            label="Eliminar Módulo"
                            icon="pi pi-trash"
                            className="p-button-danger bg-rose-600 px-4 py-2 rounded-xl text-white"
                            onClick={handleDelete}
                        />
                    </div>
                }
            >
                <div className="flex items-center gap-3">
                    <i className="pi pi-exclamation-triangle text-2xl text-rose-500" />
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        ¿Estás seguro de que deseas eliminar el módulo «<strong>{moduleToDelete?.title}</strong>»?
                        Esta acción no se puede deshacer.
                    </p>
                </div>
            </Dialog>
        </div>
    );
}
