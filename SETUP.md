# 🎯 Setup Completo - Guia Rápido

## ✅ O que já está pronto

- ✅ Aplicação com login funcional
- ✅ Servidor rodando em http://localhost:3000
- ✅ Git inicializado e primeiro commit feito
- ✅ GitHub Actions configurado para deploy automático
- ✅ Scripts de deploy manual incluídos

---

## 📋 Próximos Passos

### 1️⃣ Criar Repositório no GitHub

1. Acesse: https://github.com/new
2. Nome do repositório: `login-app` (ou outro nome)
3. **NÃO** marque "Initialize with README"
4. Clique em "Create repository"

### 2️⃣ Conectar e Fazer Push

Copie e execute os comandos que o GitHub mostrar, ou use:

```bash
git remote add origin https://github.com/SEU-USUARIO/login-app.git
git branch -M main
git push -u origin main
```

### 3️⃣ Configurar Secrets no GitHub

Vá em: `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

Adicione 4 secrets:

#### VPS_HOST
```
123.45.67.89
```
(ou seu domínio: `seusite.com`)

#### VPS_USERNAME
```
u123456789
```
(seu usuário SSH da Hostinger)

#### VPS_SSH_KEY
```
-----BEGIN OPENSSH PRIVATE KEY-----
[sua chave privada completa aqui]
-----END OPENSSH PRIVATE KEY-----
```

**Como obter a chave SSH:**

**Opção A - Criar nova chave:**
```bash
ssh-keygen -t rsa -b 4096 -C "deploy@github" -f ~/.ssh/hostinger_deploy
cat ~/.ssh/hostinger_deploy.pub  # Copiar e adicionar na VPS
cat ~/.ssh/hostinger_deploy      # Copiar e adicionar no GitHub Secret
```

**Opção B - Usar chave existente:**
```bash
cat ~/.ssh/id_rsa  # No Windows: type %USERPROFILE%\.ssh\id_rsa
```

#### VPS_APP_PATH
```
/home/u123456789/login-app
```
(caminho onde a app vai ficar na VPS)

### 4️⃣ Preparar a VPS (Primeira Vez)

Conecte via SSH na sua VPS da Hostinger:

```bash
ssh u123456789@123.45.67.89
```

Execute os comandos:

```bash
# 1. Instalar Node.js (se não tiver)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Instalar PM2
sudo npm install -g pm2

# 3. Criar diretório e clonar repositório
mkdir -p ~/login-app
cd ~/login-app
git clone https://github.com/SEU-USUARIO/login-app.git .

# 4. Configurar ambiente
npm install --production
cp .env.example .env
nano .env
# Adicionar: JWT_SECRET=seu-secret-super-seguro-aleatorio-123456

# 5. Iniciar aplicação
pm2 start server.js --name login-app
pm2 save
pm2 startup  # Seguir instruções para auto-start

# 6. Verificar se está rodando
pm2 status
pm2 logs login-app
```

### 5️⃣ Configurar Nginx (Opcional mas Recomendado)

```bash
sudo nano /etc/nginx/sites-available/login-app
```

Adicionar:
```nginx
server {
    listen 80;
    server_name seudominio.com;  # ou IP da VPS

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

### 6️⃣ SSL com Let's Encrypt (Recomendado)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d seudominio.com
```

### 7️⃣ Testar Deploy Automático

Faça uma mudança qualquer e push:

```bash
# Editar algo (ex: README.md)
git add .
git commit -m "test: testando deploy automático"
git push origin main
```

Acompanhe o deploy em: https://github.com/SEU-USUARIO/login-app/actions

---

## 🎉 Pronto!

Agora você tem:

- ✅ App rodando localmente
- ✅ Código no GitHub
- ✅ Deploy automático configurado
- ✅ App rodando na VPS da Hostinger

**Cada push para `main` vai automaticamente:**
1. Conectar na VPS
2. Fazer git pull
3. Instalar dependências
4. Reiniciar a aplicação

---

## 🔧 Comandos Úteis

### Local
```bash
npm start              # Iniciar servidor
npm run dev            # Modo desenvolvimento (com nodemon)
```

### VPS
```bash
pm2 status             # Ver status
pm2 logs login-app     # Ver logs
pm2 restart login-app  # Reiniciar
pm2 stop login-app     # Parar
pm2 delete login-app   # Remover
```

### Git
```bash
git status             # Ver mudanças
git add .              # Adicionar tudo
git commit -m "msg"    # Commit
git push origin main   # Push (vai fazer deploy!)
```

---

## 🐛 Troubleshooting

### Deploy falhou no GitHub Actions
- Verifique se os Secrets estão corretos
- Teste SSH manualmente: `ssh usuario@vps`
- Veja os logs na aba Actions do GitHub

### App não inicia na VPS
```bash
ssh usuario@vps
cd ~/login-app
pm2 logs login-app
npm install
pm2 restart login-app
```

### Porta 3000 já em uso
```bash
# Editar .env e mudar PORT
nano .env
# PORT=3001
pm2 restart login-app
```

---

## 📚 Documentação Completa

- [DEPLOY.md](DEPLOY.md) - Guia detalhado de deploy
- [README.md](README.md) - Documentação da aplicação

---

## 🆘 Precisa de Ajuda?

1. Verifique os logs: `pm2 logs login-app`
2. Teste SSH: `ssh -v usuario@vps`
3. Verifique GitHub Actions: aba "Actions" no repositório
4. Teste localmente primeiro: `npm start`

**Tudo configurado e pronto para usar! 🚀**
