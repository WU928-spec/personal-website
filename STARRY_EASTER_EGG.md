# 星空彩蛋系统解析

> 本文件是对 `/Users/a123456/Downloads/个人网站vibecoding` 中「星空彩蛋」系统的代码级理解笔记。当前版本为**纯静态 JSON 架构**，不再依赖数据库。

## 一、整体定位

网站中只有一个完整的「彩蛋」系统：**Starry Easter Egg（星空彩蛋）**。它以独立全屏路由的形式存在，主题取自 **Pluto（冥王星）与 Charon（卡戎）** 的潮汐锁定关系——「一颗心永远朝向它的伴星」。

## 二、入口：Pluto-Charon 徽章

- **文件**：`app/src/components/PlutoCharonBadge.tsx`
- **位置**：首页 `HeroSection.tsx` 标题上方
- **形式**：一个 320×140 的 Canvas 动画按钮
- **画面内容**：
  - 深色背景 + 40 颗闪烁小星星
  - Pluto（大球，带心形图案）与 Charon（小球，带红色北极点）绕共同质心反向旋转
  - 轨道线与两星连线
- **触发**：点击后 `navigate('/starry')` 进入彩蛋

这个徽章本身就是第一个彩蛋入口：首页用户看到一个漂亮的动态星球插画，点击后才会发现隐藏的星空世界。

## 三、路由与页面结构

在 `app/src/App.tsx` 中定义：

```tsx
<Route path="/starry" element={<StarryEasterEgg />} />
<Route path="/starry/:id" element={<StarryMemoir />} />
```

| 路由 | 页面 | 作用 |
|------|------|------|
| `/starry` | `StarryEasterEgg.tsx` | 星空总览，展示所有记忆星星 |
| `/starry/:id` | `StarryMemoir.tsx` | 单颗星星的记忆详情页 |

`/starry*` 被判定为独立全屏页面，**不渲染 `Layout` 导航栏**，但保留全局 `MusicPlayer`。

## 四、数据模型

### 4.1 Memoir 类型

**文件**：`app/src/data/memoirs.ts`

```ts
export interface Memoir {
  id: string
  title: string
  date: string
  content: string
  brightness: number // 当前数据为 1.0（最亮）或 0.05（暗星）
  image?: string     // 已弃用，向后兼容
  images?: string[]  // 图片路径数组
  x?: number         // 0 ~ 100，屏幕宽度百分比
  y?: number         // 0 ~ 100，屏幕高度百分比
}
```

> **彩蛋判定**：`brightness >= 1.0` 的星星被视为「最亮的星」，玩家需要逐一点亮它们。

### 4.2 静态数据源

所有星星数据存放在：

```
app/public/memoirs.json
```

构建时 Vercel 会把它作为静态资源托管，访问路径为 `/memoirs.json`。

**优点**：
- 不需要数据库
- 不需要同步逻辑
- 部署即生效
- 数据在 Git 中有版本控制

**修改方式**：
1. 直接编辑 `app/public/memoirs.json`
2. `git commit && git push`
3. Vercel 自动重新部署

### 4.3 坐标生成

**文件**：`app/src/utils/starry.ts`

```ts
export function getStarPos(
  id: string,
  saved?: { x?: number; y?: number }
): { x: string; y: string }
```

- 如果 `saved.x` / `saved.y` 存在，优先使用保存的位置。
- 否则使用基于 `id` 的伪随机种子：`Math.sin(seed * 127.1) * 43758.5453`
- 同一颗 `id` 的默认位置固定，不会因为刷新而改变
- 会避开屏幕中心区域（防止遮挡文案）

## 五、持久化策略

当前为**纯静态**：

- 数据源：`app/public/memoirs.json`
- 读取方式：页面加载时 `fetch('/memoirs.json')`
- 没有本地缓存，没有云端同步，没有数据库
- 星星位置由 `memoirs.json` 或伪随机种子固定

## 六、星空总览页（`/starry`）

**文件**：`app/src/pages/StarryEasterEgg.tsx`

### 6.1 视觉层

- 全屏深色背景 `bg-[#050508]`
- 背景图 `/starry-bg.jpg`
- 顶部文案：「点击星星，阅读一段光年之外的记忆」
- 底部文案：「在距离太阳 59 亿公里的地方，有一颗心永远朝向它的伴星」

### 6.2 星星层

- 遍历 `memoirs`，每篇渲染一个 `DraggableStar`
- 星星大小、发光强度由 `brightness` 决定
- 点击跳转记忆详情页，不可拖拽

