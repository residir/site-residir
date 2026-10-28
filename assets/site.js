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
  /* vídeo da capa: YouTube, Vimeo ou arquivo MP4/WEBM/MOV */
  function videoCapa(url) {
    var u = String(url || '').trim(), m;
    if ((m = u.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/))) return { tipo: 'yt', src: 'https://www.youtube-nocookie.com/embed/' + m[1] + '?autoplay=1&mute=1&loop=1&playlist=' + m[1] + '&controls=0&playsinline=1&rel=0&modestbranding=1&disablekb=1&iv_load_policy=3' };
    if ((m = u.match(/vimeo\.com\/(?:video\/)?(\d+)/))) return { tipo: 'vm', src: 'https://player.vimeo.com/video/' + m[1] + '?background=1&autoplay=1&loop=1&muted=1' };
    if (/^https:\/\/\S+\.(mp4|webm|mov)(\?\S*)?$/i.test(u)) return { tipo: 'mp4', src: u };
    return null;
  }
  function montarVideoCapa(capa) {
    var semMov = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var econ = navigator.connection && navigator.connection.saveData;
    var v = capa.video_capa && !econ ? videoCapa(capa.video_capa) : null;
    if (!v) return;
    var box = $('#capa'), ab = box.parentNode, el, tocando = false;
    var criar = function () {
      if (v.tipo === 'mp4') {
        el = document.createElement('video'); el.muted = true; el.defaultMuted = true; el.loop = true; el.autoplay = true; el.playsInline = true;
        el.setAttribute('playsinline', ''); el.setAttribute('muted', ''); el.preload = 'auto'; el.src = v.src;
        el.addEventListener('playing', function () { el.classList.add('ativo'); });
      } else {
        el = document.createElement('iframe'); el.src = v.src; el.title = 'Vídeo do imóvel'; el.allow = 'autoplay; encrypted-media; picture-in-picture'; el.tabIndex = -1;
        el.addEventListener('load', function () { setTimeout(function () { el.classList.add('ativo'); }, 1200); });
      }
      el.className = 'capa-video' + (v.tipo === 'mp4' ? '' : ' capa-frame'); el.setAttribute('aria-hidden', 'true');
      box.insertBefore(el, box.firstChild.nextSibling); tocando = true; marcar();
    };
    var parar = function () { if (v.tipo === 'mp4') { el.pause(); el.classList.remove('ativo'); } else { el.remove(); el = null; } tocando = false; marcar(); };
    var retomar = function () { if (v.tipo === 'mp4') { el.play(); } else criar(); tocando = true; marcar(); };
    var bt = document.createElement('button'); bt.type = 'button'; bt.className = 'capa-pausa';
    var marcar = function () { bt.setAttribute('aria-label', tocando ? 'Pausar o vídeo da capa' : 'Tocar o vídeo da capa'); bt.innerHTML = tocando ? '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>' : '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>'; };
    bt.addEventListener('click', function () { tocando ? parar() : retomar(); });
    ab.appendChild(bt);
    var cr = $('#capaLink'); if (cr) cr.textContent = cr.textContent.replace(/^Na foto:/, 'No vídeo:');
    if (semMov) { marcar(); return; }
    criar();
  }
  var SITE_VERSAO = '1.11.0';
  /* logo do site, configurada no CRM (Ajustes › Logo do site) */
  function identCache() { try { var c = JSON.parse(localStorage.getItem('res_ident') || 'null'); return c && c.d ? c : null; } catch (_) { return null; } }
  function logoHTML(L, onde) {
    var d = L[onde], c = L[onde + 'Cel'];
    if (!d && !c) return '';
    var cap = onde === 'topo' ? 'Topo' : 'Rodape';
    var hd = L['alt' + cap] || (onde === 'topo' ? 56 : 72), hc = L['alt' + cap + 'Cel'] || (onde === 'topo' ? 44 : 60);
    return '<picture>' + (c && d ? '<source media="(max-width:760px)" srcset="' + esc(c) + '">' : '') + '<img class="logo-img" src="' + esc(d || c) + '" alt="' + esc(C.nome) + '" style="--h:' + hd + 'px;--hc:' + hc + 'px" decoding="async"></picture>';
  }
  function aplicarLogos(L) {
    var m = $('.topo .marca'), lt = logoHTML(L || {}, 'topo');
    if (m) { if (lt) { m.innerHTML = lt; m.classList.add('com-logo'); } else if (m.classList.contains('com-logo')) { m.innerHTML = '<b>Residir</b><span>Imobiliária</span>'; m.classList.remove('com-logo'); } }
    var r = $('#rodLogo'), lr = logoHTML(L || {}, 'rodape');
    if (r) { r.innerHTML = lr || '<b>' + esc(C.nome) + '</b>'; r.classList.toggle('com-logo', !!lr); }
  }
  function identidade() {
    var c = identCache(); if (c) aplicarLogos(c.d);
    if (c && Date.now() - c.t < 600000) return;
    dadosVitrine('identidade', 'site_identidade').then(function (d) { d = d || {}; try { localStorage.setItem('res_ident', JSON.stringify({ t: Date.now(), d: d })); } catch (_) {} aplicarLogos(d); }, function () {});
  } /* versão do site (Versionamento Semântico) — ver CHANGELOG.md */
  var secaoDe = function (i) { return i.secao || (i.lancamento ? 'lancamento' : i.destaque ? 'destaque' : 'vitrine'); };
  var TIT_SEC = { destaque: 'Imóveis em destaque', vitrine: 'Imóveis', lancamento: 'Lançamentos' };
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
  // vitrine: primeiro a cópia em cache da Vercel (rápida e resistente a lentidão do banco);
  // se falhar, o banco direto; se tudo falhar, a última cópia boa guardada neste aparelho
  function dadosVitrine(f, fn) {
    var ult = function () { try { var o = JSON.parse(localStorage.getItem('res_ult_' + f) || 'null'); if (o) return o.d; } catch (_) {} throw new Error('Não foi possível carregar agora.'); };
    var guarda = function (d) { try { localStorage.setItem('res_ult_' + f, JSON.stringify({ t: Date.now(), d: d })); } catch (_) {} return d; };
    var comPrazo = function (p, ms) { return Promise.race([p, new Promise(function (_, rej) { setTimeout(function () { rej(new Error('tempo esgotado')); }, ms); })]); };
    return comPrazo(fetch('/api/vitrine?f=' + f).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }), 10000)
      .catch(function () { return comPrazo(rpc(fn), 12000); })
      .then(guarda, ult);
  }
  var cacheImoveis = null;
  function imoveis() {
    if (cacheImoveis) return cacheImoveis;
    try { var s = sessionStorage.getItem('res_imoveis'); if (s) { var o = JSON.parse(s); if (Date.now() - o.t < 5 * 60e3) return (cacheImoveis = Promise.resolve(o.d)); } } catch (_) {}
    cacheImoveis = dadosVitrine('imoveis', 'site_imoveis').then(function (d) { try { sessionStorage.setItem('res_imoveis', JSON.stringify({ t: Date.now(), d: d })); } catch (_) {} return d || []; });
    return cacheImoveis;
  }

  function cartao(i) {
    var spec = [i.dormitorios ? '<span>' + IC.cama + i.dormitorios + (i.suites ? ' (' + i.suites + (i.suites > 1 ? ' suítes' : ' suíte') + ')' : '') + '</span>' : '',
      i.vagas ? '<span>' + IC.carro + i.vagas + (i.vagas > 1 ? ' vagas' : ' vaga') + '</span>' : '', area(i) ? '<span>' + IC.area + area(i) + '</span>' : ''].join('');
    return '<a class="imovel" href="/imovel/' + encodeURIComponent(i.referencia) + '">' +
      '<div class="imovel-foto">' + (i.foto ? '<img loading="lazy" src="' + esc(i.foto) + '" alt="' + esc(nomeImovel(i)) + '">' : '') +
      (i.status === 'reservado' ? '<span class="selo selo-reservado">Reservado</span>' : i.lancamento ? '<span class="selo selo-lanc">Lançamento</span>' : i.prox_mar ? '<span class="selo">' + esc(i.prox_mar) + '</span>' : '') +
      '<span class="preco-faixa">' + (i.lancamento ? (i.preco ? '<small>a partir de</small> ' + brl(i.preco) : 'Consulte valores') : brl(i.preco)) + '</span></div>' +
      '<div class="imovel-txt"><h3>' + esc(nomeImovel(i)) + '</h3><div class="imovel-local">' + esc(local(i)) + '</div>' + (spec ? '<div class="imovel-spec">' + spec + '</div>' : '') + '</div></a>';
  }

  /* Cabeçalho, rodapé e WhatsApp fixo */
  function moldura() {
    var pag = document.body.getAttribute('data-pagina') || '', lancPag = document.body.hasAttribute('data-lancamento');
    var t = $('#topo');
    if (t && !$('.compromisso')) t.insertAdjacentHTML('beforebegin', '<div class="compromisso"><div class="wrap"><p><span aria-hidden="true">✦</span> Compromisso com a <b>verdade</b>, a <b>ética</b> e a <b>satisfação do cliente</b>.</p></div></div>');
    if (t) t.innerHTML = '<div class="wrap"><a class="marca" href="/" aria-label="' + esc(C.nome) + ', página inicial"><b>Residir</b><span>Imobiliária</span></a>' +
      '<nav class="menu" aria-label="Principal"><a href="/imoveis?secao=destaque" data-m="destaque">Imóveis em destaque</a><a href="/imoveis" data-m="vitrine">Imóveis</a><a href="/imoveis?secao=lancamento" data-m="lancamento">Lançamentos</a><a href="/#contato">Fale conosco</a></nav>' +
      '<a class="btn btn-wa" href="' + waUrl('Olá! Vim pelo site da Residir e gostaria de atendimento.') + '" target="_blank" rel="noopener">' + IC.wa + '<span>WhatsApp</span></a></div>';
    marcarMenu(pag === 'imoveis' ? (new URLSearchParams(location.search).get('secao') || 'vitrine') : pag === 'imovel' ? (lancPag ? 'lancamento' : 'vitrine') : '');
    var r = $('#rodape');
    if (r) r.innerHTML = '<div class="wrap"><div><div class="rod-logo" id="rodLogo"><b>' + esc(C.nome) + '</b></div><p>Imóveis à venda no Litoral Norte da Bahia, em Salvador e região.</p>' + (C.creci ? '<p>' + esc(C.creci) + '</p>' : '') + '</div>' +
      '<div><p><b style="font-size:1rem">Atendimento</b></p><p><a class="rod-wa" href="' + waUrl('Olá! Vim pelo site da Residir.') + '" target="_blank" rel="noopener" aria-label="Conversar no WhatsApp: ' + esc(C.telefoneExibicao) + '"><span class="rod-wa-ic">' + IC.wa + '</span>' + esc(C.telefoneExibicao) + '</a>' + (C.email ? '<br><a href="mailto:' + esc(C.email) + '">' + esc(C.email) + '</a>' : '') + (C.endereco ? '<br>' + esc(C.endereco) : '') + '</p></div>' +
      '<div><p><b style="font-size:1rem">Navegue</b></p><p><a href="/imoveis?secao=destaque">Imóveis em destaque</a><br><a href="/imoveis">Imóveis</a><br><a href="/imoveis?secao=lancamento">Lançamentos</a>' + (C.instagram ? '<br><a href="https://instagram.com/' + esc(C.instagram) + '" target="_blank" rel="noopener">Instagram</a>' : '') + '</p></div>' +
      '<small>© ' + new Date().getFullYear() + ' ' + esc(C.nome) + '. Valores e disponibilidade sujeitos a alteração sem aviso. <a href="/privacidade" class="rod-priv">Política de Privacidade</a> <span class="rod-versao" title="Versão do site">v' + SITE_VERSAO + '</span></small></div>';
    identidade();
    if (!$('.wa-fixo')) { var a = document.createElement('a'); a.className = 'wa-fixo'; a.href = waUrl('Olá! Vim pelo site da Residir.'); a.target = '_blank'; a.rel = 'noopener'; a.setAttribute('aria-label', 'Conversar no WhatsApp'); a.innerHTML = IC.wa; document.body.appendChild(a); }
  }

  function marcarMenu(sec) { $$('.menu [data-m]').forEach(function (a) { if (a.getAttribute('data-m') === sec) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); }); }

  /* Formulário de contato → lead no CRM (com aviso por e-mail). Se a função de aviso falhar, grava direto no banco. */
  /* Origem da visita: de onde o visitante veio (guardada no navegador por 90 dias e enviada com o contato) */
  function origemCanal(ref, u, clid) {
    var s = (u.utm_source || '').toLowerCase(), m = (u.utm_medium || '').toLowerCase();
    if (u.utm_source || clid) {
      if (/facebook|^fb$|instagram|^ig$|meta/.test(s) || clid === 'fbclid') return (/paid|cpc|ads?$|pago|social_paid/.test(m) || clid === 'fbclid' || u.utm_content) ? 'Anúncio Meta (Facebook/Instagram)' : (/instagram|^ig$/.test(s) ? 'Instagram' : 'Facebook');
      if (/google/.test(s) || clid === 'gclid') return (/cpc|paid|ads/.test(m) || clid === 'gclid') ? 'Google Ads' : 'Google';
      return 'Campanha: ' + u.utm_source;
    }
    if (!ref) return 'Acesso direto';
    if (/(^|\.)google\./.test(ref)) return 'Google (busca)';
    if (/bing\.|yahoo\.|duckduckgo\.|ecosia\./.test(ref)) return 'Outros buscadores';
    if (/instagram\.com$/.test(ref)) return 'Instagram';
    if (/(facebook\.com|fb\.com|fb\.me)$/.test(ref)) return 'Facebook';
    if (/whatsapp|wa\.me/.test(ref)) return 'WhatsApp';
    if (/youtube\.com$|youtu\.be$/.test(ref)) return 'YouTube';
    if (/tiktok\.com$/.test(ref)) return 'TikTok';
    if (/linkedin\.com$|lnkd\.in$/.test(ref)) return 'LinkedIn';
    if (/gabrielpintoimoveis\.com\.br$/.test(ref)) return 'Site Gabriel Pinto';
    if (/tecimob/.test(ref)) return 'Site no Tecimob';
    return 'Outro site (' + ref + ')';
  }
  function origemRegistrar() {
    var agora = Date.now(), q = new URLSearchParams(location.search), ref = '';
    try { ref = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, '') : ''; } catch (_) {}
    var interno = ref && (ref === location.hostname.replace(/^www\./, '') || /residirimobiliaria\.com\.br$/.test(ref));
    var u = {}; ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'utm_id'].forEach(function (k) { var v = q.get(k); if (v) u[k] = v.slice(0, 150); });
    var clid = q.get('fbclid') ? 'fbclid' : q.get('gclid') ? 'gclid' : '';
    var st = null; try { st = JSON.parse(localStorage.getItem('res_origem') || 'null'); } catch (_) {}
    if (st && agora - (st.em || 0) > 90 * 864e5) st = null;
    var nova = false; try { nova = !sessionStorage.getItem('res_sessao'); sessionStorage.setItem('res_sessao', '1'); } catch (_) {}
    if (interno && !Object.keys(u).length && !clid) { if (st && nova) { st.visitas = (st.visitas || 1) + 1; st.em = agora; } else if (!st) { var ti = { canal: 'Não identificada (navegação já iniciada no site)', ref: '', entrada: (location.pathname + location.search).slice(0, 200), em: agora }; st = { primeira: ti, ultima: ti, visitas: 1, em: agora }; } }
    else {
      var canal = origemCanal(interno ? '' : ref, u, clid);
      var t = { canal: canal, ref: interno ? '' : ref, entrada: (location.pathname + location.search).slice(0, 200), em: agora };
      if (Object.keys(u).length) t.utm = u; if (clid) t.clique = clid;
      if (!st) st = { primeira: t, ultima: t, visitas: 1, em: agora };
      else { if (canal !== 'Acesso direto' || !st.ultima) st.ultima = t; if (nova) st.visitas = (st.visitas || 1) + 1; st.em = agora; }
    }
    if (st) { try { localStorage.setItem('res_origem', JSON.stringify(st)); } catch (_) {} }
    return st;
  }
  var ORIGEM = origemRegistrar();
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
        var oEnv = ORIGEM ? JSON.parse(JSON.stringify(ORIGEM)) : null; if (oEnv) { oEnv.contato = { pagina: location.pathname.slice(0, 200), em: Date.now() }; }
        var origemAntes = oEnv ? rpc('site_origem', { p_celular: fd.get('celular'), p_origem: oEnv }).catch(function () {}) : Promise.resolve();
        origemAntes.then(function () { return enviarContato({ nome: fd.get('nome'), celular: fd.get('celular'), email: fd.get('email') || '', mensagem: fd.get('mensagem') || '',
          referencia: fd.get('referencia') || '', pagina: location.href, site: fd.get('site') || '', origem: oEnv }); })
          .then(function () {
            if (oEnv) setTimeout(function () { rpc('site_origem', { p_celular: fd.get('celular'), p_origem: oEnv }).catch(function () {}); }, 400);
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
      var dest = L.filter(function (i) { return secaoDe(i) === 'destaque' && i.foto; });
      var comuns = L.filter(function (i) { return secaoDe(i) === 'vitrine' && i.foto; });
      var capa = L.filter(function (i) { return i.video_capa && i.foto; })[0] || dest[0] || comuns[0];
      if (capa) { $('#capa').innerHTML = '<img src="' + esc(capa.foto) + '" alt="">'; var cr = $('#capaLink'); cr.href = '/imovel/' + encodeURIComponent(capa.referencia); cr.textContent = 'Na foto: ' + nomeImovel(capa).slice(0, 48) + (nomeImovel(capa).length > 48 ? '…' : ''); cr.hidden = false; montarVideoCapa(capa); }
      var cont = {}; L.forEach(function (i) { if (!i.bairro) return; var k = titulo(i.bairro); cont[k] = (cont[k] || 0) + 1; });
      var top = Object.keys(cont).sort(function (a, b) { return cont[b] - cont[a]; }).slice(0, 8);
      $('#bairros').innerHTML = top.length ? '<h2>Onde estão os imóveis</h2><ul>' + top.map(function (b) { return '<li><a href="/imoveis?local=' + encodeURIComponent('b:' + b) + '">' + esc(b) + ' <small>' + cont[b] + '</small></a></li>'; }).join('') + '</ul>' : '';
      var secao = function (grade, total, sec, lista) {
        $(grade).innerHTML = lista.slice(0, 6).map(cartao).join('');
        var a = $(total); a.hidden = lista.length <= 6; a.textContent = 'Ver os ' + lista.length;
        $(sec).hidden = !lista.length;
      };
      secao('#destaques', '#totalDest', '#destaques-sec', dest);
      secao('#comuns', '#totalImoveis', '#imoveis-sec', comuns);
      if (!L.length) { $('#destaques-sec').hidden = false; $('#destaques').innerHTML = '<div class="vazio">Os imóveis aparecem aqui assim que forem cadastrados no CRM.</div>'; }
      opcoesBusca(L, $('#buscaForm'));
      var lanc = L.filter(function (i) { return secaoDe(i) === 'lancamento'; });
      $('#lancLista').innerHTML = lanc.slice(0, 6).map(cartao).join('');
      $('#totalLanc').hidden = lanc.length <= 6; $('#totalLanc').textContent = 'Ver os ' + lanc.length;
      return lanc.length;
    }, function () { $('#destaques').innerHTML = '<div class="vazio">Não foi possível carregar os imóveis agora. Fale com a gente pelo WhatsApp.</div>'; return 0; })
    .then(function (nLanc) { return dadosVitrine('empreendimentos', 'site_empreendimentos').then(function (E) { return [nLanc, E || []]; }, function () { return [nLanc, []]; }); })
    .then(function (r) {
      var E = r[1];
      $('#lancLista').hidden = !r[0];
      if (!r[0] && !E.length) { $('#empreendimentos').hidden = true; return; }
      $('#empsLista').hidden = !E.length;
      $('#empsLista').innerHTML = E.map(function (e) {
        return '<a class="emp" href="' + waUrl('Olá! Gostaria de saber mais sobre o lançamento ' + e.nome + '.') + '" target="_blank" rel="noopener">' + (e.logo ? '<img loading="lazy" src="' + esc(e.logo) + '" alt="">' : '') + '<b>' + esc(e.nome) + '</b>' + (e.cidade || e.entrega ? '<small>' + esc([e.cidade, e.entrega ? 'Entrega ' + e.entrega : ''].filter(Boolean).join(' · ')) + '</small>' : '') + '</a>';
      }).join('');
    });
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
        if (p.get('secao') && secaoDe(i) !== p.get('secao')) return false;
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
      else if (o === 'recentes') R.sort(function (a, b) { return String(b.atualizado_em || '').localeCompare(String(a.atualizado_em || '')); });
      $('#titulo-vitrine').textContent = TIT_SEC[p.get('secao')] || 'Imóveis à venda';
      marcarMenu(p.get('secao') || 'vitrine');
      $('#contagem').textContent = R.length + (R.length === 1 ? ' imóvel encontrado' : ' imóveis encontrados');
      $('#resultado').innerHTML = R.slice(0, lim).map(cartao).join('') || '<div class="vazio" style="grid-column:1/-1">Nenhum imóvel com esses filtros. Tente ampliar a busca ou <a href="' + waUrl('Olá! Procuro um imóvel e não encontrei no site. Podem me ajudar?') + '" target="_blank" rel="noopener">conte pelo WhatsApp o que você procura</a>.</div>';
      $('#mais').innerHTML = R.length > lim ? '<button class="btn btn-linha" type="button">Mostrar mais imóveis</button>' : '';
      var u = new URLSearchParams(); p.forEach(function (v, k) { if (v) u.set(k, v); }); if (o) u.set('ordem', o);
      history.replaceState(null, '', location.pathname + (u.toString() ? '?' + u : ''));
    }
    f.addEventListener('input', function () { lim = 24; aplicar(); });
    f.addEventListener('change', function () { lim = 24; aplicar(); });
    f.addEventListener('submit', function (e) { e.preventDefault(); aplicar(); });
    $$('[name=secao]').forEach(function (r) { r.addEventListener('change', function () { lim = 24; aplicar(); }); });
    $('#ordem').addEventListener('change', aplicar);
    $('#mais').addEventListener('click', function (e) { if (e.target.closest('button')) { lim += 24; aplicar(); } });
    $('#limpar').addEventListener('click', function () { f.reset(); aplicar(); });
    var sq = new URLSearchParams(location.search).get('secao'); $$('[name=secao]').forEach(function (r) { r.checked = r.value === (TIT_SEC[sq] ? sq : ''); });
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
    /* deslizar o dedo para passar as fotos (visor e foto principal no celular) */
    function deslizar(el, ant, prox) { var x0 = null, y0 = 0; el.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
      el.addEventListener('touchend', function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0; x0 = null; if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { e.preventDefault(); dx < 0 ? prox() : ant(); } }); }
    deslizar(v, function () { mostrar(k - 1); }, function () { mostrar(k + 1); });
    /* celular: setas e contador sobre a foto principal da página, sem precisar abrir o visor */
    var g = $('.galeria'), gp = g && $('.g-principal', g);
    if (g && gp && fotos.length > 1) { var gk = 0, gimg = $('img', gp);
      g.insertAdjacentHTML('beforeend', '<button type="button" class="g-seta g-ant" aria-label="Foto anterior"><svg viewBox=\"0 0 24 24\" width=\"26\" height=\"26\" aria-hidden=\"true\"><path d=\"M15 5l-7 7 7 7\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg></button><button type="button" class="g-seta g-prox" aria-label="Próxima foto"><svg viewBox=\"0 0 24 24\" width=\"26\" height=\"26\" aria-hidden=\"true\"><path d=\"M9 5l7 7-7 7\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg></button><span class="g-cont" aria-live="polite">1 / ' + fotos.length + '</span>');
      var ir = function (n) { gk = (n + fotos.length) % fotos.length; gimg.src = fotos[gk]; gp.setAttribute('data-foto', gk); $('.g-cont', g).textContent = (gk + 1) + ' / ' + fotos.length; var pre = new Image(); pre.src = fotos[(gk + 1) % fotos.length]; };
      $('.g-ant', g).addEventListener('click', function () { ir(gk - 1); }); $('.g-prox', g).addEventListener('click', function () { ir(gk + 1); });
      deslizar(gp, function () { ir(gk - 1); }, function () { ir(gk + 1); }); }
    document.addEventListener('keydown', function (e) { if (!v.classList.contains('aberto')) return; if (e.key === 'Escape') v.classList.remove('aberto'); if (e.key === 'ArrowLeft') mostrar(k - 1); if (e.key === 'ArrowRight') mostrar(k + 1); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    moldura(); formularios();
    var p = document.body.getAttribute('data-pagina');
    if (p === 'inicio') inicio(); else if (p === 'imoveis') vitrine(); else if (p === 'imovel') paginaImovel();
  });
  window.RESIDIR = { cartao: cartao, brl: brl };
})();
