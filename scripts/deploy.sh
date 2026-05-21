#!/bin/bash
# 盎然内容 (ARaner) 部署脚本
# 在 Ubuntu 服务器上运行此脚本完成完整部署
# 用法: chmod +x deploy.sh && sudo ./deploy.sh

set -e

echo "=== 盎然内容 部署脚本 ==="
echo ""

# 1. 安装系统依赖
echo "[1/7] 安装系统依赖..."
apt update
apt install -y curl gnupg git

# 2. 安装 Node.js 20
echo "[2/7] 安装 Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
echo "Node.js $(node -v)"
echo "npm $(npm -v)"

# 3. 安装 PostgreSQL
echo "[3/7] 安装 PostgreSQL..."
apt install -y postgresql postgresql-client
pg_ctlcluster 16 main start 2>/dev/null || pg_ctlcluster 15 main start 2>/dev/null || service postgresql start

# 4. 克隆代码
echo "[4/7] 克隆项目代码..."
cd /root
if [ -d "ARaner" ]; then
  cd ARaner && git pull
else
  git clone https://github.com/yandong940319-cpu/ARaner.git
  cd ARaner
fi

# 5. 配置数据库
echo "[5/7] 配置数据库..."
sudo -u postgres psql -c "CREATE DATABASE araner;" 2>/dev/null || echo "数据库已存在"
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'araner_dev_2026';"
# 配置 pg_hba.conf 允许密码登录
PG_HBA=$(find /etc/postgresql -name pg_hba.conf 2>/dev/null | head -1)
if [ -n "$PG_HBA" ]; then
  sed -i 's/local\s*all\s*all\s*peer/local   all             all                                     md5/' "$PG_HBA"
  sed -i 's/host\s*all\s*all\s*127.0.0.1\/32\s*scram-sha-256/host    all             all             127.0.0.1\/32            md5/' "$PG_HBA"
  pg_ctlcluster 16 main reload 2>/dev/null || pg_ctlcluster 15 main reload 2>/dev/null || true
fi

# 6. 安装项目依赖并构建
echo "[6/7] 安装依赖并构建..."
cd /root/ARaner
npm install

# 创建 .env.local
cat > .env.local << 'ENVEOF'
DATABASE_URL="postgresql://postgres:araner_dev_2026@localhost:5432/araner"
NEXTAUTH_SECRET="araner-nextauth-secret-2026"
NEXTAUTH_URL="http://localhost"
ENVEOF

npx prisma migrate dev --name init 2>/dev/null || npx prisma db push
npm run build

# 7. 启动服务
echo "[7/7] 启动生产服务..."
# 使用 PM2 或直接后台启动
if command -v pm2 &>/dev/null; then
  pm2 delete araner 2>/dev/null || true
  pm2 start npm --name "araner" -- start -- -p 80
  pm2 save
else
  # 直接启动
  nohup npx next start -p 80 > /var/log/araner.log 2>&1 &
  echo "服务已后台启动 (PID: $!)"
  echo "查看日志: tail -f /var/log/araner.log"
fi

echo ""
echo "=== 部署完成！==="
echo "访问地址: http://localhost (或服务器公网 IP)"
echo ""
echo "首次使用："
echo "1. 打开 http://$(curl -s ifconfig.me 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}')"
echo "2. 注册账号"
echo "3. 在 Key 管理页面配置 DeepSeek API Key"
echo "4. 开始创作！"
