#!/bin/bash
# 盎然内容 (ARaner) 生产服务器修复脚本
# 修复: PostgreSQL 未启动 / 数据库未初始化 / 端口不对
# 在服务器上以 root 运行: sudo bash fix-production.sh

set -e

echo "=== ARaner 生产服务器修复 ==="

# 1. 检查 PostgreSQL 状态并启动
echo ""
echo "[1/4] 检查 PostgreSQL..."
if command -v pg_isready &>/dev/null && pg_isready -q 2>/dev/null; then
  echo "  PostgreSQL 已在运行 ✓"
else
  echo "  PostgreSQL 未运行，尝试启动..."
  # 尝试各种方式启动
  pg_ctlcluster 16 main start 2>/dev/null || \
  pg_ctlcluster 15 main start 2>/dev/null || \
  service postgresql start 2>/dev/null || \
  pg_ctlcluster 14 main start 2>/dev/null || \
  true

  sleep 2
  if pg_isready -q 2>/dev/null; then
    echo "  PostgreSQL 启动成功 ✓"
  else
    echo "  ⚠ PostgreSQL 无法自动启动。手动执行:"
    echo "     sudo service postgresql start"
    exit 1
  fi
fi

# 2. 检查数据库是否存在，不存在则创建
echo ""
echo "[2/4] 检查数据库..."
cd /root/ARaner 2>/dev/null || cd ~/ARaner 2>/dev/null || { echo "  ⚠ 找不到 ARaner 目录"; exit 1; }

if sudo -u postgres psql -lqt 2>/dev/null | grep -qw araner; then
  echo "  数据库 araner 已存在 ✓"
else
  echo "  创建数据库 araner..."
  sudo -u postgres psql -c "CREATE DATABASE araner;"
  sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'araner_dev_2026';"
fi

# 配置 pg_hba 允许密码登录
PG_HBA=$(find /etc/postgresql -name pg_hba.conf 2>/dev/null | head -1)
if [ -n "$PG_HBA" ]; then
  sed -i 's/local\s*all\s*all\s*peer/local   all             all                                     md5/' "$PG_HBA" 2>/dev/null || true
  sed -i 's/host\s*all\s*all\s*127.0.0.1\/32\s*scram-sha-256/host    all             all             127.0.0.1\/32            md5/' "$PG_HBA" 2>/dev/null || true
  pg_ctlcluster 16 main reload 2>/dev/null || pg_ctlcluster 15 main reload 2>/dev/null || true
fi

# 3. 确保 .env.local 存在
echo ""
echo "[3/4] 确保环境配置..."
if [ ! -f .env.local ]; then
  cat > .env.local << 'ENVEOF'
DATABASE_URL="postgresql://postgres:araner_dev_2026@localhost:5432/araner"
JWT_SECRET="araner-jwt-secret-2026-prod"
ENVEOF
  echo "  已创建 .env.local ✓"
else
  echo "  .env.local 已存在 ✓"
fi

# 运行数据库迁移
echo "  运行数据库迁移..."
npx prisma migrate dev --name init 2>/dev/null || npx prisma db push
echo "  数据库迁移完成 ✓"

# 4. 检查并重启服务（端口 80）
echo ""
echo "[4/4] 重启服务..."
# 停掉老的进程
pkill -f "next start" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
sleep 1

# 在端口 80 启动（需要 root）
echo "  启动生产服务 (端口 80)..."
nohup npx next start -p 80 > /var/log/araner.log 2>&1 &
sleep 3

# 验证
if curl -s -o /dev/null -w "" http://localhost:80/ 2>/dev/null; then
  PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}')
  echo ""
  echo "=== 修复完成！==="
  echo "  访问地址: http://$PUBLIC_IP"
  echo ""
  echo "  首次使用："
  echo "  1. 注册账号"
  echo "  2. 在 Key 管理页面配置 DeepSeek API Key"
  echo "  3. 开始创作！"
else
  echo "  ⚠ 服务未在端口 80 启动。查看日志:"
  echo "     tail -f /var/log/araner.log"
  echo ""
  echo "  备选: 在端口 3000 启动"
  echo "     cd /root/ARaner && nohup npx next start -p 3000 &"
fi

echo ""
echo "  查看实时日志: tail -f /var/log/araner.log"
