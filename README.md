# 古法推演神算

> 融合《渊海子平》《三命通会》《紫微斗数全书》《穷通宝鉴》《子平真诠》《滴天髓》《协纪辨方书》《神峰通考》《称骨歌》《黄帝内经》等数十本经典命理古籍的深度测算工具。

纯前端网页应用，无后端依赖，支持部署到任何静态托管平台。

---

## 功能特性

### 八字（子平术）
- ✅ 四柱排盘（精确节气+天文基准日，与万年历交叉验证）
- ✅ 身强身弱七级判断（《滴天髓》旺衰理论）
- ✅ 用神取法 + 调候用神（《子平真诠》+《穷通宝鉴》120条调候建议）
- ✅ 完整十神（含地支藏干）+ 十神组合格局识别
- ✅ 十二长生宫（阳干顺排阴干逆排）
- ✅ 合冲刑害（天干五合四冲 + 地支六合三合三会六冲三刑六害）
- ✅ 格局判断（八正格 + 6种特殊格局）
- ✅ 神煞系统（天乙贵人/文昌/驿马/桃花/华盖/天德/月德）
- ✅ 空亡分析
- ✅ 大运排盘（阳男阴女顺行、8步80年）
- ✅ 流年运势（2015-2035，综合/财运/事业三维评分）
- ✅ 流月运势
- ✅ 婚姻分析 + 健康诊断
- ✅ 称骨算命
- ✅ 纳音五行

### 紫微斗数
- ✅ 正统安星法（命宫/五行局/14正星）
- ✅ 辅星（左辅右弼/文昌文曲/天魁天钺/擎羊陀罗）
- ✅ 四化飞星（禄权科忌）

### 其他
- ✅ 出生地风水分析（73城市五行）
- ✅ 每日占卜（运势签 + 塔罗牌）
- ✅ AI 命理问答（携带完整命盘上下文）

---

## 项目结构

```
gufa-fortune/
├── src/                    # 源代码
│   ├── index.html          # 主页面
│   ├── bazi-core.js        # 八字核心算法引擎
│   ├── script.js           # 主逻辑 + 渲染
│   └── styles.css          # 样式
├── public/                 # 静态资源（构建时原样复制到 dist/）
├── dist/                   # 构建产物（自动生成，已 gitignore）
├── scripts/                # 构建与部署脚本
│   ├── build.sh            # 构建脚本
│   └── deploy.sh           # 多平台部署脚本
├── docs/                   # 文档
│   └── references/         # 古籍 PDF（已 gitignore）
├── package.json
├── .gitignore
└── README.md
```

---

## 快速开始

### 环境要求
- Node.js >= 14
- Python 3（用于本地开发服务器）

### 本地开发

```bash
# 1. 安装依赖
npm install

# 2. 启动本地开发服务器
npm run dev
# 访问 http://localhost:4173
```

### 构建生产版本

```bash
npm run build
# 产物输出到 dist/
# 构建过程会：
#  - 合并 + 混淆 JS
#  - 压缩 CSS / HTML
#  - 注入缓存版本号
#  - 生成 build-info.json
```

### 本地预览构建结果

```bash
npm run preview
# 访问 http://localhost:8080
```

---

## 部署到各平台

### 方案一：GitHub Pages（免费，最简单）

```bash
npm run deploy:github
```

**首次使用**：
1. 设置好 `git remote origin` 指向你的 GitHub 仓库
2. 部署完成后，在 GitHub 仓库 **Settings → Pages** 中将 Source 设为 `gh-pages` 分支
3. 访问 `https://<你的用户名>.github.io/<仓库名>/`

### 方案二：腾讯云 CloudBase（国内访问快）

```bash
# 1. 安装 CLI
npm install -g @cloudbase/cli

# 2. 登录
tcb login

# 3. 设置环境ID
export TCB_ENV_ID=你的环境ID

# 4. 部署
npm run deploy:tcb
```

访问地址：`https://<你的环境ID>.tcloudbaseapp.com/`

> 💡 如需绑定自定义域名，在 CloudBase 控制台 → 静态网站托管 → 设置中添加。

### 方案三：腾讯云 EdgeOne Pages（全球 CDN 加速）

```bash
npm install -g edgeone
edgeone login
npm run deploy:edgeone
```

### 方案四：Netlify（海外访问快）

```bash
npm install -g netlify-cli
netlify login
npm run deploy:netlify
```

### 方案五：任意静态托管

```bash
npm run build
# 把 dist/ 目录上传到任何支持静态网站的服务即可
# 例如：阿里云 OSS、华为云 OBS、七牛云、又拍云、Vercel、Cloudflare Pages 等
```

---

## 命令清单

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动本地开发服务器（http://localhost:4173） |
| `npm run build` | 构建生产版本到 `dist/` |
| `npm run preview` | 预览构建产物（http://localhost:8080） |
| `npm run clean` | 清理构建产物 |
| `npm run deploy:github` | 一键构建并部署到 GitHub Pages |
| `npm run deploy:tcb` | 一键构建并部署到腾讯云 CloudBase |
| `npm run deploy:edgeone` | 一键构建并部署到腾讯云 EdgeOne |
| `npm run deploy:netlify` | 一键构建并部署到 Netlify |

---

## 技术栈

- **纯前端**：HTML / CSS / 原生 JavaScript，无框架依赖
- **算法核心**：`src/bazi-core.js` + `src/script.js`（模块化）
- **构建工具**：uglify-js + clean-css + html-minifier-terser
- **无后端**：所有排盘计算在浏览器完成，数据不出用户设备

---

## 理论基础

算法基于以下经典命理古籍：

| 书籍 | 用途 |
|------|------|
| 《协纪辨方书》 | 天文历法、节气推算 |
| 《渊海子平》 | 子平术基础、神煞、合冲刑害 |
| 《三命通会》 | 地支藏干、十二长生、纳音 |
| 《子平真诠》 | 十神体系、八正格格局 |
| 《滴天髓》 | 身强身弱、五行旺衰 |
| 《穷通宝鉴》 | 调候用神（120条对应表） |
| 《紫微斗数全书》 | 紫微斗数排盘、四化飞星 |
| 《神峰通考》 | 特殊格局补充 |
| 《黄帝内经》 | 五行五脏对应 |
| 《称骨歌》 | 称骨算命 |

古籍 PDF 参考资料位于 `docs/references/`（不入仓库）。

---

## 许可

版权所有：城中村女大学生

测算结果仅供娱乐参考，切勿过度迷信。
