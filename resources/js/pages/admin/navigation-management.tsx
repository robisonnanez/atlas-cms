import { Head, router, usePage } from '@inertiajs/react';
import { useAtlasLocale } from '@/lib/atlas-locale';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputSwitch } from 'primereact/inputswitch';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { useMemo, useRef, useState } from 'react';

type TranslationPair = { es?: string; en?: string };
type ModuleRow = {
    idModulos: number;
    nmodulo: string;
    orden?: number | null;
    icono?: string | null;
    color?: string | null;
    detalle?: string | null;
    activo: boolean;
    translations?: TranslationPair | null;
};

type MenuRow = {
    id: number;
    idModulos: number;
    nombre: string;
    url: string;
    icono?: string | null;
    id_menu?: number | null;
    main: boolean;
    orden?: number | null;
    cesdo: boolean;
    permission_name?: string | null;
    translations?: TranslationPair | null;
};

type ParentMenu = { id: number; nombre: string; translations?: TranslationPair | null };

const emptyModule: ModuleRow = {
    idModulos: 0,
    nmodulo: '',
    orden: null,
    icono: '',
    color: '',
    detalle: '',
    activo: true,
    translations: { es: '', en: '' },
};

const emptyMenu: Omit<MenuRow, 'id'> = {
    idModulos: 0,
    nombre: '',
    url: '',
    icono: '',
    id_menu: null,
    main: false,
    orden: null,
    cesdo: true,
    permission_name: '',
    translations: { es: '', en: '' },
};

