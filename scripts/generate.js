// scripts/generate.js
const Parser = require('rss-parser');
const fs     = require('fs');
const parser = new Parser();

// Configuração dos feeds por categoria
const categorias = {
  Brasil: [
    {nome:'NeoFeed',        url:'https://neofeed.com.br/feed/'},
    {nome:'Brazil Economy', url:'https://brazileconomy.com.br/feed/'},
    {nome:'Brazil Journal', url:'https://braziljournal.com/feed/'},
    {nome:'Valor Econômico',url:'https://valor.globo.com/rss/'}
  ],
  "AI News": [
    {nome:'Fallacy Alarm',  url:'https://www.fallacyalarm.com/feed'},
    {nome:'Julia DeLuca',   url:'https://juliadeluca.substack.com/feed?format=rss'},
    {nome:'Trend Override', url:'https://trendoverride.substack.com/feed?format=rss'}
  ],
  World: [
    {nome:'NY Times',        url:'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml'},
    {nome:'Financial Times', url:'https://www.ft.com/rss'},
    {nome:'ZeroHedge',       url:'https://www.zerohedge.com/rss.xml'}
  ],
  Outros: [
    {nome:'RSS App',         url:'https://rss.app/feeds/lq2EsS022Si4i5V1.xml'}
  ]
};

(async () => {
  // Timestamp de geração no fuso de São Paulo
  const now = new Date();
  const lastUpdated = now.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day:    '2-digit', month: '2-digit', year: 'numeric',
    hour:   '2-digit', minute:'2-digit', second:'2-digit'
  });

  // Início do HTML
  let html = `<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Agregador de Notícias</title>
  <style>
    body { font-family: Arial; margin:0 auto; padding:15px; max-width:800px; }
    h1 { margin-bottom:.2em; }
    .last-updated { font-size:.9em; color:#555; margin-bottom:1.5em; }
    h2 { border-bottom:2px solid #eee; margin-top:25px; color:#333; }
    .item { display: flex; align-items: flex-start; padding:10px 0; border-bottom:1px solid #f0f0f0; }
    .thumb { flex-shrink:0; width:80px; height:60px; margin-right:10px; }
    .thumb img { width:100%; height:100%; object-fit:cover; border-radius:4px; }
    .content { flex-grow:1; }
    .content strong { display:block; margin-bottom:4px; }
    a { color:#0066cc; text-decoration:none; }
    a:hover { text-decoration:underline; }
    .time { font-size:12px; color:#999; margin-top:4px; }
  </style>
</head>
<body>
  <h1>📰 Agregador de Notícias</h1>
  <div class="last-updated">Atualizado em: ${lastUpdated}</div>
`;

  // Geração de cada seção
  for (let [cat, feeds] of Object.entries(categorias)) {
    html += `<h2>${cat}</h2>\n`;
    // Coleta itens de todos os feeds
    const itens = [];
    for (let f of feeds) {
      try {
        const feed = await parser.parseURL(f.url);
        feed.items.slice(0,3).forEach(item => {
          const dataRaw = item.isoDate || item.pubDate;
          const dateObj = dataRaw ? new Date(dataRaw) : new Date(0);
          const hora = dataRaw
            ? dateObj.toLocaleString('pt-BR', {
                timeZone: 'America/Sao_Paulo',
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute:'2-digit', second:'2-digit'
              })
            : '';
          itens.push({
            title: item.title,
            link: item.link,
            source: f.nome,
            dateObj,
            hora,
            // captura imagem do feed (enclosure ou media), sem fallback ainda
            imgUrl: item.enclosure?.url || item['media:content']?.url || null
          });
        });
      } catch(e) {
        console.warn(`Erro em ${f.nome}: ${e.message}`);
      }
    }
    // Ordena do mais recente para o mais antigo
    itens.sort((a,b) => b.dateObj - a.dateObj);
    // Renderiza
    itens.forEach(item => {
      // Se não houver imagem no feed, usa placeholder com nome da fonte
      const placeholder = `https://via.placeholder.com/80x60?text=${encodeURIComponent(item.source)}`;
      const imgSrc = item.imgUrl || placeholder;
      html += `
    <div class="item">
      <div class="thumb"><img src="${imgSrc}" alt="${item.source}" /></div>
      <div class="content">
        <strong><a href="${item.link}" target="_blank">${item.title}</a></strong>
        <div class="time">${item.source} • ${item.hora}</div>
      </div>
    </div>`;
    });
  }

  // Fecha body e html
  html += `\n</body></html>`;
  fs.writeFileSync('index.html', html, 'utf8');
})();
