// Static blog generator: discovers *.md posts and assembles them from templates/.
const fs = require('fs');
const path = require('path');
const { parseFrontMatter, renderMarkdown } = require('./render');

const ROOT = process.cwd();
const TEMPLATES = path.join(ROOT, 'templates');
const EXCLUDE = /README|OSAKA_JADE|osaka-jade-theme-report/;

const C = {
  red: '\x1b[0;31m', green: '\x1b[0;32m', blue: '\x1b[0;34m', yellow: '\x1b[0;33m', off: '\x1b[0m',
};
const log = (color, msg) => console.log(`${color}${msg}${C.off}`);

function readTemplate(name) {
  return fs.readFileSync(path.join(TEMPLATES, name), 'utf8');
}

// Static partials are loaded once and inlined into the shell.
function buildShell() {
  return readTemplate('post.html')
    .replace('{{STYLES}}', () => readTemplate('styles.css').replace(/\n$/, ''))
    .replace('{{NAV}}', () => readTemplate('nav.html').replace(/\n$/, ''))
    .replace('{{FOOTER}}', () => readTemplate('footer.html').replace(/\n$/, ''))
    .replace('{{APP_JS}}', () => readTemplate('app.js').replace(/\n$/, ''));
}

// Mirror of the old shell heuristic: first emphasized lead paragraph, stripped.
function extractDescription(html, fallback) {
  const line = html.split('\n').find((l) => l.includes('<p><em>'));
  if (!line) return fallback;
  const text = line.replace(/<[^>]*>/g, '').replace(/&[^;]*;/g, '').trim().slice(0, 160);
  return text || fallback;
}

function fillPost(shell, data) {
  return shell
    .split('{{TITLE}}').join(data.title)
    .split('{{DESCRIPTION}}').join(data.description)
    .split('{{CATEGORY}}').join(data.category)
    .split('{{TECH}}').join(data.tech)
    .split('{{OUTPUT}}').join(data.output)
    .split('{{DATE}}').join(data.date)
    .split('{{CONTENT}}').join(data.content);
}

function main() {
  log(C.blue, 'Building static blog posts...');
  log(C.blue, 'Scanning for blog posts...');

  const shell = buildShell();
  const date = new Date().toISOString().slice(0, 10);
  let processed = 0;
  let skipped = 0;

  const files = fs.readdirSync(ROOT).filter((f) => f.endsWith('.md')).sort();

  for (const md of files) {
    if (EXCLUDE.test(md)) {
      log(C.yellow, `\u23ed Skipping (excluded): ${md}`);
      skipped++;
      continue;
    }

    const raw = fs.readFileSync(path.join(ROOT, md), 'utf8');
    if (!raw.startsWith('---')) {
      log(C.yellow, `\u26a0 Skipping (no front matter): ${md}`);
      skipped++;
      continue;
    }

    const { metadata, content } = parseFrontMatter(raw);
    const title = metadata.title || '';
    if (!title) {
      log(C.yellow, `\u26a0 Skipping (no title in front matter): ${md}`);
      skipped++;
      continue;
    }

    const output = md.replace(/\.md$/, '.html');
    log(C.blue, `Processing: ${md} -> ${output}`);

    const html = renderMarkdown(content);
    const page = fillPost(shell, {
      title,
      description: extractDescription(html, title),
      category: metadata.category || 'Chromium',
      tech: metadata.tech || 'C++',
      output,
      date,
      content: html,
    });

    fs.writeFileSync(path.join(ROOT, output), page);
    log(C.green, `\u2713 Generated: ${output}`);
    processed++;
  }

  console.log('');
  log(C.green, '\u2713 Build complete!');
  log(C.blue, `  Processed: ${processed} files`);
  log(C.yellow, `  Skipped: ${skipped} files`);
}

main();
