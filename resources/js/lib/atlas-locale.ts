import { usePage } from '@inertiajs/react';

export function useAtlasLocale() {
    const page = usePage<{ locale?: { current?: string } }>();
    const locale = page.props.locale?.current === 'en' ? 'en' : 'es';

    return {
        locale,
        isEnglish: locale === 'en',
        isSpanish: locale === 'es',
        t: (es: string, en: string) => (locale === 'en' ? en : es),
    };
}
