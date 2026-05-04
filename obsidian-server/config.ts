import path from 'path'
import os from 'os'

export interface ServerConfig {
  vaultPath: string
  port: number
  githubToken: string
  githubRepo: {
    owner: string
    repo: string
  }
  corsOrigin: string
}

function getConfig(): ServerConfig {
  return {
    // Obsidian vault 本地路径
    vaultPath: process.env.OBSIDIAN_VAULT_PATH || path.join(os.homedir(), 'Documents', 'obsidian-vault'),
    // 服务器端口
    port: parseInt(process.env.PORT || '2667', 10),
    // GitHub Personal Access Token (需 repo + workflow 权限)
    githubToken: process.env.GITHUB_TOKEN || '',
    // GitHub 仓库信息
    githubRepo: {
      owner: process.env.GITHUB_OWNER || 'WU928-spec',
      repo: process.env.GITHUB_REPO || 'personal-website',
    },
    // CORS 允许的源
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  }
}

export default getConfig()
