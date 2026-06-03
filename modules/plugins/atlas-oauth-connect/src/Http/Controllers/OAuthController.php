<?php

namespace Modules\Plugins\AtlasOAuthConnect\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Modules\Plugins\AtlasOAuthConnect\Models\OAuthAccount;
use Modules\Plugins\AtlasOAuthConnect\Support\OAuthConfig;
use Modules\Plugins\AtlasOAuthConnect\Support\OAuthProviderRegistry;

class OAuthController extends Controller
{
    public function redirect(string $provider): RedirectResponse
    {
        $meta = OAuthProviderRegistry::get($provider);

        abort_unless($meta, 404);
        abort_unless((bool) config("services.{$meta['driver']}.enabled"), 403, 'Este proveedor OAuth no está activo.');

        return Socialite::driver($meta['driver'])
            ->scopes($meta['scopes'] ?? [])
            ->redirect();
    }

    public function callback(string $provider): RedirectResponse
    {
        $meta = OAuthProviderRegistry::get($provider);

        abort_unless($meta, 404);
        abort_unless((bool) config("services.{$meta['driver']}.enabled"), 403, 'Este proveedor OAuth no está activo.');

        $socialUser = Socialite::driver($meta['driver'])->user();

        $oauthAccount = OAuthAccount::query()
            ->where('provider', $provider)
            ->where('provider_user_id', (string) $socialUser->getId())
            ->first();

        if ($oauthAccount) {
            $this->syncOAuthAccount($oauthAccount, $socialUser);
            Auth::login($oauthAccount->user, true);

            return redirect()->intended('/admin');
        }

        $email = $socialUser->getEmail();
        abort_unless($email, 422, 'Google no devolvió un correo electrónico válido.');

        $user = User::query()->where('email', $email)->first();

        if (! $user) {
            abort_unless(OAuthConfig::allowAutoRegister(), 403, 'No existe una cuenta asociada a este correo.');

            $user = User::query()->create([
                'name' => $socialUser->getName() ?: $socialUser->getNickname() ?: $email,
                'email' => $email,
                'password' => Hash::make(Str::random(48)),
                'email_verified_at' => now(),
            ]);
        }

        $oauthAccount = OAuthAccount::query()->create([
            'user_id' => $user->id,
            'provider' => $provider,
            'provider_user_id' => (string) $socialUser->getId(),
            'email' => $email,
            'name' => $socialUser->getName(),
            'avatar' => $socialUser->getAvatar(),
            'access_token' => $socialUser->token ?? null,
            'refresh_token' => $socialUser->refreshToken ?? null,
            'token_expires_at' => isset($socialUser->expiresIn) ? now()->addSeconds($socialUser->expiresIn) : null,
        ]);

        Auth::login($user, true);

        return redirect()->intended('/admin');
    }

    protected function syncOAuthAccount(OAuthAccount $account, mixed $socialUser): void
    {
        $account->update([
            'email' => $socialUser->getEmail(),
            'name' => $socialUser->getName(),
            'avatar' => $socialUser->getAvatar(),
            'access_token' => $socialUser->token ?? $account->access_token,
            'refresh_token' => $socialUser->refreshToken ?? $account->refresh_token,
            'token_expires_at' => isset($socialUser->expiresIn) ? now()->addSeconds($socialUser->expiresIn) : $account->token_expires_at,
        ]);
    }
}
