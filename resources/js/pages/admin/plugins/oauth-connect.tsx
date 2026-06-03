import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from 'primereact/button';
import { InputSwitch, type InputSwitchChangeEvent } from 'primereact/inputswitch';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Tag } from 'primereact/tag';

type OAuthProvider = {
  label: string;
  driver: string;
  icon: string;
  enabled_key: string;
  client_id_key: string;
  client_secret_key: string;
  scopes?: string[];
};

type OAuthSettings = {
  google_enabled: boolean;
  google_client_id: string;
  google_client_secret: string;
  allow_auto_register: boolean;
};

type Props = {
  pluginActive: boolean;
  socialiteInstalled: boolean;
  providers: Record<string, OAuthProvider>;
  settings: OAuthSettings;
  callbackUrls: Record<string, string>;
};

export default function OAuthConnectSettings({ pluginActive, socialiteInstalled, providers, settings, callbackUrls }: Props) {
  const form = useForm({
    google_enabled: Boolean(settings.google_enabled),
    google_client_id: settings.google_client_id ?? '',
    google_client_secret: settings.google_client_secret ?? '',
    allow_auto_register: Boolean(settings.allow_auto_register),
  });

  const setBoolean = (key: 'google_enabled' | 'allow_auto_register', event: InputSwitchChangeEvent) => {
    form.setData(key, Boolean(event.value));
  };

  return (
    <>
      <Head title="OAuth de Atlas" />

      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm md:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Atlas OAuth Connect</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">Acceso con Google</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Configura el inicio de sesión con Google o Gmail para Atlas CMS. Una vez activo, el botón OAuth aparecerá
              automáticamente en la pantalla de acceso.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Resumen</h2>
            <div className="mt-4 grid gap-3 text-sm">
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <span className="text-slate-600">Plugin</span>
                <Tag value={pluginActive ? 'Activo' : 'Inactivo'} severity={pluginActive ? 'success' : 'warning'} rounded />
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <span className="text-slate-600">Socialite</span>
                <Tag value={socialiteInstalled ? 'Instalado' : 'Pendiente'} severity={socialiteInstalled ? 'success' : 'danger'} rounded />
              </div>
            </div>
          </div>
        </section>

        {!pluginActive ? (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            Activa primero el plugin desde <Link href="/admin/plugins" className="font-semibold underline">Sistema &gt; Plugins</Link> para que el botón aparezca en el login.
          </div>
        ) : null}

        {!socialiteInstalled ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-900">
            Laravel Socialite todavía no está disponible en esta instalación. Instálalo antes de usar OAuth.
          </div>
        ) : null}

        <form
          onSubmit={(event) => {
            event.preventDefault();
            form.put('/admin/plugins/atlas-oauth-connect');
          }}
          className="space-y-6"
        >
          <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-slate-950">{providers.google?.label ?? 'Google / Gmail'}</h2>
                <p className="text-sm text-slate-600">Registra esta URL exacta en Google Cloud Console:</p>
                <code className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-700">
                  {callbackUrls.google}
                </code>
              </div>

              <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-3">
                <span className="text-sm font-medium text-slate-700">Activar Google</span>
                <InputSwitch checked={form.data.google_enabled} onChange={(event) => setBoolean('google_enabled', event)} />
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Google Client ID</span>
                <InputText
                  value={form.data.google_client_id}
                  onChange={(event) => form.setData('google_client_id', event.target.value)}
                  className="w-full"
                  placeholder="1234567890-xxxxxxxx.apps.googleusercontent.com"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Google Client Secret</span>
                <Password
                  value={form.data.google_client_secret}
                  onChange={(event) => form.setData('google_client_secret', event.target.value)}
                  className="w-full"
                  inputClassName="w-full"
                  feedback={false}
                  toggleMask
                  placeholder="GOCSPX-..."
                />
              </label>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Registro automático</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Si un correo autenticado con Google no existe todavía en Atlas, se podrá crear la cuenta automáticamente.
                </p>
              </div>

              <InputSwitch checked={form.data.allow_auto_register} onChange={(event) => setBoolean('allow_auto_register', event)} />
            </div>
          </section>

          <div className="flex justify-end">
            <Button
              type="submit"
              label={form.processing ? 'Guardando...' : 'Guardar configuración OAuth'}
              icon="pi pi-save"
              loading={form.processing}
              className="rounded-full"
            />
          </div>
        </form>
      </div>
    </>
  );
}
