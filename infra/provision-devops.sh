#!/usr/bin/env bash
set -euo pipefail

apt-get update
apt-get install -y ca-certificates curl git docker.io docker-compose-v2
systemctl enable --now docker
usermod -aG docker vagrant
sysctl -w vm.max_map_count=262144
echo 'vm.max_map_count=262144' > /etc/sysctl.d/99-epms-sonarqube.conf

cd /vagrant
if [ ! -f deploy/.env ]; then
  secret=$(openssl rand -hex 32)
  sed "s/replace-with-a-long-random-local-secret/${secret}/" deploy/.env.example > deploy/.env
  chmod 600 deploy/.env
fi

docker compose -f deploy/docker-compose.yml build jenkins
docker compose -f deploy/docker-compose.yml up -d mongodb jenkins sonarqube
