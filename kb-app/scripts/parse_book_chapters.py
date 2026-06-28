#!/usr/bin/env python3
"""
parse_book_chapters.py — 解析三本书 markdown，按章节生成独立 JSON 文档文件
"""

import json, re, os, sys
from markdown_it import MarkdownIt

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BOOKS_DIR = os.path.join(SCRIPT_DIR, '..', 'public', 'data', 'documents')
INDEX_PATH = os.path.join(SCRIPT_DIR, '..', 'public', 'data', 'index.json')
SEARCH_INDEX_PATH = os.path.join(SCRIPT_DIR, '..', 'public', 'data', 'search-index.json')
PROJECT_ROOT = os.path.join(SCRIPT_DIR, '..', '..')

md = MarkdownIt()

def slugify(title):
    """Convert chapter title to slug."""
    s = title.strip()
    s = re.sub(r'[\\/:*?"<>|]', '', s)
    s = re.sub(r'\s+', '', s)
    return s

def heading_to_plain(line):
    """Strip markdown heading markers."""
    return re.sub(r'^#+\s*', '', line).strip()

def extract_chapters_book1():
    """
    以客户为中心 — 章节结构
    Ch1: L66 (H1), Ch2: L234 (H2), ..., Ch17: L3205 (H2)
    Ch12 doesn't have explicit heading, use section heading as marker
    """
    fname = os.path.join(PROJECT_ROOT, '以客户为中心_output', '以客户为中心-完整版.md')
    with open(fname, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Chapter heading lines (line numbers 1-based)
    chapters = [
        (1, '第一章', '为客户服务是华为存在的唯一理由', 66),
        (2, '第二章', '华为的价值主张', 234),
        (3, '第三章', '质量是华为的生命', 412),
        (4, '第四章', '深淘滩，低作堰', 544),
        (5, '第五章', '客户满意是衡量一切工作的准绳', 624),
        (6, '第六章', '追求长期有效增长', 688),
        (7, '第七章', '产品发展的路标是客户需求导向', 788),
        (8, '第八章', '创新是华为发展的不竭动力', 1008),
        (9, '第九章', '更多地强调机会对公司发展的驱动', 1292),
        (10, '第十章', '聚焦主航道，坚持"压强原则"', 1486),
        (11, '第十一章', '开放、竞争、合作，构建良好的商业生态环境', 1708),
        (12, '第十二章', '业务管理的指导原则', 1876),
        (13, '第十三章', '未来的竞争是管理的竞争', 2018),
        (14, '第十四章', '企业管理的目标是流程化组织建设', 2187),
        (15, '第十五章', '从客户中来，到客户中去，以最简单、最有效的方式实现流程贯通', 2593),
        (16, '第十六章', '打造数字化全连接企业', 2969),
        (17, '第十七章', '管理变革的方针', 3205),
    ]

    # Part structure
    parts = {1: '第一篇 以客户为中心', 2: '第二篇 增长', 3: '第三篇 效率'}
    chapter_parts = {1:1,2:1,3:1,4:1,5:1,6:2,7:2,8:2,9:2,10:2,11:2,12:2,13:3,14:3,15:3,16:3,17:3}

    # Chapter-specific tags
    chapter_tags = {
        1: ['客户价值', '客户服务', '企业生存'],
        2: ['价值主张', '核心价值观', '以客户为中心'],
        3: ['质量管理', '质量体系', '品牌诚信'],
        4: ['商业模式', '利润', '内部挖潜', '深淘滩低作堰'],
        5: ['客户满意', '评价标准', '服务质量'],
        6: ['长期增长', '有效增长', '核心竞争力'],
        7: ['客户需求导向', '产品路标', '技术导向'],
        8: ['创新', '研发管理', '开放合作', '知识产权'],
        9: ['战略机会', '机会驱动', '资源分配'],
        10: ['主航道', '压强原则', '聚焦'],
        11: ['开放合作', '商业生态', '产业链', '竞争合作'],
        12: ['战略方向', '灵活战术', '灰色哲学'],
        13: ['管理竞争', '科学管理', '管理进步'],
        14: ['流程化组织', '端到端', '组织建设'],
        15: ['端到端流程', '流程贯通', 'LTC', 'IPD'],
        16: ['数字化', 'IT建设', '数据管理', '信息安全'],
        17: ['管理变革', '先僵化后优化再固化', '自我批判'],
    }

    result = []
    for i, (ch_num, ch_label, ch_title, start_line) in enumerate(chapters):
        # Determine end line (next chapter or EOF)
        if i < len(chapters) - 1:
            end_line = chapters[i + 1][3]
        else:
            end_line = len(lines)

        # Extract content lines
        content_lines = lines[start_line - 1:end_line - 1]

        # Generate tags
        tags = list(set(
            ['华为管理', '业务管理'] + chapter_tags.get(ch_num, [])
        ))

        # Generate excerpt from first few non-empty lines
        excerpt_parts = []
        for line in content_lines[:20]:
            stripped = line.strip()
            if stripped and not stripped.startswith('#') and not stripped.startswith('!['):
                excerpt_parts.append(stripped)
                if len(''.join(excerpt_parts)) > 150:
                    break
        excerpt = ''.join(excerpt_parts)[:200]

        # Store full content
        chapter_content = ''.join(content_lines)

        part_name = parts.get(chapter_parts.get(ch_num, 1), '')

        result.append({
            'ch_num': ch_num,
            'slug': f'以客户为中心-{ch_label}',
            'title': f'《以客户为中心》—— {ch_label} {ch_title}',
            'full_title': f'{ch_label} {ch_title}',
            'book_slug': '以客户为中心',
            'book_title': '《以客户为中心》—— 业务管理纲要',
            'part': part_name,
            'excerpt': excerpt,
            'markdown': chapter_content,
            'tags': tags,
        })

    return result, parts


def extract_chapters_book2():
    """
    以奋斗者为本 — 章节结构
    All chapters use H2 markers. No explicit part markers in content after TOC.
    """
    fname = os.path.join(PROJECT_ROOT, '以奋斗者为本_output', '以奋斗者为本-完整版.md')
    with open(fname, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    chapters = [
        (1, '第一章', '全力创造价值', 352),
        (2, '第二章', '正确评价价值', 650),
        (3, '第三章', '合理分配价值', 889),
        (4, '第四章', '干部的使命与责任', 1468),
        (5, '第五章', '对干部的要求', 1884),
        (6, '第六章', '干部的选拔与配备', 2410),
        (7, '第七章', '干部的使用与管理', 2756),
        (8, '第八章', '干部队伍的建设', 3098),
    ]

    parts = {1: '上篇：价值创造、评价与分配', 2: '下篇：干部政策'}
    chapter_parts = {1:1, 2:1, 3:1, 4:2, 5:2, 6:2, 7:2, 8:2}

    chapter_tags = {
        1: ['价值创造', '奋斗者', '劳动', '知识', '企业家'],
        2: ['价值评价', '绩效', 'KPI', '责任结果'],
        3: ['价值分配', '分配政策', '激励', '按劳分配'],
        4: ['干部', '使命', '组织建设', '文化传承'],
        5: ['干部要求', '艰苦奋斗', '敬业', '自我批判', '灰度'],
        6: ['干部选拔', '干部配备', '实战', '能上能下'],
        7: ['干部管理', '干部考核', '干部监察', '分权制衡'],
        8: ['干部培养', '循环流动', '后备干部', '干部梯队'],
    }

    result = []
    for i, (ch_num, ch_label, ch_title, start_line) in enumerate(chapters):
        if i < len(chapters) - 1:
            end_line = chapters[i + 1][3]
        else:
            end_line = len(lines)

        content_lines = lines[start_line - 1:end_line - 1]

        tags = list(set(
            ['华为管理', '人力资源管理'] + chapter_tags.get(ch_num, [])
        ))

        excerpt_parts = []
        for line in content_lines[:20]:
            stripped = line.strip()
            if stripped and not stripped.startswith('#') and not stripped.startswith('!['):
                excerpt_parts.append(stripped)
                if len(''.join(excerpt_parts)) > 150:
                    break
        excerpt = ''.join(excerpt_parts)[:200]

        chapter_content = ''.join(content_lines)

        part_name = parts.get(chapter_parts.get(ch_num, 1), '')

        result.append({
            'ch_num': ch_num,
            'slug': f'以奋斗者为本-{ch_label}',
            'title': f'《以奋斗者为本》—— {ch_label} {ch_title}',
            'full_title': f'{ch_label} {ch_title}',
            'book_slug': '以奋斗者为本',
            'book_title': '《以奋斗者为本》—— 人力资源管理纲要',
            'part': part_name,
            'excerpt': excerpt,
            'markdown': chapter_content,
            'tags': tags,
        })

    return result, parts


def extract_chapters_book3():
    """
    价值为纲 — 章节结构
    All chapters use H2 markers. Has 代序 as intro.
    """
    fname = os.path.join(PROJECT_ROOT, '价值为纲_output', '价值为纲-完整版.md')
    with open(fname, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    chapters = [
        (1, '第一章', '华为公司的经营目的', 188),
        (2, '第二章', '华为竞争战略的财务视角', 474),
        (3, '第三章', '灵活把握不确定性的机会', 986),
        (4, '第四章', '通过战略并购和公司风险投资，增强公司的核心竞争力', 1152),
        (5, '第五章', '加强风险控制与遵从性管理', 1210),
        (6, '第六章', '恰当把握开放、妥协和灰度，正确处理扩张与控制的矛盾', 1464),
        (7, '第七章', '价值管理的指导方针', 1772),
        (8, '第八章', '面向端到端业务流程的财经管理', 2062),
        (9, '第九章', '项目财经管理', 2408),
        (10, '第十章', '健全责任中心管理控制系统', 2648),
        (11, '第十一章', '加强计划、预算、核算体系建设', 2812),
        (12, '第十二章', '账务的服务与监督', 3030),
        (13, '第十三章', '资金管理', 3148),
        (14, '第十四章', '税务管理', 3322),
        (15, '第十五章', '内控与内审', 3442),
        (16, '第十六章', '迈向数字化的财经管理', 3790),
        (17, '第十七章', '推动财经管理的流程化和职业化', 3936),
    ]

    # Also need 代序 (prologue)
    prologue = {
        'ch_num': 0,
        'slug': '价值为纲-代序',
        'title': '《价值为纲》—— 代序',
        'full_title': '代序',
        'book_slug': '价值为纲',
        'book_title': '《价值为纲》—— 财经管理纲要',
        'part': '',
        'start_line': 64,
        'end_line': 182,
    }

    parts = {1: '上篇：扩张与控制', 2: '下篇：价值管理'}
    chapter_parts = {1:1, 2:1, 3:1, 4:1, 5:1, 6:1, 7:2, 8:2, 9:2, 10:2, 11:2, 12:2, 13:2, 14:2, 15:2, 16:2, 17:2}

    chapter_tags = {
        1: ['长期增长', '经营目的', '企业生存'],
        2: ['竞争战略', '战略投入', '全球化'],
        3: ['不确定性', '机会', '技术创新'],
        4: ['战略并购', '投资', '核心竞争力'],
        5: ['风险控制', '合规', '业务连续性'],
        6: ['扩张与控制', '灰度', '平衡'],
        7: ['价值管理', '管理体系', '规则'],
        8: ['端到端流程', 'OTC', 'IPD', '财经管理'],
        9: ['项目管理', '项目四算', '经营'],
        10: ['责任中心', '利润中心', '经营机制'],
        11: ['计划预算', '核算', '弹性预算'],
        12: ['账务', '服务监督', '会计'],
        13: ['资金管理', '资本架构', '资金安全'],
        14: ['税务管理', '合规纳税'],
        15: ['内控', '内审', '流程内控', '风险'],
        16: ['数字化财经', '数据', '智能化'],
        17: ['财经职业化', '流程化', '业务财务融合'],
    }

    result = []

    # Prologue
    plines = lines[prologue['start_line'] - 1:prologue['end_line'] - 1]
    excerpt_parts = []
    for line in plines[:15]:
        stripped = line.strip()
        if stripped and not stripped.startswith('#') and not stripped.startswith('!['):
            excerpt_parts.append(stripped)
            if len(''.join(excerpt_parts)) > 150:
                break
    prologue['excerpt'] = ''.join(excerpt_parts)[:200]
    prologue['markdown'] = ''.join(plines)
    prologue['tags'] = ['财经管理', '华为管理', '长期增长']
    result.append(prologue)

    # Chapters
    for i, (ch_num, ch_label, ch_title, start_line) in enumerate(chapters):
        if i < len(chapters) - 1:
            end_line = chapters[i + 1][3]
        else:
            end_line = len(lines)

        content_lines = lines[start_line - 1:end_line - 1]

        tags = list(set(
            ['财经管理', '华为管理'] + chapter_tags.get(ch_num, [])
        ))

        excerpt_parts = []
        for line in content_lines[:20]:
            stripped = line.strip()
            if stripped and not stripped.startswith('#') and not stripped.startswith('!['):
                excerpt_parts.append(stripped)
                if len(''.join(excerpt_parts)) > 150:
                    break
        excerpt = ''.join(excerpt_parts)[:200]

        chapter_content = ''.join(content_lines)

        part_name = parts.get(chapter_parts.get(ch_num, 1), '')

        result.append({
            'ch_num': ch_num,
            'slug': f'价值为纲-{ch_label}',
            'title': f'《价值为纲》—— {ch_label} {ch_title}',
            'full_title': f'{ch_label} {ch_title}',
            'book_slug': '价值为纲',
            'book_title': '《价值为纲》—— 财经管理纲要',
            'part': part_name,
            'excerpt': excerpt,
            'markdown': chapter_content,
            'tags': tags,
        })

    return result, parts


def md_to_html(markdown_text):
    """Convert markdown to HTML, filtering images and cleaning up."""
    # Remove image references
    text = re.sub(r'!\[.*?\]\(.*?\)', '', markdown_text)
    # Remove standalone URLs
    text = re.sub(r'^\s*https?://\S+\s*$', '', text, flags=re.MULTILINE)

    html = md.render(text)

    # Clean up empty paragraphs
    html = re.sub(r'<p>\s*</p>', '', html)

    return html


def generate_chapter_json(chapter, book_info, all_chapters=None):
    """
    Generate a complete Document JSON for a chapter.
    `all_chapters` is a list of chapter dicts for sibling navigation.
    """
    md_content = chapter['markdown']

    # Extract clean HTML
    html = md_to_html(md_content)

    # Build chapters list for navigation
    chapters_list = []
    if all_chapters:
        chapters_list = [c['slug'] for c in sorted(all_chapters, key=lambda x: x['ch_num'])]

    # Build the complete document
    doc = {
        'slug': chapter['slug'],
        'title': chapter['title'],
        'year': 0,
        'filename': f'{chapter["slug"]}.md',
        'excerpt': chapter['excerpt'],
        'html': html,
        'tags': chapter['tags'],
        'category': '管理思想丛书',
        'isTopic': True,
        'metadata': {
            'book': chapter['book_title'],
            'bookSlug': chapter['book_slug'],
            'chapterNumber': chapter['ch_num'],
            'part': chapter['part'],
            'fullTitle': chapter['full_title'],
            'chapters': chapters_list,
        }
    }
    return doc


def generate_toc_html(book_info, parts, chapters, preface_title='序言'):
    """
    Generate TOC portal HTML for the parent book page.
    `chapters` is a list of dicts with slug, full_title, part, ch_num.
    """
    html_parts = []
    html_parts.append(f'<h2>内容简介</h2>')
    html_parts.append(f'<p>{book_info["description"]}</p>')

    # TOC by parts
    html_parts.append('<h2>目录</h2>')

    # Group chapters by parts
    from collections import OrderedDict
    part_order = list(OrderedDict.fromkeys(ch['part'] for ch in chapters if ch['part']))

    for part_name in part_order:
        part_chs = [ch for ch in chapters if ch['part'] == part_name]
        html_parts.append(f'<h3>{part_name}</h3>')
        html_parts.append('<ul>')
        for ch in part_chs:
            html_parts.append(
                f'<li><a href="/article/{ch["slug"]}">{ch["full_title"]}</a></li>'
            )
        html_parts.append('</ul>')

    # Chapters without a part (prologue, etc.)
    no_part = [ch for ch in chapters if not ch['part']]
    if no_part:
        for ch in no_part:
            html_parts.append(f'<p><a href="/article/{ch["slug"]}">→ {ch["full_title"]}</a></p>')

    return '\n'.join(html_parts)


def update_parent_book(book_slug, toc_html, chapter_list):
    """Update the parent book JSON with TOC HTML and chapter navigation."""
    doc_path = os.path.join(BOOKS_DIR, f'{book_slug}.json')
    with open(doc_path, 'r', encoding='utf-8') as f:
        doc = json.load(f)

    # Update HTML with TOC
    doc['html'] = toc_html

    # Add metadata for chapter nav
    doc['metadata'] = {
        'totalChapters': len([c for c in chapter_list if c.ch_num > 0]),
        'chapters': [c.slug for c in chapter_list],
    }

    with open(doc_path, 'w', encoding='utf-8') as f:
        json.dump(doc, f, ensure_ascii=False, indent=2)
    print(f'  Updated parent book: {book_slug}.json')


# ========== Chapter content metadata for TOC ==========

BOOK_METADATA = [
    {
        'book_slug': '以客户为中心',
        'description': '本书系统阐述了华为\"以客户为中心\"的核心价值观在业务管理中的落地。从客户价值主张、质量管理、\"深淘滩低作堰\"的商业模式，到长期有效增长、聚焦主航道、管理变革，全面揭示了华为业务管理的理念、战略与机制。',
    },
    {
        'book_slug': '以奋斗者为本',
        'description': '华为公司管理者培训教材，系统阐述了华为人力资源管理的核心理念：价值创造、价值评价、价值分配、干部政策、灰度哲学。揭示了华为如何通过独特的人力资源体系激发奋斗者、培养干部、构建可持续的组织活力。',
    },
    {
        'book_slug': '价值为纲',
        'description': '传承于《华为公司基本法》，系统阐述了华为的财经管理理念。以\"价值为纲\"为核心，从扩张与控制、价值管理两大维度，揭示了华为如何通过财经管理体系支撑长期有效增长。',
    },
]


def update_index(index_path, new_docs, parent_book_slugs):
    """Update index.json with new chapter entries."""
    if not os.path.exists(index_path):
        print(f'  WARNING: index.json not found at {index_path}')
        return

    with open(index_path, 'r', encoding='utf-8') as f:
        idx = json.load(f)

    # Remove old chapter entries for these books (if script re-run)
    chapter_slugs = {d['slug'] for d in new_docs}
    idx['topics'] = [t for t in idx['topics'] if t['slug'] not in chapter_slugs]
    idx['topics'] = [t for t in idx['topics'] if t['category'] != '管理思想丛书']

    # Add new topic entries
    parent_topics = []
    for slug in parent_book_slugs:
        with open(os.path.join(BOOKS_DIR, f'{slug}.json'), 'r', encoding='utf-8') as f:
            doc = json.load(f)
        parent_topics.append({
            'slug': doc['slug'],
            'title': doc['title'],
            'tags': doc['tags'],
            'category': doc['category'],
        })

    # Remove old document entries that match chapter slugs or parent books
    idx['documents'] = [
        d for d in idx['documents']
        if d['slug'] not in chapter_slugs and d['slug'] not in parent_book_slugs
    ]

    # Add parent books first
    for parent in parent_topics:
        # Re-read the full doc to get complete info
        with open(os.path.join(BOOKS_DIR, f'{parent["slug"]}.json'), 'r', encoding='utf-8') as f:
            doc = json.load(f)
        idx['documents'].append({
            'slug': doc['slug'],
            'title': doc['title'],
            'year': doc['year'],
            'tags': doc['tags'],
            'category': doc['category'],
            'isTopic': doc['isTopic'],
            'filename': doc['filename'],
        })
        # Add to topics
        idx['topics'].append(parent)

    # Add chapters
    for d in new_docs:
        idx['documents'].append({
            'slug': d['slug'],
            'title': d['title'],
            'year': d['year'],
            'tags': d['tags'],
            'category': d['category'],
            'isTopic': d['isTopic'],
            'filename': d['filename'],
        })
        # Also add to topics
        idx['topics'].append({
            'slug': d['slug'],
            'title': d['title'],
            'tags': d['tags'],
            'category': d['category'],
        })

    # Update total
    idx['total'] = len(idx['documents'])

    # Update allTags
    all_tag_set = set()
    for d in idx['documents']:
        for t in d.get('tags', []):
            if t:
                all_tag_set.add(t)
    idx['allTags'] = sorted(all_tag_set)

    # Update years
    year_set = set()
    for d in idx['documents']:
        y = d.get('year', 0)
        if y > 0:
            year_set.add(y)
    idx['years'] = sorted(year_set)

    with open(index_path, 'w', encoding='utf-8') as f:
        json.dump(idx, f, ensure_ascii=False, indent=2)
    print(f'  Updated index.json: total={idx["total"]}, topics={len(idx["topics"])}, allTags={len(idx["allTags"])}')


def update_search_index(search_path, new_docs, parent_book_slugs):
    """Update search-index.json with new chapter entries."""
    if not os.path.exists(search_path):
        print(f'  WARNING: search-index.json not found at {search_path}')
        return

    with open(search_path, 'r', encoding='utf-8') as f:
        search_idx = json.load(f)

    # Remove old entries for these books/chapters
    chapter_slugs = {d['slug'] for d in new_docs}
    remove_slugs = chapter_slugs | set(parent_book_slugs)
    search_idx = [d for d in search_idx if d['slug'] not in remove_slugs]

    # Re-add parent books
    for slug in parent_book_slugs:
        with open(os.path.join(BOOKS_DIR, f'{slug}.json'), 'r', encoding='utf-8') as f:
            doc = json.load(f)
        search_idx.append({
            'slug': doc['slug'],
            'title': doc['title'],
            'year': doc['year'],
            'excerpt': doc['excerpt'],
            'tags': doc['tags'],
            'category': doc['category'],
            'isTopic': doc['isTopic'],
        })

    # Add chapters
    for d in new_docs:
        search_idx.append({
            'slug': d['slug'],
            'title': d['title'],
            'year': d['year'],
            'excerpt': d['excerpt'],
            'tags': d['tags'],
            'category': d['category'],
            'isTopic': d['isTopic'],
        })

    with open(search_path, 'w', encoding='utf-8') as f:
        json.dump(search_idx, f, ensure_ascii=False, indent=2)
    print(f'  Updated search-index.json: {len(search_idx)} entries')


def main():
    os.makedirs(BOOKS_DIR, exist_ok=True)

    # Extract chapters from each book
    extractors = [
        ('以客户为中心', extract_chapters_book1),
        ('以奋斗者为本', extract_chapters_book2),
        ('价值为纲', extract_chapters_book3),
    ]

    all_new_docs = []
    book_toc_data = {}

    for book_slug, extractor in extractors:
        print(f'\n=== Processing {book_slug} ===')
        chapters, parts = extractor()

        book_info = next((b for b in BOOK_METADATA if b['book_slug'] == book_slug), None)
        if not book_info:
            print(f'  WARNING: No metadata for {book_slug}')
            continue

        # Generate JSON files for each chapter
        generated = []
        for ch in chapters:
            doc = generate_chapter_json(ch, book_info, chapters)
            fname = os.path.join(BOOKS_DIR, f'{doc["slug"]}.json')
            with open(fname, 'w', encoding='utf-8') as f:
                json.dump(doc, f, ensure_ascii=False, indent=2)
            print(f'  Created: {doc["slug"]}.json ({len(doc["html"])} chars)')
            generated.append(ch)

        # Build TOC HTML for parent book
        toc_chapters = [
            {
                'slug': ch['slug'],
                'full_title': ch['full_title'],
                'part': ch['part'],
                'ch_num': ch['ch_num'],
            }
            for ch in chapters
        ]
        toc_html = generate_toc_html(book_info, parts, toc_chapters)

        # Update parent book JSON
        doc_path = os.path.join(BOOKS_DIR, f'{book_slug}.json')
        with open(doc_path, 'r', encoding='utf-8') as f:
            parent_doc = json.load(f)
        parent_doc['html'] = toc_html
        parent_doc['metadata'] = {
            'totalChapters': sum(1 for ch in toc_chapters if ch['ch_num'] > 0),
            'chapters': [ch['slug'] for ch in toc_chapters],
        }
        with open(doc_path, 'w', encoding='utf-8') as f:
            json.dump(parent_doc, f, ensure_ascii=False, indent=2)
        print(f'  Updated parent: {book_slug}.json')

        # Track for index update
        all_new_docs.extend([generate_chapter_json(ch, book_info, chapters) for ch in chapters])
        book_toc_data[book_slug] = chapters

    # Update index.json
    print('\n=== Updating index.json ===')
    parent_slugs = ['以客户为中心', '以奋斗者为本', '价值为纲']
    update_index(INDEX_PATH, all_new_docs, parent_slugs)

    # Update search-index.json
    print('\n=== Updating search-index.json ===')
    update_search_index(SEARCH_INDEX_PATH, all_new_docs, parent_slugs)

    print('\n=== Done! ===')
    print(f'Total chapters generated: {len(all_new_docs)}')


if __name__ == '__main__':
    main()
