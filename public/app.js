const API_URL = window.location.origin;

// Verificar se já está logado ao carregar
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        loadDashboard();
    }
});

// Navegação entre páginas
function showLogin() {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('loginPage').classList.add('active');
    clearErrors();
}

function showRegister() {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('registerPage').classList.add('active');
    clearErrors();
}

function showDashboard() {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('dashboardPage').classList.add('active');
}

function clearErrors() {
    document.getElementById('loginError').textContent = '';
    document.getElementById('registerError').textContent = '';
}

// Login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            loadDashboard();
        } else {
            document.getElementById('loginError').textContent = data.error;
        }
    } catch (error) {
        document.getElementById('loginError').textContent = 'Erro ao conectar ao servidor';
    }
});

// Registro
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    try {
        const response = await fetch(`${API_URL}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            document.getElementById('registerError').textContent = '';
            document.getElementById('registerError').className = 'success';
            document.getElementById('registerError').textContent = 'Conta criada! Redirecionando...';
            setTimeout(() => {
                showLogin();
                document.getElementById('loginUsername').value = username;
            }, 1500);
        } else {
            document.getElementById('registerError').className = 'error';
            document.getElementById('registerError').textContent = data.error;
        }
    } catch (error) {
        document.getElementById('registerError').textContent = 'Erro ao conectar ao servidor';
    }
});

// Carregar Dashboard
async function loadDashboard() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_URL}/api/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            document.getElementById('username').textContent = data.user.username;
            document.getElementById('profileUsername').textContent = data.user.username;
            document.getElementById('profileEmail').textContent = data.user.email;
            document.getElementById('profileCreated').textContent = new Date(data.user.created_at).toLocaleDateString('pt-BR');
            showDashboard();
        } else {
            logout();
        }
    } catch (error) {
        logout();
    }
}

// Logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showLogin();
}
