import { useState, useMemo } from 'react'
import type { AdminUser } from '../../types'
import { usePagination } from '../../utils/hooks'
import Reveal from '../../components/Reveal'

// Mock data
const MOCK_USERS: AdminUser[] = [
  { id: '1', name: '张明远', email: 'zhangmy@huawei.com', role: '管理员', status: '启用', created: '2024-01-15', lastLogin: '2025-06-13 09:22' },
  { id: '2', name: '李思涵', email: 'lish@huawei.com', role: '编辑', status: '启用', created: '2024-02-20', lastLogin: '2025-06-12 14:35' },
  { id: '3', name: '王启航', email: 'wangqh@huawei.com', role: '访客', status: '启用', created: '2024-03-08', lastLogin: '2025-06-10 11:02' },
  { id: '4', name: '陈雅文', email: 'chenyw@huawei.com', role: '编辑', status: '启用', created: '2024-03-22', lastLogin: '2025-06-13 16:48' },
  { id: '5', name: '刘朝阳', email: 'liuzy@huawei.com', role: '访客', status: '禁用', created: '2024-04-11', lastLogin: '2025-05-28 08:15' },
  { id: '6', name: '赵思远', email: 'zhaosy@huawei.com', role: '管理员', status: '启用', created: '2024-05-05', lastLogin: '2025-06-13 10:30' },
  { id: '7', name: '孙婉清', email: 'sunwq@huawei.com', role: '编辑', status: '禁用', created: '2024-05-19', lastLogin: '2025-06-01 17:44' },
  { id: '8', name: '周国平', email: 'zhougp@huawei.com', role: '访客', status: '启用', created: '2024-06-02', lastLogin: '2025-06-12 09:05' },
  { id: '9', name: '吴明辉', email: 'wumh@huawei.com', role: '编辑', status: '启用', created: '2024-06-28', lastLogin: '2025-06-11 14:20' },
  { id: '10', name: '郑雨桐', email: 'zhengyt@huawei.com', role: '访客', status: '启用', created: '2024-07-14', lastLogin: '2025-06-09 11:33' },
  { id: '11', name: '林浩宇', email: 'linhy@huawei.com', role: '管理员', status: '禁用', created: '2024-08-01', lastLogin: '2025-05-15 16:00' },
  { id: '12', name: '黄思琪', email: 'huangsq@huawei.com', role: '编辑', status: '启用', created: '2024-08-20', lastLogin: '2025-06-13 08:12' },
  { id: '13', name: '马骏飞', email: 'majf@huawei.com', role: '访客', status: '启用', created: '2024-09-05', lastLogin: '2025-06-10 15:55' },
  { id: '14', name: '高以宁', email: 'gaoyn@huawei.com', role: '编辑', status: '启用', created: '2024-09-28', lastLogin: '2025-06-12 10:18' },
  { id: '15', name: '何文博', email: 'hewb@huawei.com', role: '访客', status: '禁用', created: '2024-10-10', lastLogin: '2025-04-22 13:40' },
  { id: '16', name: '罗佳琪', email: 'luojq@huawei.com', role: '编辑', status: '启用', created: '2024-10-25', lastLogin: '2025-06-13 07:55' },
  { id: '17', name: '许志远', email: 'xuzzy@huawei.com', role: '管理员', status: '启用', created: '2024-11-12', lastLogin: '2025-06-11 09:30' },
  { id: '18', name: '唐晓琳', email: 'tangxl@huawei.com', role: '访客', status: '禁用', created: '2024-11-30', lastLogin: '2025-05-30 14:22' },
  { id: '19', name: '韩子轩', email: 'hanzx@huawei.com', role: '编辑', status: '启用', created: '2024-12-15', lastLogin: '2025-06-12 16:05' },
  { id: '20', name: '曹梦涵', email: 'caomh@huawei.com', role: '访客', status: '启用', created: '2025-01-02', lastLogin: '2025-06-13 11:45' },
  { id: '21', name: '邓子超', email: 'dengzc@huawei.com', role: '编辑', status: '启用', created: '2025-01-18', lastLogin: '2025-06-10 08:30' },
  { id: '22', name: '冯思雨', email: 'fengsy@huawei.com', role: '访客', status: '启用', created: '2025-02-05', lastLogin: '2025-06-09 15:10' },
  { id: '23', name: '宋明达', email: 'songmd@huawei.com', role: '管理员', status: '禁用', created: '2025-02-22', lastLogin: '2025-06-02 10:00' },
  { id: '24', name: '蒋文婷', email: 'jiangwt@huawei.com', role: '编辑', status: '启用', created: '2025-03-08', lastLogin: '2025-06-13 12:30' },
]

