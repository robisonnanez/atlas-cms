import { FormEvent } from 'react'
import { Head, useForm } from '@inertiajs/react'
import AdminLayout from '@/layouts/AdminLayout'
import { Button } from 'primereact/button'
import { Card } from 'primereact/card'
import { InputText } from 'primereact/inputtext'
import { InputSwitch, InputSwitchChangeEvent } from 'primereact/inputswitch'
import { Password } from 'primereact/password'

/*
  Copia este archivo a:
  resources/js/Pages/Admin/OAuthConnect/Index.tsx
  si tu compilador Vite/Inertia todavía no resuelve páginas desde modules/plugins.
*/

type OAuthProvider = {
  label: string
  driver: string
  icon: string
  enabled_key: string
  client_id_key: string
  client_secret_key: string
  scopes?: string[]
}

type ProviderKey = 'google'

type OAuthProviders = Record<ProviderKey, OAuthProvider>

type OAuthSettings = {
  google_enabled: boolean
  google_client_id: string | null
  google_client_secret: string | null
  allow_auto_register: boolean
}

type CallbackUrls = Record<ProviderKey, string>

type Props = {
  providers: OAuthProviders
  settings: OAuthSettings
  callbackUrls: CallbackUrls
}

type FormData = {
  google_enabled: boolean
  google_client_id: string
  google_client_secret: string
  allow_auto_register: boolean
}

export default function Index({ providers, settings, callbackUrls }: Props) {
  const { data, setData, put, processing } = useForm<FormData>({
    google_enabled: Boolean(settings.google_enabled),
    google_client_id: settings.google_client_id ?? '',
    google_client_secret: settings.google_client_secret ?? '',
    allow_auto_register: Boolean(settings.allow_auto_register),
  })

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    put(route('admin.plugins.atlas-oauth-connect.update'))
  }

  const updateBoolean = (key: keyof FormData, event: InputSwitchChangeEvent) => {
    setData(key, Boolean(event.value))
  }

  return (
    <AdminLayout>
      <Head title="Atlas OAuth Connect" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Atlas OAuth Connect
          </h1>
          <p className="text-sm text-slate-500">
            V1.0.0: configura el inicio de sesión con Google/Gmail.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-6">
          <Card>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-medium">Registro automático</h2>
                <p className="text-sm text-slate-500">
                  Permite crear usuarios automáticamente cuando inicien sesión con Google.
                </p>
              </div>

              <InputSwitch
                checked={data.allow_auto_register}
                onChange={(event) => updateBoolean('allow_auto_register', event)}
              />
            </div>
          </Card>

          <Card>
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-medium">{providers.google.label}</h2>
                  <p className="text-sm text-slate-500">Callback URL:</p>
                  <code className="block rounded bg-slate-100 px-3 py-2 text-xs text-slate-700">
                    {callbackUrls.google}
                  </code>
                </div>

                <InputSwitch
                  checked={data.google_enabled}
                  onChange={(event) => updateBoolean('google_enabled', event)}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Google Client ID</label>
                  <InputText
                    className="w-full"
                    value={data.google_client_id}
                    onChange={(event) => setData('google_client_id', event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Google Client Secret</label>
                  <Password
                    className="w-full"
                    inputClassName="w-full"
                    feedback={false}
                    toggleMask
                    value={data.google_client_secret}
                    onChange={(event) => setData('google_client_secret', event.target.value)}
                  />
                </div>
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button
              type="submit"
              label="Guardar configuración"
              icon="pi pi-save"
              loading={processing}
            />
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
