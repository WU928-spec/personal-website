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
  if (action === 'list') return { action: 'list' }
  if (action === 'env' && parts[2] === 'list') return { action: 'list' }
  if (action === 'env' && ['remove', 'delete'].includes(parts[2])) {
    const nameIndex = Math.max(parts.indexOf('-n'), parts.indexOf('--name'))
    const name = nameIndex >= 0 ? parts[nameIndex + 1] : parts[3]
    return name && !name.startsWith('-') ? { action: 'delete', name } : null
  }
  if (action === 'create') {
    const nameIndex = Math.max(parts.indexOf('-n'), parts.indexOf('--name'))
    const name = nameIndex >= 0 ? parts[nameIndex + 1] : parts[2]
    if (!name || name.startsWith('-')) return null
    const packages = parts.slice(nameIndex >= 0 ? nameIndex + 2 : 3).filter((part) => !part.startsWith('-'))
    return packages.length > 0 ? { action, name, packages } : { action, name }
  }
  if (action === 'activate') {
    const name = parts[2]
    return name && !name.startsWith('-') ? { action, name } : null
  }
  if (['install', 'remove', 'uninstall'].includes(action)) {
    const packages = parts.slice(2).filter((part) => !part.startsWith('-'))
    return packages.length > 0 ? { action, packages } : null
  }
  if (action === 'deactivate') return { action }
  return null
}

if (typeof document !== 'undefined') {
  const input = document.getElementById('dev-command')
  const output = document.getElementById('dev-output')
  let branch = 'main'
  let environment = 'base'
  const environments = new Map([['base', ['numpy', 'pandas', 'matplotlib']]])
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
      if (conda.action === 'create') {
        if (environments.has(conda.name)) message = `环境 ${conda.name} 已存在。`
        else {
          environments.set(conda.name, conda.packages || [])
          message = `已创建环境 ${conda.name}。`
        }
      } else if (conda.action === 'activate') {
        if (!environments.has(conda.name)) message = `环境 ${conda.name} 不存在。`
        else {
          environment = conda.name
          message = `已激活环境 ${environment}。`
        }
      } else if (conda.action === 'deactivate') {
        environment = 'base'
        message = '已退出到 base 环境。'
      } else if (conda.action === 'install') {
        const packages = environments.get(environment)
        environments.set(environment, [...new Set([...packages, ...conda.packages])])
        message = `已在 ${environment} 中安装：${conda.packages.join('、')}。`
      } else if (conda.action === 'remove' || conda.action === 'uninstall') {
        const remaining = environments.get(environment).filter((item) => !conda.packages.includes(item))
        environments.set(environment, remaining)
        message = `已从 ${environment} 中移除：${conda.packages.join('、')}。`
      } else if (conda.action === 'delete') {
        if (conda.name === 'base') message = '不能删除 base 环境。'
        else if (!environments.has(conda.name)) message = `环境 ${conda.name} 不存在。`
        else {
          environments.delete(conda.name)
          if (environment === conda.name) environment = 'base'
          message = `已删除环境 ${conda.name}。`
        }
      } else if (conda.action === 'list') {
        const envList = [...environments.keys()].map((name) => `${name === environment ? '*' : ' '} ${name}`).join('\n')
        const packages = environments.get(environment).join('、') || '无'
        message = `环境列表：\n${envList}\n\n${environment} 中的包：${packages}`
      }
    }
    if (output) output.textContent = message
  })
}
