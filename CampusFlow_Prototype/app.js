// --- Mock Data & Global State ---
let state = {
    currentUser: null, // { id: 1, name: 'Lucas', role: 'student' | 'admin' }
    currentRoute: 'login',
    isLoading: false
};

const spaces = [
    { id: 1, name: 'Sala de Estudo A', type: 'Estudo', capacity: 4, available: true },
    { id: 2, name: 'Laboratório de Informática 1', type: 'Laboratório', capacity: 20, available: false },
    { id: 3, name: 'Auditório Principal', type: 'Auditório', capacity: 100, available: true },
    { id: 4, name: 'Estúdio de Gravação', type: 'Estúdio', capacity: 2, available: true },
    { id: 5, name: 'Sala de Reunião 1', type: 'Reunião', capacity: 8, available: true }
];

let bookings = [
    { id: 1, userId: 1, spaceId: 2, date: '2026-05-25', time: '14:00', status: 'approved' },
    { id: 2, userId: 2, spaceId: 3, date: '2026-05-26', time: '10:00', status: 'pending' }
];

// --- Core Utility Functions ---

function announce(message) {
    const liveRegion = document.getElementById('aria-live-region');
    if (liveRegion) liveRegion.textContent = message;
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span>${message}</span>
        <button class="btn-outline" style="border:none; padding:4px;" onclick="this.parentElement.remove()" aria-label="Fechar alerta">✕</button>
    `;
    container.appendChild(toast);
    announce(message);
    setTimeout(() => { if (toast.parentElement) toast.remove(); }, 5000);
}

function showLoading(show) {
    state.isLoading = show;
    render();
}

function navigateTo(route, params = {}) {
    state.currentRoute = route;
    state.params = params;
    render();
    announce(`Navegou para ${route.replace('-', ' ')}`);
}

function checkPermission(requiredRole) {
    if (!state.currentUser || state.currentUser.role !== requiredRole) {
        navigateTo('no-permission');
        return false;
    }
    return true;
}

// --- Layouts ---

function getNavbar() {
    if (!state.currentUser) return '';
    
    const isAdmin = state.currentUser.role === 'admin';
    const links = isAdmin ? `
        <a href="#" class="nav-link" onclick="navigateTo('admin-dashboard'); return false;">Dashboard</a>
        <a href="#" class="nav-link" onclick="navigateTo('manage-bookings'); return false;">Reservas (Admin)</a>
        <a href="#" class="nav-link" onclick="navigateTo('history'); return false;">Histórico</a>
    ` : `
        <a href="#" class="nav-link" onclick="navigateTo('dashboard'); return false;">Início</a>
        <a href="#" class="nav-link" onclick="navigateTo('spaces'); return false;">Espaços</a>
        <a href="#" class="nav-link" onclick="navigateTo('my-bookings'); return false;">Minhas Reservas</a>
    `;

    return `
        <nav class="navbar" role="navigation" aria-label="Navegação principal">
            <a href="#" class="navbar-brand" onclick="navigateTo(state.currentUser.role === 'admin' ? 'admin-dashboard' : 'dashboard'); return false;">
                CampusFlow
            </a>
            <div class="nav-links">
                ${links}
                <a href="#" class="nav-link" onclick="navigateTo('profile'); return false;">Perfil</a>
                <a href="#" class="nav-link btn-danger" style="padding: 4px 8px; border-radius: 4px; color: white;" onclick="state.currentUser = null; navigateTo('login'); return false;">Sair</a>
            </div>
        </nav>
    `;
}

// --- Views (10 Screens + States) ---

const views = {
    // 1. Login
    'login': () => `
        <div class="auth-container">
            <main class="card auth-card" id="main-content">
                <div class="text-center mb-4">
                    <h1 style="color: var(--color-primary)">CampusFlow</h1>
                    <p>Faça login para reservar espaços.</p>
                </div>
                <form id="loginForm" onsubmit="handleLogin(event)" novalidate>
                    <div class="form-group">
                        <label for="email" class="form-label">E-mail</label>
                        <input type="email" id="email" class="form-control" required aria-describedby="email-error">
                        <span id="email-error" class="error-message">E-mail inválido.</span>
                    </div>
                    <div class="form-group">
                        <label for="password" class="form-label">Senha</label>
                        <input type="password" id="password" class="form-control" required aria-describedby="password-error">
                        <span id="password-error" class="error-message">A senha é obrigatória.</span>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%">Entrar</button>
                    <div class="text-center mt-4">
                        <p>Não tem uma conta? <a href="#" onclick="navigateTo('register'); return false;" style="color: var(--color-primary)">Cadastre-se</a></p>
                    </div>
                </form>
            </main>
        </div>
    `,
    // 2. Register
    'register': () => `
        <div class="auth-container">
            <main class="card auth-card" id="main-content">
                <div class="text-center mb-4">
                    <h2>Cadastre-se</h2>
                    <p>Crie sua conta no CampusFlow.</p>
                </div>
                <form id="registerForm" onsubmit="handleRegister(event)" novalidate>
                    <div class="form-group">
                        <label for="name" class="form-label">Nome Completo</label>
                        <input type="text" id="name" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="reg-email" class="form-label">E-mail Institucional</label>
                        <input type="email" id="reg-email" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="role" class="form-label">Perfil</label>
                        <select id="role" class="form-control">
                            <option value="student">Estudante</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%">Criar Conta</button>
                    <div class="text-center mt-4">
                        <p>Já possui conta? <a href="#" onclick="navigateTo('login'); return false;" style="color: var(--color-primary)">Faça Login</a></p>
                    </div>
                </form>
            </main>
        </div>
    `,
    // 3. Student Dashboard
    'dashboard': () => `
        <div class="main-content" id="main-content">
            <h1>Olá, ${state.currentUser.name} 👋</h1>
            <p>O que você precisa hoje?</p>
            
            <div class="grid grid-cols-2 mt-4">
                <div class="card text-center" style="cursor: pointer;" onclick="navigateTo('spaces')">
                    <h3>🔍 Encontrar Sala</h3>
                    <p>Busque por salas de estudo e laboratórios disponíveis.</p>
                </div>
                <div class="card text-center" style="cursor: pointer;" onclick="navigateTo('my-bookings')">
                    <h3>📅 Minhas Reservas</h3>
                    <p>Visualize seus próximos agendamentos.</p>
                </div>
            </div>
        </div>
    `,
    // 4. Space Search
    'spaces': () => `
        <div class="main-content" id="main-content">
            <div class="flex justify-between items-center mb-4">
                <h1>Espaços Disponíveis</h1>
                <div class="form-group" style="margin-bottom:0">
                    <input type="text" class="form-control" placeholder="Buscar espaço..." aria-label="Buscar espaço" onkeyup="filterSpaces(this.value)">
                </div>
            </div>
            <div class="grid grid-cols-3" id="spaces-list">
                ${spaces.map(s => `
                    <div class="card">
                        <h3>${s.name}</h3>
                        <p class="mb-2">Tipo: ${s.type} | Capacidade: ${s.capacity}</p>
                        <div class="flex justify-between items-center mt-4">
                            <span class="badge ${s.available ? 'badge-success' : 'badge-warning'}">${s.available ? 'Livre' : 'Ocupado'}</span>
                            <button class="btn btn-primary" onclick="navigateTo('space-details', {id: ${s.id}})">Detalhes</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `,
    // 5. Space Details
    'space-details': () => {
        const space = spaces.find(s => s.id === state.params.id);
        if (!space) return `<div class="main-content"><h1>Erro</h1><p>Espaço não encontrado.</p></div>`;
        return `
            <div class="main-content" id="main-content">
                <button class="btn btn-outline mb-4" onclick="navigateTo('spaces')">← Voltar</button>
                <div class="card">
                    <h1>${space.name}</h1>
                    <p>Tipo: ${space.type} | Capacidade: ${space.capacity} pessoas</p>
                    
                    <h2 class="mt-4">Agendar Horário</h2>
                    <form onsubmit="handleBook(event, ${space.id})">
                        <div class="grid grid-cols-2">
                            <div class="form-group">
                                <label for="date" class="form-label">Data</label>
                                <input type="date" id="date" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="time" class="form-label">Horário</label>
                                <input type="time" id="time" class="form-control" required>
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary">Confirmar Reserva</button>
                    </form>
                </div>
            </div>
        `;
    },
    // 6. My Bookings
    'my-bookings': () => {
        const myBookings = bookings.filter(b => b.userId === state.currentUser.id);
        
        let content = '';
        if (myBookings.length === 0) {
            content = `
                <div class="empty-state">
                    <div class="empty-icon" aria-hidden="true">📭</div>
                    <h2>Nenhuma reserva encontrada</h2>
                    <p>Você ainda não reservou nenhum espaço.</p>
                    <button class="btn btn-primary mt-4" onclick="navigateTo('spaces')">Procurar Espaços</button>
                </div>
            `;
        } else {
            content = `
                <div class="grid grid-cols-2">
                    ${myBookings.map(b => {
                        const space = spaces.find(s => s.id === b.spaceId);
                        return `
                            <div class="card">
                                <h3>${space ? space.name : 'Espaço Desconhecido'}</h3>
                                <p>Data: ${b.date} às ${b.time}</p>
                                <p>Status: <span class="badge ${b.status === 'approved' ? 'badge-success' : 'badge-warning'}">${b.status}</span></p>
                                <button class="btn btn-danger mt-4" onclick="cancelBooking(${b.id})">Cancelar Reserva</button>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }

        return `
            <div class="main-content" id="main-content">
                <h1>Minhas Reservas</h1>
                ${content}
            </div>
        `;
    },
    // 7. Admin Dashboard
    'admin-dashboard': () => {
        if(!checkPermission('admin')) return '';
        const pending = bookings.filter(b => b.status === 'pending').length;
        return `
            <div class="main-content" id="main-content">
                <h1>Dashboard Administrativo</h1>
                <p>Visão geral do campus.</p>
                <div class="grid grid-cols-3 mt-4">
                    <div class="card">
                        <h2>${spaces.length}</h2>
                        <p>Total de Espaços</p>
                    </div>
                    <div class="card" style="border-left: 4px solid var(--color-warning)">
                        <h2>${pending}</h2>
                        <p>Reservas Pendentes</p>
                    </div>
                    <div class="card">
                        <h2>${bookings.length}</h2>
                        <p>Total de Reservas</p>
                    </div>
                </div>
            </div>
        `;
    },
    // 8. Manage Bookings
    'manage-bookings': () => {
        if(!checkPermission('admin')) return '';
        const pendingBookings = bookings.filter(b => b.status === 'pending');
        
        let content = pendingBookings.length === 0 ? 
            `<div class="empty-state"><p>Nenhuma reserva pendente de aprovação.</p></div>` :
            `<div class="grid grid-cols-2">
                ${pendingBookings.map(b => {
                    const space = spaces.find(s => s.id === b.spaceId);
                    return `
                        <div class="card">
                            <h3>Reserva #${b.id}</h3>
                            <p>Espaço: ${space ? space.name : 'N/A'}</p>
                            <p>Data: ${b.date} às ${b.time}</p>
                            <div class="flex gap-2 mt-4">
                                <button class="btn btn-primary" onclick="approveBooking(${b.id})">Aprovar</button>
                                <button class="btn btn-danger" onclick="cancelBooking(${b.id})">Rejeitar</button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>`;

        return `
            <div class="main-content" id="main-content">
                <h1>Aprovação de Reservas</h1>
                ${content}
            </div>
        `;
    },
    // 9. History
    'history': () => {
        if(!checkPermission('admin')) return '';
        return `
            <div class="main-content" id="main-content">
                <h1>Histórico Global</h1>
                <div class="card">
                    <table style="width: 100%; text-align: left; border-collapse: collapse;">
                        <thead>
                            <tr style="border-bottom: 1px solid #eee;">
                                <th style="padding: 8px;">ID</th>
                                <th>Espaço</th>
                                <th>Data/Hora</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${bookings.map(b => {
                                const space = spaces.find(s => s.id === b.spaceId);
                                return `
                                <tr>
                                    <td style="padding: 8px;">#${b.id}</td>
                                    <td>${space ? space.name : '-'}</td>
                                    <td>${b.date} ${b.time}</td>
                                    <td><span class="badge ${b.status === 'approved' ? 'badge-success' : 'badge-warning'}">${b.status}</span></td>
                                </tr>
                            `}).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },
    // 10. Profile
    'profile': () => `
        <div class="main-content" id="main-content">
            <h1>Meu Perfil</h1>
            <div class="card" style="max-width: 600px;">
                <div class="form-group">
                    <label class="form-label">Nome</label>
                    <input type="text" class="form-control" value="${state.currentUser.name}" disabled>
                </div>
                <div class="form-group">
                    <label class="form-label">Perfil</label>
                    <input type="text" class="form-control" value="${state.currentUser.role === 'admin' ? 'Administrador' : 'Estudante'}" disabled>
                </div>
                <button class="btn btn-primary" onclick="showToast('Perfil atualizado com sucesso!')">Salvar Alterações</button>
            </div>
        </div>
    `,
    // Extra: No Permission State
    'no-permission': () => `
        <div class="main-content" id="main-content">
            <div class="empty-state">
                <div class="empty-icon" aria-hidden="true">🚫</div>
                <h1 style="color: var(--color-error)">Sem Permissão</h1>
                <p>Você não tem acesso a esta página.</p>
                <button class="btn btn-primary mt-4" onclick="navigateTo(state.currentUser && state.currentUser.role === 'admin' ? 'admin-dashboard' : 'dashboard')">Voltar ao Início</button>
            </div>
        </div>
    `
};

// --- Actions & Logic ---

function handleLogin(e) {
    e.preventDefault();
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    // Validation State
    let valid = true;
    if (!emailInput.value.includes('@')) {
        emailInput.classList.add('is-invalid');
        document.getElementById('email-error').classList.add('show');
        valid = false;
    } else {
        emailInput.classList.remove('is-invalid');
        document.getElementById('email-error').classList.remove('show');
    }

    if (passwordInput.value.length < 3) {
        passwordInput.classList.add('is-invalid');
        document.getElementById('password-error').classList.add('show');
        valid = false;
    } else {
        passwordInput.classList.remove('is-invalid');
        document.getElementById('password-error').classList.remove('show');
    }

    if (!valid) {
        showToast('Corrija os erros do formulário.', 'error');
        return;
    }

    // Loading State
    showLoading(true);
    
    // Simulate API call
    setTimeout(() => {
        // Mock Auth Logic
        if (emailInput.value === 'admin@admin.com') {
            state.currentUser = { id: 99, name: 'Admin Mariana', role: 'admin' };
            navigateTo('admin-dashboard');
        } else {
            state.currentUser = { id: 1, name: 'Estudante Lucas', role: 'student' };
            navigateTo('dashboard');
        }
        showLoading(false);
        showToast('Login realizado com sucesso!');
    }, 800);
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('reg-email').value;
    const role = document.getElementById('role').value;

    if(!name || !email) {
        showToast('Preencha todos os campos.', 'error');
        return;
    }

    showLoading(true);
    setTimeout(() => {
        state.currentUser = { id: Math.floor(Math.random() * 1000), name, role };
        navigateTo(role === 'admin' ? 'admin-dashboard' : 'dashboard');
        showLoading(false);
        showToast('Conta criada com sucesso!');
    }, 800);
}

function handleBook(e, spaceId) {
    e.preventDefault();
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;

    if(!date || !time) {
        showToast('Selecione data e hora', 'error');
        return;
    }

    showLoading(true);
    setTimeout(() => {
        bookings.push({
            id: Date.now(),
            userId: state.currentUser.id,
            spaceId: spaceId,
            date: date,
            time: time,
            status: 'pending'
        });
        navigateTo('my-bookings');
        showLoading(false);
        showToast('Reserva solicitada com sucesso!');
    }, 600);
}

function cancelBooking(id) {
    if(confirm('Tem certeza que deseja cancelar esta reserva?')) {
        bookings = bookings.filter(b => b.id !== id);
        render();
        showToast('Reserva cancelada.');
    }
}

function approveBooking(id) {
    const booking = bookings.find(b => b.id === id);
    if(booking) {
        booking.status = 'approved';
        render();
        showToast('Reserva aprovada!');
    }
}

function filterSpaces(query) {
    const q = query.toLowerCase();
    const cards = document.querySelectorAll('#spaces-list .card');
    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if(text.includes(q)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// --- Render Engine ---

function render() {
    const app = document.getElementById('app');
    
    let html = '';
    
    // Loading State Full Screen overlay
    if (state.isLoading) {
        html += `<div class="loading-overlay" aria-busy="true" aria-label="Carregando"><div class="spinner spinner-lg"></div></div>`;
    }

    html += getNavbar();
    
    const viewFn = views[state.currentRoute];
    if (viewFn) {
        html += viewFn();
    } else {
        html += `<div class="main-content"><h1>Erro 404</h1><p>Página não encontrada.</p></div>`;
    }

    app.innerHTML = html;
    
    // Focus management for accessibility
    setTimeout(() => {
        const mainContent = document.getElementById('main-content');
        if(mainContent) {
            mainContent.setAttribute('tabindex', '-1');
            mainContent.focus();
        }
    }, 50);
}

// Init
window.addEventListener('DOMContentLoaded', () => {
    render();
    
    // Acessibilidade Checklist - Initialize Focus on Skip Link
    document.querySelector('.skip-link').addEventListener('click', (e) => {
        e.preventDefault();
        const main = document.getElementById('main-content');
        if(main) {
            main.setAttribute('tabindex', '-1');
            main.focus();
        }
    });
});
