// Edge Function de Supabase: "leer-lista"
// Recibe la foto de la hoja de ruta de la oficina y devuelve los nombres de la
// columna "Nombre del cliente" leídos con inteligencia artificial.
//
// Usa el proveedor cuya clave esté guardada en Edge Functions → Secrets:
//   ANTHROPIC_API_KEY  → Claude Haiku (recomendado: los datos no se usan para entrenar)
//   GEMINI_API_KEY     → Gemini (plan gratis; Google usa esos datos para mejorar sus productos)
// Opcionales: CLAUDE_MODEL, GEMINI_MODEL, ORIGEN_PERMITIDO.

const ORIGEN = Deno.env.get("ORIGEN_PERMITIDO") || "https://linkmastersami.github.io";

const CORS = (origen: string) => ({
  "Access-Control-Allow-Origin": origen,
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
});

const INSTRUCCION =
  "Esta foto es una hoja impresa de 'RUTA' de una oficina de cobranza en México. " +
  "Tiene una tabla con columnas como 'Nombre del cliente', 'Parcela', 'Lote', 'Folio', 'Estatus' y 'Día de cobro'. " +
  "Lee SOLO la columna 'Nombre del cliente', de arriba hacia abajo, y escribe cada nombre completo exactamente como aparece " +
  "(con acentos si los tiene). Incluye los renglones repetidos tal cual. Ignora encabezados, fechas, renglones vacíos y las demás columnas. " +
  'Responde únicamente con JSON, sin texto adicional, con esta forma: {"nombres":["Nombre Uno","Nombre Dos"]}. ' +
  'Si no ves una tabla de nombres, responde {"nombres":[]}.';

function sacarNombres(texto: string): string[] {
  const m = texto.match(/\{[\s\S]*\}/);
  if (!m) return [];
  try {
    const d = JSON.parse(m[0]);
    return Array.isArray(d.nombres) ? d.nombres.map((x: unknown) => String(x).trim()).filter(Boolean).slice(0, 80) : [];
  } catch {
    return [];
  }
}

async function conClaude(clave: string, img: string, tipo: string) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": clave, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model: Deno.env.get("CLAUDE_MODEL") || "claude-haiku-5-5",
      max_tokens: 1500,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: tipo, data: img } },
          { type: "text", text: INSTRUCCION },
        ],
      }],
    }),
  });
  const d = await r.json();
  if (!r.ok) throw new Error("Claude: " + (d?.error?.message || r.status));
  return sacarNombres((d.content || []).map((c: { text?: string }) => c.text || "").join(""));
}

async function conGemini(clave: string, img: string, tipo: string) {
  const modelo = Deno.env.get("GEMINI_MODEL") || "gemini-3.5-flash-lite";
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${clave}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ inline_data: { mime_type: tipo, data: img } }, { text: INSTRUCCION }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0 },
    }),
  });
  const d = await r.json();
  if (!r.ok) throw new Error("Gemini: " + (d?.error?.message || r.status));
  const t = (d.candidates?.[0]?.content?.parts || []).map((p: { text?: string }) => p.text || "").join("");
  return sacarNombres(t);
}

Deno.serve(async (req) => {
  const origen = req.headers.get("origin") || "";
  const permitido = origen === ORIGEN || origen.startsWith("http://localhost");
  const cabeceras = { ...CORS(permitido ? origen : ORIGEN), "Content-Type": "application/json" };
  if (req.method === "OPTIONS") return new Response("ok", { headers: cabeceras });
  // Solo la app puede usar este servicio (para que nadie más gaste tu clave)
  if (!permitido) return new Response(JSON.stringify({ error: "ORIGEN_NO_PERMITIDO" }), { status: 403, headers: cabeceras });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "USA_POST" }), { status: 405, headers: cabeceras });

  let img = "", tipo = "image/jpeg";
  try {
    const b = await req.json();
    img = String(b.imagen || "");
    tipo = /^image\/(jpeg|png|webp)$/.test(b.tipo) ? b.tipo : "image/jpeg";
  } catch { /* cuerpo inválido */ }
  if (!img || img.length > 7_000_000) {
    return new Response(JSON.stringify({ error: "IMAGEN_INVALIDA" }), { status: 400, headers: cabeceras });
  }

  const claude = Deno.env.get("ANTHROPIC_API_KEY"), gemini = Deno.env.get("GEMINI_API_KEY");
  if (!claude && !gemini) return new Response(JSON.stringify({ error: "SIN_CLAVE" }), { status: 503, headers: cabeceras });
  try {
    const nombres = claude ? await conClaude(claude, img, tipo) : await conGemini(gemini!, img, tipo);
    return new Response(JSON.stringify({ nombres, proveedor: claude ? "claude" : "gemini" }), { headers: cabeceras });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message || e) }), { status: 502, headers: cabeceras });
  }
});
