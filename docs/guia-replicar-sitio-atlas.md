# Guia para replicar un sitio tipo Sistematizar con Atlas CMS

## Objetivo
Esta guia explica como construir en Atlas CMS un sitio corporativo parecido a Sistematizar, tomando como referencia tres vistas publicas:
- Inicio: https://sistematizar.co/
- Costos: https://sistematizar.co/sitios-web/costos
- Soluciones web: https://sistematizar.co/productos/software-web

La idea no es clonar literalmente la marca de ese sitio, sino replicar su arquitectura de informacion, sus tipos de contenido y el flujo editorial usando Atlas CMS.

## 1. Mapa del sitio recomendado en Atlas
Crea esta estructura inicial:
- Inicio
- Nosotros
  - Quienes somos
  - Grupo humano
  - Legado
  - Historia
- Productos
  - Soluciones escritorio
  - Soluciones web
  - Apps moviles
  - Mensajes masivos SMS
- Sitios web
  - Clientes
  - Costos
  - Posicionamiento
- Servicios
  - Administracion de proyectos
  - Software a la medida
  - Infraestructura
  - Servidores
  - Hosting
  - Redes
- Contacto
- Blog o Noticias

En Atlas esto se reparte asi:
- `Pages`: para inicio, costos, contacto y paginas corporativas.
- `Posts`: para noticias y novedades.
- `Categories`: para agrupar noticias, productos o casos.
- `Menus`: para la navegacion principal, el footer y menus secundarios.

## 2. Configuracion base del sitio
En `System > Settings` configura:
- Nombre del sitio: Atlas CMS
- Eslogan: el mensaje comercial principal
- URL publica
- SEO por defecto
- Correo remitente
- Zona horaria e idioma

En `System > Themes` activa el tema principal y ajusta:
- Header con logo, menu principal y boton de acceso al admin
- Footer con contacto, redes y bloque de newsletter

## 3. Crear el menu principal
En `Content > Menus` crea un menu contenedor con ubicacion `primary`.
Luego agrega items de primer nivel:
- Home
- Nosotros
- Productos
- Sitios web
- Servicios
- Contacto

Despues agrega hijos y nietos usando `Parent item` o el arbol jerarquico drag-and-drop.
Atlas ya soporta hasta 4 niveles.

## 4. Construir la pagina de inicio
Segun la referencia, la home necesita estas secciones:
- Hero principal con titular fuerte y CTA
- Portafolio de servicios
- Productos de software
- Contacto
- Bloque de noticias o suscripcion

### Bloques sugeridos en Atlas
Usa el editor de paginas para crear bloques como estos:
- `Heading`: titulo principal y subtitulos
- `Paragraph`: mensajes de valor
- `Button`: botones como "Conocer servicios" o "Contactar"
- `Image`: logos y mockups
- `Columns`: grillas de servicios y productos
- `HTML`: cuando necesites una seccion mas personalizada con Tailwind

### Estructura recomendada
1. Hero con una propuesta de valor clara.
2. Tarjetas de servicios: fabrica de software, desarrollo web, apps moviles, cloud, infraestructura, soporte.
3. Rejilla de productos: Persey, Controller, Gestal, Kanato, Horus, etc.
4. Seccion de contacto con direccion, telefonos y correo.
5. Formulario o CTA final.

## 5. Crear la pagina de costos
La referencia de costos trabaja una pagina comercial orientada a conversion.
En Atlas se recomienda esta estructura:
- Hero corto con titulo `Nuestros costos`
- Parrafo introductorio
- Imagen o banner principal
- Tabla o cards de planes
- CTA "Me interesa"
- Contacto rapido

### Tipo de contenido recomendado
Crea la pagina `Costos` como una `Page` y usa bloques `Columns` para los planes.
Cada plan puede llevar:
- Nombre del plan
- Precio
- Lista de caracteristicas
- Boton de accion

#### Planes detectados en la referencia
- Basico
- Normal
- Avanzado
- Profesional

Campos sugeridos por plan:
- precio
- numero de paginas
- hosting incluido
- dominio incluido
- administrable
- adaptable
- slider o banner
- base de datos
- boton de pagos
- carrito de compra
- tiempo de entrega

En Atlas puedes modelarlo de dos maneras:
- V1 rapida: una sola pagina con bloques manuales.
- V1 escalable: crear un plugin o modulo `Pricing Cards` para administrar planes como items estructurados.

## 6. Crear la pagina de soluciones web
La referencia muestra un listado de productos o soluciones con nombre, resumen e imagen.
En Atlas tienes dos caminos:
- usar `Pages` hijas bajo `Productos > Soluciones web`
- usar `Posts` con categoria `soluciones-web`

### Recomendacion
Para tener mayor flexibilidad editorial:
- crea categoria `soluciones-web`
- registra cada solucion como `Post`
- usa la pagina `Soluciones web` como landing que liste automaticamente los posts de esa categoria

Cada solucion debe incluir:
- titulo
- slug
- extracto
- imagen destacada
- contenido extendido
- CTA `Ver mas`
- metadata SEO

## 7. Media y branding
En `Content > Media` sube:
- logo principal
- favicon
- iconos de servicios
- banners de hero
- mockups o capturas de productos

Buenas practicas:
- usa nombres de archivo claros
- completa `alt text`
- organiza por carpetas o convenciones de nombre
- prepara una version del logo para fondo claro y otra para fondo oscuro

## 8. SEO y conversion
Para acercarte a un sitio comercial como la referencia:
- define `SEO title` y `SEO description` por cada pagina clave
- usa slugs cortos y legibles
- agrega CTAs visibles arriba y abajo
- enlaza entre `Inicio`, `Costos`, `Soluciones web` y `Contacto`
- usa testimonios, logos de clientes o casos de exito cuando Atlas ya tenga ese modulo

## 9. Flujo editorial recomendado
1. Crear estructura del menu.
2. Configurar tema y branding.
3. Crear paginas base.
4. Cargar media.
5. Crear productos o soluciones.
6. Revisar SEO.
7. Validar navegacion publica y responsive.
8. Publicar.

## 10. Roadmap para dejarlo aun mejor en Atlas
Cuando Atlas cierre V1, esta replica puede mejorar con:
- bloques reutilizables para hero, pricing y cards de producto
- listados dinamicos por categoria
- formulario de contacto como plugin oficial
- widgets para testimonios y logos de clientes
- personalizador visual del tema
- pagina de blog y newsletter mas completas

## 11. Checklist final dentro de Atlas
Antes de publicar, revisa:
- logo oficial cargado
- menu principal completo
- submenus probados hasta 4 niveles
- paginas Home, Costos y Soluciones Web creadas
- enlaces CTA funcionando
- SEO basico cargado
- footer con contacto y redes
- contenido responsive
- pruebas visuales en escritorio y movil

## Fuentes de referencia
Esta guia se construyo tomando como referencia publica estas paginas:
- https://sistematizar.co/
- https://sistematizar.co/sitios-web/costos
- https://sistematizar.co/productos/software-web
