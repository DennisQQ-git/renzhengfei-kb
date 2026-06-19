/**
 * Preprocessing script: scans all Obsidian markdown files, parses frontmatter,
 * resolves wiki links, and generates a static JSON index for the React app.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.resolve(__dirname, '..', '..');
const HUAWEI_DIR = path.join(DATA_DIR, 'huaweimind-master', 'huawei');
const TOPIC_DIR = DATA_DIR;
const OUTPUT_DIR = path.join(ROOT, 'public', 'data');

// Simple frontmatter parser (no gray-matter dependency needed at build time)
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };

  const fm = {};
  const fmText = match[1];
  let currentKey = null;

  fmText.split('\n').forEach(line => {
    const keyMatch = line.match(/^(\w+):\s*(.*)/);
    if (keyMatch) {
      currentKey = keyMatch[1];
      let value = keyMatch[2].trim();
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      fm[currentKey] = value;
    } else if (currentKey && line.startsWith('  - ')) {
      // Array item
      const item = line.replace('  - ', '').trim().replace(/^"(.*)"$/, '$1');
      if (!Array.isArray(fm[currentKey])) {
        fm[currentKey] = [fm[currentKey]];
      }
      fm[currentKey].push(item);
    }
  });

  return { frontmatter: fm, body: match[2] };
}

function slugify(text) {
  return text
    .replace(/\.md$/, '')
    .replace(/[\/\\]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9\u4e00-\u9fff\-]/g, '')
    .toLowerCase();
}

function extractTitleFromBody(body) {
  // Try h1 first, then h2
  const h1 = body.match(/^#\s+(.+)/m);
  if (h1) return h1[1].trim();
  const h2 = body.match(/^##\s+(.+)/m);
  if (h2) return h2[1].trim();

  // Fallback: use filename without date prefix
  return null
}

function extractExcerpt(body, maxLen = 200) {
  const clean = body
    .replace(/^#+\s+.*$/gm, '')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/>\s*(.*)/g, '$1')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[#*`=\[\]|]/g, '')
    .replace(/\n{2,}/g, '\n')
    .trim();
  return clean.length > maxLen ? clean.slice(0, maxLen) + '…' : clean;
}

// Resolve wiki links [[target]] or [[target|display]]
function processWikiLinks(body, docSlugMap) {
  return body.replace(/\[\[([^\]]+)\]\]/g, (match, inner) => {
    const parts = inner.split('|');
    const target = parts[0].trim();
    const display = parts[1] ? parts[1].trim() : target;

    // Check if it's a heading link (starts with #)
    if (target.startsWith('#')) {
      return `<a href="${target}" class="wiki-link wiki-link-heading">${display}</a>`;
    }

    // Try to find the target document
    const targetSlug = slugify(target);
    if (docSlugMap[targetSlug]) {
      return `<a href="/article/${targetSlug}" class="wiki-link">${display}</a>`;
    }

    // External link or unresolved
    const extMatch = target.match(/^(https?:\/\/)/);
    if (extMatch) {
      return `<a href="${target}" target="_blank" rel="noopener noreferrer" class="wiki-link wiki-link-external">${display} ↗</a>`;
    }

    // Unresolved wiki link - render with special class
    return `<span class="wiki-link wiki-link-unresolved">${display}</span>`;
  });
}

// Convert basic markdown to HTML for body content
function markdownToHtml(md, docSlugMap) {
  // Process wiki links first
  let html = processWikiLinks(md, docSlugMap);

  // Process code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>');

  // Process inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Process blockquotes
  html = html.replace(/^>\s*(.*)$/gm, '<blockquote>$1</blockquote>');
  html = html.replace(/<\/blockquote>\n<blockquote>/g, '<br>');

  // Process headings
  html = html.replace(/^####\s+(.*)$/gm, '<h4>$1</h4>');
  html = html.replace(/^###\s+(.*)$/gm, '<h3>$1</h3>');
  html = html.replace(/^##\s+(.*)$/gm, '<h2>$1</h2>');
  html = html.replace(/^#\s+(.*)$/gm, '<h1>$1</h1>');

  // Process bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Process horizontal rules
  html = html.replace(/^---$/gm, '<hr>');

  // Process images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');

  // Process links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Process paragraphs
  const lines = html.split('\n');
  let inBlock = false;
  let result = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      if (!inBlock) result.push('');
      continue;
    }

    if (trimmed.startsWith('<h') || trimmed.startsWith('<pre') ||
        trimmed.startsWith('<blockquote') || trimmed.startsWith('<hr') ||
        trimmed.startsWith('<img') || trimmed.startsWith('<ul') ||
        trimmed.startsWith('<li') || trimmed.startsWith('</')) {
      result.push(trimmed);
      continue;
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inBlock) {
        result.push('<ul>');
        inBlock = true;
      }
      result.push(`<li>${trimmed.slice(2)}</li>`);
      continue;
    }

    if (trimmed.match(/^\d+\.\s/)) {
      if (!inBlock) {
        result.push('<ol>');
        inBlock = true;
      }
      result.push(`<li>${trimmed.replace(/^\d+\.\s/, '')}</li>`);
      continue;
    }

    if (inBlock && !trimmed.match(/^[-*]\s/) && !trimmed.match(/^\d+\.\s/)) {
      result.push(inBlock === 'ul' ? '</ul>' : '</ol>');
      inBlock = false;
    }

    if (!trimmed.startsWith('<')) {
      result.push(`<p>${trimmed}</p>`);
    } else {
      result.push(trimmed);
    }
  }

  if (inBlock) {
    result.push('</ul>');
  }

  return result.join('\n');
}

async function main() {
  console.log('🔍 Scanning markdown files...');

  // Collect all speech files by year
  const yearDirs = fs.readdirSync(HUAWEI_DIR).filter(f =>
    fs.statSync(path.join(HUAWEI_DIR, f)).isDirectory() && /^\d{4}$/.test(f)
  ).sort();

  // Collect root-level topic files
  const topicFiles = fs.readdirSync(TOPIC_DIR)
    .filter(f => f.endsWith('.md') && fs.statSync(path.join(TOPIC_DIR, f)).isFile())
    .filter(f => !f.includes('README') && !f.includes('任正非历年讲话'));

  // First pass: build slug map for wiki link resolution
  const docSlugMap = {};
  const allDocs = [];

  // Process speech files
  for (const year of yearDirs) {
    const yearPath = path.join(HUAWEI_DIR, year);
    const files = fs.readdirSync(yearPath).filter(f => f.endsWith('.md')).sort();

    for (const file of files) {
      const content = fs.readFileSync(path.join(yearPath, file), 'utf-8');
      const { frontmatter, body } = parseFrontmatter(content);
      const name = file.replace(/\.md$/, '');
      const slug = slugify(name);
      docSlugMap[slug] = true;
      docSlugMap[slugify(frontmatter.title || name)] = true;
    }
  }

  // Process topic files
  for (const file of topicFiles) {
    const content = fs.readFileSync(path.join(TOPIC_DIR, file), 'utf-8');
    const { frontmatter } = parseFrontmatter(content);
    const name = file.replace(/\.md$/, '');
    const slug = slugify(name);
    docSlugMap[slug] = true;
    if (frontmatter.title) docSlugMap[slugify(frontmatter.title)] = true;
  }

  console.log(`📚 Built slug map with ${Object.keys(docSlugMap).length} entries`);

  // Second pass: generate output
  let totalFiles = 0;

  for (const year of yearDirs) {
    const yearPath = path.join(HUAWEI_DIR, year);
    const files = fs.readdirSync(yearPath).filter(f => f.endsWith('.md')).sort();

    for (const file of files) {
      const content = fs.readFileSync(path.join(yearPath, file), 'utf-8');
      const { frontmatter, body } = parseFrontmatter(content);
      const name = file.replace(/\.md$/, '');
      const cleanName = name.replace(/^\d{8}-?/, '').replace(/^\d{6}-?/, '').replace(/[-_]/g, ' ');
      const slug = slugify(name);
      const title = frontmatter.title || extractTitleFromBody(body) || cleanName;
      const excerpt = extractExcerpt(body);
      const htmlContent = markdownToHtml(body, docSlugMap);

      const doc = {
        slug,
        title,
        year: parseInt(year),
        filename: file,
        excerpt,
        html: htmlContent,
        tags: frontmatter.tags ? (Array.isArray(frontmatter.tags) ? frontmatter.tags : [frontmatter.tags]) : [],
        category: frontmatter.category || '',
        metadata: frontmatter,
      };

      allDocs.push(doc);

      // Write individual doc JSON
      const docDir = path.join(OUTPUT_DIR, 'documents');
      if (!fs.existsSync(docDir)) fs.mkdirSync(docDir, { recursive: true });
      fs.writeFileSync(path.join(docDir, `${slug}.json`), JSON.stringify(doc));

      totalFiles++;
    }
  }

  // Process topic files
  for (const file of topicFiles) {
    const content = fs.readFileSync(path.join(TOPIC_DIR, file), 'utf-8');
    const { frontmatter, body } = parseFrontmatter(content);
    const name = file.replace(/\.md$/, '');
    const slug = slugify(name);
    const title = frontmatter.title || name;
    const excerpt = extractExcerpt(body);
    const htmlContent = markdownToHtml(body, docSlugMap);

    const doc = {
      slug,
      title,
      year: 0,
      filename: file,
      excerpt,
      html: htmlContent,
      tags: frontmatter.tags ? (Array.isArray(frontmatter.tags) ? frontmatter.tags : [frontmatter.tags]) : [],
      category: frontmatter.category || '专题',
      isTopic: true,
      metadata: frontmatter,
    };

    allDocs.push(doc);

    const docDir = path.join(OUTPUT_DIR, 'documents');
    if (!fs.existsSync(docDir)) fs.mkdirSync(docDir, { recursive: true });
    fs.writeFileSync(path.join(docDir, `${slug}.json`), JSON.stringify(doc));

    totalFiles++;
  }

  // Write index
  const indexData = {
    total: allDocs.length,
    years: yearDirs.map(y => parseInt(y)),
    documents: allDocs.map(({ slug, title, year, excerpt, tags, category, isTopic, filename }) => ({
      slug, title, year, excerpt, tags, category, isTopic: !!isTopic, filename
    })),
    topics: allDocs.filter(d => d.isTopic).map(({ slug, title, tags, category }) => ({ slug, title, tags, category })),
    allTags: [...new Set(allDocs.flatMap(d => d.tags))].sort(),
  };

  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.json'), JSON.stringify(indexData));

  console.log(`✅ Preprocessed ${totalFiles} documents`);
  console.log(`📊 Index written to public/data/index.json`);
  console.log(`🏷️  Found ${indexData.allTags.length} unique tags`);

  // Write year stats
  const yearStats = {};
  for (const year of yearDirs) {
    const count = allDocs.filter(d => d.year === parseInt(year)).length;
    yearStats[year] = count;
  }
  fs.writeFileSync(path.join(OUTPUT_DIR, 'years.json'), JSON.stringify(yearStats));
}

main().catch(console.error);
