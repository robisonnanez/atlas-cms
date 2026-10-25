import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAtlasLocale } from '@/lib/atlas-locale';
import { Head, Link } from '@inertiajs/react';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';

type ActivityDetail = {
    id: number;
    log_name?: string | null;
    description: string;
    subject_type?: string | null;
    subject_id?: number | null;
    event?: string | null;
    causer?: { id: number; name: string; email: string } | null;
    properties?: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
};

export default function ActivityLogShow({
    activity,
}: {
    activity: ActivityDetail;
}) {
    const { t } = useAtlasLocale();

    return (
        <div className="space-y-6 p-4 md:p-8 max-w-5xl mx-auto">
            <Head title={t(`Detalle de Actividad #${activity.id} - Atlas CMS`, `Activity Detail #${activity.id} - Atlas CMS`)} />

            <div className="flex items-center justify-between">
                <div>
                    <Link href="/admin/activity-logs">
                        <Button
                            label={t('Volver al registro', 'Back to Activity Log')}
                            icon="pi pi-arrow-left"
                            className="p-button-text p-button-sm mb-2"
                        />
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                        {t('Detalle de Registro', 'Log Detail')} #{activity.id}
                    </h1>
                </div>
                <Tag
                    value={activity.event?.toUpperCase() || 'EVENTO'}
                    severity="info"
                    className="text-sm px-3 py-1"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">{t('Información General', 'General Information')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-slate-500">{t('Descripción', 'Description')}:</span>
                            <span className="font-medium">{activity.description}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-slate-500">{t('Canal / Log', 'Channel / Log')}:</span>
                            <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{activity.log_name || 'general'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-slate-500">{t('Fecha de Creación', 'Creation Date')}:</span>
                            <span>{new Date(activity.created_at).toLocaleString()}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">{t('Contexto y Sujeto', 'Context & Subject')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-slate-500">{t('Usuario Causante', 'Causer')}:</span>
                            <span className="font-medium">{activity.causer ? `${activity.causer.name} (${activity.causer.email})` : t('Sistema / Tarea Automática', 'System / Automatic Task')}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-slate-500">{t('Tipo de Sujeto', 'Subject Type')}:</span>
                            <span className="font-mono text-xs">{activity.subject_type || '-'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-slate-500">{t('ID de Sujeto', 'Subject ID')}:</span>
                            <span className="font-mono">{activity.subject_id || '-'}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">{t('Propiedades y Metadatos del Evento', 'Event Properties & Metadata')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <pre className="bg-slate-950 text-slate-100 p-4 rounded text-xs font-mono whitespace-pre-wrap overflow-x-auto">
                        {JSON.stringify(activity.properties || {}, null, 2)}
                    </pre>
                </CardContent>
            </Card>
        </div>
    );
}
