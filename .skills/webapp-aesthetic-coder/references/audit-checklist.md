# 设计系统审计 — 扫描脚本

> **注意**：优先使用 `rg` (ripgrep)。如果不可用，使用 `grep -r` 替代（已提供降级方案）。

## 兼容性检查

```bash
# 检查是否有 rg
which rg >/dev/null 2>&1 && echo "has rg" || echo "use grep"
```

## 字号违规扫描

**ripgrep (rg)：**
```bash
rg 'text-\[(0\.7|0\.75|0\.875|1|1\.125|1\.25|1\.5|2|2\.5|3)rem\]' app/src --type tsx
rg 'text-xs[^-]|text-sm[^-]|text-lg[^-]|text-xl[^-]|text-2xl[^-]' app/src --type tsx
```

**grep 降级（如果 rg 不可用）：**
```bash
cd app/src && grep -r 'text-\[' --include="*.tsx" | grep -E 'rem' | sort -u
cd app/src && grep -r 'text-xs[^-]' --include="*.tsx" | sort -u
cd app/src && grep -r 'text-sm[^-]' --include="*.tsx" | sort -u
```

## 间距违规扫描

**ripgrep:**
```bash
rg '[^a-zA-Z](p-3|px-3|py-3|gap-3|mb-3|mt-3|space-y-3)[^a-zA-Z]' app/src --type tsx
rg 'pb-20|pt-20' app/src --type tsx
```

**grep:**
```bash
cd app/src && grep -r 'gap-3' --include="*.tsx" | sort -u
cd app/src && grep -r 'p-3[^0-9]' --include="*.tsx" | sort -u
cd app/src && grep -r 'px-3' --include="*.tsx" | sort -u
cd app/src && grep -r 'py-3' --include="*.tsx" | sort -u
cd app/src && grep -r 'mb-3' --include="*.tsx" | sort -u
cd app/src && grep -r 'mt-3' --include="*.tsx" | sort -u
```

## 颜色违规扫描

**ripgrep:**
```bash
rg 'text-\[rgba|bg-\[rgba|border-\[rgba|text-\[#' app/src --type tsx
rg 'bg-\[rgba|bg-\[#' app/src --type tsx
rg 'border-\[rgba|border-\[#' app/src --type tsx
```

**grep:**
```bash
cd app/src && grep -r 'bg-\[rgba\|bg-\[#\|text-\[rgba\|text-\[#\|border-\[rgba\|border-\[#' --include="*.tsx" | sort -u
```

## 装饰效果扫描

**ripgrep:**
```bash
rg 'backdrop-blur' app/src --type tsx
rg 'shadow-\[0_0|hover:shadow-\[0_0' app/src --type tsx
rg 'from-[^/]+/\d+ to-[^/]+/\d+.*blur' app/src --type tsx
```

**grep:**
```bash
cd app/src && grep -r 'backdrop-blur' --include="*.tsx" | sort -u
cd app/src && grep -r 'shadow-\[0_0' --include="*.tsx" | sort -u
```

## 圆角违规扫描

**ripgrep:**
```bash
rg 'rounded-full' app/src --type tsx
rg 'rounded-2xl' app/src --type tsx
rg 'rounded-\[4px' app/src --type tsx
```

**grep:**
```bash
cd app/src && grep -r 'rounded-full' --include="*.tsx" | sort -u
cd app/src && grep -r 'rounded-2xl' --include="*.tsx" | sort -u
```

## 工具页面检查

```bash
# 检查哪些工具页面缺少 BackToTools
cd app/src/pages && grep -L 'BackToTools' TextSegmenter.tsx InternshipDecision.tsx MovieRecommender.tsx
# 如果输出任何文件名，说明该文件缺少 BackToTools
```

## 星空彩蛋过滤

扫描结果中必须排除的文件：

```bash
# 按文件名前缀排除（不修改）
grep -v 'Starry\|starry\|EasterEgg' 
# 或更精确：排除包含 "starry/" 路径的文件
grep -v '/starry/\|/starry'
```

## 未使用变量扫描

```bash
# 检查是否有未使用的 import（构建时会报错）
cd app && npx tsc --noEmit -p tsconfig.app.json
```

## 输出格式

扫描完成后，按此格式生成报告：

```markdown
## 设计系统审计报告

### 违规统计
| 类型 | 文件数 | 样例行 |
|------|-------|-------|
| 字号硬编码 | N | `file.tsx:45` |
| ... | ... | ... |

### 修复建议
1. 批次1：pages/ 级文件（影响最大）
2. 批次2：components/ 公共组件
3. 批次3：components/ui/ + 杂项
```