export default function NavigationManagementPage() {
    const toast = useRef<Toast>(null);
    const page = usePage<{ modules: ModuleRow[]; menus: MenuRow[]; parentMenus: ParentMenu[] }>();
    const { locale, t } = useAtlasLocale();
    const [moduleDialog, setModuleDialog] = useState(false);
    const [menuDialog, setMenuDialog] = useState(false);
    const [editingModule, setEditingModule] = useState<ModuleRow>(emptyModule);
    const [editingMenu, setEditingMenu] = useState<Omit<MenuRow, 'id'> & { id?: number }>(emptyMenu);

    const labelOf = (row?: { translations?: TranslationPair | null; nmodulo?: string; nombre?: string }) => {
        if (!row) return '';
        return row.translations?.[locale] || row.translations?.es || row.nmodulo || row.nombre || '';
    };

    const moduleMap = useMemo(() => new Map(page.props.modules.map((mod) => [mod.idModulos, labelOf(mod)])), [page.props.modules, locale]);
    const moduleOptions = page.props.modules.map((module) => ({ label: labelOf(module), value: module.idModulos }));
    const parentOptions = [{ label: t('Sin padre', 'No parent'), value: null }, ...page.props.parentMenus.filter((menu) => menu.id !== editingMenu.id).map((menu) => ({ label: menu.translations?.[locale] || menu.translations?.es || menu.nombre, value: menu.id }))];

    const showToast = (severity: 'success' | 'warn', detail: string) => {
        toast.current?.show({ severity, summary: severity === 'success' ? 'OK' : t('Validaci?n', 'Validation'), detail, life: 2500 });
    };

    const submitModule = () => {
        if (editingModule.idModulos === 0 || !editingModule.translations?.es?.trim()) {
            showToast('warn', t('Completa el ID y el nombre en espa?ol del m?dulo.', 'Complete the module ID and Spanish name.'));
            return;
        }

        const payload = {
            ...editingModule,
            nmodulo: editingModule.translations.es.trim(),
            translations: {
                es: editingModule.translations.es.trim(),
                en: editingModule.translations.en?.trim() ?? '',
            },
        };

        if (page.props.modules.some((module) => module.idModulos === editingModule.idModulos)) {
            router.put(`/admin/navigation/modules/${editingModule.idModulos}`, payload, { preserveScroll: true, onSuccess: () => showToast('success', t('M?dulo actualizado.', 'Module updated.')) });
        } else {
            router.post('/admin/navigation/modules', payload, { preserveScroll: true, onSuccess: () => showToast('success', t('M?dulo creado.', 'Module created.')) });
        }

        setModuleDialog(false);
        setEditingModule(emptyModule);
    };

    const submitMenu = () => {
        if (!editingMenu.idModulos || !editingMenu.translations?.es?.trim() || !editingMenu.url.trim()) {
            showToast('warn', t('Completa m?dulo, nombre en espa?ol y URL.', 'Complete module, Spanish label and URL.'));
            return;
        }

        const payload = {
            ...editingMenu,
            nombre: editingMenu.translations.es.trim(),
            url: editingMenu.url.trim(),
            translations: {
                es: editingMenu.translations.es.trim(),
                en: editingMenu.translations.en?.trim() ?? '',
            },
        };

        if (editingMenu.id) {
            router.put(`/admin/navigation/menus/${editingMenu.id}`, payload, { preserveScroll: true, onSuccess: () => showToast('success', t('Men? actualizado.', 'Menu updated.')) });
        } else {
            router.post('/admin/navigation/menus', payload, { preserveScroll: true, onSuccess: () => showToast('success', t('Men? creado.', 'Menu created.')) });
        }

        setMenuDialog(false);
        setEditingMenu(emptyMenu);
    };

    return (
        <>
            <Head title={t('Gesti?n de navegaci?n', 'Navigation management')} />
            <Toast ref={toast} position="top-right" />
            <div className="space-y-6">
                <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                        <div className="space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">{t('Gobernanza Atlas', 'Atlas governance')}</p>
                            <h1 className="text-3xl font-semibold text-slate-950">{t('Módulos y menús', 'Modules and menus')}</h1>
                            <p className="max-w-2xl text-sm text-slate-600">{t('Administra la estructura del panel y define etiquetas en espa?ol e ingl?s para una navegaci?n consistente.', 'Manage panel structure and define Spanish and English labels for consistent navigation.')}</p>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-sm text-slate-500">{t('Módulos', 'Modules')}</p>
                                <p className="mt-2 text-3xl font-semibold text-slate-950">{page.props.modules.length}</p>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-sm text-slate-500">{t('Menús', 'Menus')}</p>
                                <p className="mt-2 text-3xl font-semibold text-slate-950">{page.props.menus.length}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-slate-950">{t('Módulos del panel', 'Panel modules')}</h2>
                            <p className="text-sm text-slate-600">{t('Define grupos como Dashboard, Content, System o Admin y traduce sus etiquetas.', 'Define groups like Dashboard, Content, System or Admin and translate their labels.')}</p>
                        </div>
                        <Button label={t('Nuevo m?dulo', 'New module')} icon="pi pi-plus" className="rounded-full" onClick={() => { setEditingModule(emptyModule); setModuleDialog(true); }} />
                    </div>
                    <DataTable value={page.props.modules} dataKey="idModulos" stripedRows className="rounded-2xl border border-slate-200" emptyMessage={t('No hay m?dulos registrados.', 'No modules registered yet.')}>
                        <Column field="idModulos" header="ID" sortable />
                        <Column header={t('Etiqueta', 'Label')} body={(row: ModuleRow) => <div><p className="font-medium text-slate-950">{labelOf(row)}</p><p className="text-xs text-slate-500">ES: {row.translations?.es || row.nmodulo} ? EN: {row.translations?.en || '?'}</p></div>} />
                        <Column field="orden" header={t('Orden', 'Order')} sortable />
                        <Column field="detalle" header={t('Detalle', 'Detail')} />
                        <Column header={t('Activo', 'Active')} body={(row: ModuleRow) => <Tag value={row.activo ? t('Activo', 'Active') : t('Oculto', 'Hidden')} severity={row.activo ? 'success' : 'secondary'} rounded />} />
                        <Column header={t('Acciones', 'Actions')} body={(row: ModuleRow) => <div className="flex gap-2"><Button icon="pi pi-pencil" text onClick={() => { setEditingModule({ ...row, translations: row.translations ?? { es: row.nmodulo, en: '' } }); setModuleDialog(true); }} /><Button icon="pi pi-trash" text severity="danger" onClick={() => router.delete(`/admin/navigation/modules/${row.idModulos}`, { preserveScroll: true, onSuccess: () => showToast('success', t('M?dulo eliminado.', 'Module deleted.')) })} /></div>} />
                    </DataTable>
                </section>

                <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-slate-950">{t('Menús administrativos', 'Admin menus')}</h2>
                            <p className="text-sm text-slate-600">{t('Cada men? puede pertenecer a un m?dulo, colgar de un padre y definir etiquetas por idioma.', 'Each menu can belong to a module, attach to a parent and define per-language labels.')}</p>
                        </div>
                        <Button label={t('Nuevo men?', 'New menu')} icon="pi pi-plus" className="rounded-full" onClick={() => { setEditingMenu(emptyMenu); setMenuDialog(true); }} />
                    </div>
                    <DataTable value={page.props.menus} dataKey="id" stripedRows className="rounded-2xl border border-slate-200" emptyMessage={t('No hay men?s administrativos registrados.', 'No admin menus registered yet.')}>
                        <Column field="id" header="ID" sortable />
                        <Column header={t('M?dulo', 'Module')} body={(row: MenuRow) => moduleMap.get(row.idModulos) ?? row.idModulos} sortable />
                        <Column header={t('Etiqueta', 'Label')} body={(row: MenuRow) => <div><p className="font-medium text-slate-950">{labelOf(row)}</p><p className="text-xs text-slate-500">ES: {row.translations?.es || row.nombre} ? EN: {row.translations?.en || '?'}</p></div>} sortable />
                        <Column field="url" header="URL" />
                        <Column header={t('Padre', 'Parent')} body={(row: MenuRow) => row.id_menu ? page.props.parentMenus.find((menu) => menu.id === row.id_menu)?.translations?.[locale] || page.props.parentMenus.find((menu) => menu.id === row.id_menu)?.translations?.es || page.props.parentMenus.find((menu) => menu.id === row.id_menu)?.nombre || `#${row.id_menu}` : t('Ra?z', 'Root')} />
                        <Column header={t('Permiso', 'Permission')} body={(row: MenuRow) => row.permission_name ? <Tag value={row.permission_name} severity="info" rounded /> : <Tag value={t('Sin permiso', 'No permission')} severity="secondary" rounded />} />
                        <Column header={t('Acciones', 'Actions')} body={(row: MenuRow) => <div className="flex gap-2"><Button icon="pi pi-pencil" text onClick={() => { setEditingMenu({ ...row, translations: row.translations ?? { es: row.nombre, en: '' } }); setMenuDialog(true); }} /><Button icon="pi pi-trash" text severity="danger" onClick={() => router.delete(`/admin/navigation/menus/${row.id}`, { preserveScroll: true, onSuccess: () => showToast('success', t('Men? eliminado.', 'Menu deleted.')) })} /></div>} />
                    </DataTable>
                </section>
            </div>

            <Dialog header={editingModule.idModulos ? t('Editar m?dulo', 'Edit module') : t('Nuevo m?dulo', 'New module')} visible={moduleDialog} onHide={() => setModuleDialog(false)} className="w-full max-w-2xl">
                <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2"><span className="text-sm font-medium text-slate-700">ID</span><InputText value={`${editingModule.idModulos || ''}`} onChange={(event) => setEditingModule((prev) => ({ ...prev, idModulos: Number(event.target.value) || 0 }))} /></label>
                    <label className="space-y-2"><span className="text-sm font-medium text-slate-700">{t('Nombre en espa?ol', 'Spanish label')}</span><InputText value={editingModule.translations?.es ?? ''} onChange={(event) => setEditingModule((prev) => ({ ...prev, translations: { ...(prev.translations ?? {}), es: event.target.value }, nmodulo: event.target.value }))} /></label>
                    <label className="space-y-2 md:col-span-2"><span className="text-sm font-medium text-slate-700">{t('Nombre en ingl?s', 'English label')}</span><InputText value={editingModule.translations?.en ?? ''} onChange={(event) => setEditingModule((prev) => ({ ...prev, translations: { ...(prev.translations ?? {}), en: event.target.value } }))} /></label>
                    <label className="space-y-2"><span className="text-sm font-medium text-slate-700">{t('Orden', 'Order')}</span><InputText value={`${editingModule.orden ?? ''}`} onChange={(event) => setEditingModule((prev) => ({ ...prev, orden: Number(event.target.value) || null }))} /></label>
                    <label className="space-y-2"><span className="text-sm font-medium text-slate-700">{t('Icono', 'Icon')}</span><InputText value={editingModule.icono ?? ''} onChange={(event) => setEditingModule((prev) => ({ ...prev, icono: event.target.value }))} /></label>
                    <label className="space-y-2"><span className="text-sm font-medium text-slate-700">Color</span><InputText value={editingModule.color ?? ''} onChange={(event) => setEditingModule((prev) => ({ ...prev, color: event.target.value }))} /></label>
                    <label className="space-y-2"><span className="text-sm font-medium text-slate-700">{t('Detalle', 'Detail')}</span><InputText value={editingModule.detalle ?? ''} onChange={(event) => setEditingModule((prev) => ({ ...prev, detalle: event.target.value }))} /></label>
                    <div className="col-span-full flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"><span className="text-sm font-medium text-slate-700">{t('M?dulo activo', 'Active module')}</span><InputSwitch checked={!!editingModule.activo} onChange={(event) => setEditingModule((prev) => ({ ...prev, activo: !!event.value }))} /></div>
                </div>
                <div className="mt-5 flex justify-end"><Button label={t('Guardar m?dulo', 'Save module')} className="rounded-full" onClick={submitModule} /></div>
            </Dialog>

            <Dialog header={editingMenu.id ? t('Editar men?', 'Edit menu') : t('Nuevo men?', 'New menu')} visible={menuDialog} onHide={() => setMenuDialog(false)} className="w-full max-w-3xl">
                <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2"><span className="text-sm font-medium text-slate-700">{t('M?dulo', 'Module')}</span><Dropdown value={editingMenu.idModulos} options={moduleOptions} onChange={(event) => setEditingMenu((prev) => ({ ...prev, idModulos: event.value }))} className="w-full" placeholder={t('Selecciona un m?dulo', 'Select module')} /></label>
                    <label className="space-y-2"><span className="text-sm font-medium text-slate-700">{t('Nombre en espa?ol', 'Spanish label')}</span><InputText value={editingMenu.translations?.es ?? ''} onChange={(event) => setEditingMenu((prev) => ({ ...prev, translations: { ...(prev.translations ?? {}), es: event.target.value }, nombre: event.target.value }))} /></label>
                    <label className="space-y-2 md:col-span-2"><span className="text-sm font-medium text-slate-700">{t('Nombre en ingl?s', 'English label')}</span><InputText value={editingMenu.translations?.en ?? ''} onChange={(event) => setEditingMenu((prev) => ({ ...prev, translations: { ...(prev.translations ?? {}), en: event.target.value } }))} /></label>
                    <label className="space-y-2"><span className="text-sm font-medium text-slate-700">URL</span><InputText value={editingMenu.url} onChange={(event) => setEditingMenu((prev) => ({ ...prev, url: event.target.value }))} /></label>
                    <label className="space-y-2"><span className="text-sm font-medium text-slate-700">{t('Icono', 'Icon')}</span><InputText value={editingMenu.icono ?? ''} onChange={(event) => setEditingMenu((prev) => ({ ...prev, icono: event.target.value }))} /></label>
                    <label className="space-y-2"><span className="text-sm font-medium text-slate-700">{t('Men? padre', 'Parent menu')}</span><Dropdown value={editingMenu.id_menu ?? null} options={parentOptions} onChange={(event) => setEditingMenu((prev) => ({ ...prev, id_menu: event.value }))} className="w-full" /></label>
                    <label className="space-y-2"><span className="text-sm font-medium text-slate-700">{t('Orden', 'Order')}</span><InputText value={`${editingMenu.orden ?? ''}`} onChange={(event) => setEditingMenu((prev) => ({ ...prev, orden: Number(event.target.value) || null }))} /></label>
                    <label className="space-y-2 md:col-span-2"><span className="text-sm font-medium text-slate-700">{t('Permiso asociado', 'Permission')}</span><InputText value={editingMenu.permission_name ?? ''} onChange={(event) => setEditingMenu((prev) => ({ ...prev, permission_name: event.target.value }))} placeholder="ej. atlas.settings.view" /></label>
                    <div className="col-span-full grid gap-4 md:grid-cols-2">
                        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"><span className="text-sm font-medium text-slate-700">Main</span><InputSwitch checked={!!editingMenu.main} onChange={(event) => setEditingMenu((prev) => ({ ...prev, main: !!event.value }))} /></div>
                        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"><span className="text-sm font-medium text-slate-700">CESDO</span><InputSwitch checked={!!editingMenu.cesdo} onChange={(event) => setEditingMenu((prev) => ({ ...prev, cesdo: !!event.value }))} /></div>
                    </div>
                </div>
                <div className="mt-5 flex justify-end"><Button label={t('Guardar men?', 'Save menu')} className="rounded-full" onClick={submitMenu} /></div>
            </Dialog>
        </>
    );
}
