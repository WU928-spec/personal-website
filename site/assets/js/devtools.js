export function parseGitCommand(input) {
  const parts = input.trim().split(/\s+/)
  if (parts[0] !== 'git') return null
  const action = parts[1]
  if (['init', 'status', 'log'].includes(action)) return { action }
  if (action === 'add') return { action, target: parts[2] || '.' }
  if (action === 'commit') return { action, message: parts.slice(3).join(' ') }
  if (action === 'branch') return { action, name: parts[2] || 'branch' }
  if (['checkout', 'switch', 'merge'].includes(action)) return { action, name: parts[2] || 'main' }
  return null
}

export function parseCondaCommand(input) {
  const parts = input.trim().split(/\s+/)
  if (parts[0] !== 'conda') return null
  const action = parts[1]
  if (action === 'env' && parts[2] === 'list') return { action: 'list' }
  if (['create', 'activate', 'install', 'remove', 'uninstall'].includes(action)) {
    const name = parts.at(-1)
    return parts.length > 2 && !name.startsWith('-') ? { action, name } : null
  }
  if (action === 'deactivate') return { action }
  return null
}

if (typeof document !== 'undefined') {
  const input = document.getElementById('dev-command')
  const output = document.getElementById('dev-output')
  let branch = 'main'
  let environment = 'base'
  const commits = ['Initial commit']
  document.getElementById('dev-run')?.addEventListener('click', () => {
    const value = input?.value || ''
    const git = parseGitCommand(value)
    const conda = parseCondaCommand(value)
    let message = '不支持的命令。这里只模拟白名单 Git/Conda 命令，不会执行系统操作。'
    if (git) {
      if (git.action === 'init') message = '已初始化模拟 Git 仓库。'
      else if (git.action === 'add') message = `已暂存 ${git.target}。`
      else if (git.action === 'commit') { commits.push(git.message || 'New commit'); message = `已提交：${commits.at(-1)}。` }
      else if (git.action === 'branch') { branch = git.name; message = `已创建分支 ${branch}。` }
      else if (git.action === 'checkout' || git.action === 'switch') { branch = git.name; message = `已切换到 ${branch}。` }
      else if (git.action === 'merge') message = `已将 ${git.name} 合并到 ${branch}。`
      else message = `当前分支：${branch}\n${commits.join('\n')}`
    } else if (conda) {
      if (conda.action === 'create' || conda.action === 'activate') environment = conda.name
      else if (conda.action === 'deactivate') environment = 'base'
      message = `当前 Conda 环境：${environment}\n模拟操作：${conda.action} ${conda.name || ''}`
    }
    if (output) output.textContent = message
  })
}
