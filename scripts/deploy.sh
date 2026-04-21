#!/bin/bash
# 多平台部署脚本
# 用法: bash scripts/deploy.sh [github|netlify|tcb|edgeone]

set -e
cd "$(dirname "$0")/.."
ROOT="$(pwd)"
DIST="$ROOT/dist"

PLATFORM="${1:-github}"

# 检查 dist 是否存在
if [ ! -d "$DIST" ] || [ ! -f "$DIST/index.html" ]; then
  echo "❌ dist/ 不存在或为空，请先运行: npm run build"
  exit 1
fi

VERSION=$(cat "$DIST/build-info.json" 2>/dev/null | grep version | head -1 | sed 's/.*"version":[[:space:]]*"\([^"]*\)".*/\1/' || echo "unknown")

echo "🚀 部署到 [$PLATFORM] (版本: $VERSION)"
echo ""

case "$PLATFORM" in

  github)
    # GitHub Pages: 推送到 gh-pages 分支
    REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")
    if [ -z "$REMOTE_URL" ]; then
      echo "❌ 未找到 git remote origin，请先设置远程仓库"
      exit 1
    fi
    echo "   仓库: $REMOTE_URL"
    cd "$DIST"
    rm -rf .git
    git init -q
    git checkout -q -b gh-pages
    git config user.email "deploy@gufa-fortune"
    git config user.name "deploy-bot"
    git add -A
    git commit -q -m "deploy: $VERSION"
    git push -fq "$REMOTE_URL" gh-pages
    rm -rf .git
    cd "$ROOT"
    echo ""
    echo "✅ GitHub Pages 部署完成！"
    echo "   网址: https://<your-username>.github.io/<repo-name>/"
    echo "   首次部署请在 GitHub 仓库 Settings → Pages 中将 Source 设为 gh-pages 分支"
    ;;

  netlify)
    # Netlify: 通过 netlify-cli 部署
    if ! command -v netlify &>/dev/null; then
      echo "❌ 未安装 netlify CLI，请先运行: npm install -g netlify-cli"
      echo "   然后运行: netlify login"
      exit 1
    fi
    netlify deploy --prod --dir="$DIST"
    echo ""
    echo "✅ Netlify 部署完成！"
    ;;

  tcb)
    # 腾讯云 CloudBase 静态托管
    if ! command -v tcb &>/dev/null; then
      echo "❌ 未安装 tcb CLI，请先运行: npm install -g @cloudbase/cli"
      echo "   然后运行: tcb login"
      exit 1
    fi
    if [ -z "$TCB_ENV_ID" ]; then
      echo "❌ 请先设置环境变量 TCB_ENV_ID（你的 CloudBase 环境ID）"
      echo "   示例: export TCB_ENV_ID=your-env-id"
      exit 1
    fi
    tcb hosting deploy "$DIST" -e "$TCB_ENV_ID"
    echo ""
    echo "✅ 腾讯云 CloudBase 部署完成！"
    echo "   访问地址: https://$TCB_ENV_ID.tcloudbaseapp.com/"
    ;;

  edgeone)
    # 腾讯云 EdgeOne Pages
    if ! command -v edgeone &>/dev/null; then
      echo "❌ 未安装 edgeone CLI，请先运行: npm install -g edgeone"
      echo "   然后运行: edgeone login"
      exit 1
    fi
    edgeone pages deploy "$DIST"
    echo ""
    echo "✅ EdgeOne Pages 部署完成！"
    ;;

  *)
    echo "❌ 未知平台: $PLATFORM"
    echo ""
    echo "支持的平台:"
    echo "  github   - GitHub Pages（推送到 gh-pages 分支）"
    echo "  netlify  - Netlify"
    echo "  tcb      - 腾讯云 CloudBase 静态托管"
    echo "  edgeone  - 腾讯云 EdgeOne Pages"
    echo ""
    echo "用法示例:"
    echo "  npm run deploy:github"
    echo "  npm run deploy:tcb     # 需先 export TCB_ENV_ID=xxx"
    exit 1
    ;;

esac
