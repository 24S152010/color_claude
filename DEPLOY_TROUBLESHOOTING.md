# GitHub Pages 部署问题总结

## 项目背景
将 Color Diary（Vite + React + TypeScript）部署到 GitHub Pages，实现公开访问。

---

## 问题清单与解决方案

### 1. 项目不是 Git 仓库
**现象**：无法执行 `git push`，提示 `fatal: not a git repository`
**解决**：
```bash
git init
git config user.email "your@email.com"
git config user.name "Your Name"
git add .
git commit -m "Initial commit"
```

---

### 2. GitHub CLI (gh) 未安装
**现象**：无法通过命令行创建 GitHub 仓库，`gh: command not found`
**解决**：
```bash
winget install --id GitHub.cli
```
安装后发现当前 shell 的 PATH 未刷新，需要找到完整路径执行：
```bash
"/c/Program Files/GitHub CLI/gh.exe" auth status
```

---

### 3. GitHub CLI 登录超时（网络问题）
**现象**：`gh auth login` 生成设备码后，请求 `https://github.com/login/oauth/access_token` 超时失败
**根因**：当前终端环境未走代理，直连 GitHub 网络不稳定
**解决**：放弃 CLI 登录，改为**手动在 GitHub 网站创建仓库**（浏览器可走代理），然后给我仓库地址，我通过 `git remote add origin` 推送代码

---

### 4. GitHub CLI 登录成功后仍无法使用
**现象**：用户在浏览器完成设备码授权，但 `gh auth status` 仍显示未登录
**根因**：CLI 的网络请求（获取 access_token）超时，token 未成功保存到本地
**解决**：同上，放弃 CLI 方式

---

### 5. Vercel 登录同样失败
**现象**：`npx vercel login` 生成设备码后，`Waiting for authentication...` 超时
**根因**：与 GitHub 相同，终端未走代理
**解决**：放弃 Vercel，改用**GitHub Pages**（代码已在 GitHub 上，无需额外平台登录）

---

### 6. `git push` 网络连接失败
**现象**：
```
fatal: unable to access 'https://github.com/...':
Could not connect to server
Recv failure: Connection was reset
```
**根因**：终端默认不走浏览器代理，国内访问 GitHub 的 443 端口被重置
**解决**：将代理软件（Clash/V2Ray 等）从"规则模式"切换为**"全局模式"**，使系统所有流量（包括终端）都走代理

---

### 7. `git push` 冲突（远程有本地没有的提交）
**现象**：
```
! [rejected] main -> main (fetch first)
Updates were rejected because the remote contains work that you do not have locally
```
**根因**：用户在 GitHub 网站上手动创建了 `.github/workflows/deploy.yml`，远程领先于本地
**解决**：
```bash
git pull origin main --no-rebase
# 解决冲突后
git add .
git commit -m "Merge remote changes"
git push origin main
```

---

### 8. YAML 语法错误导致 Actions 无法运行
**现象**：GitHub 报错 `Invalid workflow file: .github/workflows/deploy.yml#L3`
**根因**：在 GitHub 网页编辑器粘贴时，缩进被破坏（空格/tab 混用，或行首多了空格）
**解决**：在本地写好正确的 YAML 文件，通过 `git push` 推送。关键要点：
- `on:` 必须顶格，前面不能有空格
- 统一使用**空格**缩进（2 个空格），不要用 Tab

---

### 9. `package-lock.json` 与 `package.json` 不同步
**现象**：GitHub Actions 的 `npm ci` 步骤失败，或 build 报 exit code 1
**根因**：本地执行了 `npm install vercel`，但 `package-lock.json` 未正确提交到远程
**解决**：
```bash
rm -rf node_modules package-lock.json
npm install
git add package-lock.json package.json
git commit -m "chore: regenerate package-lock.json"
git push origin main
```

---

### 10. Vite 缺少 `base` 路径配置
**现象**：Actions 构建成功，但打开 `https://username.github.io/repo-name/` 页面空白，控制台报 404
**根因**：GitHub Pages 项目站点的 URL 带有子路径 `/repo-name/`，Vite 默认按根路径 `/` 加载资源
**解决**：修改 `vite.config.ts`：
```ts
export default defineConfig({
  plugins: [react()],
  base: '/color_claude/',  // 仓库名
})
```
或者在 build 命令中传入：
```bash
npm run build -- --base=/color_claude/
```

---

### 11. GitHub Pages Source 设置错误
**现象**：Actions 运行成功但 Pages 没有生成链接
**根因**：GitHub Pages 的 Source 默认是 "Deploy from a branch"，但 Actions 工作流需要改为 "GitHub Actions"
**解决**：
仓库页面 → **Settings** → **Pages** → **Source** → 选择 **GitHub Actions** → Save

---

## 最终成功的工作流

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: false
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build -- --base=/color_claude/
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

---

## 核心教训

| 问题类型 | 教训 |
|---------|------|
| 网络 | 终端默认不走浏览器代理，国内访问 GitHub 必须开全局代理 |
| CLI 登录 | `gh auth login` / `vercel login` 的设备码流程对网络要求极高，不稳定时果断改用网页手动操作 |
| YAML | 网页编辑器容易破坏缩进，复杂配置文件优先本地编辑后推送 |
| lock 文件 | 只要动了 `package.json`，必须同步提交 `package-lock.json` |
| Vite base | GitHub Pages 项目站点必须配置 `base`，否则资源 404 |
