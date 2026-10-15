// Página de cada imóvel, gerada no servidor (Google e prévia no WhatsApp)
const C = require('../config.js');

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const brl = (v) => (v == null ? 'Consulte' : Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }));
const tit = (s) => String(s || '').toLowerCase().replace(/(^|[\s(\/-])([a-zà-ú])/g, (m, a, b) => a + b.toUpperCase()).replace(/\b(De|Da|Do|Das|Dos|E)\b/g, (m) => m.toLowerCase());
const nome = (i) => i.titulo || `${i.tipo || 'Imóvel'}${i.bairro ? ' em ' + tit(i.bairro) : ''}`;
const local = (i) => [i.bairro ? tit(i.bairro) : '', i.cidade && i.estado ? `${i.cidade}/${i.estado}` : i.cidade].filter(Boolean).join(', ');
const m2 = (v) => (v ? String(v).replace('.', ',') + ' m²' : '');
const wa = (t) => `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(t)}`;

async function rpc(fn, corpo) {
  const r = await fetch(`${C.supabaseUrl}/rest/v1/rpc/${fn}`, { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: C.supabaseKey }, body: JSON.stringify(corpo || {}) });
  if (!r.ok) throw new Error('consulta ' + r.status);
  return r.json();
}

function head({ titulo, descricao, url, imagem, extra = '' }) {
  return `<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#0B4A50">
<title>${esc(titulo)}</title><meta name="description" content="${esc(descricao)}"><link rel="canonical" href="${esc(url)}">
<meta property="og:type" content="website"><meta property="og:site_name" content="${esc(C.nome)}"><meta property="og:title" content="${esc(titulo)}"><meta property="og:description" content="${esc(descricao)}"><meta property="og:url" content="${esc(url)}">
${imagem ? `<meta property="og:image" content="${esc(imagem)}"><meta name="twitter:card" content="summary_large_image">` : ''}
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Figtree:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/site.css"><script src="/config.js"></script><script>window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments);};</script><script defer src="/_vercel/insights/script.js"></script><script src="/assets/site.js" defer></script>${extra}`;
}

