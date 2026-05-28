import type { PropsWithChildren } from 'react';
import { Link } from '@inertiajs/react';

type Step = { key: string; label: string };

export default function InstallShell({
    title,
    description,
    currentStep,
    steps,
    children,
    backHref,
    nextHref,
    nextLabel,
}: PropsWithChildren<{
    title: string;
    description: string;
    currentStep: string;
    steps: Step[];
    backHref?: string;
    nextHref?: string;
    nextLabel?: string;
}>) {
    return (
        <div className="min-h-screen bg-slate-100 px-6 py-12 text-slate-950">
            <div className="mx-auto max-w-5xl space-y-8">
                <section className="rounded-[2rem] bg-slate-950 px-8 py-8 text-white shadow-xl">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex items-center gap-4">
                            <img src="/atlas-cms-logo.png" alt="Atlas CMS" className="h-20 w-auto rounded-2xl object-contain" />
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-300">Atlas CMS Installer</p>
                                <p className="mt-2 max-w-xl text-sm text-slate-300">Asistente de instalacion inicial para dejar listo el panel, la identidad del sitio y la primera cuenta administrativa.</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl space-y-3">
                            <h1 className="text-4xl font-semibold">{title}</h1>
                            <p className="text-sm leading-7 text-slate-300">{description}</p>
                        </div>
                        <div className="grid min-w-full gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 lg:min-w-[320px]">
                            {steps.map((step, index) => {
                                const active = step.key === currentStep;
                                const complete = steps.findIndex((item) => item.key === currentStep) > index;

                                return (
                                    <div key={step.key} className={`flex items-center gap-3 rounded-2xl px-3 py-2 ${active ? 'bg-white text-slate-950' : 'bg-white/5 text-slate-300'}`}>
                                        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${complete ? 'bg-emerald-400 text-slate-950' : active ? 'bg-slate-950 text-white' : 'bg-white/10 text-white'}`}>
                                            {index + 1}
                                        </div>
                                        <span className="text-sm font-medium">{step.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
                    {children}

                    <div className="mt-8 flex flex-wrap gap-3">
                        {backHref ? (
                            <Link href={backHref} className="rounded-full border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700">
                                Volver
                            </Link>
                        ) : null}
                        {nextHref ? (
                            <Link href={nextHref} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white">
                                {nextLabel ?? 'Continuar'}
                            </Link>
                        ) : null}
                    </div>
                </section>
            </div>
        </div>
    );
}
