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
    email: 'gabrielpinto@residirimobiliaria.com.br',
    instagram: '',            // ex.: 'residirimobiliaria' (sem @)
    creci: '',                // ex.: 'CRECI/BA 0000-J'
    endereco: 'Av. Prefeito Celso Alves Pinheiro da Silva, nº 103, Ed. Revi Center, Sala 203, Centro, Lauro de Freitas/BA',
    // Supabase do CRM (chave pública — pode ficar no site)
    supabaseUrl: 'https://sxesceeoedcafuhjfrtn.supabase.co',
    supabaseKey: 'sb_publishable_e3QnarGzvo0mXT6kj08Ulg_BefV7_yF'
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = SITE; else g.SITE = SITE;
})(typeof window !== 'undefined' ? window : this);
