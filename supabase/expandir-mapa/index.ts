// Edge Function de Supabase: "expandir-mapa"
// Recibe un enlace corto de Google Maps (maps.app.goo.gl/...) y devuelve
// la dirección completa a la que redirige, que trae las coordenadas.
// El navegador no puede hacerlo solo porque Google no lo permite (CORS).

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

// Solo se siguen enlaces de Google (para que nadie use esto como proxy de otra cosa)
const ES_GOOGLE = (u: URL) =>
  u.protocol === "https:" &&
  (/(^|\.)goo\.gl$/i.test(u.hostname) ||
    /(^|\.)google\.[a-z.]+$/i.test(u.hostname) ||
    /^g\.co$/i.test(u.hostname));

const TIENE_COORDS = /!3d-?\d|@-?\d+\.\d+,-?\d+\.\d+|[?&](q|ll|query|center)=-?\d/;

const responder = (cuerpo: unknown, estado = 200) =>
  new Response(JSON.stringify(cuerpo), { status: estado, headers: { ...CORS, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  let actual: URL;
  try {
    actual = new URL(new URL(req.url).searchParams.get("url") || "");
  } catch {
    return responder({ error: "URL_INVALIDA" }, 400);
  }
  if (!ES_GOOGLE(actual)) return responder({ error: "URL_NO_PERMITIDA" }, 400);

  // Sigue hasta 5 redirecciones leyendo solo el encabezado Location
  for (let i = 0; i < 5; i++) {
    if (TIENE_COORDS.test(actual.href)) break;
    let r: Response;
    try {
      r = await fetch(actual.href, {
        redirect: "manual",
        headers: { "User-Agent": "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/126 Mobile Safari/537.36" },
      });
    } catch {
      return responder({ error: "SIN_CONEXION" }, 502);
    }
    const loc = r.headers.get("location");
    await r.body?.cancel();
    if (!loc) break;
    const sig = new URL(loc, actual);
    if (!ES_GOOGLE(sig)) break;
    actual = sig;
  }
  return responder({ url: actual.href });
});
