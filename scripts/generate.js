const Parser = require('rss-parser');
const fs     = require('fs');
const parser = new Parser();

// 1) Timestamp
const now = new Date();
const lastUpdated = now.toLocaleString('pt-BR', {/* formato */});

const categorias = { /* ... */ };

(async () => {
  // 2) Cabeçalho com lastUpdated
  let html = `<!DOCTYPE html><html lang="pt-br"><head>…</head><body>
<h1>📰 Agregador de Notícias</h1>
<div class="last-updated">Atualizado em: ${lastUpdated}</div>
<div id="conteudo">`;

  for (let [cat, feeds] of Object.entries(categorias)) {
    html += `<h2>${cat}</h2>\n`;
    for (let f of feeds) {
      try {
        const feed = await parser.parseURL(f.url);
        feed.items.slice(0,3).forEach(item => {
          const hora = item.pubDate
            ? new Date(item.pubDate).toLocaleString('pt-BR')
            : '';
          const imgTag = item.enclosure && item.enclosure.url
            ? `<div class="thumb"><img src="${item.enclosure.url}" alt="" /></div>`
            : '';
          html += `
<div class="item">
  ${imgTag}
  <strong><a href="${item.link}" target="_blank">${item.title}</a></strong>
  <div class="time">${f.nome} • ${hora}</div>
</div>\n`;
        });
      } catch(e) {/*…*/}
    }
  }

  html += `</div></body></html>`;
  fs.writeFileSync('index.html', html, 'utf8');
})();
