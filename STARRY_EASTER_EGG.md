# 星空彩蛋系统解析

> 本文件是对 `/Users/a123456/Downloads/个人网站vibecoding` 中「星空彩蛋」系统的代码级理解笔记。

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
  brightness: number // 0.1 ~ 1.0，越激动越亮
  image?: string     // 已弃用，向后兼容
  images?: string[]  // Base64 图片数组
}
```

### 4.2 默认数据

`DEFAULT_MEMOIRS` 包含 12 篇文学性短文，例如《第一次看见极光》《海边的告别》《旧书店的老猫》等。每篇对应一颗星星。

### 4.3 坐标生成

**文件**：`app/src/utils/starry.ts`

```ts
export function getStarPos(id: string): { x: string; y: string }
```

- 使用基于 `id` 的伪随机种子：`Math.sin(seed * 127.1) * 43758.5453`
- 同一颗 `id` 的星星位置固定，不会因为刷新而改变
- 会避开屏幕中心区域（防止遮挡文案）

## 五、持久化策略

采用 **Supabase 云端优先 + IndexedDB 本地缓存** 双写架构。

### 5.1 云端存储：Supabase

- 表名：`starry_memoirs`
- 字段：`id`（PK）, `title`, `date`, `content`, `brightness`, `images`（JSONB）, `created_at`, `updated_at`
- 冲突策略：**云端优先**。`getMemoirs()` 优先拉取 Supabase；成功则覆盖本地缓存。Supabase 不可用时回退 IndexedDB / 默认值。
- 写入策略：`saveMemoirs()` 先写 IndexedDB，再后台静默 upsert 到 Supabase；失败不阻塞 UI。

### 5.2 本地缓存：IndexedDB

- 数据库名：`starry-db`
- 对象存储名：`memoirs`
- Key：`data`
- 作为离线兜底和快速读取缓存。

### 5.3 同步 API

| 函数 | 作用 |
|------|------|
| `getMemoirs()` | 云端优先读取，失败回退本地 |
| `saveMemoirs(memoirs)` | 保存本地并后台同步到云端 |
| `resetMemoirs()` | 清空本地和云端，回到默认值 |
| `syncMemoirsToCloud()` | 手动把本地当前数据推送到云端 |

### 5.4 向后兼容

旧版本使用 `localStorage` 的 `starry-memoirs-v1`。启动时会自动迁移到 IndexedDB，然后删除旧 key。

### 5.5 装饰状态

单条页面的特殊装饰状态使用 `localStorage`：
- `starry-glasses-position`：「老夏」页面金丝眼镜的位置和缩放

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
- 支持拖拽模式 / 固定模式切换

### 6.3 控制按钮

| 按钮 | 功能 |
|------|------|
| 返回 | `navigate('/')` 回到首页 |
| 可拖动 / 已固定 | 切换星星是否可拖拽 |
| 管理记忆 | 打开 `MemoirManager` 抽屉 |
| 同步到云端 | 手动把本地记忆推送到 Supabase |
| 观看星轨 | 全屏播放 `/starry-video.mp4` |

### 6.4 星星组件

**文件**：`app/src/components/starry/DraggableStar.tsx`

- 使用 Framer Motion 的 `drag` 实现拖拽
- 点击（非拖拽时）跳转 `/starry/${memoir.id}`
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

## 八、记忆管理器

**文件**：`app/src/components/starry/MemoirManager.tsx`

右侧滑出抽屉，支持：

- 添加新星星
- 编辑标题、日期、亮度、内容、图片
- 删除单条记忆
- 图片上传并自动压缩（`utils/starry.ts` 中的 `compressImage`）
- 重置为默认的 12 颗星星

## 九、样式与动画

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

## 十、彩蛋层级总结

| 层级 | 入口 | 隐藏内容 |
|------|------|----------|
| L1 | 首页 Pluto-Charon 徽章 | `/starry` 星空世界 |
| L2 | 星空中的任意星星 | 单篇记忆详情 |
| L3 | 特定标题「2月26日 凌晨 冬雨」 | `/next-video.mp4` 视频 |
| L3 | 特定标题「老夏」 | 可拖拽缩放的金丝眼镜 |
| 管理 | 「管理记忆」按钮 | 用户可自定义星星内容 |

## 十一、关键文件清单

```
app/supabase_migrations.sql              # Supabase 建表 SQL（含 starry_memoirs）
app/src/App.tsx                          # 路由定义
app/src/data/memoirs.ts                  # 数据模型、本地缓存与云端同步
app/src/utils/starry.ts                  # 坐标生成与图片压缩
app/src/pages/StarryEasterEgg.tsx        # 星空总览页（含同步按钮）
app/src/pages/StarryMemoir.tsx           # 记忆详情页
app/src/components/PlutoCharonBadge.tsx  # 首页入口徽章
app/src/components/starry/DraggableStar.tsx   # 可拖拽星星
app/src/components/starry/MemoirManager.tsx   # 记忆管理抽屉
app/src/components/starry/NebulaField.tsx     # 星云背景
app/src/components/starry/PhotoFrame.tsx      # 照片框
app/src/index.css                        # starPulse、photo-frame、drop-cap
public/starry-bg.jpg                     # 星空背景图
public/starry-video.mp4                  # 星轨视频
public/next-video.mp4                    # 冬雨专属视频
public/golden-glasses.png                # 老夏专属装饰
```
