#!/usr/bin/env python3
"""
create_parent_jsons.py — Create parent book JSON files for the 4 new books
so the extraction script can update them with TOC content later.
"""

import json, os, re
from markdown_it import MarkdownIt

PROJECT_ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
BOOKS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'data', 'documents')

md = MarkdownIt()

def md_to_html(markdown_text):
    text = re.sub(r'!\[.*?\]\(.*?\)', '', markdown_text)
    text = re.sub(r'^\s*https?://\S+\s*$', '', text, flags=re.MULTILINE)
    html = md.render(text)
    html = re.sub(r'<p>\s*</p>', '', html)
    return html

def create_parent(slug, title, combined_file, excerpt, tags, description):
    """Create a parent book JSON file if it doesn't already exist."""
    fpath = os.path.join(BOOKS_DIR, f'{slug}.json')
    if os.path.exists(fpath):
        print(f'  Already exists: {slug}.json')
        return

    # Read full combined markdown
    with open(combined_file, 'r', encoding='utf-8') as f:
        content = f.read()

    html = md_to_html(content)
    # Truncate HTML to first ~5000 chars for initial version (will be updated by main script)
    html_preview = html[:5000]

    doc = {
        'slug': slug,
        'title': title,
        'year': 0,
        'filename': f'{slug}.md',
        'excerpt': excerpt,
        'html': f'<h2>内容简介</h2>\n<p>{description}</p>\n{html_preview}',
        'tags': tags,
        'category': '管理思想丛书',
        'isTopic': True,
        'metadata': {
            'totalChapters': 0,
            'chapters': [],
        }
    }

    with open(fpath, 'w', encoding='utf-8') as f:
        json.dump(doc, f, ensure_ascii=False, indent=2)
    print(f'  Created: {slug}.json')


def main():
    os.makedirs(BOOKS_DIR, exist_ok=True)

    books = [
        {
            'slug': '下一个倒下的会不会是华为',
            'title': '《下一个倒下的会不会是华为》—— 田涛、吴春波',
            'combined_file': os.path.join(PROJECT_ROOT, '下一个倒下的会不会是华为_output', '下一个倒下的会不会是华为-完整版.md'),
            'excerpt': '本书由两大资深华为观察者田涛、吴春波历时6年创作，深度揭示了华为的兴衰逻辑与任正非的管理哲学。从以客户为中心、以奋斗者为本的核心价值观，到开放、妥协、灰度的管理哲学，全面剖析了华为成功背后的思想力量。',
            'description': '300多万字华为内外部文献，100多万字背景资料，与华为10多年近距离接触，6年创作。颠覆所有外界对于华为的认识，研究华为及任正非的教案级著述。',
            'tags': ['华为管理', '企业哲学', '组织变革', '管理思想'],
        },
        {
            'slug': '为客户服务',
            'title': '《为客户服务是华为存在的唯一理由》—— 夏忠毅',
            'combined_file': os.path.join(PROJECT_ROOT, '为客户服务_output', '为客户服务-完整版.md'),
            'excerpt': '本书系统阐述了华为"以客户为中心"核心价值观的形成与实践。由华为轮值董事长徐直军亲自审定，基于华为干部高级管理研讨班培训教材编写，聚焦华为经营发展理念、方针、思想方法和管理原则。',
            'description': '本书聚焦于华为为什么要把以客户为中心作为核心价值观，以及多年践行以客户为中心而形成的华为经营发展理念、方针、思想方法和管理原则等，不采用内部文件拼凑的表现形式，使之更具有逻辑性、可读性和通俗性。',
            'tags': ['华为管理', '客户价值', '业务管理', '管理思想'],
        },
        {
            'slug': '熵减',
            'title': '《熵减：华为活力之源》—— 华为大学',
            'combined_file': os.path.join(PROJECT_ROOT, '熵减_output', '熵减-完整版.md'),
            'excerpt': '任正非将热力学第二定律的"熵"概念引入企业管理，形成独特的华为活力管理哲学。本书收录了华为大学关于熵减机制的理论探索、业务实践和百家争鸣文章，揭示了华为如何通过开放、自我批判激发组织活力。',
            'description': '任正非将物理学、人性和哲学理念直接引入企业管理中，成就了华为独特的思想文化、价值观和发展战略。熵和生命活力，就像两支时间之矢，一头拖拽着我们进入无穷的黑暗，一头拉扯着我们走向永恒的光明。',
            'tags': ['华为管理', '组织活力', '熵减', '管理思想'],
        },
        {
            'slug': '质量为纲',
            'title': '《质量为纲：华为公司质量理念与实践》—— 田涛 主编',
            'combined_file': os.path.join(PROJECT_ROOT, '质量为纲_output', '质量为纲-完整版.md'),
            'excerpt': '华为质量管理的系统性总结，涵盖从质量价值观、质量文化到全流程质量管理的完整体系。揭示了华为如何将"质量优先"战略贯穿到企业经营管理方方面面，实现全员、全过程、全价值链的质量管理。',
            'description': '质量不仅是客户的需求，也是我们的责任。经过30多年的质量文化建设和质量管理实践，华为将"质量优先"的战略贯穿到了企业经营管理的方方面面，这是公司持续生存与发展的基石。',
            'tags': ['华为管理', '质量管理', '质量文化', '管理思想'],
        },
    ]

    for book in books:
        print(f'\n=== {book["slug"]} ===')
        if not os.path.exists(book['combined_file']):
            print(f'  WARNING: Combined file not found at {book["combined_file"]}')
            continue
        create_parent(**book)


if __name__ == '__main__':
    main()
