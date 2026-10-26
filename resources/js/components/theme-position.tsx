import { Link } from '@inertiajs/react';
import React from 'react';

export type PositionModule = {
    id: number;
    title: string;
    show_title: boolean;
    type: string;
    position: string;
    custom_classes?: string | null;
    data?: any;
};

export type ThemePositionProps = {
    position: string;
    modules?: PositionModule[];
    className?: string;
    moduleClassName?: string;
};

export default function ThemePosition({ position, modules = [], className = '', moduleClassName = '' }: ThemePositionProps) {
    if (!modules || modules.length === 0) {
        return null;
    }

    return (
        <div className={`atlas-theme-position atlas-position-${position} ${className}`}>
            {modules.map((module) => (
                <div
                    key={module.id}
                    className={`atlas-module atlas-module-${module.type} ${module.custom_classes ?? ''} ${moduleClassName}`}
                >
                    {module.show_title && (
                        <h4 className="atlas-module-title text-base font-semibold text-slate-900 dark:text-slate-100 mb-3">
                            {module.title}
                        </h4>
                    )}

                    <div className="atlas-module-body">
                        {renderModuleContent(module)}
                    </div>
                </div>
            ))}
        </div>
    );
}

function renderModuleContent(module: PositionModule) {
    const data = module.data ?? {};

    switch (module.type) {
        case 'custom_html':
            return (
                <div
                    className="prose prose-sm prose-slate max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: data.html ?? '' }}
                />
            );

        case 'menu': {
            const items = data.items ?? [];
            const isHorizontal = data.layout === 'horizontal';

            if (!items.length) {
                return <p className="text-xs text-slate-400">Sin enlaces en el menú.</p>;
            }

            return (
                <ul className={isHorizontal ? 'flex flex-wrap gap-4 items-center' : 'space-y-1'}>
                    {items.map((item: any) => (
                        <li key={item.id}>
                            <Link
                                href={item.url}
                                target={item.target ?? '_self'}
                                className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition"
                            >
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            );
        }

        case 'recent_posts': {
            const posts = data.posts ?? [];
            if (!posts.length) {
                return <p className="text-xs text-slate-400">No hay publicaciones recientes.</p>;
            }

            return (
                <div className="space-y-3">
                    {posts.map((post: any) => (
                        <article key={post.id} className="text-sm">
                            <Link
                                href={post.url}
                                className="font-medium text-slate-800 dark:text-slate-200 hover:text-sky-600 dark:hover:text-sky-400 line-clamp-2 transition"
                            >
                                {post.title}
                            </Link>
                            {data.show_date && post.published_at && (
                                <time className="block text-xs text-slate-400 mt-0.5">
                                    {new Date(post.published_at).toLocaleDateString()}
                                </time>
                            )}
                            {data.show_excerpt && post.excerpt && (
                                <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                                    {post.excerpt}
                                </p>
                            )}
                        </article>
                    ))}
                </div>
            );
        }

        case 'categories': {
            const categories = data.categories ?? [];
            if (!categories.length) {
                return <p className="text-xs text-slate-400">No hay categorías disponibles.</p>;
            }

            return (
                <ul className="space-y-1.5 text-sm">
                    {categories.map((cat: any) => (
                        <li key={cat.id} className="flex items-center justify-between">
                            <Link
                                href={cat.url}
                                className="text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition"
                            >
                                {cat.name}
                            </Link>
                            {data.show_count && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                                    {cat.posts_count}
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
            );
        }

        case 'search_bar':
            return (
                <form action={data.action ?? '/search'} method="GET" className="relative">
                    <input
                        type="search"
                        name="q"
                        placeholder={data.placeholder ?? 'Buscar...'}
                        className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 pr-9 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <button
                        type="submit"
                        aria-label="Buscar"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                        <i className="pi pi-search text-xs" />
                    </button>
                </form>
            );

        case 'contact_info':
            return (
                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    {data.phone && (
                        <div className="flex items-center gap-2">
                            <i className="pi pi-phone text-xs text-sky-600" />
                            <span>{data.phone}</span>
                        </div>
                    )}
                    {data.email && (
                        <div className="flex items-center gap-2">
                            <i className="pi pi-envelope text-xs text-sky-600" />
                            <a href={`mailto:${data.email}`} className="hover:underline">
                                {data.email}
                            </a>
                        </div>
                    )}
                    {data.address && (
                        <div className="flex items-start gap-2">
                            <i className="pi pi-map-marker text-xs text-sky-600 mt-1" />
                            <span>{data.address}</span>
                        </div>
                    )}
                    {data.hours && (
                        <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                            <i className="pi pi-clock text-xs" />
                            <span>{data.hours}</span>
                        </div>
                    )}
                </div>
            );

        default:
            return null;
    }
}