function pagina(i, semelhantes) {
  const url = `${C.dominio}/imovel/${encodeURIComponent(i.referencia)}`;
  const fotos = [...(i.fotos || []), ...(i.fotos_condominio || [])];
  const resumo = [i.dormitorios ? `${i.dormitorios} dormitórios` : '', i.suites ? `${i.suites} ${i.suites > 1 ? 'suítes' : 'suíte'}` : '', i.vagas ? `${i.vagas} ${i.vagas > 1 ? 'vagas' : 'vaga'}` : '', m2(i.area_privativa || i.area_total)].filter(Boolean).join(', ');
  const L = !!i.lancamento;
  const precoTxt = L ? (i.preco ? `a partir de ${brl(i.preco)}` : 'valores sob consulta') : `por ${brl(i.preco)}`;
  const descricao = `${L ? 'Lançamento: ' : ''}${i.tipo || 'Imóvel'} à venda em ${local(i)} ${precoTxt}${resumo ? '. ' + resumo : ''}. Ref. ${i.referencia}.`;
  const numeros = [[i.dormitorios, 'dormitórios'], [i.suites, i.suites > 1 ? 'suítes' : 'suíte'], [i.banheiros, 'banheiros'], [i.vagas, i.vagas > 1 ? 'vagas' : 'vaga'], [m2(i.area_privativa), 'área privativa'], [m2(i.area_total), 'área total']].filter(([v]) => v);
  const sim = (v) => (v === true ? 'Sim' : v === false ? 'Não' : v);
  const ficha = [['Tipo', [i.tipo, i.subtipo && i.subtipo !== i.tipo ? i.subtipo : ''].filter(Boolean).join(', ')], ['Estado', i.situacao], ['Condomínio', i.condominio], ['Mobília', i.mobilia], ['Proximidade do mar', i.prox_mar], ['Aceita financiamento', sim(i.aceita_financiamento)], ['Previsão de entrega', i.previsao_entrega], ['Ano de construção', i.ano_construcao], ['Andar', i.andar], ['Área construída', m2(i.area_construida)], ['Referência', i.referencia]].filter(([, v]) => v !== '' && v != null && v !== undefined);
  const etiquetas = (t, a) => (a && a.length ? `<div class="bloco"><h2>${t}</h2><ul class="etiquetas">${a.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>` : '');
  const taxas = [i.preco_condominio ? `Condomínio ${brl(i.preco_condominio)}/mês` : '', i.preco_iptu ? `IPTU ${brl(i.preco_iptu)}${i.periodo_iptu ? (i.periodo_iptu === 'anual' ? '/ano' : '/mês') : ''}` : ''].filter(Boolean).join(' · ');
  const msgWa = L ? `Olá! Quero receber a tabela atualizada e as condições do lançamento ${nome(i)} (Ref. ${i.referencia}). ${url}` : `Olá! Tenho interesse no imóvel ${i.referencia} (${nome(i)}). ${url}`;
  const precoCurto = L ? (i.preco ? `A partir de ${brl(i.preco)}` : 'Consulte valores') : brl(i.preco);
  const ld = { '@context': 'https://schema.org', '@type': 'RealEstateListing', name: nome(i), description: descricao, url, image: fotos.slice(0, 6),
    offers: i.preco ? { '@type': 'Offer', price: i.preco, priceCurrency: 'BRL', availability: i.status === 'reservado' ? 'https://schema.org/LimitedAvailability' : 'https://schema.org/InStock' } : undefined,
    address: { '@type': 'PostalAddress', addressLocality: i.cidade, addressRegion: i.estado || 'BA', addressCountry: 'BR', streetAddress: [i.logradouro, i.numero].filter(Boolean).join(', ') || undefined } };
  return `<!doctype html><html lang="pt-BR"><head>${head({ titulo: `${nome(i)} — ${precoCurto} | ${C.nome}`, descricao, url, imagem: fotos[0], extra: `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>` })}</head>
<body data-pagina="imovel"${L ? ' data-lancamento' : ''}><header class="topo" id="topo"></header>
<main class="wrap">
  <nav class="trilha" aria-label="Você está em"><a href="/">Início</a> / ${L ? '<a href="/#empreendimentos">Lançamentos</a>' : '<a href="/imoveis">Imóveis</a>'} / <a href="/imoveis?local=${encodeURIComponent('c:' + (i.cidade || ''))}">${esc(i.cidade || '')}</a> / Ref. ${esc(i.referencia)}</nav>
  ${fotos.length ? `<div class="galeria">${fotos.slice(0, 3).map((u, k) => `<button type="button" class="${k === 0 ? 'g-principal' : ''}" data-foto="${k}" aria-label="Ampliar foto ${k + 1} de ${fotos.length}"><img src="${esc(u)}" alt="${k === 0 ? esc(nome(i)) : ''}" ${k ? 'loading="lazy"' : ''}>${k === Math.min(2, fotos.length - 1) && fotos.length > 1 ? `<span class="g-ver">Ver as ${fotos.length} fotos</span>` : ''}</button>`).join('')}</div>` : ''}
  <div class="detalhe">
    <article>
      ${L ? '<span class="selo-lanc-p">Lançamento</span>' : ''}<h1>${esc(nome(i))}</h1>
      <p class="local">${esc(local(i))}${i.logradouro ? ` · ${esc([i.logradouro, i.numero].filter(Boolean).join(', '))}` : ''}</p>
      ${numeros.length ? `<div class="numeros">${numeros.map(([v, l]) => `<div><b>${esc(v)}</b><span>${esc(l)}</span></div>`).join('')}</div>` : ''}
      ${i.descricao ? `<div class="bloco"><h2>Sobre o imóvel</h2><p class="descricao">${esc(i.descricao)}</p></div>` : ''}
      <div class="bloco"><h2>Ficha do imóvel</h2><dl class="ficha">${ficha.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></div>
      ${etiquetas('Características', i.caracteristicas)}${etiquetas('No condomínio', i.caracteristicas_condominio)}${etiquetas('Por perto', i.proximidades)}
      ${i.descricao_condominio ? `<div class="bloco"><h2>Sobre o condomínio</h2><p class="descricao">${esc(i.descricao_condominio)}</p></div>` : ''}
      ${i.video ? `<div class="bloco video"><h2>Vídeo</h2><iframe src="${esc(i.video)}" title="Vídeo do imóvel" loading="lazy" allowfullscreen></iframe></div>` : ''}
      ${i.tour360 ? `<p class="bloco"><a class="btn btn-linha" href="${esc(i.tour360)}" target="_blank" rel="noopener">Fazer o tour 360°</a></p>` : ''}
      ${i.latitude && i.longitude ? `<div class="bloco mapa"><h2>Localização</h2><iframe src="https://maps.google.com/maps?q=${i.latitude},${i.longitude}&z=15&output=embed" title="Mapa da região do imóvel" loading="lazy"></iframe><p class="local">A posição no mapa é aproximada.</p></div>` : ''}
    </article>
    <aside class="lateral" aria-label="Valor e contato">
      <div class="valor">${L ? (i.preco ? `<small>A partir de</small>${brl(i.preco)}` : 'Consulte valores') : brl(i.preco)}</div>${L ? '<p class="taxas">Tabela atualizada e condições de pagamento direto com a Residir.</p>' : ''}${i.status === 'reservado' ? '<p class="ref"><b>Reservado</b> — fale com a gente para entrar na fila de interesse.</p>' : ''}
      ${taxas ? `<p class="taxas">${esc(taxas)}</p>` : ''}
      <a class="btn btn-wa" href="${esc(wa(msgWa))}" target="_blank" rel="noopener">${L ? 'Receber tabela pelo WhatsApp' : 'Conversar pelo WhatsApp'}</a>
      <hr><form class="form" data-contato novalidate><b>Prefere que a gente ligue?</b>
        <label>Nome<input name="nome" autocomplete="name" required></label><label>Celular com DDD<input name="celular" type="tel" inputmode="tel" autocomplete="tel" required></label>
        <label>Mensagem (opcional)<textarea name="mensagem" rows="3">${L ? 'Quero receber a tabela atualizada e as condições.' : 'Tenho interesse neste imóvel.'}</textarea></label>
        <input type="hidden" name="referencia" value="${esc(i.referencia)}"><input class="oculto" name="site" tabindex="-1" autocomplete="off" aria-hidden="true">
        <button class="btn btn-mar" type="submit">Quero receber contato</button><div class="form-msg" role="status" aria-live="polite"></div></form>
      <p class="ref">Ref. ${esc(i.referencia)} · valores sujeitos a alteração.</p>
    </aside>
  </div>
  ${semelhantes.length ? `<section class="secao" style="padding-top:0"><div class="secao-h"><h2>Outros imóveis em ${esc(i.cidade || 'região próxima')}</h2><a href="/imoveis?local=${encodeURIComponent('c:' + (i.cidade || ''))}">Ver todos</a></div><div class="grade" id="semelhantes"></div><script type="application/json" id="semelhantesJson">${JSON.stringify(semelhantes).replace(/</g, '\\u003c')}</script></section>` : ''}
</main>
<div class="visor" id="visor" role="dialog" aria-label="Fotos do imóvel"><button class="v-fechar" type="button" aria-label="Fechar">×</button><button class="v-ant" type="button" aria-label="Foto anterior">‹</button><img alt=""><button class="v-prox" type="button" aria-label="Próxima foto">›</button><span class="v-cont"></span></div>
<div class="barra-movel"><div><b>${esc(precoCurto)}</b><span>Ref. ${esc(i.referencia)}</span></div><a class="btn btn-wa" href="${esc(wa(msgWa))}" target="_blank" rel="noopener">WhatsApp</a></div>
<script type="application/json" id="fotosJson">${JSON.stringify(fotos).replace(/</g, '\\u003c')}</script>
<script>document.addEventListener('DOMContentLoaded',function(){var s=document.getElementById('semelhantesJson');if(s&&window.RESIDIR){document.getElementById('semelhantes').innerHTML=JSON.parse(s.textContent).map(window.RESIDIR.cartao).join('');}});</script>
<footer class="rodape" id="rodape"></footer></body></html>`;
}

