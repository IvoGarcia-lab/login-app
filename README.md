# App de Login - Node.js + Express

Aplicação simples com sistema de autenticação usando JWT e SQLite.

## 🚀 Funcionalidades

- ✅ Registro de usuários
- ✅ Login com JWT
- ✅ Página protegida (Dashboard)
- ✅ Logout
- ✅ Persistência com SQLite

## 📦 Instalação Local

```bash
# Instalar dependências
npm install

# Criar arquivo .env
cp .env.example .env

# Editar .env e mudar o JWT_SECRET
# JWT_SECRET=seu-secret-super-seguro-aqui

# Iniciar servidor
npm start
```

Acesse: http://localhost:3000

## 🚀 Deploy Automático com GitHub Actions

Veja o guia completo em [DEPLOY.md](DEPLOY.md)

**Resumo rápido:**

1. Configure os Secrets no GitHub:
   - `VPS_HOST` - IP da VPS
   - `VPS_USERNAME` - usuário SSH
   - `VPS_SSH_KEY` - chave privada SSH
   - `VPS_APP_PATH` - caminho da app (ex: `/home/usuario/login-app`)

2. Prepare a VPS uma vez:
```bash
ssh usuario@vps
mkdir -p ~/login-app
cd ~/login-app
git clone https://github.com/seu-usuario/seu-repo.git .
npm install --production
cp .env.example .env
nano .env  # Configurar JWT_SECRET
pm2 start server.js --name login-app
pm2 save
pm2 startup
```

3. Faça push e veja o deploy automático:
```bash
git push origin main
```

Pronto! Cada push vai fazer deploy automático! 🎉

---

## 🌐 Deploy Manual na VPS Hostinger

### 1. Conectar via SSH
```bash
ssh [usuario]@[seu-ip-vps]
```

### 2. Instalar Node.js (se não tiver)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 3. Clonar/Upload do projeto
```bash
# Opção 1: Via Git
git clone [seu-repositorio]
cd login-app

# Opção 2: Via FTP/SFTP
# Faça upload dos arquivos para /home/[usuario]/login-app
```

### 4. Configurar aplicação
```bash
cd login-app
npm install
cp .env.example .env
nano .env  # Editar e adicionar JWT_SECRET seguro
```

### 5. Instalar PM2 (gerenciador de processos)
```bash
sudo npm install -g pm2
```

### 6. Iniciar aplicação
```bash
pm2 start server.js --name login-app
pm2 save
pm2 startup  # Seguir instruções para auto-start
```

### 7. Configurar Nginx (proxy reverso)
```bash
sudo nano /etc/nginx/sites-available/login-app
```

Adicionar:
```nginx
server {
    listen 80;
    server_name [seu-dominio.com];

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ativar site:
```bash
sudo ln -s /etc/nginx/sites-available/login-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 8. SSL com Let's Encrypt (opcional mas recomendado)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d [seu-dominio.com]
```

## 🔧 Comandos PM2 Úteis

```bash
pm2 list              # Ver apps rodando
pm2 logs login-app    # Ver logs
pm2 restart login-app # Reiniciar
pm2 stop login-app    # Parar
pm2 delete login-app  # Remover
```

## 🔒 Segurança

- Sempre mude o `JWT_SECRET` no arquivo `.env`
- Use HTTPS em produção
- Configure firewall na VPS
- Mantenha Node.js atualizado

## 📝 Estrutura do Projeto

```
login-app/
├── server.js          # Servidor Express
├── package.json       # Dependências
├── .env              # Configurações (não commitar!)
├── users.db          # Database SQLite (criado automaticamente)
└── public/           # Frontend
    ├── index.html
    ├── style.css
    └── app.js
```

## 🐛 Troubleshooting

**Porta já em uso:**
```bash
# Mudar PORT no .env
PORT=3001
```

**Erro de permissões:**
```bash
sudo chown -R $USER:$USER /home/[usuario]/login-app
```

**App não inicia após reboot:**
```bash
pm2 startup
pm2 save
```
