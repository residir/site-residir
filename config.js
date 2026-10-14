/* =====================================================================
   Site Residir Imobiliária — configuração
   Edite aqui os contatos que aparecem no site. Depois envie o arquivo ao GitHub.
   ===================================================================== */
(function (g) {
  var SITE = {
    nome: 'Residir Imobiliária',
    dominio: 'https://residirimobiliaria.com.br',
    // WhatsApp que recebe os contatos do site (só números, com 55 + DDD)
    whatsapp: '5571992047763',
    telefoneExibicao: '(71) 99204-7763',
    email: 'gpinto@residirimobiliaria.com.br',
    instagram: 'gabrielpinto.imoveis',            // ex.: 'gabrielpinto.imoveis' (sem @)
    creci: 'CRECI/BA 25.441',                // ex.: 'CRECI '
    endereco: 'AV PREFEITO CELSO ALVES PINHEIRO DA SILVA, nº 103, ED.REVI CENTER, SALA 203, CENTRO, LAURO DE FREITAS, BAHIA',             // ex.: 'Av....'
    // Supabase do CRM (chave pública — pode ficar no site)
    supabaseUrl: 'https://sxesceeoedcafuhjfrtn.supabase.co',
    supabaseKey: 'sb_publishable_e3QnarGzvo0mXT6kj08Ulg_BefV7_yF'
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = SITE; else g.SITE = SITE;
})(typeof window !== 'undefined' ? window : this);
