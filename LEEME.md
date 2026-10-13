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

## Activar la lectura de enlaces de Google Maps (una sola vez)
Google Maps comparte un **enlace corto** (`maps.app.goo.gl/...`) que no trae coordenadas.
Un pequeño servicio en Supabase lo abre y le regresa a la app la ubicación exacta.

1. Entra a supabase.com → tu proyecto → **Edge Functions** → **Deploy a new function** → **Via Editor**.
2. Nombre de la función: `expandir-mapa` (exactamente así).
3. Borra el código de ejemplo y pega todo el contenido de `supabase/expandir-mapa/index.ts`.
4. Toca **Deploy function**.
5. Ya creada, entra a la función → **Details** (o Settings) y **apaga "Verify JWT"** (Enforce JWT verification). Guarda.

Listo: al compartir desde Google Maps (o pegar el enlace), la app pone el pin en el lugar compartido.
Si el servicio no responde, la app sigue funcionando y usa tu GPS como antes.

## Importante
- Los datos se guardan **en el teléfono**. Usa Historial → **Guardar respaldo** de vez en cuando.
- Los avisos de "estamos a 10 minutos" y "llegamos" funcionan con la app **abierta en pantalla**
  (la app mantiene la pantalla encendida durante la ruta). Si navegas con Google Maps, la app no puede avisar mientras está en segundo plano.
- El mapa y el cálculo de tiempos necesitan datos móviles.
