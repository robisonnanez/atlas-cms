type OAuthLoginProvider = {
  key: string
  label: string
  redirect_url: string
}

type OAuthLoginButtonsProps = {
  providers: OAuthLoginProvider[]
}

export default function OAuthLoginButtons({ providers }: OAuthLoginButtonsProps) {
  if (providers.length === 0) {
    return null
  }

  return (
    <div className="mt-6 space-y-3">
      {providers.map((provider) => (
        <a
          key={provider.key}
          href={provider.redirect_url}
          className="flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Continuar con {provider.label}
        </a>
      ))}
    </div>
  )
}
