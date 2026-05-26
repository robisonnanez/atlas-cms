import { useEffect, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { FileUpload, type FileUploadSelectEvent } from 'primereact/fileupload';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type MediaRecord = {
    id: number;
    filename: string;
    mime_type: string;
    size?: number | null;
    title?: string | null;
    alt_text?: string | null;
    metadata?: { url?: string };
};

export default function MediaIndex({ media }: { media: MediaRecord[] }) {
    const [query, setQuery] = useState('');
    const [selectedMediaId, setSelectedMediaId] = useState<number | null>(media[0]?.id ?? null);

    const uploadForm = useForm<{ file: File | null; title: string; alt_text: string }>({
        file: null,
        title: '',
        alt_text: '',
    });

    const detailsForm = useForm({
        title: '',
        alt_text: '',
    });

    const filteredMedia = media.filter((item) => {
        const haystack = `${item.filename} ${item.mime_type} ${item.title ?? ''} ${item.alt_text ?? ''}`.toLowerCase();

        return haystack.includes(query.toLowerCase());
    });

    const selectedMedia = media.find((item) => item.id === selectedMediaId) ?? filteredMedia[0] ?? null;

    useEffect(() => {
        if (!selectedMedia && filteredMedia.length > 0) {
            setSelectedMediaId(filteredMedia[0].id);
        }
    }, [filteredMedia, selectedMedia]);

    useEffect(() => {
        detailsForm.setData({
            title: selectedMedia?.title ?? selectedMedia?.filename ?? '',
            alt_text: selectedMedia?.alt_text ?? '',
        });
    }, [selectedMedia?.id]);

    return (
        <>
            <Head title="Media" />

            <div className="space-y-6">
                <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Atlas media</p>
                            <h1 className="text-3xl font-semibold text-slate-950">Media library</h1>
                            <p className="max-w-2xl text-sm text-slate-600">
                                Upload assets, search the library and refine metadata without leaving the same screen.
                            </p>
                        </div>
                        <div className="w-full max-w-sm">
                            <InputText
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search by filename, title or MIME type"
                                className="w-full"
                            />
                        </div>
                    </div>
                </section>

                <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
                    <div className="space-y-6">
                        <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                            <CardHeader>
                                <CardTitle>Upload asset</CardTitle>
                                <CardDescription>Add a new file with the metadata editors need right away.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        uploadForm.post('/admin/media');
                                    }}
                                    className="grid gap-4"
                                >
                                    <FileUpload
                                        mode="basic"
                                        name="file"
                                        chooseLabel={uploadForm.data.file ? uploadForm.data.file.name : 'Choose file'}
                                        auto={false}
                                        customUpload
                                        uploadHandler={() => {}}
                                        onSelect={(event: FileUploadSelectEvent) => uploadForm.setData('file', event.files?.[0] ?? null)}
                                    />
                                    <label className="space-y-2">
                                        <span className="text-sm font-medium text-slate-700">Title</span>
                                        <InputText
                                            value={uploadForm.data.title}
                                            onChange={(event) => uploadForm.setData('title', event.target.value)}
                                            placeholder="Homepage hero image"
                                            className="w-full"
                                        />
                                    </label>
                                    <label className="space-y-2">
                                        <span className="text-sm font-medium text-slate-700">Alt text</span>
                                        <InputTextarea
                                            value={uploadForm.data.alt_text}
                                            onChange={(event) => uploadForm.setData('alt_text', event.target.value)}
                                            autoResize
                                            rows={4}
                                            placeholder="Describe the asset for accessibility and SEO."
                                            className="w-full"
                                        />
                                    </label>
                                    <Button label="Upload asset" icon="pi pi-upload" type="submit" className="w-full rounded-full" />
                                </form>
                            </CardContent>
                        </Card>

                        <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                            <CardHeader>
                                <CardTitle>Asset details</CardTitle>
                                <CardDescription>Edit the selected file metadata in place.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {selectedMedia ? (
                                    <form
                                        onSubmit={(event) => {
                                            event.preventDefault();
                                            detailsForm.put(`/admin/media/${selectedMedia.id}`);
                                        }}
                                        className="space-y-4"
                                    >
                                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                                            {selectedMedia.mime_type.startsWith('image/') && selectedMedia.metadata?.url ? (
                                                <img
                                                    src={selectedMedia.metadata.url}
                                                    alt={selectedMedia.filename}
                                                    className="h-56 w-full rounded-2xl object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-sm text-slate-500">
                                                    {selectedMedia.mime_type}
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid gap-2 text-sm text-slate-600">
                                            <div className="flex items-center justify-between">
                                                <span>Filename</span>
                                                <span className="font-medium text-slate-900">{selectedMedia.filename}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span>MIME type</span>
                                                <span className="font-medium text-slate-900">{selectedMedia.mime_type}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span>Size</span>
                                                <span className="font-medium text-slate-900">
                                                    {selectedMedia.size ? `${Math.max(1, Math.round(selectedMedia.size / 1024))} KB` : 'Unknown'}
                                                </span>
                                            </div>
                                        </div>

                                        <label className="space-y-2">
                                            <span className="text-sm font-medium text-slate-700">Title</span>
                                            <InputText
                                                value={detailsForm.data.title}
                                                onChange={(event) => detailsForm.setData('title', event.target.value)}
                                                className="w-full"
                                            />
                                        </label>
                                        <label className="space-y-2">
                                            <span className="text-sm font-medium text-slate-700">Alt text</span>
                                            <InputTextarea
                                                value={detailsForm.data.alt_text}
                                                onChange={(event) => detailsForm.setData('alt_text', event.target.value)}
                                                rows={4}
                                                autoResize
                                                className="w-full"
                                            />
                                        </label>

                                        <Button
                                            label={detailsForm.processing ? 'Saving...' : 'Save metadata'}
                                            icon="pi pi-save"
                                            type="submit"
                                            loading={detailsForm.processing}
                                            className="w-full rounded-full"
                                        />
                                    </form>
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                                        Select a media item to inspect and update its metadata.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
                        <CardHeader>
                            <CardTitle>Library</CardTitle>
                            <CardDescription>{filteredMedia.length} assets match the current search.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DataTable
                                value={filteredMedia}
                                dataKey="id"
                                paginator
                                rows={12}
                                stripedRows
                                size="small"
                                selectionMode="single"
                                selection={selectedMedia}
                                onSelectionChange={(event) => setSelectedMediaId((event.value as MediaRecord | null)?.id ?? null)}
                                className="rounded-2xl border border-slate-200"
                                emptyMessage="No assets match the current search."
                            >
                                <Column
                                    header="Preview"
                                    body={(row: MediaRecord) => (
                                        row.mime_type.startsWith('image/') && row.metadata?.url
                                            ? <img src={row.metadata.url} alt={row.filename} className="h-14 w-14 rounded-lg object-cover" />
                                            : <span className="text-xs text-slate-500">{row.mime_type}</span>
                                    )}
                                />
                                <Column field="filename" header="Filename" sortable />
                                <Column field="title" header="Title" />
                                <Column field="mime_type" header="MIME type" sortable />
                            </DataTable>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
