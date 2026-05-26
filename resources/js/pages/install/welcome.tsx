import { Head, Link } from '@inertiajs/react';

export default function InstallWelcome({ requirements }: { requirements: Array<{ label: string; passed: boolean }> }) {
    return (
        <>
            <Head title="Install Atlas CMS" />
            <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-16 text-white">
                <div className="w-full max-w-4xl rounded-[2rem] border border-white/10 bg-white/5 p-10 backdrop-blur">
                    <p className="text-sm uppercase tracking-[0.35em] text-sky-300">Atlas CMS Installer</p>
                    <h1 className="mt-4 text-4xl font-semibold">Welcome to Atlas CMS</h1>
                    <p className="mt-4 max-w-2xl text-slate-300">
                        A modular publishing platform inspired by classic CMS workflows with a cleaner, faster modern stack.
                    </p>
                    <div className="mt-8 grid gap-4 md:grid-cols-2">
                        {requirements.map((item) => (
                            <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <div className="flex items-center justify-between">
                                    <span>{item.label}</span>
                                    <span className={item.passed ? 'text-emerald-300' : 'text-amber-300'}>{item.passed ? 'Ready' : 'Check'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 flex gap-3">
                        <Link href="/install/requirements" className="rounded-full bg-white px-5 py-3 font-medium text-slate-950">
                            Start installation
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
