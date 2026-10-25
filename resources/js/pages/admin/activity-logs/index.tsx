import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAtlasLocale } from '@/lib/atlas-locale';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { useRef, useState } from 'react';

type ActivityItem = {
    id: number;
    log_name?: string | null;
    description: string;
    subject_type?: string | null;
    subject_id?: number | null;
    event?: string | null;
    causer_type?: string | null;
    causer_id?: number | null;
    causer?: { id: number; name: string; email: string } | null;
    properties?: Record<string, unknown> | null;
    created_at: string;
};

type PaginatedLogs = {
    data: ActivityItem[];
    current_page: number;
    last_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

export default function ActivityLogsIndex({
    logs,
    filters = {},
    availableLogNames = [],
    availableEvents = [],
    totalCount = 0,
}: {
    logs: PaginatedLogs;
    filters: Record<string, string | null>;
    availableLogNames: string[];
    availableEvents: string[];
    totalCount: number;
}) {
    const { t } = useAtlasLocale();
    const toast = useRef<Toast>(null);
    const [clearDialogOpen, setClearDialogOpen] = useState(false);
    const [clearDays, setClearDays] = useState<number>(30);
    const [isClearing, setIsClearing] = useState(false);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedLogName, setSelectedLogName] = useState(filters.log_name || '');
    const [selectedEvent, setSelectedEvent] = useState(filters.event || '');

    const showToast = (severity: 'success' | 'warn' | 'error', detail: string) => {
        toast.current?.show({ severity, summary: t('Auditoría', 'Audit Trail'), detail, life: 3000 });
    };

    const applyFilter = (key: string, value: string | null) => {
        const queryParams = {
            ...filters,
            search: searchTerm || undefined,
            log_name: selectedLogName || undefined,
            event: selectedEvent || undefined,
            [key]: value || undefined,
        };

        router.get('/admin/activity-logs', queryParams, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClear = () => {
        setIsClearing(true);
        router.delete('/admin/activity-logs', {
            data: { days: clearDays },
            preserveScroll: true,
            onSuccess: () => {
                setClearDialogOpen(false);
                showToast('success', t('Registros antiguos depurados.', 'Old logs cleared.'));
            },
            onFinish: () => setIsClearing(false),
        });
    };

    const getEventSeverity = (event?: string | null): 'success' | 'info' | 'warn' | 'danger' => {
        switch (event) {
            case 'created':
                return 'success';
            case 'updated':
            case 'status_changed':
                return 'info';
            case 'deleted':
                return 'danger';
            default:
                return 'warn';
        }
    };

    return (
        <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto">
            <Head title={t('Registro de Actividad - Atlas CMS', 'Activity Log - Atlas CMS')} />
            <Toast ref={toast} />

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                        {t('Registro de Actividad', 'Activity Log')}
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {t('Trazabilidad completa, auditoría de cambios y eventos del sistema.', 'Complete traceability, change audit and system events.')}
                    </p>
                </div>
                <Button
                    label={t('Depurar Antiguos', 'Clear Old Logs')}
                    icon="pi pi-trash"
                    className="p-button-danger p-button-outlined"
                    onClick={() => setClearDialogOpen(true)}
                />
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{t('Filtros de Auditoría', 'Audit Filters')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">{t('Canal / Log', 'Channel / Log')}</label>
                            <Dropdown
                                value={selectedLogName}
                                options={[{ label: t('Todos los canales', 'All Channels'), value: '' }, ...availableLogNames.map(n => ({ label: n, value: n }))]}
                                onChange={(e) => {
                                    setSelectedLogName(e.value);
                                    applyFilter('log_name', e.value);
                                }}
                                className="w-full p-inputtext-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">{t('Tipo de Evento', 'Event Type')}</label>
                            <Dropdown
                                value={selectedEvent}
                                options={[{ label: t('Todos los eventos', 'All Events'), value: '' }, ...availableEvents.map(e => ({ label: e, value: e }))]}
                                onChange={(e) => {
                                    setSelectedEvent(e.value);
                                    applyFilter('event', e.value);
                                }}
                                className="w-full p-inputtext-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">{t('Búsqueda por texto', 'Text Search')}</label>
                            <div className="p-inputgroup">
                                <InputText
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder={t('Buscar en descripción...', 'Search in description...')}
                                    className="p-inputtext-sm"
                                    onKeyDown={(e) => e.key === 'Enter' && applyFilter('search', searchTerm)}
                                />
                                <Button
                                    icon="pi pi-search"
                                    className="p-button-sm p-button-secondary"
                                    onClick={() => applyFilter('search', searchTerm)}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="pt-6">
                    <DataTable
                        value={logs?.data || []}
                        responsiveLayout="scroll"
                        emptyMessage={t('No hay registros de actividad que coincidan con los filtros.', 'No activity logs matching filters.')}
                        className="p-datatable-sm"
                    >
                        <Column
                            field="log_name"
                            header={t('Canal', 'Channel')}
                            body={(row: ActivityItem) => (
                                <Tag value={row.log_name || 'general'} severity="secondary" className="text-xs uppercase" />
                            )}
                        />
                        <Column
                            field="event"
                            header={t('Evento', 'Event')}
                            body={(row: ActivityItem) => (
                                <Tag value={row.event || 'action'} severity={getEventSeverity(row.event)} className="text-xs" />
                            )}
                        />
                        <Column field="description" header={t('Descripción', 'Description')} />
                        <Column
                            header={t('Usuario Causante', 'Causer')}
                            body={(row: ActivityItem) => (
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {row.causer ? row.causer.name : t('Sistema', 'System')}
                                </span>
                            )}
                        />
                        <Column
                            field="created_at"
                            header={t('Fecha / Hora', 'Date / Time')}
                            body={(row: ActivityItem) => (
                                <span className="text-xs text-slate-500">
                                    {new Date(row.created_at).toLocaleString()}
                                </span>
                            )}
                        />
                        <Column
                            header={t('Detalles', 'Details')}
                            body={(row: ActivityItem) => (
                                <Link href={`/admin/activity-logs/${row.id}`}>
                                    <Button
                                        icon="pi pi-eye"
                                        className="p-button-rounded p-button-text p-button-info"
                                        tooltip={t('Ver Detalles', 'View Details')}
                                    />
                                </Link>
                            )}
                        />
                    </DataTable>

                    {logs && logs.total > 20 && (
                        <div className="flex items-center justify-between mt-4 text-xs text-slate-500">
                            <span>
                                {t(`Mostrando página ${logs.current_page} de ${logs.last_page} (${logs.total} registros)`, `Showing page ${logs.current_page} of ${logs.last_page} (${logs.total} records)`)}
                            </span>
                            <div className="flex gap-1">
                                {logs.links.map((link, idx) => (
                                    <Button
                                        key={idx}
                                        label={link.label.replace('&laquo;', '«').replace('&raquo;', '»')}
                                        disabled={!link.url}
                                        className={`p-button-xs ${link.active ? 'p-button-primary' : 'p-button-text'}`}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog
                header={t('Depurar Registros de Auditoría', 'Purge Audit Logs')}
                visible={clearDialogOpen}
                style={{ width: '400px' }}
                onHide={() => setClearDialogOpen(false)}
                footer={(
                    <div className="flex justify-end gap-2">
                        <Button
                            label={t('Cancelar', 'Cancel')}
                            className="p-button-text"
                            onClick={() => setClearDialogOpen(false)}
                        />
                        <Button
                            label={t('Eliminar', 'Delete')}
                            icon="pi pi-trash"
                            className="p-button-danger"
                            loading={isClearing}
                            onClick={handleClear}
                        />
                    </div>
                )}
            >
                <div className="space-y-3 pt-2">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        {t('Se eliminarán todos los registros anteriores al número de días seleccionado.', 'All logs older than the selected number of days will be deleted.')}
                    </p>
                    <div>
                        <label className="block text-sm font-medium mb-1">{t('Días de antigüedad', 'Age in days')}</label>
                        <InputNumber
                            value={clearDays}
                            onValueChange={(e) => setClearDays(e.value || 30)}
                            min={1}
                            max={365}
                            className="w-full"
                        />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
