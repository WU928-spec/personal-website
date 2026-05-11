# Obsidian 集成

**完成时间：** 2026-04-27

## 项目概述
将 Obsidian 作为我的配置中心和知识库，实现双向同步。

## 核心决策
1. **配置位置：** Obsidian Vault/openclaw/ 文件夹
2. **同步方式：** 软链接到 ~/.openclaw/workspace/
3. **权限规则：** 只能写入 openclaw/，其他文件夹只读

## 文件结构
```
openclaw/
├── SOUL.md       ← 灵魂与性格
├── AGENTS.md     ← 工作规则
├── USER.md       ← 用户信息
├── IDENTITY.md   ← 身份定义
├── TOOLS.md      ← 工具配置
├── MEMORY.md     ← 记忆
├── HEARTBEAT.md  ← 心跳任务
├── INDEX.md      ← 索引页
└── README.md     ← 说明文档
```

## Obsidian CLI
- **版本：** v0.2.3
- **安装：** brew install yakitrak/yakitrak/obsidian-cli
- **默认 vault：** Obsidian Vault

## 权限规则（AGENTS.md 中定义）
- ✅ 可读取整个 Obsidian vault
- ✅ 只可写入 openclaw/ 文件夹
- ❌ 禁止修改其他文件夹的笔记

## 备注
- 软链接实现双向同步
- 用户可以在 Obsidian 直接编辑我的配置
- 重启后配置生效
