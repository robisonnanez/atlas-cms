import { Head, Link } from '@inertiajs/react';

export default function InstallDatabase({ database }: { database: { driver: string; database: string } }) {
    return (
        <>
            <Head title="Database" />
            <div className="mx-auto max-w-4xl px-6 py-16">
                <h1 className="text-3xl font-semibold">Database configuration</h1>
                <p className="text-muted-foreground mt-3">Atlas reads the active Laravel connection from the environment.</p>
                <div className="mt-8 grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border p-5">
                        <p className="text-sm text-slate-500">Driver</p>
                        <p className="mt-2 text-lg font-semibold">{database.driver}</p>
                    </div>
                    <div className="rounded-2xl border p-5">
                        <p className="text-sm text-slate-500">Database</p>
                        <p className="mt-2 text-lg font-semibold">{database.database}</p>
                    </div>
                </div>
                <div className="mt-8 flex gap-3">
                    <Link href="/install/admin" className="rounded-full bg-slate-950 px-5 py-3 font-medium text-white">
                        Continue
                    </Link>
                </div>
            </div>
        </>
    );
}
