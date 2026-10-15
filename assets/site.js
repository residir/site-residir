/* Site Residir Imobiliária — leitura dos imóveis do CRM e contato */
(function () {
  'use strict';
  var C = window.SITE || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var brl = function (v) { return v == null ? 'Consulte' : Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }); };
  var semAc = function (s) { return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim(); };
  var titulo = function (s) { return String(s || '').toLowerCase().replace(/(^|[\s(\/-])([a-zà-ú])/g, function (m, a, b) { return a + b.toUpperCase(); }).replace(/\b(De|Da|Do|Das|Dos|E)\b/g, function (m) { return m.toLowerCase(); }); };
  var nomeImovel = function (i) { return i.titulo || ((i.tipo || 'Imóvel') + (i.bairro ? ' em ' + titulo(i.bairro) : '')); };
  var local = function (i) { return [i.bairro ? titulo(i.bairro) : '', i.cidade].filter(Boolean).join(', '); };
  var area = function (i) { var a = i.area_privativa || i.area_total; return a ? String(a).replace('.', ',') + ' m²' : ''; };
  var waUrl = function (txt) { return 'https://wa.me/' + C.whatsapp + '?text=' + encodeURIComponent(txt); };
  var IC = {
    cama: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 18V8M21 18v-5a3 3 0 0 0-3-3H10v8M3 14h18M6 11h2"/></svg>',
    banho: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3zM6 12V5a2 2 0 0 1 4 0"/></svg>',
    carro: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 16l1.5-5h11L19 16M4 16h16v3H4zM7 19v1M17 19v1"/></svg>',
    area: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 4h16v16H4zM4 9h5V4M20 15h-5v5"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 2.9 2.9 0 0 0-.9 2.2 5 5 0 0 0 1 2.7 11.5 11.5 0 0 0 4.4 3.9c1.6.7 2.3.7 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z"/></svg>'
  };

  function rpc(fn, corpo) {
    return fetch(C.supabaseUrl + '/rest/v1/rpc/' + fn, {
      method: 'POST', headers: { 'Content-Type': 'application/json', apikey: C.supabaseKey },
      body: JSON.stringify(corpo || {})
    }).then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error((j && (j.message || j.hint)) || 'Não foi possível concluir agora.'); return j; }); });
  }
  var cacheImoveis = null;
  function imoveis() {
    if (cacheImoveis) return cacheImoveis;
    try { var s = sessionStorage.getItem('res_imoveis'); if (s) { var o = JSON.parse(s); if (Date.now() - o.t < 5 * 60e3) return (cacheImoveis = Promise.resolve(o.d)); } } catch (_) {}
    cacheImoveis = rpc('site_imoveis').then(function (d) { try { sessionStorage.setItem('res_imoveis', JSON.stringify({ t: Date.now(), d: d })); } catch (_) {} return d || []; });
    return cacheImoveis;
  }

  function cartao(i) {
    var spec = [i.dormitorios ? '<span>' + IC.cama + i.dormitorios + (i.suites ? ' (' + i.suites + (i.suites > 1 ? ' suítes' : ' suíte') + ')' : '') + '</span>' : '',
      i.vagas ? '<span>' + IC.carro + i.vagas + (i.vagas > 1 ? ' vagas' : ' vaga') + '</span>' : '', area(i) ? '<span>' + IC.area + area(i) + '</span>' : ''].join('');
    return '<a class="imovel" href="/imovel/' + encodeURIComponent(i.referencia) + '">' +
      '<div class="imovel-foto">' + (i.foto ? '<img loading="lazy" src="' + esc(i.foto) + '" alt="' + esc(nomeImovel(i)) + '">' : '') +
      (i.status === 'reservado' ? '<span class="selo selo-reservado">Reservado</span>' : i.prox_mar ? '<span class="selo">' + esc(i.prox_mar) + '</span>' : '') +
      '<span class="preco-faixa">' + brl(i.preco) + '</span></div>' +
      '<div class="imovel-txt"><h3>' + esc(nomeImovel(i)) + '</h3><div class="imovel-local">' + esc(local(i)) + '</div>' + (spec ? '<div class="imovel-spec">' + spec + '</div>' : '') + '</div></a>';
  }

  /* Cabeçalho, rodapé e WhatsApp fixo */
  function moldura() {
    var pag = document.body.getAttribute('data-pagina') || '';
    var t = $('#topo');
    if (t) t.innerHTML = '<div class="wrap"><a class="marca" href="/" aria-label="' + esc(C.nome) + ', página inicial"><b>Residir</b><span>Imobiliária</span></a>' +
      '<nav class="menu" aria-label="Principal"><a href="/imoveis"' + (pag === 'imoveis' || pag === 'imovel' ? ' aria-current="page"' : '') + '>Imóveis</a><a href="/#empreendimentos">Lançamentos</a><a href="/#contato">Fale conosco</a></nav>' +
      '<a class="btn btn-wa" href="' + waUrl('Olá! Vim pelo site da Residir e gostaria de atendimento.') + '" target="_blank" rel="noopener">' + IC.wa + '<span>WhatsApp</span></a></div>';
    var r = $('#rodape');
    if (r) r.innerHTML = '<div class="wrap"><div><b>' + esc(C.nome) + '</b><p>Imóveis à venda no Litoral Norte da Bahia, em Salvador e região.</p>' + (C.creci ? '<p>' + esc(C.creci) + '</p>' : '') + '</div>' +
      '<div><p><b style="font-size:1rem">Atendimento</b></p><p><a class="rod-wa" href="' + waUrl('Olá! Vim pelo site da Residir.') + '" target="_blank" rel="noopener" aria-label="Conversar no WhatsApp: ' + esc(C.telefoneExibicao) + '"><span class="rod-wa-ic">' + IC.wa + '</span>' + esc(C.telefoneExibicao) + '</a>' + (C.email ? '<br><a href="mailto:' + esc(C.email) + '">' + esc(C.email) + '</a>' : '') + (C.endereco ? '<br>' + esc(C.endereco) : '') + '</p></div>' +
      '<div><p><b style="font-size:1rem">Navegue</b></p><p><a href="/imoveis">Todos os imóveis</a><br><a href="/#empreendimentos">Lançamentos</a>' + (C.instagram ? '<br><a href="https://instagram.com/' + esc(C.instagram) + '" target="_blank" rel="noopener">Instagram</a>' : '') + '</p></div>' +
      '<small>© ' + new Date().getFullYear() + ' ' + esc(C.nome) + '. Valores e disponibilidade sujeitos a alteração sem aviso.</small></div>';
    if (!$('.wa-fixo')) { var a = document.createElement('a'); a.className = 'wa-fixo'; a.href = waUrl('Olá! Vim pelo site da Residir.'); a.target = '_blank'; a.rel = 'noopener'; a.setAttribute('aria-label', 'Conversar no WhatsApp'); a.innerHTML = IC.wa; document.body.appendChild(a); }
  }

  /* Formulário de contato → lead no CRM (com aviso por e-mail). Se a função de aviso falhar, grava direto no banco. */
  function enviarContato(c) {
    var direto = function () { return rpc('site_contato', { p_nome: c.nome, p_celular: c.celular, p_email: c.email, p_mensagem: c.mensagem, p_referencia: c.referencia, p_pagina: c.pagina, p_extra: c.site }); };
    return fetch(C.supabaseUrl + '/functions/v1/site-contato', { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: C.supabaseKey }, body: JSON.stringify(c) })
      .then(function (r) {
        return r.json().catch(function () { return null; }).then(function (j) {
          if (r.ok && j && j.ok) return j;
          if (r.status === 400 && j && j.erro) throw new Error(j.erro);
          return direto();
        });
      }, function () { return direto(); });
  }
  /* Formulário de contato → lead no CRM */
  function formularios() {
    $$('form[data-contato]').forEach(function (f) {
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var fd = new FormData(f), msg = $('.form-msg', f), b = $('button[type=submit]', f);
        msg.className = 'form-msg'; msg.textContent = '';
        if (!String(fd.get('nome') || '').trim()) { msg.className = 'form-msg erro'; msg.textContent = 'Informe seu nome.'; return; }
        if (String(fd.get('celular') || '').replace(/\D/g, '').length < 10) { msg.className = 'form-msg erro'; msg.textContent = 'Informe seu celular com DDD.'; return; }
        b.disabled = true; var txt = b.textContent; b.textContent = 'Enviando…';
        enviarContato({ nome: fd.get('nome'), celular: fd.get('celular'), email: fd.get('email') || '', mensagem: fd.get('mensagem') || '',
          referencia: fd.get('referencia') || '', pagina: location.href, site: fd.get('site') || '' })
          .then(function () {
            msg.className = 'form-msg ok';
            msg.innerHTML = 'Recebemos seu contato. Um corretor vai falar com você em breve. Prefere já conversar? <a href="' + waUrl('Olá! Acabei de enviar meu contato pelo site' + (fd.get('referencia') ? ' (imóvel ' + fd.get('referencia') + ')' : '') + '.') + '" target="_blank" rel="noopener">Abrir o WhatsApp</a>.';
            f.reset();
          })
          .catch(function (x) { msg.className = 'form-msg erro'; msg.textContent = x.message; })
          .then(function () { b.disabled = false; b.textContent = txt; });
      });
    });
  }

  /* Página inicial */
  function inicio() {
    imoveis().then(function (L) {
      var dest = L.filter(function (i) { return i.destaque && i.foto; });
      var capa = dest[0] || L.filter(function (i) { return i.foto; })[0];
      if (capa) { $('#capa').innerHTML = '<img src="' + esc(capa.foto) + '" alt="">'; var cr = $('#capaLink'); cr.href = '/imovel/' + encodeURIComponent(capa.referencia); cr.textContent = 'Na foto: ' + nomeImovel(capa).slice(0, 48) + (nomeImovel(capa).length > 48 ? '…' : ''); cr.hidden = false; }
      var cont = {}; L.forEach(function (i) { if (!i.bairro) return; var k = titulo(i.bairro); cont[k] = (cont[k] || 0) + 1; });
      var top = Object.keys(cont).sort(function (a, b) { return cont[b] - cont[a]; }).slice(0, 8);
      $('#bairros').innerHTML = top.length ? '<h2>Onde estão os imóveis</h2><ul>' + top.map(function (b) { return '<li><a href="/imoveis?local=' + encodeURIComponent('b:' + b) + '">' + esc(b) + ' <small>' + cont[b] + '</small></a></li>'; }).join('') + '</ul>' : '';
      var lista = (dest.length >= 3 ? dest : L.filter(function (i) { return i.foto; })).slice(0, 6);
      $('#destaques').innerHTML = lista.map(cartao).join('') || '<div class="vazio">Os imóveis aparecem aqui assim que forem cadastrados no CRM.</div>';
      $('#totalImoveis').textContent = L.length ? 'Ver os ' + L.length + ' imóveis' : '';
      opcoesBusca(L, $('#buscaForm'));
    }).catch(function () { $('#destaques').innerHTML = '<div class="vazio">Não foi possível carregar os imóveis agora. Fale com a gente pelo WhatsApp.</div>'; });
    rpc('site_empreendimentos').then(function (E) {
      if (!E || !E.length) { $('#empreendimentos').hidden = true; return; }
      $('#empsLista').innerHTML = E.map(function (e) {
        return '<a class="emp" href="' + waUrl('Olá! Gostaria de saber mais sobre o lançamento ' + e.nome + '.') + '" target="_blank" rel="noopener">' + (e.logo ? '<img loading="lazy" src="' + esc(e.logo) + '" alt="">' : '') + '<b>' + esc(e.nome) + '</b>' + (e.cidade || e.entrega ? '<small>' + esc([e.cidade, e.entrega ? 'Entrega ' + e.entrega : ''].filter(Boolean).join(' · ')) + '</small>' : '') + '</a>';
      }).join('');
    }).catch(function () { $('#empreendimentos').hidden = true; });
  }
  function opcoesBusca(L, f) {
    if (!f) return;
    var tipos = {}, cids = {}, bairros = {};
    L.forEach(function (i) { if (i.tipo) tipos[i.tipo] = 1; if (i.cidade) cids[i.cidade] = 1; if (i.bairro) bairros[titulo(i.bairro)] = 1; });
    var q = new URLSearchParams(location.search);
    var sel = function (n, html) { var s = $('[name=' + n + ']', f); if (s) { s.insertAdjacentHTML('beforeend', html); if (q.get(n)) s.value = q.get(n); } };
    sel('tipo', Object.keys(tipos).sort().map(function (t) { return '<option>' + esc(t) + '</option>'; }).join(''));
    sel('local', '<optgroup label="Cidades">' + Object.keys(cids).sort().map(function (c) { return '<option value="c:' + esc(c) + '">' + esc(c) + '</option>'; }).join('') + '</optgroup><optgroup label="Bairros">' + Object.keys(bairros).sort().map(function (b) { return '<option value="b:' + esc(b) + '">' + esc(b) + '</option>'; }).join('') + '</optgroup>');
    ['dorm', 'vagas', 'max', 'min', 'q', 'ordem'].forEach(function (n) { var el = $('[name=' + n + ']', f); if (el && q.get(n)) el.value = q.get(n); });
  }

  /* Vitrine */
  function vitrine() {
    var f = $('#filtros'), lim = 24, L = [];
    $('.abrir-filtros').addEventListener('click', function () { f.classList.toggle('aberto'); });
    function aplicar() {
      var p = new FormData(f), loc = p.get('local') || '', q = semAc(p.get('q'));
      var R = L.filter(function (i) {
        if (p.get('tipo') && i.tipo !== p.get('tipo')) return false;
        if (loc.indexOf('c:') === 0 && i.cidade !== loc.slice(2)) return false;
        if (loc.indexOf('b:') === 0 && titulo(i.bairro) !== loc.slice(2)) return false;
        if (p.get('dorm') && (i.dormitorios || 0) < +p.get('dorm')) return false;
        if (p.get('vagas') && (i.vagas || 0) < +p.get('vagas')) return false;
        if (p.get('min') && (i.preco || 0) < +p.get('min')) return false;
        if (p.get('max') && (i.preco || Infinity) > +p.get('max')) return false;
        if (q && semAc([i.referencia, i.titulo, i.bairro, i.cidade, i.condominio, i.tipo].join(' ')).indexOf(q) < 0) return false;
        return true;
      });
      var o = $('#ordem').value;
      if (o === 'menor') R.sort(function (a, b) { return (a.preco || Infinity) - (b.preco || Infinity); });
      else if (o === 'maior') R.sort(function (a, b) { return (b.preco || 0) - (a.preco || 0); });
      $('#contagem').textContent = R.length + (R.length === 1 ? ' imóvel encontrado' : ' imóveis encontrados');
      $('#resultado').innerHTML = R.slice(0, lim).map(cartao).join('') || '<div class="vazio" style="grid-column:1/-1">Nenhum imóvel com esses filtros. Tente ampliar a busca ou <a href="' + waUrl('Olá! Procuro um imóvel e não encontrei no site. Podem me ajudar?') + '" target="_blank" rel="noopener">conte pelo WhatsApp o que você procura</a>.</div>';
      $('#mais').innerHTML = R.length > lim ? '<button class="btn btn-linha" type="button">Mostrar mais imóveis</button>' : '';
      var u = new URLSearchParams(); p.forEach(function (v, k) { if (v) u.set(k, v); }); if (o !== 'recentes') u.set('ordem', o);
      history.replaceState(null, '', location.pathname + (u.toString() ? '?' + u : ''));
    }
    f.addEventListener('input', function () { lim = 24; aplicar(); });
    f.addEventListener('change', function () { lim = 24; aplicar(); });
    f.addEventListener('submit', function (e) { e.preventDefault(); aplicar(); });
    $('#ordem').addEventListener('change', aplicar);
    $('#mais').addEventListener('click', function (e) { if (e.target.closest('button')) { lim += 24; aplicar(); } });
    $('#limpar').addEventListener('click', function () { f.reset(); aplicar(); });
    imoveis().then(function (d) { L = d; opcoesBusca(L, f); var o = new URLSearchParams(location.search).get('ordem'); if (o) $('#ordem').value = o; aplicar(); })
      .catch(function () { $('#resultado').innerHTML = '<div class="vazio">Não foi possível carregar os imóveis agora. Tente novamente em instantes.</div>'; });
  }

  /* Página do imóvel: visor de fotos */
  function paginaImovel() {
    var fotos = []; try { fotos = JSON.parse($('#fotosJson').textContent || '[]'); } catch (_) {}
    var v = $('#visor'), k = 0; if (!v || !fotos.length) return;
    function mostrar(n) { k = (n + fotos.length) % fotos.length; $('img', v).src = fotos[k]; $('.v-cont', v).textContent = (k + 1) + ' de ' + fotos.length; }
    $$('[data-foto]').forEach(function (b) { b.addEventListener('click', function () { v.classList.add('aberto'); mostrar(+b.getAttribute('data-foto')); $('.v-fechar', v).focus(); }); });
    $('.v-fechar', v).addEventListener('click', function () { v.classList.remove('aberto'); });
    $('.v-ant', v).addEventListener('click', function () { mostrar(k - 1); });
    $('.v-prox', v).addEventListener('click', function () { mostrar(k + 1); });
    document.addEventListener('keydown', function (e) { if (!v.classList.contains('aberto')) return; if (e.key === 'Escape') v.classList.remove('aberto'); if (e.key === 'ArrowLeft') mostrar(k - 1); if (e.key === 'ArrowRight') mostrar(k + 1); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    moldura(); formularios();
    var p = document.body.getAttribute('data-pagina');
    if (p === 'inicio') inicio(); else if (p === 'imoveis') vitrine(); else if (p === 'imovel') paginaImovel();
  });
  window.RESIDIR = { cartao: cartao, brl: brl };
})();
