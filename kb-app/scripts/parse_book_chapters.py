#!/usr/bin/env python3
"""
parse_book_chapters.py — 解析8本管理思想丛书 markdown，按章节生成独立 JSON 文档文件
"""

import json, re, os, sys
from collections import OrderedDict
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

def extract_plain_text(md, max_len=1500):
    """Strip markdown formatting, return plain text (for full-text search index)."""
    clean = re.sub(r'^#+\s+.*$', '', md, flags=re.MULTILINE)
    clean = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', clean)
    clean = re.sub(r'\[\[([^\]]+)\]\]', r'\1', clean)
    clean = re.sub(r'>\s*(.*)', r'\1', clean, flags=re.MULTILINE)
    clean = re.sub(r'```[\s\S]*?```', '', clean)
    clean = re.sub(r'[#*`=\[\]|~]', '', clean)
    clean = re.sub(r'\n{2,}', '\n', clean)
    clean = clean.strip()
    if len(clean) > max_len:
        clean = clean[:max_len]
    return clean

def extract_chapters_book1():
    """以客户为中心 — 章节结构"""
    fname = os.path.join(PROJECT_ROOT, '以客户为中心_output', '以客户为中心-完整版.md')
    with open(fname, 'r', encoding='utf-8') as f:
        lines = f.readlines()

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

    parts = {1: '第一篇 以客户为中心', 2: '第二篇 增长', 3: '第三篇 效率'}
    chapter_parts = {1:1,2:1,3:1,4:1,5:1,6:2,7:2,8:2,9:2,10:2,11:2,12:2,13:3,14:3,15:3,16:3,17:3}

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
        end_line = chapters[i + 1][3] if i < len(chapters) - 1 else len(lines)
        content_lines = lines[start_line - 1:end_line - 1]

        tags = list(set(['华为管理', '业务管理'] + chapter_tags.get(ch_num, [])))

        excerpt_parts = []
        for line in content_lines[:20]:
            stripped = line.strip()
            if stripped and not stripped.startswith('#') and not stripped.startswith('!['):
                excerpt_parts.append(stripped)
                if len(''.join(excerpt_parts)) > 150:
                    break
        excerpt = ''.join(excerpt_parts)[:200]

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
            'markdown': ''.join(content_lines),
            'tags': tags,
        })

    return result, parts


def extract_chapters_book2():
    """以奋斗者为本 — 章节结构"""
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
        end_line = chapters[i + 1][3] if i < len(chapters) - 1 else len(lines)
        content_lines = lines[start_line - 1:end_line - 1]
        tags = list(set(['华为管理', '人力资源管理'] + chapter_tags.get(ch_num, [])))

        excerpt_parts = []
        for line in content_lines[:20]:
            stripped = line.strip()
            if stripped and not stripped.startswith('#') and not stripped.startswith('!['):
                excerpt_parts.append(stripped)
                if len(''.join(excerpt_parts)) > 150:
                    break
        excerpt = ''.join(excerpt_parts)[:200]

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
            'markdown': ''.join(content_lines),
            'tags': tags,
        })

    return result, parts


def extract_chapters_book3():
    """价值为纲 — 章节结构"""
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

    for i, (ch_num, ch_label, ch_title, start_line) in enumerate(chapters):
        end_line = chapters[i + 1][3] if i < len(chapters) - 1 else len(lines)
        content_lines = lines[start_line - 1:end_line - 1]
        tags = list(set(['财经管理', '华为管理'] + chapter_tags.get(ch_num, [])))

        excerpt_parts = []
        for line in content_lines[:20]:
            stripped = line.strip()
            if stripped and not stripped.startswith('#') and not stripped.startswith('!['):
                excerpt_parts.append(stripped)
                if len(''.join(excerpt_parts)) > 150:
                    break
        excerpt = ''.join(excerpt_parts)[:200]

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
            'markdown': ''.join(content_lines),
            'tags': tags,
        })

    return result, parts


