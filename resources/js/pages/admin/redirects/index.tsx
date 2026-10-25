import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAtlasLocale } from '@/lib/atlas-locale';
import { Head, router } from '@inertiajs/react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputSwitch } from 'primereact/inputswitch';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { useRef, useState } from 'react';

type RedirectRecord = {
    id: number;
    source_path: string;
    target_url: string;
    status_code: number;
    hits: number;
    is_active: boolean;
    description?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
};

type FormState = {
    id?: number;
    source_path: string;
    target_url: string;
    status_code: number;
    description: string;
    is_active: boolean;
};

const emptyForm: FormState = {
    source_path: '',
    target_url: '',
    status_code: 301,
    description: '',
    is_active: true,
};

export default function RedirectsIndex({
    redirects = [],
}: {
    redirects: RedirectRecord[];
}) {
    const { t } = useAtlasLocale();
    const toast = useRef<Toast>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [formData, setFormData] = useState<FormState>(emptyForm);
    const [isSaving, setIsSaving] = useState(false);

    const showToast = (severity: 'success' | 'warn' | 'error', detail: string) => {
        toast.current?.show({ severity, summary: t('Redirecciones', 'Redirects'), detail, life: 3000 });
    };

    const statusCodeOptions = [
        { label: '301 - Permanente (Recomendado para SEO)', value: 301 },
        { label: '302 - Temporal (Mantenimiento o promociones)', value: 302 },
        { label: '307 - Redirección temporal estricta (Mantiene método)', value: 307 },
        { label: '308 - Redirección permanente estricta', value: 308 },
    ];

    const openCreateDialog = () => {
        setFormData(emptyForm);
        setDialogOpen(true);
    };

    const openEditDialog = (record: RedirectRecord) => {
        setFormData({
            id: record.id,
            source_path: record.source_path,
            target_url: record.target_url,
            status_code: Number(record.status_code),
            description: record.description ?? '',
            is_active: Boolean(record.is_active),
        });
        setDialogOpen(true);
    };

    const handleSubmit = () => {
        if (!formData.source_path.trim() || !formData.target_url.trim()) {
            showToast('warn', t('Ingresa la ruta de origen y la URL de destino.', 'Enter source path and target URL.'));
            return;
        }

        setIsSaving(true);
        const payload = {
            source_path: formData.source_path.trim(),
            target_url: formData.target_url.trim(),
            status_code: formData.status_code,
            description: formData.description.trim() || null,
            is_active: formData.is_active,
        };

        if (formData.id) {
            router.put(`/admin/redirects/${formData.id}`, payload, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSaving(false);
                    setDialogOpen(false);
                    showToast('success', t('Regla de redirección actualizada.', 'Redirect rule updated.'));
                },
                onError: () => setIsSaving(false),
            });
        } else {
            router.post('/admin/redirects', payload, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSaving(false);
                    setDialogOpen(false);
                    showToast('success', t('Regla de redirección creada.', 'Redirect rule created.'));
                },
                onError: () => setIsSaving(false),
            });
        }
    };

    const handleDelete = (record: RedirectRecord) => {
        if (confirm(t(`¿Eliminar la redirección desde "${record.source_path}"?`, `Delete redirect from "${record.source_path}"?`))) {
            router.delete(`/admin/redirects/${record.id}`, {
                preserveScroll: true,
                onSuccess: () => showToast('success', t('Redirección eliminada.', 'Redirect deleted.')),
            });
        }
    };

    const totalHits = redirects.reduce((sum, r) => sum + (Number(r.hits) || 0), 0);
    const count301 = redirects.filter((r) => r.status_code === 301).length;
    const count302 = redirects.filter((r) => r.status_code === 302).length;
    const activeCount = redirects.filter((r) => r.is_active).length;

    return (
        <>
            <Head title={t('Gestor de Redirecciones', 'Redirect Manager')} />
            <Toast ref={toast} />

            <div className="space-y-6">
                <section className="grid gap-4 md:grid-cols-4">
                    <Card className="rounded-3xl border border-slate-200/80 shadow-sm md:col-span-2">
                        <CardHeader>
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
                                {t('Tráfico y Enrutamiento', 'Traffic & Routing')}
                            </p>
                            <CardTitle className="text-3xl">
                                {t('Gestor de Redirecciones', 'Redirect Manager')}
                            </CardTitle>
                            <CardDescription>
                                {t(
                                    'Controla enlaces obsoletos, errores 404 y redirecciones automáticas 301/302 inspirado en com_redirect de Joomla.',
                                    'Control obsolete links, 404 errors and automatic 301/302 redirects inspired by Joomla com_redirect.'
                                )}
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-slate-500 font-normal">
                                {t('Total de Reglas', 'Total Rules')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-baseline justify-between">
                                <span className="text-3xl font-bold text-slate-900">{redirects.length}</span>
                                <Tag value={`${activeCount} ${t('activas', 'active')}`} severity="success" />
                            </div>
                            <div className="mt-2 text-xs text-slate-500">
                                <span>301: <strong>{count301}</strong> | 302: <strong>{count302}</strong></span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-slate-500 font-normal">
                                {t('Accesos Redirigidos', 'Redirected Hits')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-baseline justify-between">
                                <span className="text-3xl font-bold text-emerald-600">{totalHits.toLocaleString()}</span>
                                <i className="pi pi-directions text-2xl text-slate-300" />
                            </div>
                            <p className="mt-2 text-xs text-slate-500">
                                {t('Peticiones capturadas y redirigidas exitosamente.', 'Requests intercepted and successfully redirected.')}
                            </p>
                        </CardContent>
                    </Card>
                </section>

                <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>{t('Reglas de Redirección', 'Redirect Rules')}</CardTitle>
                            <CardDescription>
                                {t('Redirige tráfico entrante hacia rutas internas o URLs externas sin perder posicionamiento.', 'Redirect inbound traffic to internal routes or external URLs preserving SEO value.')}
                            </CardDescription>
                        </div>
                        <Button
                            label={t('Nueva redirección', 'New redirect')}
                            icon="pi pi-plus"
                            className="rounded-full"
                            onClick={openCreateDialog}
                        />
                    </CardHeader>

                    <CardContent>
                        <DataTable
                            value={redirects}
                            dataKey="id"
                            paginator
                            rows={10}
                            stripedRows
                            className="rounded-2xl border border-slate-200"
                            emptyMessage={t('No hay redirecciones configuradas.', 'No redirects configured yet.')}
                        >
                            <Column
                                field="source_path"
                                header={t('Ruta de origen', 'Source path')}
                                sortable
                                body={(row: RedirectRecord) => (
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1.5 font-mono text-sm text-slate-900">
                                            <i className="pi pi-arrow-right text-xs text-slate-400" />
                                            <span>{row.source_path}</span>
                                        </div>
                                        {row.description && (
                                            <span className="text-xs text-slate-500 mt-0.5">{row.description}</span>
                                        )}
                                    </div>
                                )}
                            />

                            <Column
                                field="target_url"
                                header={t('Destino', 'Target')}
                                sortable
                                body={(row: RedirectRecord) => (
                                    <div className="max-w-md truncate font-medium text-slate-700">
                                        {row.target_url.startsWith('http') ? (
                                            <a
                                                href={row.target_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 text-sky-600 hover:underline"
                                            >
                                                <span>{row.target_url}</span>
                                                <i className="pi pi-external-link text-[10px]" />
                                            </a>
                                        ) : (
                                            <span className="font-mono text-sm">{row.target_url}</span>
                                        )}
                                    </div>
                                )}
                            />

                            <Column
                                field="status_code"
                                header={t('Código', 'Code')}
                                sortable
                                body={(row: RedirectRecord) => (
                                    <Tag
                                        value={String(row.status_code)}
                                        severity={row.status_code === 301 ? 'success' : 'info'}
                                    />
                                )}
                            />

                            <Column
                                field="hits"
                                header={t('Hits', 'Hits')}
                                sortable
                                body={(row: RedirectRecord) => (
                                    <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                                        <i className="pi pi-eye text-xs text-slate-400" />
                                        {row.hits.toLocaleString()}
                                    </span>
                                )}
                            />

                            <Column
                                field="is_active"
                                header={t('Estado', 'Status')}
                                body={(row: RedirectRecord) => (
                                    <Tag
                                        value={row.is_active ? t('Activa', 'Active') : t('Inactiva', 'Inactive')}
                                        severity={row.is_active ? 'success' : 'warning'}
                                    />
                                )}
                            />

                            <Column
                                header={t('Acciones', 'Actions')}
                                body={(row: RedirectRecord) => (
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
                header={formData.id ? t('Editar regla de redirección', 'Edit redirect rule') : t('Nueva regla de redirección', 'New redirect rule')}
                visible={dialogOpen}
                onHide={() => setDialogOpen(false)}
                className="w-full max-w-xl"
            >
                <div className="grid gap-4 py-3">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium text-slate-700">{t('Ruta de origen (Source Path)', 'Source path')} *</label>
                        <InputText
                            value={formData.source_path}
                            onChange={(e) => setFormData({ ...formData, source_path: e.target.value })}
                            placeholder="/antigua-pagina-o-noticia"
                            className="w-full font-mono text-sm"
                        />
                        <span className="text-[11px] text-slate-500">
                            {t('Ruta relativa que devolvería un error 404 o necesita reubicación.', 'Relative path that would return a 404 error or needs relocation.')}
                        </span>
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium text-slate-700">{t('URL o ruta de destino (Target)', 'Target URL or path')} *</label>
                        <InputText
                            value={formData.target_url}
                            onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
                            placeholder="/nueva-pagina o https://otro-sitio.com"
                            className="w-full font-mono text-sm"
                        />
                        <span className="text-[11px] text-slate-500">
                            {t('Puede ser una ruta interna del CMS (/pagina) o una URL absoluta externa (https://...).', 'Can be an internal CMS path (/page) or an external absolute URL (https://...).')}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-slate-700">{t('Código de respuesta HTTP', 'HTTP status code')}</label>
                            <Dropdown
                                value={formData.status_code}
                                options={statusCodeOptions}
                                onChange={(e) => setFormData({ ...formData, status_code: Number(e.value) })}
                                className="w-full"
                            />
                        </div>

                        <div className="flex flex-col justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <span className="text-sm font-medium text-slate-700">{t('¿Redirección activa?', 'Is active?')}</span>
                            <div className="flex items-center gap-2">
                                <InputSwitch
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: Boolean(e.value) })}
                                />
                                <span className="text-xs text-slate-600">
                                    {formData.is_active ? t('Activa', 'Active') : t('Pausada', 'Paused')}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium text-slate-700">{t('Descripción / Nota (opcional)', 'Description / Note (optional)')}</label>
                        <InputTextarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder={t('Motivo de la redirección o campaña de marketing asociada.', 'Reason for redirect or associated marketing campaign.')}
                            rows={3}
                            autoResize
                            className="w-full"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-3">
                        <Button
                            label={t('Cancelar', 'Cancel')}
                            className="p-button-text"
                            onClick={() => setDialogOpen(false)}
                        />
                        <Button
                            label={formData.id ? t('Guardar cambios', 'Save changes') : t('Crear redirección', 'Create redirect')}
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
