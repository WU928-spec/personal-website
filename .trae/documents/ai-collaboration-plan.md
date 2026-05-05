# Trae + Kimi Code 混合协作模式（已确认）

## 模式：C. 混合模式

**大任务**：任务队列 - 我拆分并行任务，Kimi Code 按队列执行
**小优化**：我直接修

---

## 任务队列系统

### 文件结构
```
.trae/
├── tasks/              ← 我写，Kimi Code 读
│   ├── STATUS.md       ← 双方读写：任务状态板
│   ├── task-001.md     ← 待执行任务
│   ├── task-002.md
│   └── ...
├── results/            ← Kimi Code 写，我读
│   ├── task-001-done.md
│   └── ...
└── documents/          ← 方案文档（只读参考）
    └── obsidian-complete-integration.md
```

### 你的操作（极简）

| 什么时候 | 对谁说 | 说什么 |
|---------|--------|--------|
| 启动一个大功能 | 我 | "开始 Obsidian 集成，拆任务" |
| 等我拆完后 | Kimi Code | "执行 .trae/tasks/ 中的下一个任务" |
| 等它完成后 | 我 | "审查" |
| 小问题 | 我 | 直接说需求，我立即修 |

**你不需要复制粘贴任何代码或指令。**

---

## STATUS.md 格式

```markdown
# 任务状态板
> 最后更新: 2026-05-04

| 编号 | 任务 | 状态 | 执行者 |
|------|------|------|--------|
| 001 | 实现 linkParser 反向链接 | ⏳ 待执行 | Kimi Code |
| 002 | 完善 Backlinks 组件 | ⏳ 待执行 | Kimi Code |
| 003 | BlogPost 集成 Backlinks | ⏳ 待执行 | Kimi Code |
| 004 | GraphView 知识图谱 | ⏳ 待执行 | Kimi Code |
| — | 审查 001-003 | — | Trae |
| — | Obsidian Sync Server | — | Trae（直接做） |
```

### 状态流转
```
⏳ 待执行 → 🔄 执行中 → ✅ 完成 → 👀 待审查 → ✔️ 已通过
```

---

## Kimi Code 的启动指令（只说一次）

```
你是施工队角色。我会把任务写在 .trae/tasks/ 文件夹里。
请按以下规则工作：

1. 先读 .trae/tasks/STATUS.md 找到第一个 ⏳待执行 的任务
2. 读那个任务文件，理解需求
3. 执行实现（只改指定的文件，不碰禁止修改的文件）
4. 完成后在 .trae/results/ 创建对应完成报告
5. 更新 STATUS.md 状态为 ✅完成
6. git commit 并 push

每次我说“继续”，你执行下一个任务。
```

---

## 首次任务：Obsidian 反向链接功能

我现在就开始拆分任务。完成后告诉你，你对 Kimi Code 说一句启动指令，它就自动干活了。
