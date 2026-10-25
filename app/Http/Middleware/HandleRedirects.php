<?php

namespace App\Http\Middleware;

use App\Models\RedirectRule;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HandleRedirects
{
    public function handle(Request $request, Closure $next): Response
    {
        // Solo interceptar peticiones GET y HEAD para redirecciones de navegación
        if (! $request->isMethodSafe()) {
            return $next($request);
        }

        $path = '/'.ltrim($request->path(), '/');

        // Búsqueda rápida de regla de redirección activa
        $rule = RedirectRule::query()
            ->active()
            ->where(function ($query) use ($path) {
                $query->where('source_path', $path)
                    ->orWhere('source_path', rtrim($path, '/'));
            })
            ->first();

        if ($rule) {
            $rule->recordHit();

            return redirect($rule->target_url, $rule->status_code);
        }

        return $next($request);
    }
}
