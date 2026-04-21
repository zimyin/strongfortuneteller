#!/bin/bash
# 构建脚本：将 src/ 源码编译/混淆到 dist/
# 用法: bash scripts/build.sh

set -e

# 进入项目根目录
cd "$(dirname "$0")/.."
ROOT="$(pwd)"
SRC="$ROOT/src"
DIST="$ROOT/dist"

# 自动版本号
VERSION=$(date '+%Y%m%d')_$(git rev-parse --short HEAD 2>/dev/null || echo "dev")

echo "🔨 开始构建... (版本: $VERSION)"

# 检查依赖工具
for cmd in npx; do
  if ! command -v $cmd &>/dev/null; then
    echo "❌ 缺少必要工具: $cmd（请先安装 Node.js）"
    exit 1
  fi
done

# 检查源文件
for f in index.html bazi-core.js constants.js utils-ganzhi.js ziwei.js fortune-algo.js narrative.js divination.js render.js chat.js ui-main.js styles.css; do
  if [ ! -f "$SRC/$f" ]; then
    echo "❌ 缺少源文件: src/$f"
    exit 1
  fi
done

# 清理并新建 dist
rm -rf "$DIST"
mkdir -p "$DIST"

# === JS 合并 + 混淆 ===
# 注意: 各模块共享全局变量，必须按依赖顺序合并后混淆
cat "$SRC/bazi-core.js" \
    "$SRC/constants.js" \
    "$SRC/utils-ganzhi.js" \
    "$SRC/ziwei.js" \
    "$SRC/fortune-algo.js" \
    "$SRC/narrative.js" \
    "$SRC/divination.js" \
    "$SRC/render.js" \
    "$SRC/chat.js" \
    "$SRC/ui-main.js" \
    > "$DIST/_combined.js"
npx uglifyjs "$DIST/_combined.js" -o "$DIST/_combined.min.js" \
  -c drop_console=false,passes=2 \
  -m reserved=['$','jQuery']

# HTML 中第一个加载的是 bazi-core.js，所以合并后的代码放到 bazi-core.js
# 其他模块文件写入空 stub，防止 404
cp "$DIST/_combined.min.js" "$DIST/bazi-core.js"
for stub in constants utils-ganzhi ziwei fortune-algo narrative divination render chat ui-main; do
  echo "/* merged into bazi-core.js */" > "$DIST/${stub}.js"
done
rm -f "$DIST/_combined.js" "$DIST/_combined.min.js"
echo "  ✅ JS 已合并混淆（10 个模块 → bazi-core.js）"

# === CSS 压缩 ===
npx cleancss -o "$DIST/styles.css" "$SRC/styles.css"
echo "  ✅ styles.css 已压缩"

# === 复制第三方 vendor (lunar-javascript) ===
if [ -d "$SRC/vendor" ]; then
  mkdir -p "$DIST/vendor"
  cp -r "$SRC/vendor/"* "$DIST/vendor/"
  echo "  ✅ vendor/ 已复制（lunar-javascript）"
fi

# === HTML 压缩（注入版本号到缓存参数） ===
sed "s/?v=[^\"']*/?v=$VERSION/g" "$SRC/index.html" > "$DIST/_index_versioned.html"
npx html-minifier-terser "$DIST/_index_versioned.html" \
  --collapse-whitespace \
  --remove-comments \
  --minify-css true \
  --minify-js true \
  -o "$DIST/index.html"
rm -f "$DIST/_index_versioned.html"
echo "  ✅ index.html 已压缩（缓存版本号: $VERSION）"

# === 复制 public 静态资源（如有） ===
if [ -d "$ROOT/public" ] && [ "$(ls -A $ROOT/public 2>/dev/null)" ]; then
  cp -r "$ROOT/public/"* "$DIST/" 2>/dev/null || true
  echo "  ✅ public/ 静态资源已复制"
fi

# === 写入构建信息 ===
cat > "$DIST/build-info.json" <<EOF
{
  "version": "$VERSION",
  "buildTime": "$(date -u '+%Y-%m-%dT%H:%M:%SZ')",
  "commit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')"
}
EOF

# === 输出大小对比 ===
echo ""
echo "📊 文件大小对比:"
printf "  %-22s %10s   %10s\n" "文件" "源码" "构建后"
for f in bazi-core.js styles.css index.html; do
  if [ -f "$SRC/$f" ] && [ -f "$DIST/$f" ]; then
    src_size=$(wc -c < "$SRC/$f" | tr -d ' ')
    dst_size=$(wc -c < "$DIST/$f" | tr -d ' ')
    pct=$((dst_size * 100 / src_size))
    printf "  %-22s %8sB → %8sB (%d%%)\n" "$f" "$src_size" "$dst_size" "$pct"
  fi
done

# 合并后的 JS 总大小对比
src_total=0
for f in bazi-core.js constants.js utils-ganzhi.js ziwei.js fortune-algo.js narrative.js divination.js render.js chat.js ui-main.js; do
  [ -f "$SRC/$f" ] && src_total=$((src_total + $(wc -c < "$SRC/$f" | tr -d ' ')))
done
dst_total=$(wc -c < "$DIST/bazi-core.js" | tr -d ' ')
pct=$((dst_total * 100 / src_total))
printf "  %-22s %8sB → %8sB (%d%%)\n" "JS 模块合计" "$src_total" "$dst_total" "$pct"

echo ""
echo "✅ 构建完成！产物位于 dist/ (版本: $VERSION)"
echo "   本地预览: npm run preview"
