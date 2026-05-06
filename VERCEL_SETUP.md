# Vercel 部署配置指南

## 第 1 步：获取 Project ID 和 Org ID

### 方法 A：通过 Vercel CLI（推荐）

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 进入项目目录，链接到 Vercel
vercel --cwd ./app

# 按提示操作，链接完成后会生成 .vercel/project.json
```

链接完成后，查看生成的文件：
```bash
cat ./app/.vercel/project.json
```

输出类似：
```json
{
  "orgId": "team_xxxxxxxxxxxxxxxx",
  "projectId": "prj_xxxxxxxxxxxxxxxx"
}
```

- `orgId` → 对应 GitHub Secrets 的 `ORG_ID`
- `projectId` → 对应 GitHub Secrets 的 `PROJECT_ID`

### 方法 B：通过 Vercel 网站

1. 打开 [vercel.com/dashboard](https://vercel.com/dashboard)
2. 点击 **Add New...** → **Project**
3. Import Git Repository → 选择 `WU928-spec/personal-website`
4. 创建项目后，进入 **Project Settings** → **General**
5. 页面底部找到 **Project ID** 和 **Team ID**（个人用户 Team ID 通常是 `user_xxx`）

## 第 2 步：配置 GitHub Secrets

1. 打开 GitHub 仓库 → **Settings** → **Secrets and variables** → **Actions**
2. 点击 **New repository secret**，依次添加：

| Secret 名称 | 值 |
|------------|-----|
| `VERCEL_TOKEN` | 你刚才获取的 Vercel token |
| `ORG_ID` | Vercel 的 orgId / Team ID |
| `PROJECT_ID` | Vercel 的 projectId |

## 第 3 步：切换回 Vercel 部署（可选）

如果你希望用 Vercel 部署替代 GitHub Pages，把 `.github/workflows/deploy.yml` 改回 Vercel 配置即可。
