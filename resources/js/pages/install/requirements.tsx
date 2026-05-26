import { Head, Link } from '@inertiajs/react';

export default function InstallRequirements({ requirements }: { requirements: Array<{ label: string; passed: boolean }> }) {
    return (
        <>
            <Head title="Requirements" />
            <div className="mx-auto max-w-4xl px-6 py-16">
                <h1 className="text-3xl font-semibold">Server requirements</h1>
                <div className="mt-8 space-y-4">
                    {requirements.map((item) => (
                        <div key={item.label} className="flex items-center justify-between rounded-2xl border bg-white p-4 shadow-sm">
                            <span>{item.label}</span>
                            <span className={item.passed ? 'text-emerald-600' : 'text-amber-600'}>{item.passed ? 'Passed' : 'Needs attention'}</span>
                        </div>
                    ))}
                </div>
                <div className="mt-8 flex gap-3">
                    <Link href="/install/database" className="rounded-full bg-slate-950 px-5 py-3 font-medium text-white">
                        Continue
                    </Link>
                </div>
            </div>
        </>
    );
}