export default function UserManagement() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('全部')
  const [statusFilter, setStatusFilter] = useState<string>('全部')
  const [sortField, setSortField] = useState<keyof AdminUser>('created')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const filtered = useMemo(() => {
    let list = [...MOCK_USERS]

    if (search) {
      const q = search.toLowerCase()
      list = list.filter(u =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      )
    }
    if (roleFilter !== '全部') list = list.filter(u => u.role === roleFilter)
    if (statusFilter !== '全部') list = list.filter(u => u.status === statusFilter)

    list.sort((a, b) => {
      const va = a[sortField] || ''
      const vb = b[sortField] || ''
      const cmp = va.localeCompare(vb, 'zh-CN')
      return sortDir === 'asc' ? cmp : -cmp
    })

    return list
  }, [search, roleFilter, statusFilter, sortField, sortDir])

  const { page, totalPages, items, setPage, pageSize } = usePagination(filtered, 8)

  const toggleSort = (field: keyof AdminUser) => {
    if (sortField === field) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  return (
    <div className="space-y-8">
      <Reveal>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-cream-200">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-ink-800">用户管理</h1>
            <p className="text-sm text-ink-400 mt-1">管理知识库后台用户权限与状态</p>
          </div>
          <button className="btn-primary text-sm">
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            添加用户
          </button>
        </div>
      </Reveal>

      {/* Filters */}
      <Reveal delay={1}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="搜索姓名或邮箱..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="input-field sm:w-32"
          >
            <option value="全部">全部角色</option>
            <option value="管理员">管理员</option>
            <option value="编辑">编辑</option>
            <option value="访客">访客</option>
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="input-field sm:w-32"
          >
            <option value="全部">全部状态</option>
            <option value="启用">启用</option>
            <option value="禁用">禁用</option>
          </select>
        </div>
      </Reveal>

      {/* Summary */}
      <Reveal delay={2}>
        <p className="text-xs text-ink-400">
          共 {filtered.length} 位用户
          {(search || roleFilter !== '全部' || statusFilter !== '全部') && (
            <span className="text-gold-600">（已筛选）</span>
          )}
        </p>
      </Reveal>

      {/* Table (Desktop) */}
      <Reveal delay={2}>
        <div className="hidden md:block card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <SortableHeader label="姓名" field="name" current={sortField} dir={sortDir} onSort={toggleSort} />
                  <SortableHeader label="邮箱" field="email" current={sortField} dir={sortDir} onSort={toggleSort} />
                  <SortableHeader label="角色" field="role" current={sortField} dir={sortDir} onSort={toggleSort} />
                  <SortableHeader label="状态" field="status" current={sortField} dir={sortDir} onSort={toggleSort} />
                  <SortableHeader label="创建时间" field="created" current={sortField} dir={sortDir} onSort={toggleSort} />
                  <th className="px-4 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider bg-cream-100 border-b border-cream-200">
                    最近登录
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-ink-500 uppercase tracking-wider bg-cream-100 border-b border-cream-200">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map(user => (
                  <tr key={user.id}>
                    <td className="px-4 py-3 text-sm font-medium text-ink-800">{user.name}</td>
                    <td className="px-4 py-3 text-sm text-ink-500">{user.email}</td>
                    <td className="px-4 py-3">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-ink-500">{user.created}</td>
                    <td className="px-4 py-3 text-sm text-ink-400">{user.lastLogin}</td>
                    <td className="px-4 py-3 text-right">
                      <button className="btn-ghost text-xs px-2 py-1">编辑</button>
                      <button className="btn-ghost text-xs px-2 py-1 text-red-400 hover:text-red-500">
                        {user.status === '启用' ? '禁用' : '启用'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Reveal>

      {/* Mobile card list */}
      <Reveal delay={2}>
        <div className="md:hidden space-y-3">
          {items.map(user => (
            <div key={user.id} className="card p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-sm font-medium text-ink-800">{user.name}</span>
                  <p className="text-xs text-ink-400 mt-0.5">{user.email}</p>
                </div>
                <StatusBadge status={user.status} />
              </div>
              <div className="flex items-center justify-between text-xs text-ink-400">
                <RoleBadge role={user.role} />
                <span>{user.created}</span>
              </div>
              <div className="flex justify-end gap-2 pt-1 border-t border-cream-100">
                <button className="btn-ghost text-xs px-2 py-1">编辑</button>
                <button className="btn-ghost text-xs px-2 py-1 text-red-400 hover:text-red-500">
                  {user.status === '启用' ? '禁用' : '启用'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Pagination */}
      <Reveal delay={3}>
        <div className="flex items-center justify-between">
          <span className="text-xs text-ink-400">
            第 {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} 条，共 {filtered.length} 条
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
              className="btn-ghost text-xs px-2 py-1 disabled:opacity-30"
            >
              上一页
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum: number
              if (totalPages <= 7) {
                pageNum = i + 1
              } else if (page <= 4) {
                pageNum = i + 1
              } else if (page >= totalPages - 3) {
                pageNum = totalPages - 6 + i
              } else {
                pageNum = page - 3 + i
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-8 h-8 text-xs rounded-lg transition-all duration-200 ${
                    pageNum === page
                      ? 'bg-ink-800 text-cream-50 font-medium'
                      : 'text-ink-500 hover:bg-cream-100'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
              className="btn-ghost text-xs px-2 py-1 disabled:opacity-30"
            >
              下一页
            </button>
          </div>
        </div>
      </Reveal>
    </div>
  )
}

// Sub-components
function SortableHeader({ label, field, current, dir, onSort }: {
  label: string; field: keyof AdminUser; current: string; dir: 'asc' | 'desc'; onSort: (f: keyof AdminUser) => void
}) {
  const active = current === field
  return (
    <th
      className="px-4 py-3 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider bg-cream-100 border-b border-cream-200 cursor-pointer select-none hover:bg-cream-200 transition-colors"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        {active && (
          <svg className={`w-3 h-3 transition-transform duration-200 ${dir === 'desc' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        )}
      </div>
    </th>
  )
}

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    '管理员': 'bg-gold-400/10 text-gold-600',
    '编辑': 'bg-blue-50 text-blue-600',
    '访客': 'bg-cream-100 text-ink-500',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[role] || 'bg-cream-100 text-ink-500'}`}>
      {role}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${
      status === '启用'
        ? 'bg-green-50 text-green-600'
        : 'bg-red-50 text-red-400'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        status === '启用' ? 'bg-green-500' : 'bg-red-400'
      }`} />
      {status}
    </span>
  )
}
