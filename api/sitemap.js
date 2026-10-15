// Mapa do site para o Google (lista a página inicial, a vitrine e cada imóvel disponível)
const C = require('../config.js');
module.exports = async (req, res) => {
  let L = [];
  try {
    const r = await fetch(`${C.supabaseUrl}/rest/v1/rpc/site_imoveis`, { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: C.supabaseKey }, body: '{}' });
    if (r.ok) L = await r.json();
  } catch (_) {}
  const urls = [[`${C.dominio}/`, null], [`${C.dominio}/imoveis`, null], [`${C.dominio}/privacidade`, '2026-10-15'], ...L.map((i) => [`${C.dominio}/imovel/${encodeURIComponent(i.referencia)}`, i.atualizado_em])];
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600');
  res.end(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(([u, d]) => `<url><loc>${u}</loc>${d ? `<lastmod>${String(d).slice(0, 10)}</lastmod>` : ''}</url>`).join('\n')}\n</urlset>`);
};
