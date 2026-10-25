import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAtlasLocale } from '@/lib/atlas-locale';
import { Head, router } from '@inertiajs/react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputSwitch } from 'primereact/inputswitch';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { useRef, useState } from 'react';

type ScheduledTaskRecord = {
    id: number;
    name: string;
    command: string;
    expression: string;
    description?: string | null;
    is_active: boolean;
    last_run_at?: string | null;
    next_run_at?: string | null;
    last_status?: string | null;
    last_output?: string | null;
    runs?: Array<{
        id: number;
        status: string;
        output?: string | null;
        duration_ms: number;
        started_at: string;
        finished_at?: string | null;
    }>;
};

type FormState = {
    id?: number;
    name: string;
    command: string;
    expression: string;
    description: string;
    is_active: boolean;
};

const emptyForm: FormState = {
    name: '',
    command: '',
    expression: '* * * * *',
    description: '',
    is_active: true,
};

export default function ScheduledTasksIndex({
    tasks = [],
    stats = { total: 0, active: 0, failed: 0 },
}: {
    tasks: ScheduledTaskRecord[];
    stats: { total: number; active: number; failed: number };
}) {
    const { t } = useAtlasLocale();
    const toast = useRef<Toast>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [outputDialogOpen, setOutputDialogOpen] = useState(false);
    const [selectedOutput, setSelectedOutput] = useState<string>('');
    const [formData, setFormData] = useState<FormState>(emptyForm);
    const [isSaving, setIsSaving] = useState(false);
    const [isExecutingId, setIsExecutingId] = useState<number | null>(null);

    const showToast = (severity: 'success' | 'warn' | 'error', detail: string) => {
        toast.current?.show({ severity, summary: t('Tareas Programadas', 'Scheduled Tasks'), detail, life: 3000 });
    };

    const openCreateDialog = () => {
        setFormData(emptyForm);
        setDialogOpen(true);
    };

    const openEditDialog = (task: ScheduledTaskRecord) => {
        setFormData({
            id: task.id,
            name: task.name,
            command: task.command,
            expression: task.expression,
            description: task.description || '',
            is_active: task.is_active,
        });
        setDialogOpen(true);
    };

    const handleSave = () => {
        if (!formData.name.trim() || !formData.command.trim() || !formData.expression.trim()) {
            showToast('warn', t('Nombre, comando y expresión son requeridos.', 'Name, command and expression are required.'));
            return;
        }

        setIsSaving(true);
        if (formData.id) {
            router.put(`/admin/scheduled-tasks/${formData.id}`, formData, {
                preserveScroll: true,
                onSuccess: () => {
                    setDialogOpen(false);
                    showToast('success', t('Tarea actualizada con éxito.', 'Task updated successfully.'));
                },
                onError: () => {
                    showToast('error', t('Error al actualizar la tarea.', 'Error updating task.'));
                },
                onFinish: () => setIsSaving(false),
            });
        } else {
            router.post('/admin/scheduled-tasks', formData, {
                preserveScroll: true,
                onSuccess: () => {
                    setDialogOpen(false);
                    showToast('success', t('Tarea creada con éxito.', 'Task created successfully.'));
                },
                onError: () => {
                    showToast('error', t('Error al crear la tarea.', 'Error creating task.'));
                },
                onFinish: () => setIsSaving(false),
            });
        }
    };

    const handleDelete = (task: ScheduledTaskRecord) => {
        if (confirm(t(`¿Eliminar la tarea '${task.name}'?`, `Delete task '${task.name}'?`))) {
            router.delete(`/admin/scheduled-tasks/${task.id}`, {
                preserveScroll: true,
                onSuccess: () => showToast('success', t('Tarea eliminada.', 'Task deleted.')),
            });
        }
    };

    const handleRun = (task: ScheduledTaskRecord) => {
        setIsExecutingId(task.id);
        router.post(`/admin/scheduled-tasks/${task.id}/run`, {}, {
            preserveScroll: true,
            onSuccess: () => showToast('success', t(`Tarea '${task.name}' ejecutada.`, `Task '${task.name}' executed.`)),
            onFinish: () => setIsExecutingId(null),
        });
    };

    const handleToggle = (task: ScheduledTaskRecord) => {
        router.post(`/admin/scheduled-tasks/${task.id}/toggle`, {}, {
            preserveScroll: true,
            onSuccess: () => showToast('success', t('Estado cambiado.', 'Status toggled.')),
        });
    };

    const showOutput = (output: string | null | undefined) => {
        setSelectedOutput(output || t('Sin salida registrada.', 'No output recorded.'));
        setOutputDialogOpen(true);
    };

    return (
        <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto">
            <Head title={t('Tareas Programadas - Atlas CMS', 'Scheduled Tasks - Atlas CMS')} />
            <Toast ref={toast} />

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                        {t('Tareas Programadas', 'Scheduled Tasks')}
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {t('Automatización interna y ejecución de rutinas tipo cron inspiradas en Joomla com_scheduler.', 'Internal automation and cron routine execution inspired by Joomla com_scheduler.')}
                    </p>
                </div>
                <Button
                    label={t('Nueva Tarea', 'New Task')}
                    icon="pi pi-plus"
                    className="p-button-primary"
                    onClick={openCreateDialog}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>{t('Total de Tareas', 'Total Tasks')}</CardDescription>
                        <CardTitle className="text-2xl font-bold text-sky-500">{stats.total}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>{t('Tareas Activas', 'Active Tasks')}</CardDescription>
                        <CardTitle className="text-2xl font-bold text-emerald-500">{stats.active}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>{t('Fallos Recientes', 'Recent Failures')}</CardDescription>
                        <CardTitle className="text-2xl font-bold text-rose-500">{stats.failed}</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <DataTable
                        value={tasks}
                        responsiveLayout="scroll"
                        emptyMessage={t('No hay tareas programadas registradas.', 'No scheduled tasks registered.')}
                        className="p-datatable-sm"
                    >
                        <Column field="name" header={t('Nombre', 'Name')} sortable />
                        <Column
                            field="command"
                            header={t('Comando', 'Command')}
                            body={(row: ScheduledTaskRecord) => (
                                <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs text-sky-600 dark:text-sky-400">
                                    {row.command}
                                </code>
                            )}
                        />
                        <Column
                            field="expression"
                            header={t('Expresión', 'Expression')}
                            body={(row: ScheduledTaskRecord) => (
                                <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs font-mono">
                                    {row.expression}
                                </code>
                            )}
                        />
                        <Column
                            field="is_active"
                            header={t('Activa', 'Active')}
                            body={(row: ScheduledTaskRecord) => (
                                <InputSwitch
                                    checked={row.is_active}
                                    onChange={() => handleToggle(row)}
                                />
                            )}
                        />
                        <Column
                            field="last_status"
                            header={t('Último Estado', 'Last Status')}
                            body={(row: ScheduledTaskRecord) => {
                                if (!row.last_status) return <span className="text-slate-400">-</span>;
                                return (
                                    <Tag
                                        value={row.last_status.toUpperCase()}
                                        severity={row.last_status === 'success' ? 'success' : 'danger'}
                                        className="cursor-pointer"
                                        onClick={() => showOutput(row.last_output)}
                                    />
                                );
                            }}
                        />
                        <Column
                            field="last_run_at"
                            header={t('Última Ejecución', 'Last Run')}
                            body={(row: ScheduledTaskRecord) => (
                                <span className="text-xs text-slate-500">
                                    {row.last_run_at ? new Date(row.last_run_at).toLocaleString() : '-'}
                                </span>
                            )}
                        />
                        <Column
                            header={t('Acciones', 'Actions')}
                            body={(row: ScheduledTaskRecord) => (
                                <div className="flex items-center gap-1">
                                    <Button
                                        icon="pi pi-play"
                                        className="p-button-rounded p-button-text p-button-success"
                                        tooltip={t('Ejecutar Ahora', 'Run Now')}
                                        loading={isExecutingId === row.id}
                                        onClick={() => handleRun(row)}
                                    />
                                    <Button
                                        icon="pi pi-file"
                                        className="p-button-rounded p-button-text p-button-info"
                                        tooltip={t('Ver Salida', 'View Output')}
                                        onClick={() => showOutput(row.last_output)}
                                    />
                                    <Button
                                        icon="pi pi-pencil"
                                        className="p-button-rounded p-button-text p-button-warning"
                                        tooltip={t('Editar', 'Edit')}
                                        onClick={() => openEditDialog(row)}
                                    />
                                    <Button
                                        icon="pi pi-trash"
                                        className="p-button-rounded p-button-text p-button-danger"
                                        tooltip={t('Eliminar', 'Delete')}
                                        onClick={() => handleDelete(row)}
                                    />
                                </div>
                            )}
                        />
                    </DataTable>
                </CardContent>
            </Card>

            <Dialog
                header={formData.id ? t('Editar Tarea Programada', 'Edit Scheduled Task') : t('Nueva Tarea Programada', 'New Scheduled Task')}
                visible={dialogOpen}
                style={{ width: '450px' }}
                onHide={() => setDialogOpen(false)}
                footer={(
                    <div className="flex justify-end gap-2">
                        <Button
                            label={t('Cancelar', 'Cancel')}
                            icon="pi pi-times"
                            className="p-button-text"
                            onClick={() => setDialogOpen(false)}
                        />
                        <Button
                            label={t('Guardar', 'Save')}
                            icon="pi pi-check"
                            className="p-button-primary"
                            loading={isSaving}
                            onClick={handleSave}
                        />
                    </div>
                )}
            >
                <div className="space-y-4 pt-2">
                    <div>
                        <label className="block text-sm font-medium mb-1">{t('Nombre descriptivo', 'Descriptive Name')}</label>
                        <InputText
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder={t('Ej: Publicar artículos programados', 'Ex: Publish scheduled posts')}
                            className="w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">{t('Comando Artisan', 'Artisan Command')}</label>
                        <InputText
                            value={formData.command}
                            onChange={(e) => setFormData({ ...formData, command: e.target.value })}
                            placeholder="atlas:publish-scheduled"
                            className="w-full font-mono text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">{t('Expresión Cron', 'Cron Expression')}</label>
                        <InputText
                            value={formData.expression}
                            onChange={(e) => setFormData({ ...formData, expression: e.target.value })}
                            placeholder="* * * * * / @daily"
                            className="w-full font-mono text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">{t('Descripción', 'Description')}</label>
                        <InputTextarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            className="w-full"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <InputSwitch
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.value ?? true })}
                        />
                        <span className="text-sm">{t('Activar inmediatamente', 'Activate immediately')}</span>
                    </div>
                </div>
            </Dialog>

            <Dialog
                header={t('Salida de Ejecución', 'Execution Output')}
                visible={outputDialogOpen}
                style={{ width: '600px' }}
                onHide={() => setOutputDialogOpen(false)}
            >
                <pre className="bg-slate-950 text-slate-100 p-4 rounded text-xs font-mono whitespace-pre-wrap max-h-96 overflow-y-auto">
                    {selectedOutput}
                </pre>
            </Dialog>
        </div>
    );
}
