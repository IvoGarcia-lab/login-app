require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'seu-secret-aqui-mude-isso';

// Inicializar "database" (arquivo JSON simples)
const DB_FILE = 'users.json';
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ users: [] }));
}

const getDB = () => JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
const saveDB = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Rotas de autenticação
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const db = getDB();

    // Verificar se já existe
    if (db.users.find(u => u.username === username || u.email === email)) {
      return res.status(400).json({ error: 'Username ou email já existe' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário
    const newUser = {
      id: db.users.length + 1,
      username,
      email,
      password: hashedPassword,
      created_at: new Date().toISOString()
    };

    db.users.push(newUser);
    saveDB(db);

    res.status(201).json({ 
      message: 'Usuário criado com sucesso',
      userId: newUser.id 
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username e senha são obrigatórios' });
    }

    const db = getDB();
    const user = db.users.find(u => u.username === username);

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Verificar senha
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Gerar token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ 
      message: 'Login bem-sucedido',
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// Rota protegida (exemplo)
app.get('/api/profile', authenticateToken, (req, res) => {
  const db = getDB();
  const user = db.users.find(u => u.id === req.user.id);
  
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  const { password, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword });
});

// Servir frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
