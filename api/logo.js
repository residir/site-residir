// Imagens de identidade configuradas no CRM (Ajustes › Logo do site):
// /logo/favicon, /logo/apple e /logo/compartilhar (prévia no WhatsApp)
const C = require('../config.js');
const TIPOS = { favicon: 'favicon', apple: 'apple', compartilhar: 'compartilhar', topo: 'topo', rodape: 'rodape' };

module.exports = async (req, res) => {
  const t = TIPOS[String((req.query && req.query.t) || '').replace(/\.(png|jpg|jpeg|webp)$/i, '')];
  let url = null;
  try {
    const r = await fetch(`${C.supabaseUrl}/rest/v1/rpc/site_identidade`, { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: C.supabaseKey }, body: '{}' });
    if (r.ok) { const d = await r.json(); url = d && t && d[t]; }
  } catch (_) {}
  const reserva = () => { res.statusCode = 302; res.setHeader('Location', '/assets/favicon.svg'); res.setHeader('Cache-Control', 'public, max-age=300'); res.end(); };
  if (!url || !/^https:\/\//.test(url)) return reserva();
  try {
    const im = await fetch(url);
    if (!im.ok) return reserva();
    const buf = Buffer.from(await im.arrayBuffer());
    res.setHeader('Content-Type', im.headers.get('content-type') || 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=600, stale-while-revalidate=86400');
    res.end(buf);
  } catch (_) { reserva(); }
};
