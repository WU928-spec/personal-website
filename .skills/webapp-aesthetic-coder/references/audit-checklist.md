# 设计系统审计 — 扫描脚本

## 字号违规扫描

```bash
# 字号硬编码
rg 'text-\[(0\.7|0\.75|0\.875|1|1\.125|1\.25|1\.5|2|2\.5|3)rem\]' app/src --type tsx

# 未使用 design system 字号
rg 'text-xs[^-]|text-sm[^-]|text-lg[^-]|text-xl[^-]|text-2xl[^-]' app/src --type tsx
```

## 间距违规扫描

```bash
# 非 8 倍数间距
rg '[^a-zA-Z](p-3|px-3|py-3|gap-3|mb-3|mt-3|space-y-3)[^a-zA-Z]' app/src --type tsx
rg 'pb-20|pt-20' app/src --type tsx
```

## 颜色违规扫描

```bash
# 硬编码颜色
rg 'text-\[rgba|bg-\[rgba|border-\[rgba|text-\[#' app/src --type tsx
rg 'bg-\[rgba|bg-\[#' app/src --type tsx
rg 'border-\[rgba|border-\[#' app/src --type tsx
```

## 装饰效果扫描

```bash
# backdrop-blur
rg 'backdrop-blur' app/src --type tsx
# 自定义 shadow glow
rg 'shadow-\[0_0|hover:shadow-\[0_0' app/src --type tsx
# 自定义渐变背景中的装饰
rg 'from-[^/]+/\d+ to-[^/]+/\d+.*blur' app/src --type tsx
```

## 圆角违规扫描

```bash
rg 'rounded-full' app/src --type tsx
rg 'rounded-2xl' app/src --type tsx
rg 'rounded-\[4px' app/src --type tsx
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
