import { useEffect, useMemo, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { useAtlasLocale } from '@/lib/atlas-locale';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dropdown } from 'primereact/dropdown';
import { FileUpload, type FileUploadSelectEvent } from 'primereact/fileupload';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Tag } from 'primereact/tag';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type DirectoryRecord = { id: number; name: string; slug: string; description?: string | null; media_count?: number };
type MediaRecord = { id: number; filename: string; mime_type: string; size?: number | null; title?: string | null; alt_text?: string | null; directory_id?: number | null; directory?: DirectoryRecord | null; metadata?: { url?: string; directory?: string }; preview_url?: string | null };

export default function MediaIndex({ media, directories }: { media: MediaRecord[]; directories: DirectoryRecord[] }) {
    const { t } = useAtlasLocale();
    const [query, setQuery] = useState('');
    const [selectedDirectoryId, setSelectedDirectoryId] = useState<number | 'all'>('all');
    const [selectedMediaId, setSelectedMediaId] = useState<number | null>(media[0]?.id ?? null);
    const uploadForm = useForm<{ file: File | null; title: string; alt_text: string; directory_id: number | null }>({ file: null, title: '', alt_text: '', directory_id: null });
    const directoryForm = useForm({ name: '', description: '' });
    const detailsForm = useForm({ title: '', alt_text: '', directory_id: null as number | null });

    const directoryOptions = useMemo(
        () => [{ label: t('Sin directorio', 'No directory'), value: null }, ...directories.map((directory) => ({ label: directory.name, value: directory.id }))],
        [directories],
    );

    const filteredMedia = media.filter((item) => {
        const matchesDirectory = selectedDirectoryId === 'all' || (item.directory_id ?? null) === selectedDirectoryId;
        const haystack = `${item.filename} ${item.mime_type} ${item.title ?? ''} ${item.alt_text ?? ''} ${item.directory?.name ?? ''}`.toLowerCase();
        return matchesDirectory && haystack.includes(query.toLowerCase());
    });

    const selectedMedia = media.find((item) => item.id === selectedMediaId) ?? filteredMedia[0] ?? null;

    useEffect(() => {
        if (!selectedMedia && filteredMedia.length > 0) setSelectedMediaId(filteredMedia[0].id);
    }, [filteredMedia, selectedMedia]);

    useEffect(() => {
        detailsForm.setData({ title: selectedMedia?.title ?? selectedMedia?.filename ?? '', alt_text: selectedMedia?.alt_text ?? '', directory_id: selectedMedia?.directory_id ?? null });
    }, [selectedMedia?.id]);

    const removeMedia = (row = selectedMedia) => {
        if (!row) return;
        if (!window.confirm(t(`¿Eliminar el archivo "${row.filename}"?`, `Delete file "${row.filename}"?`))) return;
        router.delete(`/admin/media/${row.id}`, { preserveScroll: true, onSuccess: () => setSelectedMediaId(null) });
    };

    const removeDirectory = (directory: DirectoryRecord) => {
        if (!window.confirm(t(`¿Eliminar el directorio "${directory.name}"?`, `Delete directory "${directory.name}"?`))) return;
        router.delete(`/admin/media/directories/${directory.id}`, { preserveScroll: true });
    };

    const previewImage = (row?: MediaRecord | null, size = 'h-14 w-14') => {
        if (!row?.mime_type?.startsWith('image/')) return null;
        const src = row.preview_url || row.metadata?.url || null;
        if (!src) return null;
        return <img src={src} alt={row.title || row.filename} className={`${size} rounded-lg object-cover`} loading="lazy" />;
    };

    return (
        <>
            <Head title={t('Media', 'Media')} />
            <div className="space-y-6">
                <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Atlas media</p>
                            <h1 className="text-3xl font-semibold text-slate-950">{t('Biblioteca multimedia', 'Media library')}</h1>
                            <p className="max-w-2xl text-sm text-slate-600">{t('Organiza archivos por directorios como carrusel, PDF, prensa o documentos y mantén una biblioteca mucho más clara para el equipo editorial.', 'Organize files by directories such as carousel, PDF, press or documents and keep a much clearer media library for the editorial team.')}</p>
                        </div>
                        <div className="grid w-full max-w-xl gap-3 md:grid-cols-[1fr_220px]">
                            <InputText value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('Buscar por archivo, título o tipo MIME', 'Search by file, title or MIME type')} className="w-full" />
                            <Dropdown value={selectedDirectoryId} options={[{ label: t('Todos los directorios', 'All directories'), value: 'all' }, ...directories.map((directory) => ({ label: directory.name, value: directory.id }))]} onChange={(event) => setSelectedDirectoryId(event.value)} className="w-full" />
                        </div>
                    </div>
                </section>

                <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
                    <div className="space-y-6">
                        <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                            <CardHeader>
                                <CardTitle>{t('Directorios', 'Directories')}</CardTitle>
                                <CardDescription>{t('Crea contenedores lógicos para separar carruseles, PDF, recursos institucionales o cualquier colección editorial.', 'Create logical containers to separate carousels, PDFs, institutional resources or any editorial collection.')}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <form onSubmit={(event) => { event.preventDefault(); directoryForm.post('/admin/media/directories', { onSuccess: () => directoryForm.reset() }); }} className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                    <label className="space-y-2"><span className="text-sm font-medium text-slate-700">{t('Nombre del directorio', 'Directory name')}</span><InputText value={directoryForm.data.name} onChange={(event) => directoryForm.setData('name', event.target.value)} placeholder={t('Carrusel', 'Carousel')} className="w-full" /></label>
                                    <label className="space-y-2"><span className="text-sm font-medium text-slate-700">{t('Descripción', 'Description')}</span><InputTextarea value={directoryForm.data.description} onChange={(event) => directoryForm.setData('description', event.target.value)} rows={3} autoResize placeholder={t('Banners e imágenes principales del home.', 'Banners and main home images.')} className="w-full" /></label>
                                    <Button label={t('Crear directorio', 'Create directory')} icon="pi pi-folder-plus" type="submit" className="w-full rounded-full" />
                                </form>
                                <div className="space-y-3">
                                    {directories.length ? directories.map((directory) => (
                                        <div key={directory.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                                            <div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2"><p className="font-medium text-slate-950">{directory.name}</p><Tag value={directory.slug} severity="info" rounded /></div><p className="mt-2 text-sm text-slate-600">{directory.description || t('Sin descripción.', 'No description.')}</p></div><Button icon="pi pi-trash" severity="danger" text rounded onClick={() => removeDirectory(directory)} /></div>
                                            <div className="mt-3 text-xs text-slate-500">{directory.media_count ?? 0} {t('archivos', 'files')}</div>
                                        </div>
                                    )) : <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">{t('Todavía no hay directorios. Crea uno para empezar a ordenar carruseles, PDF o recursos descargables.', 'There are no directories yet. Create one to start organizing carousels, PDFs or downloadable resources.')}</div>}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                            <CardHeader><CardTitle>{t('Subir archivo', 'Upload file')}</CardTitle><CardDescription>{t('Asigna el archivo a un directorio desde el primer momento para que el sitio se mantenga ordenado.', 'Assign the file to a directory from the start so the site stays organized.')}</CardDescription></CardHeader>
                            <CardContent>
                                <form onSubmit={(event) => { event.preventDefault(); uploadForm.post('/admin/media', { forceFormData: true, onSuccess: () => uploadForm.reset() }); }} className="grid gap-4">
                                    <FileUpload mode="basic" name="file" chooseLabel={uploadForm.data.file ? uploadForm.data.file.name : t('Seleccionar archivo', 'Select file')} auto={false} customUpload uploadHandler={() => {}} onSelect={(event: FileUploadSelectEvent) => uploadForm.setData('file', event.files?.[0] ?? null)} />
                                    <label className="space-y-2"><span className="text-sm font-medium text-slate-700">{t('Directorio', 'Directory')}</span><Dropdown value={uploadForm.data.directory_id} options={directoryOptions} onChange={(event) => uploadForm.setData('directory_id', event.value)} className="w-full" /></label>
                                    <label className="space-y-2"><span className="text-sm font-medium text-slate-700">{t('Título', 'Title')}</span><InputText value={uploadForm.data.title} onChange={(event) => uploadForm.setData('title', event.target.value)} placeholder={t('Imagen principal del home', 'Main home image')} className="w-full" /></label>
                                    <label className="space-y-2"><span className="text-sm font-medium text-slate-700">{t('Texto alternativo', 'Alt text')}</span><InputTextarea value={uploadForm.data.alt_text} onChange={(event) => uploadForm.setData('alt_text', event.target.value)} autoResize rows={4} placeholder={t('Describe el archivo para accesibilidad y SEO.', 'Describe the file for accessibility and SEO.')} className="w-full" /></label>
                                    <Button label={t('Subir archivo', 'Upload file')} icon="pi pi-upload" type="submit" className="w-full rounded-full" />
                                </form>
                            </CardContent>
                        </Card>

                        <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                            <CardHeader><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><CardTitle>{t('Detalle del archivo', 'File details')}</CardTitle><CardDescription>{t('Edita el archivo seleccionado, cambia su directorio o retíralo de la biblioteca.', 'Edit the selected file, change its directory or remove it from the library.')}</CardDescription></div>{selectedMedia ? <Button label={t('Eliminar archivo', 'Delete file')} icon="pi pi-trash" severity="danger" outlined onClick={() => removeMedia()} className="rounded-full" /> : null}</div></CardHeader>
                            <CardContent>
                                {selectedMedia ? (
                                    <form onSubmit={(event) => { event.preventDefault(); detailsForm.put(`/admin/media/${selectedMedia.id}`); }} className="space-y-4">
                                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">{previewImage(selectedMedia, 'h-56 w-full') ?? <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-sm text-slate-500">{selectedMedia.mime_type}</div>}</div>
                                        <div className="grid gap-2 text-sm text-slate-600"><div className="flex items-center justify-between"><span>{t('Archivo', 'File')}</span><span className="font-medium text-slate-900">{selectedMedia.filename}</span></div><div className="flex items-center justify-between"><span>{t('Tipo MIME', 'MIME type')}</span><span className="font-medium text-slate-900">{selectedMedia.mime_type}</span></div><div className="flex items-center justify-between"><span>{t('Directorio', 'Directory')}</span><span className="font-medium text-slate-900">{selectedMedia.directory?.name ?? t('Sin directorio', 'No directory')}</span></div><div className="flex items-center justify-between"><span>{t('Tamaño', 'Size')}</span><span className="font-medium text-slate-900">{selectedMedia.size ? `${Math.max(1, Math.round(selectedMedia.size / 1024))} KB` : t('Desconocido', 'Unknown')}</span></div></div>
                                        <label className="space-y-2"><span className="text-sm font-medium text-slate-700">{t('Directorio', 'Directory')}</span><Dropdown value={detailsForm.data.directory_id} options={directoryOptions} onChange={(event) => detailsForm.setData('directory_id', event.value)} className="w-full" /></label>
                                        <label className="space-y-2"><span className="text-sm font-medium text-slate-700">{t('Título', 'Title')}</span><InputText value={detailsForm.data.title} onChange={(event) => detailsForm.setData('title', event.target.value)} className="w-full" /></label>
                                        <label className="space-y-2"><span className="text-sm font-medium text-slate-700">{t('Texto alternativo', 'Alt text')}</span><InputTextarea value={detailsForm.data.alt_text} onChange={(event) => detailsForm.setData('alt_text', event.target.value)} rows={4} autoResize className="w-full" /></label>
                                        <Button label={detailsForm.processing ? t('Guardando...', 'Saving...') : t('Guardar metadata', 'Save metadata')} icon="pi pi-save" type="submit" loading={detailsForm.processing} className="w-full rounded-full" />
                                    </form>
                                ) : <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">{t('Selecciona un archivo para revisar, actualizar metadata o eliminarlo.', 'Select a file to review, update metadata or delete it.')}</div>}
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                        <CardHeader><CardTitle>{t('Biblioteca', 'Library')}</CardTitle><CardDescription>{t(`${filteredMedia.length} archivos coinciden con la búsqueda actual.`, `${filteredMedia.length} assets match the current search.`)}</CardDescription></CardHeader>
                        <CardContent>
                            <DataTable value={filteredMedia} dataKey="id" paginator rows={12} stripedRows size="small" selectionMode="single" selection={selectedMedia} onSelectionChange={(event) => setSelectedMediaId((event.value as MediaRecord | null)?.id ?? null)} className="rounded-2xl border border-slate-200" emptyMessage={t('No hay archivos que coincidan con la búsqueda actual.', 'No assets match the current search.')}>
                                <Column header={t('Vista previa', 'Preview')} body={(row: MediaRecord) => previewImage(row) ?? <span className="text-xs text-slate-500">{row.mime_type}</span>} />
                                <Column field="filename" header={t('Archivo', 'File')} sortable />
                                <Column field="title" header={t('Título', 'Title')} />
                                <Column header={t('Directorio', 'Directory')} body={(row: MediaRecord) => row.directory?.name ? <Tag value={row.directory.name} rounded severity="info" /> : <span className="text-xs text-slate-500">{t('Sin directorio', 'No directory')}</span>} />
                                <Column field="mime_type" header={t('Tipo MIME', 'MIME type')} sortable />
                                <Column header={t('Acciones', 'Actions')} body={(row: MediaRecord) => <Button icon="pi pi-trash" severity="danger" text rounded onClick={() => removeMedia(row)} />} />
                            </DataTable>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
