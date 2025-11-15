# 🚀 Guia de Deploy Automático

## Opção 1: GitHub Actions (Recomendado)

### 1. Configurar Secrets no GitHub

Vá em: `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

Adicione os seguintes secrets:

| Secret | Descrição | Exemplo |
|--------|-----------|---------|
| `VPS_HOST` | IP ou domínio da VPS | `123.45.67.89` ou `seusite.com` |
| `VPS_USERNAME` | Usuário SSH | `ubuntu` ou `u123456789` |
| `VPS_SSH_KEY` | Chave SSH privada | Conteúdo do arquivo `~/.ssh/id_rsa` |
| `VPS_PORT` | Porta SSH (geralmente 22) | `22` |
| `VPS_APP_PATH` | Caminho da app na VPS | `/home/usuario/login-app` |

### 2. Gerar Chave SSH (se não tiver)

No seu computador local:
```bash
ssh-keygen -t rsa -b 4096 -C "deploy@github"
```

Copiar chave pública para VPS:
```bash
ssh-copy-id -i ~/.ssh/id_rsa.pub usuario@seu-vps
```

Copiar chave privada para GitHub Secret:
```bash
cat ~/.ssh/id_rsa
# Copie TODO o conteúdo (incluindo BEGIN e END)
```

### 3. Preparar VPS (primeira vez)

Conecte via SSH e execute:

```bash
# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2
sudo npm install -g pm2

# Criar diretório da aplicação
mkdir -p ~/login-app
cd ~/login-app

# Clonar repositório
git clone https://github.com/seu-usuario/seu-repo.git .

# Configurar .env
nano .env
# Adicionar:
# PORT=3000
# JWT_SECRET=seu-secret-super-seguro-aleatorio

# Primeira inicialização
npm install --production
pm2 start server.js --name login-app
pm2 save
pm2 startup
```

### 4. Configurar Nginx (opcional)

```bash
sudo nano /etc/nginx/sites-available/login-app
```

Adicionar:
```nginx
server {
    listen 80;
    server_name seudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Ativar:
```bash
sudo ln -s /etc/nginx/sites-available/login-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. Testar Deploy Automático

Agora, sempre que você fizer push para `main`:

```bash
git add .
git commit -m "feat: nova funcionalidade"
git push origin main
```

O GitHub Actions vai automaticamente:
1. ✅ Conectar na VPS via SSH
2. ✅ Fazer git pull
3. ✅ Instalar dependências
4. ✅ Reiniciar aplicação com PM2

Acompanhe o progresso em: `Actions` tab no GitHub

---

## Opção 2: Deploy Manual com Script

### 1. Configurar script

Edite `deploy.sh`:
```bash
VPS_USER="seu-usuario"
VPS_HOST="123.45.67.89"
VPS_PATH="/home/seu-usuario/login-app"
```

### 2. Dar permissão de execução

```bash
chmod +x deploy.sh
```

### 3. Executar deploy

```bash
./deploy.sh
```

---

## Opção 3: Git Hook na VPS

Configure um webhook para deploy automático:

### 1. Na VPS, criar script de deploy

```bash
nano ~/deploy-login-app.sh
```

Adicionar:
```bash
#!/bin/bash
cd /home/usuario/login-app
git pull origin main
npm install --production
pm2 restart login-app
```

Dar permissão:
```bash
chmod +x ~/deploy-login-app.sh
```

### 2. Configurar webhook no GitHub

1. Vá em `Settings` → `Webhooks` → `Add webhook`
2. Payload URL: `http://seu-vps:9000/hooks/deploy`
3. Content type: `application/json`
4. Secret: crie um token seguro

### 3. Instalar webhook listener na VPS

```bash
npm install -g webhook
```

Criar config:
```bash
nano ~/hooks.json
```

```json
[
  {
    "id": "deploy",
    "execute-command": "/home/usuario/deploy-login-app.sh",
    "command-working-directory": "/home/usuario/login-app"
  }
]
```

Iniciar webhook:
```bash
pm2 start webhook -- -hooks hooks.json -verbose
pm2 save
```

---

## 🔒 Segurança

### Firewall
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### SSL com Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d seudominio.com
```

### Proteger .env
```bash
chmod 600 .env
```

---

## 🐛 Troubleshooting

### Ver logs do deploy
```bash
# GitHub Actions: veja na aba Actions do repositório

# PM2 logs
pm2 logs login-app

# Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Deploy falhou
```bash
# Conectar na VPS e verificar
ssh usuario@vps
cd ~/login-app
git status
npm install
pm2 restart login-app
```

### Permissões SSH
```bash
# Na VPS
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

---

## 📊 Monitoramento

### Ver status da aplicação
```bash
pm2 status
pm2 monit
```

### Configurar alertas
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
```

---

## 🎯 Checklist de Deploy

- [ ] Secrets configurados no GitHub
- [ ] SSH key adicionada à VPS
- [ ] Node.js e PM2 instalados na VPS
- [ ] Repositório clonado na VPS
- [ ] .env configurado com JWT_SECRET seguro
- [ ] Nginx configurado (se usar)
- [ ] SSL configurado (se usar domínio)
- [ ] Firewall configurado
- [ ] Primeiro deploy manual funcionou
- [ ] GitHub Actions testado com push

Pronto! Agora cada push vai fazer deploy automático! 🚀
