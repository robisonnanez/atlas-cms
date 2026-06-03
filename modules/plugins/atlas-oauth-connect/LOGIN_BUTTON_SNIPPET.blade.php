{{--
  Agrega este bloque en tu vista Blade de login si el login usa Blade.
  Si el login usa React/Inertia, expón los proveedores activos desde el controlador
  y renderiza botones equivalentes en TSX.
--}}

@php
    $oauthProviders = \Modules\Plugins\AtlasOAuthConnect\Support\OAuthProviderRegistry::enabled();
@endphp

@if (count($oauthProviders) > 0)
    <div class="mt-6 space-y-3">
        @foreach ($oauthProviders as $key => $provider)
            <a
                href="{{ route('oauth.redirect', ['provider' => $key]) }}"
                class="flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
                Continuar con {{ $provider['label'] }}
            </a>
        @endforeach
    </div>
@endif