function naoEncontrado() {
  return `<!doctype html><html lang="pt-BR"><head>${head({ titulo: `Imóvel não encontrado | ${C.nome}`, descricao: 'Este imóvel não está mais disponível.', url: `${C.dominio}/imoveis` })}<meta name="robots" content="noindex"></head>
<body data-pagina="imovel"><header class="topo" id="topo"></header><main class="wrap secao"><h1>Este imóvel não está mais disponível</h1><p>Ele pode ter sido vendido ou retirado do site. Veja outras opções parecidas ou fale com um corretor.</p><p><a class="btn btn-mar" href="/imoveis">Ver imóveis disponíveis</a> <a class="btn btn-wa" href="${esc(wa('Olá! Procurava um imóvel do site que não está mais disponível. Podem me indicar opções?'))}" target="_blank" rel="noopener">Falar no WhatsApp</a></p></main><footer class="rodape" id="rodape"></footer></body></html>`;
}

module.exports = async (req, res) => {
  const ref = String((req.query && req.query.ref) || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 30);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  try {
    const i = ref ? await rpc('site_imovel', { p_ref: ref }) : null;
    if (!i) { res.statusCode = 404; res.setHeader('Cache-Control', 's-maxage=60'); return res.end(naoEncontrado()); }
    let semelhantes = [];
    try { semelhantes = (await rpc('site_imoveis')).filter((x) => x.referencia !== i.referencia && x.cidade === i.cidade && x.foto).slice(0, 3); } catch (_) {}
    res.statusCode = 200; res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=900');
    return res.end(pagina(i, semelhantes));
  } catch (e) {
    res.statusCode = 503; res.setHeader('Cache-Control', 'no-store');
    return res.end(naoEncontrado().replace('Este imóvel não está mais disponível', 'Não foi possível carregar o imóvel agora'));
  }
};
