// Markdown rendering: front matter + marked + Prism + snippet/heading handling.
const { marked } = require('marked');
const Prism = require('prismjs');
const yaml = require('js-yaml');

require('prismjs/components/prism-bash');
require('prismjs/components/prism-c');
require('prismjs/components/prism-cpp');
require('prismjs/components/prism-python');
require('prismjs/components/prism-json');
require('prismjs/components/prism-rust');
require('prismjs/components/prism-shell-session');

const renderer = new marked.Renderer();
const originalCode = renderer.code.bind(renderer);

renderer.code = function (code, lang, escaped) {
  // Custom snippet blocks are emitted as raw HTML.
  if (lang === 'snippet') return code + '\n';
  return originalCode(code, lang, escaped);
};

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/<[^>]*>/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim();
}

renderer.heading = function (text, level, raw) {
  // marked v4+ may pass an object instead of positional args.
  if (typeof text === 'object') {
    const id = slugify(text.text);
    return '<h' + text.depth + ' id="' + id + '">' + text.text + '</h' + text.depth + '>\n';
  }
  const id = slugify(raw || text);
  return '<h' + level + ' id="' + id + '">' + text + '</h' + level + '>\n';
};

marked.setOptions({
  renderer,
  highlight: function (code, lang) {
    if (lang === 'snippet') return code;
    if (lang === 'sh') lang = 'bash';
    if (Prism.languages[lang]) {
      return Prism.highlight(code, Prism.languages[lang], lang);
    }
    return code;
  },
  breaks: true,
  gfm: true,
});

function parseFrontMatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) return { metadata: {}, content };
  try {
    return { metadata: yaml.load(match[1]) || {}, content: match[2] };
  } catch (e) {
    console.error('Error parsing front matter:', e.message);
    return { metadata: {}, content };
  }
}

function renderMarkdown(markdown) {
  let html = marked.parse(markdown);

  // Convert snippet code blocks back to raw HTML, processing markdown inside <details>.
  html = html.replace(
    /<pre><code class="language-snippet">([\s\S]+?)<\/code><\/pre>/g,
    (match, inner) => {
      let unescaped = inner
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&');

      unescaped = unescaped.replace(
        /(<details[\s\S]*?>)([\s\S]*?)(<\/details>)/gi,
        (m, openTag, innerContent, closeTag) => openTag + marked.parse(innerContent) + closeTag
      );

      return unescaped;
    }
  );

  return html;
}

module.exports = { parseFrontMatter, renderMarkdown, slugify };