### 6.3 控制按钮

| 按钮 | 功能 |
|------|------|
| 返回 | `navigate('/')` 回到首页 |
| 观看星轨 | 全屏播放 `/starry-video.mp4` |

### 6.4 隐藏告白彩蛋

当用户**点击过所有 `brightness >= 1.0` 的星星**后，会自动触发一个隐藏告白弹窗。

- **数据源**：`app/public/starry-secret.json`
- **进度持久化**：`localStorage` 键名为 `starry-bright-clicked`
- **触发条件**：页面加载时检查当前所有高亮星是否都已在 `localStorage` 中
- **显示方式**：屏幕中央淡入一个半透明毛玻璃卡片，展示 `message` 字段内容
- **关闭方式**：点击卡片外部或右上角 × 关闭；再次触发条件会重新显示

```json
{
  "message": "当你走过所有最亮的星，才发现我一直在这里等你。—— 冥王星"
}
```

修改告白文案只需编辑 `app/public/starry-secret.json`，提交并重新部署即可。

### 6.5 星星组件

**文件**：`app/src/components/starry/DraggableStar.tsx`

- 使用 Framer Motion 渲染星星
- 点击跳转 `/starry/${memoir.id}`，并通知父组件记录点击
- Hover 显示日期 tooltip
- CSS 动画 `starPulse` 实现呼吸发光效果

## 七、记忆详情页（`/starry/:id`）

**文件**：`app/src/pages/StarryMemoir.tsx`

### 7.1 视觉层

- 背景：`NebulaField` Canvas 星云动画（`app/src/components/starry/NebulaField.tsx`）
- 内容区域：日期 + 标题 + 照片框 + 正文
- 正文首字下沉（`.drop-cap`）
- 照片框（`PhotoFrame.tsx`）：拍立得风格，带旋转和图钉阴影

### 7.2 两条特殊内容分支

系统对特定标题的记忆做了「专属彩蛋」：

#### 分支 A：`title === '2月26日 凌晨 冬雨'`

- 正文底部出现「下一页」按钮
- 点击后进入视频页，播放 `/next-video.mp4`
- 这是第二个隐藏层级：某篇记忆背后还藏着一个视频

#### 分支 B：`title === '老夏'`

- 页面右侧出现「金丝眼镜」装饰图 `/golden-glasses.png`
- 可拖拽移动位置
- 可用滚轮缩放大小
- 位置与缩放持久化到 `localStorage`
- 这是第三个隐藏层级：特定人物页面的专属互动装饰

## 八、样式与动画

**文件**：`app/src/index.css`

相关片段：

```css
/* ── Starry Easter Egg ── */
@keyframes starPulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
  50% { transform: translate(-50%, -50%) scale(1.3); opacity: 1; }
}

/* Photo Frame */
.photo-frame-wrapper { ... }
.photo-frame { ... }

/* 首字下沉 */
.drop-cap { ... }
```

## 九、彩蛋层级总结

| 层级 | 入口 | 隐藏内容 |
|------|------|----------|
| L1 | 首页 Pluto-Charon 徽章 | `/starry` 星空世界 |
| L2 | 点击任意星星 | 单篇记忆详情 |
| L3 | 点亮所有最亮的星 | 隐藏告白文字（`starry-secret.json`） |
| L3 | 特定标题「2月26日 凌晨 冬雨」 | `/next-video.mp4` 视频 |
| L3 | 特定标题「老夏」 | 可拖拽缩放的金丝眼镜 |

## 十、关键文件清单

```
app/public/memoirs.json                  # 星星数据（静态 JSON）
app/public/starry-secret.json            # 隐藏告白文字
app/src/App.tsx                          # 路由定义
app/src/data/memoirs.ts                  # 数据模型、静态文件读取、secret 读取
app/src/utils/starry.ts                  # 坐标生成与图片压缩
app/src/pages/StarryEasterEgg.tsx        # 星空总览页
app/src/pages/StarryMemoir.tsx           # 记忆详情页
app/src/components/PlutoCharonBadge.tsx  # 首页入口徽章
app/src/components/starry/DraggableStar.tsx   # 可拖拽星星
app/src/components/starry/NebulaField.tsx     # 星云背景
app/src/components/starry/PhotoFrame.tsx      # 照片框
app/src/index.css                        # starPulse、photo-frame、drop-cap
public/starry-bg.jpg                     # 星空背景图
public/starry-video.mp4                  # 星轨视频
public/next-video.mp4                    # 冬雨专属视频
public/golden-glasses.png                # 老夏专属装饰
```
