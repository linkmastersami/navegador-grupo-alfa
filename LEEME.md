# Grupo Alfa Cobranza

App para el teléfono del cobrador: registro de clientes y ruta de cobranza.

## Archivos
- `index.html` – toda la app
- `manifest.webmanifest` – nombre, ícono y la opción de aparecer en "Compartir"
- `sw.js` – permite instalarla y abrirla sin internet
- `icon-*.png` – íconos

## Cómo publicarla (una sola vez)
La app necesita estar en una dirección **https** para poder instalarse y usar el GPS.
Sube la carpeta completa a cualquiera de estos (gratis):

- **Cloudflare Pages**: dash.cloudflare.com → Workers & Pages → Crear → Pages →
  "Subir recursos" → arrastra la carpeta. Te da una dirección tipo `alfa-cobranza.pages.dev`.
- **GitHub Pages**: crea un repositorio, sube los archivos y activa Pages en Settings → Pages.

## Cómo instalarla en el teléfono (Android)
1. Abre la dirección en **Chrome**.
2. Toca **Instalar** (arriba en la app) o menú ⋮ → **Agregar a la pantalla principal / Instalar app**.
3. Acepta el permiso de ubicación la primera vez.

## Registrar un cliente compartiendo la ubicación
Estando en la casa del cliente: Google Maps → toca tu punto azul → **Compartir** → **Alfa Cobranza**.
La app abre el registro con la ubicación; escribes el nombre y, si quieres, tomas la foto de la fachada.
(Solo funciona con la app instalada en Android. En iPhone usa "+ Nuevo cliente" → "Usar mi ubicación actual".)

## Importante
- Los datos se guardan **en el teléfono**. Usa Historial → **Guardar respaldo** de vez en cuando.
- Los avisos de "estamos a 10 minutos" y "llegamos" funcionan con la app **abierta en pantalla**
  (la app mantiene la pantalla encendida durante la ruta). Si navegas con Google Maps, la app no puede avisar mientras está en segundo plano.
- El mapa y el cálculo de tiempos necesitan datos móviles.
