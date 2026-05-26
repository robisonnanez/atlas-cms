<?php

namespace App\Http\Middleware;

use App\Support\Cms\InstallStateStore;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAtlasInstalled
{
    public function __construct(
        protected InstallStateStore $installStateStore,
    ) {
    }

    public function handle(Request $request, Closure $next): Response
    {
        if (app()->runningUnitTests()) {
            return $next($request);
        }

        if ($this->installStateStore->installed()) {
            return $next($request);
        }

        if ($request->is('install*') || $request->is('up') || $request->is('storage/*')) {
            return $next($request);
        }

        return redirect()->route('install.welcome');
    }
}
