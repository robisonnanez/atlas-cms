import { Form, Head, Link } from '@inertiajs/react';
import { Password } from 'primereact/password';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = { status?: string; canResetPassword: boolean };

export default function LoginAtlantis({ canResetPassword, status }: Props) {
  return (
    <>
      <Head title="Login" />
      <div className="atlantis-theme min-h-screen bg-[#0b1136] px-4 py-10">
        <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-2xl border border-white/10 bg-[#1d254f] shadow-2xl lg:grid-cols-2">
          <div className="hidden flex-col justify-between bg-[radial-gradient(circle_at_top,_#2f3b75,_#151b3b)] p-10 lg:flex">
            <div className="space-y-4">
              <img src="/atlas-cms-logo.png" alt="Atlas CMS" className="h-28 w-auto object-contain" />
              <p className="text-sm text-slate-300">Panel editorial, sitios publicos y arquitectura modular para Atlas CMS.</p>
            </div>
            <div>
              <h2 className="text-3xl font-semibold text-white">Bienvenido de nuevo</h2>
              <p className="mt-3 text-slate-300">Inicia sesion para continuar administrando contenido, permisos, temas, plugins y configuracion del sitio.</p>
            </div>
          </div>

          <div className="p-6 sm:p-10">
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <img src="/atlas-cms-logo.png" alt="Atlas CMS" className="h-16 w-auto object-contain" />
              <div>
                <h1 className="text-2xl font-semibold text-white">Atlas CMS</h1>
                <p className="text-sm text-slate-300">Acceso al panel administrativo</p>
              </div>
            </div>

            <h1 className="text-3xl font-semibold text-white">Iniciar sesion</h1>
            <p className="mt-2 text-sm text-slate-300">Usa tus credenciales para acceder a la plataforma.</p>

            {status && <div className="mt-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{status}</div>}

            <Form {...store.form()} className="mt-6 space-y-5">
              {({ processing, errors }) => (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-200">Correo</label>
                    <input name="email" type="email" className="w-full rounded-lg border border-white/10 bg-[#2a325d] px-3 py-2 text-white outline-none ring-0 placeholder:text-slate-400 focus:border-fuchsia-400" placeholder="tu@empresa.com" />
                    {errors.email && <p className="mt-1 text-xs text-rose-300">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-200">Contrasena</label>
                    <Password
                      inputId="password"
                      name="password"
                      feedback={false}
                      toggleMask
                      className="atlantis-password-field"
                      inputClassName="rounded-lg border border-white/10 bg-[#2a325d] px-3 py-2 text-white outline-none ring-0 placeholder:text-slate-400 focus:border-fuchsia-400"
                      placeholder="Tu contrasena"
                    />
                    {errors.password && <p className="mt-1 text-xs text-rose-300">{errors.password}</p>}
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <label className="flex items-center gap-2 text-sm text-slate-300">
                      <input name="remember" value="1" type="checkbox" className="h-4 w-4 rounded border border-white/20 bg-[#2a325d]" />
                      Recordarme
                    </label>
                    {canResetPassword && <a href={request().url} className="text-sm text-fuchsia-300 hover:text-fuchsia-200">Olvide mi contrasena</a>}
                  </div>

                  <button type="submit" disabled={processing} className="w-full rounded-lg bg-fuchsia-500 px-4 py-2.5 font-semibold text-white transition hover:bg-fuchsia-400 disabled:cursor-not-allowed disabled:opacity-60">
                    {processing ? 'Ingresando...' : 'Ingresar'}
                  </button>

                  <p className="text-center text-xs text-slate-400">
                    Necesitas ayuda? <Link href="/auth/error" className="text-fuchsia-300 hover:text-fuchsia-200">Abrir soporte</Link>
                  </p>
                </>
              )}
            </Form>
          </div>
        </div>
      </div>
    </>
  );
}
