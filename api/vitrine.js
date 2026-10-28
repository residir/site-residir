// Vitrine em cache na Vercel: imóveis, empreendimentos e identidade do site.
// A Vercel guarda a resposta por 2 minutos e, se o banco estiver lento ou fora do ar,
// continua entregando a última cópia boa por até 1 dia enquanto tenta atualizar.
const C = require('../config.js');
const PERMITIDAS = { imoveis: 'site_imoveis', empreendimentos: 'site_empreendimentos', identidade: 'site_identidade' };
module.exports = async (req, res) => {
  const fn = PERMITIDAS[String((req.query && req.query.f) || '')];
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (!fn) { res.statusCode = 400; res.setHeader('Cache-Control', 'no-store'); return res.end('{"erro":"consulta inválida"}'); }
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 9000);
  try {
    const r = await fetch(`${C.supabaseUrl}/rest/v1/rpc/${fn}`, { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: C.supabaseKey }, body: '{}', signal: ctl.signal });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const d = await r.json();
    res.statusCode = 200; res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=86400');
    return res.end(JSON.stringify(d));
  } catch (e) {
    res.statusCode = 503; res.setHeader('Cache-Control', 'no-store');
    return res.end('{"erro":"banco indisponível"}');
  } finally { clearTimeout(t); }
};
