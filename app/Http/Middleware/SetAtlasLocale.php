<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class SetAtlasLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->session()->get('atlas.locale');

        if (! $locale) {
            try {
                $locale = data_get(Setting::query()->where('key', 'site.system')->first()?->value, 'locale');
            } catch (Throwable) {
                $locale = null;
            }
        }

        if (! in_array($locale, ['es', 'en'], true)) {
            $locale = config('app.locale', 'es');
        }

        app()->setLocale($locale);
        $request->setLocale($locale);

        return $next($request);
    }
}