def extract_chapters_book4():
    """
    下一个倒下的会不会是华为 — 章节结构
    引子 + 9章正文
    """
    fname = os.path.join(PROJECT_ROOT, '下一个倒下的会不会是华为_output', '下一个倒下的会不会是华为-完整版.md')
    with open(fname, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Chapter entries: (ch_num, label, title, start_line_1based)
    chapters = [
        (0, '引子', '企业管理哲学：华为成功的神秘力量', 216),
        (1, '第一章', '常识·真理：以客户为中心', 412),
        (2, '第二章', '常识·真理：以奋斗者为本', 708),
        (3, '第三章', '开放：顺应者兴，逆则衰', 988),
        (4, '第四章', '妥协：丛林中的生存之道', 1356),
        (5, '第五章', '灰度理论：凝聚十万知识分子', 1636),
        (6, '第六章', '自我批判：恐惧造就伟大', 1914),
        (7, '第七章', '变革：渐进与激进', 2370),
        (8, '第八章', '战略："战"靠勇气，"略"靠智慧', 2702),
        (9, '第九章', '均衡：力量，弹性，规则', 3014),
    ]

    # Parts (no formal parts in this book, group into major themes)
    parts = {1: '第一篇 核心价值观', 2: '第二篇 管理哲学', 3: '第三篇 变革与战略'}
    chapter_parts = {0:1, 1:1, 2:1, 3:2, 4:2, 5:2, 6:3, 7:3, 8:3, 9:3}

    chapter_tags = {
        0: ['引子', '华为成功', '管理哲学', '企业基因'],
        1: ['以客户为中心', '客户价值', '常识'],
        2: ['以奋斗者为本', '奋斗文化', '人力资源'],
        3: ['开放', '全球化', '学习型组织'],
        4: ['妥协', '灰度', '生存之道'],
        5: ['灰度理论', '知识分子', '组织管理'],
        6: ['自我批判', '耗散结构', '组织纠偏'],
        7: ['变革', '渐进', '改良'],
        8: ['战略', '聚焦', '竞争'],
        9: ['均衡', '系统思维', '企业哲学'],
    }

    result = []
    for i, (ch_num, ch_label, ch_title, start_line) in enumerate(chapters):
        end_line = chapters[i + 1][3] if i < len(chapters) - 1 else 3290  # before 后记
        content_lines = lines[start_line - 1:end_line - 1]

        tags = list(set(['华为管理', '企业哲学'] + chapter_tags.get(ch_num, [])))

        excerpt_parts = []
        for line in content_lines[:20]:
            stripped = line.strip()
            if stripped and not stripped.startswith('#') and not stripped.startswith('!['):
                excerpt_parts.append(stripped)
                if len(''.join(excerpt_parts)) > 150:
                    break
        excerpt = ''.join(excerpt_parts)[:200]

        # Build label for chapter (引子 has special label)
        slug_label = ch_label if ch_num > 0 else '引子'
        part_name = parts.get(chapter_parts.get(ch_num, 1), '')
        result.append({
            'ch_num': ch_num,
            'slug': f'下一个倒下的会不会是华为-{slug_label}',
            'title': f'《下一个倒下的会不会是华为》—— {ch_label} {ch_title}',
            'full_title': f'{ch_label} {ch_title}',
            'book_slug': '下一个倒下的会不会是华为',
            'book_title': '《下一个倒下的会不会是华为》—— 田涛、吴春波',
            'part': part_name,
            'excerpt': excerpt,
            'markdown': ''.join(content_lines),
            'tags': tags,
        })

    return result, parts


def extract_chapters_book5():
    """
    为客户服务是华为存在的唯一理由 — 章节结构
    序言 + 前言 + 14章（3篇）
    """
    fname = os.path.join(PROJECT_ROOT, '为客户服务_output', '为客户服务-完整版.md')
    with open(fname, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Chapter boundaries: (ch_num, label, title, start_line)
    chapters = [
        (0, '序言', '序言', 40),
        (0, '前言', '前言', 51),
        (1, '第1章', '为客户服务是华为存在的唯一理由', 91),
        (2, '第2章', '华为的价值主张', 227),
        (3, '第3章', '华为的发展理念', 397),
        (4, '第4章', '客户满意是衡量一切工作的准绳', 655),
        (5, '第5章', '以客户需求为导向', 803),
        (6, '第6章', '深刻理解客户需求', 942),
        (7, '第7章', '华为的发展指导方针', 1038),
        (8, '第8章', '以一定利润率水平的成长作为企业发展的评价标准', 1448),
        (9, '第9章', '未来的竞争是管理的竞争', 1578),
        (10, '第10章', '建立以客户为中心、以生存为底线的管理体系', 1637),
        (11, '第11章', '从端到端，以最简单、最有效的方式实现流程贯通', 1897),
        (12, '第12章', '建设满足客户需求的流程化组织', 1981),
        (13, '第13章', '持续优化和改进', 2045),
        (14, '第14章', '以核心竞争力的提升作为管理进步的考核验收依据', 2141),
    ]

    parts = {
        1: '第一篇 以客户为中心',
        2: '第二篇 产品发展的路标是客户需求导向',
        3: '第三篇 企业管理的目标是流程化组织建设',
    }
    # ch_num -> part mapping
    chapter_parts_map = {0: 1, 1: 1, 2: 1, 3: 1, 4: 1, 5: 2, 6: 2, 7: 2, 8: 2, 9: 3, 10: 3, 11: 3, 12: 3, 13: 3, 14: 3}

    chapter_tags = {
        0: ['序言', '以客户为中心', '核心价值观'],
        1: ['前言', '编著说明', '全书导读'],
        2: ['客户服务', '企业生存', '客户需求'],
        3: ['价值主张', '客户观', '服务理念'],
        4: ['发展理念', '深淘滩', '产业生态'],
        5: ['客户满意', '衡量标准', '服务质量'],
        6: ['客户需求导向', '技术导向', '需求驱动'],
        7: ['客户需求', '深刻理解', '需求分析'],
        8: ['发展方针', '指导原则', '战略制定'],
        9: ['利润率', '成长', '评价标准'],
        10: ['管理竞争', '管理体系', '管理进步'],
        11: ['管理体系', '以生存为底线', '流程化'],
        12: ['端到端', '流程贯通', '流程建设'],
        13: ['流程化组织', '组织建设', '流程化'],
        14: ['持续改进', '优化', '管理进步'],
    }

    result = []
    for i, (ch_num, ch_label, ch_title, start_line) in enumerate(chapters):
        end_line = chapters[i + 1][3] if i < len(chapters) - 1 else 2181  # before 本篇小结
        content_lines = lines[start_line - 1:end_line - 1]

        tags = list(set(['华为管理', '业务管理'] + chapter_tags.get(ch_num, ['以客户为中心'])))

        excerpt_parts = []
        for line in content_lines[:20]:
            stripped = line.strip()
            if stripped and not stripped.startswith('#') and not stripped.startswith('!['):
                excerpt_parts.append(stripped)
                if len(''.join(excerpt_parts)) > 150:
                    break
        excerpt = ''.join(excerpt_parts)[:200]

        part_name = parts.get(chapter_parts_map.get(ch_num, 1), '')

        # Determine slug label
        if ch_num == 0 and ch_label == '序言':
            slug_label = '序言'
        elif ch_num == 0 and ch_label == '前言':
            slug_label = '前言'
        else:
            slug_label = ch_label

        result.append({
            'ch_num': ch_num,
            'slug': f'为客户服务-{slug_label}',
            'title': f'《为客户服务是华为存在的唯一理由》—— {ch_label} {ch_title}',
            'full_title': f'{ch_label} {ch_title}',
            'book_slug': '为客户服务',
            'book_title': '《为客户服务是华为存在的唯一理由》—— 夏忠毅',
            'part': part_name,
            'excerpt': excerpt,
            'markdown': ''.join(content_lines),
            'tags': tags,
        })

    return result, parts


def extract_chapters_book6():
    """
    熵减：华为活力之源 — 按4大篇划分章节
    序言 + 理论探索篇 + 业务实践篇 + 百家争鸣篇
    """
    fname = os.path.join(PROJECT_ROOT, '熵减_output', '熵减-完整版.md')
    with open(fname, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # (ch_num, label, title, start_line)
    chapters = [
        (1, '序言', '熵减的过程是痛苦的，前途是光明的', 66),
        (2, '理论探索篇', '华为之熵，光明之矢', 84),
        (3, '业务实践篇', '数字化与流程变革实践', 1268),
        (4, '百家争鸣篇', '热力学第二定律与耗散结构', 2261),
    ]

    parts = {1: '序言', 2: '第一部分 理论探索篇', 3: '第二部分 业务实践篇', 4: '第三部分 百家争鸣篇'}
    chapter_parts = {1: 1, 2: 2, 3: 3, 4: 4}

    chapter_tags = {
        1: ['熵减', '耗散结构', '任正非', '组织活力'],
        2: ['理论探索', '热力学第二定律', '开放系统', '组织兴亡'],
        3: ['业务实践', '数字化转型', '流程变革', 'GTS'],
        4: ['百家争鸣', '热力学', '熵', '管理哲学'],
    }

    # End boundaries (next chapter start or file end)
    end_boundaries = {0: 66, 1: 84, 2: 1268, 3: 2261, 4: 2770}

    result = []
    for i, (ch_num, ch_label, ch_title, start_line) in enumerate(chapters):
        end_line = chapters[i + 1][2] if i < len(chapters) - 1 else 2770
        # end_line here is the label of the next chapter, which is wrong
        # Fix: use end_boundaries
        end_line = end_boundaries.get(ch_num + 1, 2770)
        content_lines = lines[start_line - 1:end_line - 1]

        tags = list(set(['华为管理', '组织活力', '熵减'] + chapter_tags.get(ch_num, [])))

        excerpt_parts = []
        for line in content_lines[:20]:
            stripped = line.strip()
            if stripped and not stripped.startswith('#') and not stripped.startswith('!['):
                excerpt_parts.append(stripped)
                if len(''.join(excerpt_parts)) > 150:
                    break
        excerpt = ''.join(excerpt_parts)[:200]

        part_name = parts.get(chapter_parts.get(ch_num, 1), '')

        result.append({
            'ch_num': ch_num,
            'slug': f'熵减-{ch_label}',
            'title': f'《熵减：华为活力之源》—— {ch_label}',
            'full_title': ch_label,
            'book_slug': '熵减',
            'book_title': '《熵减：华为活力之源》—— 华为大学',
            'part': part_name,
            'excerpt': excerpt,
            'markdown': ''.join(content_lines),
            'tags': tags,
        })

    return result, parts


def extract_chapters_book7():
    """
    质量为纲 — 按主题章节划分
    8个章节，涵盖质量价值观、文化、机制、研发、制造、生态、战略、组织等
    """
    fname = os.path.join(PROJECT_ROOT, '质量为纲_output', '质量为纲-完整版.md')
    with open(fname, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # (ch_num, label, title, start_line)
    chapters = [
        (1, '第一章', '质量价值观', 119),
        (2, '第二章', '质量文化', 237),
        (3, '第三章', '质量管理机制', 353),
        (4, '第四章', '市场拓展与产品研发', 498),
        (5, '第五章', '采购供应与生产制造', 719),
        (6, '第六章', '产业生态与交付服务', 895),
        (7, '第七章', '战略质量与经营质量', 1099),
        (8, '第八章', '组织、人才与平台质量', 1311),
    ]

    parts = {1: '上篇：质量理念与文化', 2: '中篇：质量管理实践', 3: '下篇：质量战略与平台'}
    chapter_parts = {1: 1, 2: 1, 3: 1, 4: 2, 5: 2, 6: 2, 7: 3, 8: 3}

    # End boundaries for each chapter
    end_lines_map = {1: 237, 2: 353, 3: 498, 4: 719, 5: 895, 6: 1099, 7: 1311, 8: 2218}

    chapter_tags = {
        1: ['质量价值观', '质量理念', '质量优先'],
        2: ['质量文化', '自我批判', '持续改进'],
        3: ['管理机制', 'ISO9000', '全面质量管理'],
        4: ['市场营销', '产品研发', '客户服务'],
        5: ['采购供应', '生产制造', '优质优价'],
        6: ['产业生态', '交付服务', '标准贡献'],
        7: ['战略质量', '经营质量', '风险内控'],
        8: ['组织质量', '人才质量', '平台质量', 'IT系统'],
    }

    result = []
    for i, (ch_num, ch_label, ch_title, start_line) in enumerate(chapters):
        end_line = end_lines_map.get(ch_num, len(lines))
        content_lines = lines[start_line - 1:end_line - 1]

        tags = list(set(['华为管理', '质量管理'] + chapter_tags.get(ch_num, [])))

        excerpt_parts = []
        for line in content_lines[:20]:
            stripped = line.strip()
            if stripped and not stripped.startswith('#') and not stripped.startswith('!['):
                excerpt_parts.append(stripped)
                if len(''.join(excerpt_parts)) > 150:
                    break
        excerpt = ''.join(excerpt_parts)[:200]

        part_name = parts.get(chapter_parts.get(ch_num, 1), '')
        result.append({
            'ch_num': ch_num,
            'slug': f'质量为纲-{ch_label}',
            'title': f'《质量为纲》—— {ch_label} {ch_title}',
            'full_title': f'{ch_label} {ch_title}',
            'book_slug': '质量为纲',
            'book_title': '《质量为纲：华为公司质量理念与实践》—— 田涛 主编',
            'part': part_name,
            'excerpt': excerpt,
            'markdown': ''.join(content_lines),
            'tags': tags,
        })

    return result, parts


def extract_chapters_book8():
    """
    从偶然到必然：华为研发投资与管理实践 — 9章正文
    """
    fname = os.path.join(PROJECT_ROOT, '从偶然到必然_output', '从偶然到必然：华为研发投资与管理实践 (夏忠毅).md')
    with open(fname, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # (ch_num, label, title, start_line_1based)
    chapters = [
        (1, '第1章', 'IPD的价值', 323),
        (2, '第2章', '投资组合管理', 452),
        (3, '第3章', '结构化流程与项目管理', 1080),
        (4, '第4章', '研发能力及其管理', 1521),
        (5, '第5章', '创新与技术开发', 2117),
        (6, '第6章', '产品数据及其管理', 2457),
        (7, '第7章', '质量管理', 2847),
        (8, '第8章', '成本管理', 3225),
        (9, '第9章', '变革管理和持续改进', 3454),
    ]

    # Natural end boundaries for each chapter (start of next chapter or end of file)
    end_boundaries = {1: 452, 2: 1080, 3: 1521, 4: 2117, 5: 2457, 6: 2847, 7: 3225, 8: 3454, 9: len(lines)}

    parts = {}
    chapter_parts = {}

    chapter_tags = {
        1: ['IPD', '研发管理', '集成产品开发', '管理体系'],
        2: ['投资组合', '产品管理', 'Charter', '商业设计'],
        3: ['结构化流程', '项目管理', 'IPD流程', '敏捷开发'],
        4: ['研发能力', '平台战略', '异步开发', '架构设计'],
        5: ['创新', '技术开发', '知识产权', '不确定性管理'],
        6: ['产品数据', 'BOM', '数据管理', '配置管理'],
        7: ['质量管理', '质量文化', '一次性把事情做对'],
        8: ['成本管理', '成本竞争力', '价值工程'],
        9: ['变革管理', '持续改进', 'IPD推行', 'TPM'],
    }

    result = []
    for i, (ch_num, ch_label, ch_title, start_line) in enumerate(chapters):
        end_line = end_boundaries.get(ch_num, len(lines))
        content_lines = lines[start_line - 1:end_line - 1]

        tags = list(set(['华为管理', '研发管理', 'IPD'] + chapter_tags.get(ch_num, [])))

        excerpt_parts = []
        for line in content_lines[:20]:
            stripped = line.strip()
            if stripped and not stripped.startswith('#') and not stripped.startswith('!['):
                excerpt_parts.append(stripped)
                if len(''.join(excerpt_parts)) > 150:
                    break
        excerpt = ''.join(excerpt_parts)[:200]

        result.append({
            'ch_num': ch_num,
            'slug': f'从偶然到必然-{ch_label}',
            'title': f'《从偶然到必然》—— {ch_label} {ch_title}',
            'full_title': f'{ch_label} {ch_title}',
            'book_slug': '从偶然到必然',
            'book_title': '《从偶然到必然》—— 华为研发投资与管理实践',
            'part': '',
            'excerpt': excerpt,
            'markdown': ''.join(content_lines),
            'tags': tags,
        })

    return result, parts


def md_to_html(markdown_text):
    """Convert markdown to HTML, filtering images and cleaning up."""
    text = re.sub(r'!\[.*?\]\(.*?\)', '', markdown_text)
    text = re.sub(r'^\s*https?://\S+\s*$', '', text, flags=re.MULTILINE)
    html = md.render(text)
    html = re.sub(r'<p>\s*</p>', '', html)
    return html


def generate_chapter_json(chapter, book_info, all_chapters=None):
    """Generate a complete Document JSON for a chapter."""
    md_content = chapter['markdown']
    html = md_to_html(md_content)
    text = extract_plain_text(md_content)

    chapters_list = []
    if all_chapters:
        chapters_list = [c['slug'] for c in sorted(all_chapters, key=lambda x: x['ch_num'])]

    doc = {
        'slug': chapter['slug'],
        'title': chapter['title'],
        'year': 0,
        'filename': f'{chapter["slug"]}.md',
        'excerpt': chapter['excerpt'],
        'text': text,
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
    """Generate TOC portal HTML for the parent book page."""
    html_parts = []
    html_parts.append(f'<h2>内容简介</h2>')
    html_parts.append(f'<p>{book_info["description"]}</p>')
    html_parts.append('<h2>目录</h2>')

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

    no_part = [ch for ch in chapters if not ch['part']]
    if no_part:
        for ch in no_part:
            html_parts.append(f'<p><a href="/article/{ch["slug"]}">→ {ch["full_title"]}</a></p>')

    return '\n'.join(html_parts)


def create_parent_json(book_slug, title, description, tags):
    """Create a parent book JSON if it doesn't exist."""
    doc_path = os.path.join(BOOKS_DIR, f'{book_slug}.json')
    if os.path.exists(doc_path):
        return

    doc = {
        'slug': book_slug,
        'title': title,
        'year': 0,
        'filename': f'{book_slug}.md',
        'excerpt': description[:200],
        'html': f'<h2>内容简介</h2>\n<p>{description}</p>',
        'tags': tags,
        'category': '管理思想丛书',
        'isTopic': True,
        'metadata': {
            'totalChapters': 0,
            'chapters': [],
        }
    }
    with open(doc_path, 'w', encoding='utf-8') as f:
        json.dump(doc, f, ensure_ascii=False, indent=2)
    print(f'  Created parent: {book_slug}.json')


# ========== Chapter content metadata for TOC ==========

BOOK_METADATA = [
    {
        'book_slug': '以客户为中心',
        'description': '本书系统阐述了华为"以客户为中心"的核心价值观在业务管理中的落地。从客户价值主张、质量管理、"深淘滩低作堰"的商业模式，到长期有效增长、聚焦主航道、管理变革，全面揭示了华为业务管理的理念、战略与机制。',
    },
    {
        'book_slug': '以奋斗者为本',
        'description': '华为公司管理者培训教材，系统阐述了华为人力资源管理的核心理念：价值创造、价值评价、价值分配、干部政策、灰度哲学。揭示了华为如何通过独特的人力资源体系激发奋斗者、培养干部、构建可持续的组织活力。',
    },
    {
        'book_slug': '价值为纲',
        'description': '传承于《华为公司基本法》，系统阐述了华为的财经管理理念。以"价值为纲"为核心，从扩张与控制、价值管理两大维度，揭示了华为如何通过财经管理体系支撑长期有效增长。',
    },
    {
        'book_slug': '下一个倒下的会不会是华为',
        'description': '本书由两大资深华为观察者田涛、吴春波历时6年创作，深度揭示了华为的兴衰逻辑与任正非的管理哲学。从以客户为中心、以奋斗者为本的核心价值观，到开放、妥协、灰度的管理哲学，全面剖析了华为成功背后的思想力量。',
    },
    {
        'book_slug': '为客户服务',
        'description': '本书系统阐述了华为"以客户为中心"核心价值观的形成与实践。由华为轮值董事长徐直军亲自审定，基于华为干部高级管理研讨班培训教材编写，聚焦华为经营发展理念、方针、思想方法和管理原则。',
    },
    {
        'book_slug': '熵减',
        'description': '任正非将热力学第二定律的"熵"概念引入企业管理，形成独特的华为活力管理哲学。本书收录了华为大学关于熵减机制的理论探索、业务实践和百家争鸣文章，揭示了华为如何通过开放、自我批判激发组织活力。',
    },
    {
        'book_slug': '质量为纲',
        'description': '华为质量管理的系统性总结，涵盖从质量价值观、质量文化到全流程质量管理的完整体系。揭示了华为如何将"质量优先"战略贯穿到企业经营管理方方面面，实现全员、全过程、全价值链的质量管理。',
    },
    {
        'book_slug': '从偶然到必然',
        'description': '本书系统阐述了华为研发投资与管理实践，涵盖IPD（集成产品开发）体系的核心理念、流程与方法。从投资组合管理、结构化流程、研发能力建设，到创新管理、质量管理、成本管理及变革管理，全面揭示了华为如何构建可复制、持续稳定高质量的研发管理体系。',
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

    chapter_slugs = {d['slug'] for d in new_docs}
    remove_slugs = chapter_slugs | set(parent_book_slugs)
    search_idx = [d for d in search_idx if d['slug'] not in remove_slugs]

    for slug in parent_book_slugs:
        with open(os.path.join(BOOKS_DIR, f'{slug}.json'), 'r', encoding='utf-8') as f:
            doc = json.load(f)
        search_idx.append({
            'slug': doc['slug'],
            'title': doc['title'],
            'year': doc['year'],
            'excerpt': doc['excerpt'],
            'text': doc.get('text', ''),
            'tags': doc['tags'],
            'category': doc['category'],
            'isTopic': doc['isTopic'],
        })

    for d in new_docs:
        search_idx.append({
            'slug': d['slug'],
            'title': d['title'],
            'year': d['year'],
            'excerpt': d['excerpt'],
            'text': d.get('text', ''),
            'tags': d['tags'],
            'category': d['category'],
            'isTopic': d['isTopic'],
        })

    with open(search_path, 'w', encoding='utf-8') as f:
        json.dump(search_idx, f, ensure_ascii=False, indent=2)
    print(f'  Updated search-index.json: {len(search_idx)} entries')


def main():
    os.makedirs(BOOKS_DIR, exist_ok=True)

    # Ensure parent JSONs exist for all books
    parent_defaults = {
        '下一个倒下的会不会是华为': {
            'title': '《下一个倒下的会不会是华为》—— 田涛、吴春波',
            'description': '300多万字华为内外部文献，100多万字背景资料，与华为10多年近距离接触，6年创作，两大资深华为观察者的倾力之作！颠覆所有外界对于华为的认识，研究华为及任正非的教案级著述。',
            'tags': ['华为管理', '企业哲学', '组织变革', '管理思想'],
        },
        '为客户服务': {
            'title': '《为客户服务是华为存在的唯一理由》—— 夏忠毅',
            'description': '本书聚焦于华为为什么要把以客户为中心作为核心价值观，以及多年践行以客户为中心而形成的华为经营发展理念、方针、思想方法和管理原则等。',
            'tags': ['华为管理', '客户价值', '业务管理', '管理思想'],
        },
        '熵减': {
            'title': '《熵减：华为活力之源》—— 华为大学',
            'description': '任正非将物理学、人性和哲学理念直接引入企业管理中，成就了华为独特的思想文化、价值观和发展战略。熵和生命活力，就像两支时间之矢，一头拖拽着我们进入无穷的黑暗，一头拉扯着我们走向永恒的光明。',
            'tags': ['华为管理', '组织活力', '熵减', '管理思想'],
        },
        '质量为纲': {
            'title': '《质量为纲：华为公司质量理念与实践》—— 田涛 主编',
            'description': '质量不仅是客户的需求，也是我们的责任。经过30多年的质量文化建设和质量管理实践，华为将"质量优先"的战略贯穿到了企业经营管理的方方面面，这是公司持续生存与发展的基石。',
            'tags': ['华为管理', '质量管理', '质量文化', '管理思想'],
        },
        '从偶然到必然': {
            'title': '《从偶然到必然》—— 华为研发投资与管理实践',
            'description': '本书系统阐述了华为研发投资与管理实践，涵盖IPD（集成产品开发）体系的核心理念、流程与方法。从投资组合管理、结构化流程、研发能力建设，到创新管理、质量管理、成本管理及变革管理，全面揭示了华为如何构建可复制、持续稳定高质量的研发管理体系，实现从"偶然成功"到"必然成功"的转变。',
            'tags': ['华为管理', '研发管理', 'IPD', '管理思想'],
        },
    }
    for slug, info in parent_defaults.items():
        create_parent_json(slug, info['title'], info['description'], info['tags'])

    # Extract chapters from each book
    extractors = [
        ('以客户为中心', extract_chapters_book1),
        ('以奋斗者为本', extract_chapters_book2),
        ('价值为纲', extract_chapters_book3),
        ('下一个倒下的会不会是华为', extract_chapters_book4),
        ('为客户服务', extract_chapters_book5),
        ('熵减', extract_chapters_book6),
        ('质量为纲', extract_chapters_book7),
        ('从偶然到必然', extract_chapters_book8),
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

        all_new_docs.extend([generate_chapter_json(ch, book_info, chapters) for ch in chapters])
        book_toc_data[book_slug] = chapters

    # Update index.json
    print('\n=== Updating index.json ===')
    parent_slugs = ['以客户为中心', '以奋斗者为本', '价值为纲',
                    '下一个倒下的会不会是华为', '为客户服务', '熵减', '质量为纲',
                    '从偶然到必然']
    update_index(INDEX_PATH, all_new_docs, parent_slugs)

    # Update search-index.json
    print('\n=== Updating search-index.json ===')
    update_search_index(SEARCH_INDEX_PATH, all_new_docs, parent_slugs)

    print('\n=== Done! ===')
    print(f'Total chapters generated: {len(all_new_docs)}')


if __name__ == '__main__':
    main()
