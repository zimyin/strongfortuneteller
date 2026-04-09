#!/bin/bash
# 一键构建混淆 + 部署到 GitHub Pages
# 用法: bash deploy.sh

set -e
cd "$(dirname "$0")"

echo "🔨 开始混淆构建..."

# 清理
rm -rf dist
mkdir -p dist

# 混淆 JS（变量名替换 + 压缩 + 去注释）
npx uglifyjs script.js -o dist/script.js \
  -c drop_console=false,passes=2 \
  -m toplevel,reserved=['$','jQuery']
echo "  ✅ script.js 已混淆"

npx uglifyjs bazi-core.js -o dist/bazi-core.js \
  -c drop_console=false,passes=2 \
  -m toplevel,reserved=['$','jQuery']
echo "  ✅ bazi-core.js 已混淆"

# 压缩 CSS
npx cleancss -o dist/styles.css styles.css
echo "  ✅ styles.css 已压缩"

# 压缩 HTML
npx html-minifier-terser index.html \
  --collapse-whitespace \
  --remove-comments \
  --minify-css true \
  --minify-js true \
  -o dist/index.html
echo "  ✅ index.html 已压缩"

# 复制其他需要的文件
cp -f pay-success.html dist/ 2>/dev/null || true

# 显示文件大小对比
echo ""
echo "📊 文件大小对比:"
echo "  源码                    混淆后"
for f in script.js bazi-core.js styles.css index.html; do
  if [ -f "$f" ] && [ -f "dist/$f" ]; then
    src_size=$(wc -c < "$f" | tr -d ' ')
    dst_size=$(wc -c < "dist/$f" | tr -d ' ')
    pct=$((dst_size * 100 / src_size))
    printf "  %-22s %6s → %6s (%d%%)\n" "$f" "${src_size}B" "${dst_size}B" "$pct"
  fi
done

# 部署到 gh-pages 分支
echo ""
echo "🚀 部署到 gh-pages 分支..."
cd dist
git init
git checkout -b gh-pages
git add -A
git commit -m "deploy: $(date '+%Y-%m-%d %H:%M') 混淆构建"
git push -f "https://github.com/zimyin/strongfortuneteller.git" gh-pages
cd ..

# 清理
rm -rf dist

echo ""
echo "✅ 部署完成！"
echo "🌐 网址: https://zimyin.github.io/strongfortuneteller/"
echo "   (首次部署需等待 1-2 分钟生效)"
