// scripts/generate.js
const Parser = require('rss-parser');
const fs     = require('fs');
const parser = new Parser();

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
    {nome:'X-JH',         url:'https://rss.app/feeds/lq2EsS022Si4i5V1.xml'}
  ]
};

(async () => {
  let html = `<!DOCTYPE html>
<html lang="pt-br"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Agregador de Notícias</title>
<style>
  body{font-family:Arial;margin:0 auto;padding:15px;max-width:600px}
  h2{border-bottom:2px solid #eee;margin-top:25px;color:#333}
  .item{padding:10px 0;border-bottom:1px solid #f0f0f0}
  a{color:#0066cc;text-decoration:none}a:hover{text-decoration:underline}
  .time{font-size:12px;color:#999}
</style>
</head><body>
<h1>📰 Agregador de Notícias</h1>
<div id="conteudo">
`;

  for (let [cat, feeds] of Object.entries(categorias)) {
    html += `<h2>${cat}</h2>\n`;
    for (let f of feeds) {
      try {
        const feed = await parser.parseURL(f.url);
        feed.items.slice(0,3).forEach(item => {
          const hora = item.pubDate ? new Date(item.pubDate).toLocaleString() : '';
          html += `
<div class="item">
  <strong><a href="${item.link}" target="_blank">${item.title}</a></strong>
  <div class="time">${f.nome} • ${hora}</div>
</div>\n`;
        });
      } catch(e) {
        console.warn(`Erro em ${f.nome}: ${e.message}`);
      }
    }
  }

  html += `</div></body></html>`;
  fs.writeFileSync('index.html', html, 'utf8');
})();
