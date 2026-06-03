# Atlas OAuth Connect

Plugin para Atlas CMS que permite iniciar sesión mediante OAuth2.

## Versión actual

V1.0.0 incluye únicamente conexión por Google/Gmail para facilitar pruebas controladas.

## Autor

Atlas CMS - Robison Ñañez Vivas

## Ruta esperada

Copia esta carpeta en:

```text
modules/plugins/atlas-oauth-connect/
```

## Dependencia requerida

Ejecuta desde la raíz de Atlas CMS:

```bash
composer require laravel/socialite
```

## Instalación

```bash
php artisan migrate
php artisan optimize:clear
npm run build
```

Luego entra al panel:

```text
System > Plugins
```

Activa el plugin y configura Google/Gmail.

## Callback URL

En Google Cloud Console registra:

```text
https://tudominio.com/auth/oauth/google/callback
```

En local:

```text
http://localhost:8000/auth/oauth/google/callback
```

## Login

El plugin incluye dos snippets:

```text
LOGIN_BUTTON_SNIPPET.blade.php
LOGIN_BUTTON_SNIPPET.tsx
```

Usa el que corresponda según tu login actual.

## Roadmap recomendado

- V1.0.0: Google/Gmail.
- V1.1.0: GitHub.
- V1.2.0: Microsoft/Outlook.
- V1.3.0: Facebook.
- V1.4.0: vincular/desvincular cuentas OAuth desde perfil de usuario.

## Notas

- Los tokens se guardan cifrados mediante casts `encrypted`.
- El registro automático es configurable.
- La configuración principal del plugin está declarada en `plugin.json` mediante `settings_schema`.
