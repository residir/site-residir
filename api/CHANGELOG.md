# Changelog — Site Residir Imobiliária (residirimobiliaria.com.br)

Todas as mudanças relevantes do site são registradas aqui.
O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e a numeração segue o
[Versionamento Semântico 2.0.0](https://semver.org/lang/pt-BR/).

O site tem numeração própria, separada da do CRM. A versão publicada aparece no rodapé de todas as páginas (ex.: “v1.6.0”)
e fica definida em `assets/site.js` (`SITE_VERSAO`).

**O que conta como interface pública do site** (mudanças incompatíveis aqui exigem nova versão MAJOR):
os endereços `/`, `/imoveis` (e seus parâmetros de busca `tipo`, `local`, `dorm`, `vagas`, `min`, `max`, `q`, `ordem`, `secao`),
`/imovel/REFERENCIA`, `/sitemap.xml`, os redirecionamentos dos endereços antigos e as consultas públicas ao banco
(`site_imoveis`, `site_imovel`, `site_empreendimentos`, contato pelo site).

- **MAJOR** (2.0.0): algo deixa de funcionar para quem já usa o site, como um endereço ou parâmetro removido ou renomeado.
- **MINOR** (1.x.0): função nova que não quebra o que já existe.
- **PATCH** (1.x.y): correção sem função nova.

Cada versão informa o **script mínimo do banco** (pasta `supabase/` do CRM) e a versão do CRM entregue junto.

---

## [1.9.0] — 19/10/2026
**Requer:** banco até `30-imoveis-escopo.sql` · entregue com o CRM 3.52.1

### Adicionado
- Faixa no topo de todas as páginas, com o texto destacado no canto superior direito: “✦ Compromisso com a **verdade**, a **ética** e a **satisfação do cliente**.” (centralizado no celular).
- Página do imóvel no celular: **setas e contador** (“3 / 12”) sobre a foto principal, para passar as fotos sem abrir o visor, e passagem das fotos **deslizando o dedo**.
### Alterado
- Visor de fotos: setas maiores, brancas e com sombra, centralizadas na altura da foto (antes eram quase transparentes e difíceis de ver no celular); contador em destaque e passagem deslizando o dedo.

## [1.8.1] — 19/10/2026
**Requer:** banco até `29-perfil-busca.sql` · entregue com o CRM 3.51.0

### Alterado
- A página do imóvel mostra a descrição com a formatação feita no CRM (negrito, itálico, sublinhado, listas e links) e os emojis. Qualquer outra marcação é descartada por segurança; descrições em texto simples continuam como antes.

## [1.8.0] — 15/10/2026
**Requer:** banco até `28-logo-site.sql` · sem mudança no CRM

### Adicionado
- Página **Política de Privacidade** (`/privacidade`), conforme a LGPD: responsável pelos dados, dados coletados, finalidades, bases legais, compartilhamento com fornecedores, prazo de guarda, segurança, direitos do titular e canal de atendimento.
- Link “Política de Privacidade” no rodapé de todas as páginas e aviso curto com o link nos formulários de contato (página inicial e página de cada imóvel).
- `/privacidade` incluída no mapa do site (`/sitemap.xml`).

## [1.7.0] — 15/10/2026
**Requer:** banco até `28-logo-site.sql` · entregue com o CRM 3.40.0

### Adicionado
- Logo no topo e no rodapé configurada no CRM (Ajustes › Logo do site), com imagens e alturas diferentes para computador e celular. Sem logo configurada, o site mantém o nome em texto.
- Imagem de compartilhamento (prévia no WhatsApp, Facebook e Instagram) da página inicial, da vitrine e dos imóveis sem foto, em `/logo/compartilhar` (1200 × 630).
- Ícone da aba do navegador e do atalho no celular (`/logo/favicon` e `/logo/apple`), com o ícone anterior como reserva.
- A logo fica guardada no navegador do visitante por 10 minutos, para aparecer sem atraso ao trocar de página.

## [1.6.2] — 15/10/2026
**Requer:** banco até `27-video-capa.sql` · sem mudança no CRM

### Alterado
- Descrições para o Google e para as prévias de link (WhatsApp, Instagram, Facebook) atualizadas para a nova região:
  - página inicial: “Casas, apartamentos, villages e terrenos à venda de Arembepe a Subaúma, em Salvador e região metropolitana. Fale com um corretor da Residir pelo WhatsApp.”
  - prévia de link da página inicial: “Casas, apartamentos, villages e terrenos à venda de Arembepe a Subaúma, em Salvador e região metropolitana.”
  - vitrine (/imoveis): “Busque casas, apartamentos, villages e terrenos à venda de Arembepe a Subaúma, em Salvador e região metropolitana, com filtros por bairro, dormitórios e valor.”

## [1.6.1] — 15/10/2026
**Requer:** banco até `27-video-capa.sql` · sem mudança no CRM

### Alterado
- Texto da capa da página inicial: “Casas, Apartamentos, Villages e Terrenos à venda de Arembepe a Subaúma, em Salvador e região metropolitana, com Corretores que conhecem cada condomínio.”

## [1.6.0] — 15/10/2026
**Requer:** banco até `27-video-capa.sql` · entregue com o CRM 3.38.0

### Adicionado
- Vídeo na capa da página inicial: o imóvel marcado no CRM com “Rodar vídeo na capa” passa a ser o da capa, com o vídeo (YouTube, Vimeo ou arquivo MP4/WEBM/MOV) tocando sem som e em repetição atrás do título.
- A foto do imóvel aparece enquanto o vídeo carrega; botão para pausar e tocar; o crédito da capa passa a “No vídeo: …”.
- O vídeo não carrega com economia de dados ligada e não inicia sozinho para quem pede menos movimento no sistema.
- Versão do site discreta no rodapé (“v1.6.0”) e este CHANGELOG.

## [1.5.0] — 15/10/2026
**Requer:** banco até `25-ordem-site.sql` · entregue com o CRM 3.35.0

### Adicionado
- As seções da página inicial e a vitrine seguem a ordem definida no CRM (Imóveis › Ordem no site).
- Vitrine: ordenação **Recomendados** (a ordem do CRM) como padrão; Mais recentes passa a ordenar pela data de atualização.

## [1.4.0] — 15/10/2026
**Requer:** banco até `24-lancamentos-site.sql` · entregue com o CRM 3.34.0

### Adicionado
- Página inicial com três seções: **Imóveis em destaque**, **Imóveis** e **Lançamentos**, até 6 imóveis cada, com “Ver os N” quando há mais; seção vazia não aparece.
- Menu e rodapé com as três opções, abrindo a vitrine já filtrada.
- Vitrine: botões **Todos · Imóveis em destaque · Imóveis · Lançamentos** e parâmetro `secao` no endereço (ex.: `/imoveis?secao=lancamento`); o menu marca a opção escolhida.

### Alterado
- A seção de destaques mostra só os imóveis marcados como destaque (antes era completada com outros imóveis quando havia menos de 3).

## [1.3.0] — 15/10/2026
**Requer:** banco até `24-lancamentos-site.sql` · entregue com o CRM 3.33.0

### Adicionado
- Lançamentos com fotos: cartões com foto de capa, selo “Lançamento” e valor “a partir de” (ou “Consulte valores”), abrindo a página completa com galeria.
- Página do lançamento: selo, trilha “Lançamentos”, botão “Receber tabela pelo WhatsApp” e formulário já pedindo a tabela atualizada e as condições.

### Alterado
- Empreendimentos (cartão com a logo) só aparecem quando marcados “Mostrar no site” no CRM.
- Imóveis arquivados no CRM deixam de aparecer no site.

## [1.2.0] — 15/10/2026
**Requer:** banco até `23-avisos-site.sql` e a função `site-contato` · entregue com o CRM 3.32.0

### Adicionado
- Formulário de contato enviado pela função `site-contato`: grava o lead no CRM e avisa a equipe por e-mail.
- Se a função falhar, o contato é gravado direto no banco, sem se perder.

## [1.1.0] — 14/10/2026
**Requer:** banco até `22-site-e-fotos.sql` · entregue com o CRM 3.30.0

### Adicionado
- Medição de visitas com o Vercel Web Analytics em todas as páginas (lida no CRM, em Visitas do site).

## [1.0.0] — 13/10/2026
**Requer:** banco até `22-site-e-fotos.sql` · entregue com o CRM 3.29.0

### Adicionado
- Lançamento do site residirimobiliaria.com.br: página inicial com busca, bairros e destaques; vitrine com filtros (`/imoveis`); página de cada imóvel gerada no servidor, com dados para o Google e prévia no WhatsApp (`/imovel/REFERENCIA`); lançamentos; contato; mapa do site (`/sitemap.xml`).
- Formulários criam o lead no CRM (origem “Site”) ou acrescentam uma anotação ao lead existente.
- Redirecionamentos dos endereços antigos do site no Tecimob.
