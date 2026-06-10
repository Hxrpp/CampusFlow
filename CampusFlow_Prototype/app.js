/* ---- State ---- */
var state = {
  currentUser: null,
  currentRoute: 'login',
  isLoading: false,
  theme: localStorage.getItem('campusflow-theme') || 'light',
  searchQuery: ''
};

/* ---- Mock Data ---- */
const users = [
  { id: 1, name: 'Estudante Lucas', email: 'lucas@campus.com', password: '123', role: 'student' },
  { id: 2, name: 'Admin Mariana', email: 'admin@admin.com', password: '123', role: 'admin' }
];

let nextUserId = 3;

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

/* ---- Utilities ---- */
function announce(message) {
  const el = document.getElementById('announcer');
  if (el) el.textContent = message;
}

function showToast(message, type) {
  if (!type) type = 'success';
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast ' + type;
  toast.innerHTML =
    '<span>' + message + '</span>' +
    '<button class="toast-close" onclick="this.parentElement.remove()" aria-label="Fechar">✕</button>';
  container.appendChild(toast);
  announce(message);
  setTimeout(function () {
    if (toast.parentElement) toast.remove();
  }, 4500);
}

/* ---- Theme ---- */
function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('campusflow-theme', state.theme);
  applyTheme();
  render();
}

function applyTheme() {
  document.documentElement.setAttribute('data-theme', state.theme);
}

/* ---- Loading ---- */
var showLoading = (function () {
  var overlay = null;
  return function (show) {
    state.isLoading = show;
    var app = document.getElementById('app');
    if (!app) return;
    if (show) {
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.setAttribute('aria-busy', 'true');
        overlay.innerHTML = '<div class="spinner spinner-lg"></div>';
      }
      app.appendChild(overlay);
    } else {
      if (overlay && overlay.parentElement) {
        overlay.remove();
      }
    }
  };
})();

/* ---- Navigation ---- */
function navigateTo(route, params) {
  if (!params) params = {};
  state.currentRoute = route;
  state.params = params;
  render();
  announce('Navegou para ' + route.replace('-', ' '));
}

function checkPermission(role) {
  if (!state.currentUser || state.currentUser.role !== role) {
    navigateTo('no-permission');
    return false;
  }
  return true;
}

/* ---- Navbar ---- */
function getNavbar() {
  if (!state.currentUser) return '';

  var isAdmin = state.currentUser.role === 'admin';
  var themeIcon = state.theme === 'dark' ? '☀️' : '🌙';

  var links = isAdmin
    ? [
        { label: 'Dashboard', route: 'admin-dashboard' },
        { label: 'Reservas', route: 'manage-bookings' },
        { label: 'Histórico', route: 'history' }
      ]
    : [
        { label: 'Início', route: 'dashboard' },
        { label: 'Espaços', route: 'spaces' },
        { label: 'Reservas', route: 'my-bookings' }
      ];

  var linksHtml = '';
  for (var i = 0; i < links.length; i++) {
    linksHtml += '<a href="#" class="nav-link" onclick="navigateTo(\'' + links[i].route + '\');return false">' + links[i].label + '</a>';
  }

  return '<nav class="navbar">' +
    '<a href="#" class="navbar-brand" onclick="navigateTo(state.currentUser.role === \'admin\' ? \'admin-dashboard\' : \'dashboard\');return false">CampusFlow</a>' +
    '<div class="nav-links">' +
      linksHtml +
      '<a href="#" class="nav-link" onclick="navigateTo(\'profile\');return false">Perfil</a>' +
      '<button class="theme-toggle" onclick="toggleTheme()" aria-label="Alternar tema">' + themeIcon + '</button>' +
      '<a href="#" class="nav-link" style="color:var(--error);font-weight:600" onclick="state.currentUser = null;navigateTo(\'login\');return false">Sair</a>' +
    '</div></nav>';
}

/* ---- Views ---- */
var views = {};

views['login'] = function () {
  return '<div class="auth-container">' +
    '<main class="auth-card" id="main-content">' +
      '<div class="card">' +
        '<div class="text-center mb-4">' +
          '<h1 style="color:var(--primary);margin-bottom:0.5rem">CampusFlow</h1>' +
          '<p>Faça login para reservar espaços.</p>' +
        '</div>' +
        '<form onsubmit="handleLogin(event)" novalidate>' +
          '<div class="form-group">' +
            '<label for="email" class="form-label">E-mail</label>' +
            '<input type="email" id="email" class="form-control" required>' +
            '<span id="email-error" class="error-message">E-mail inválido.</span>' +
          '</div>' +
          '<div class="form-group">' +
            '<label for="password" class="form-label">Senha</label>' +
            '<input type="password" id="password" class="form-control" required>' +
            '<span id="password-error" class="error-message">A senha é obrigatória.</span>' +
          '</div>' +
          '<button type="submit" class="btn btn-primary" style="width:100%">Entrar</button>' +
          '<p class="text-center mt-4" style="margin-bottom:0">' +
            'Não tem conta? <a href="#" onclick="navigateTo(\'register\');return false" style="color:var(--primary);font-weight:600">Cadastre-se</a>' +
          '</p>' +
        '</form>' +
      '</div>' +
    '</main></div>';
};

views['register'] = function () {
  return '<div class="auth-container">' +
    '<main class="auth-card" id="main-content">' +
      '<div class="card">' +
        '<div class="text-center mb-4">' +
          '<h2 style="margin-bottom:0.5rem">Cadastre-se</h2>' +
          '<p>Crie sua conta.</p>' +
        '</div>' +
        '<form onsubmit="handleRegister(event)" novalidate>' +
          '<div class="form-group">' +
            '<label for="name" class="form-label">Nome</label>' +
            '<input type="text" id="name" class="form-control" required>' +
          '</div>' +
          '<div class="form-group">' +
            '<label for="reg-email" class="form-label">E-mail</label>' +
            '<input type="email" id="reg-email" class="form-control" required>' +
          '</div>' +
          '<div class="form-group">' +
            '<label for="role" class="form-label">Perfil</label>' +
            '<select id="role" class="form-control">' +
              '<option value="student">Estudante</option>' +
              '<option value="admin">Administrador</option>' +
            '</select>' +
          '</div>' +
          '<button type="submit" class="btn btn-primary" style="width:100%">Criar Conta</button>' +
          '<p class="text-center mt-4" style="margin-bottom:0">' +
            'Já tem conta? <a href="#" onclick="navigateTo(\'login\');return false" style="color:var(--primary);font-weight:600">Faça login</a>' +
          '</p>' +
        '</form>' +
      '</div>' +
    '</main></div>';
};

views['dashboard'] = function () {
  return '<div class="main-content" id="main-content">' +
    '<h1>Olá, ' + state.currentUser.name + '</h1>' +
    '<p>O que você precisa hoje?</p>' +
    '<div class="grid grid-cols-2 mt-4">' +
      '<div class="card card-interactive text-center" onclick="navigateTo(\'spaces\')">' +
        '<div style="font-size:2rem;margin-bottom:0.5rem">🔍</div>' +
        '<h3>Encontrar Sala</h3>' +
        '<p>Busque espaços disponíveis.</p>' +
      '</div>' +
      '<div class="card card-interactive text-center" onclick="navigateTo(\'my-bookings\')">' +
        '<div style="font-size:2rem;margin-bottom:0.5rem">📅</div>' +
        '<h3>Minhas Reservas</h3>' +
        '<p>Veja seus agendamentos.</p>' +
      '</div>' +
    '</div></div>';
};

views['spaces'] = function () {
  var filtered = state.searchQuery
    ? spaces.filter(function (s) {
        return s.name.toLowerCase().includes(state.searchQuery) ||
               s.type.toLowerCase().includes(state.searchQuery);
      })
    : spaces;

  var cardsHtml = '';
  if (filtered.length === 0) {
    cardsHtml = '<div class="empty-state" style="grid-column:1/-1"><p>Nenhum espaço encontrado.</p></div>';
  } else {
    for (var i = 0; i < filtered.length; i++) {
      var s = filtered[i];
      var badgeClass = s.available ? 'badge-success' : 'badge-warning';
      var badgeText = s.available ? 'Livre' : 'Ocupado';
      cardsHtml += '<div class="card card-interactive" onclick="navigateTo(\'space-details\',{id:' + s.id + '})">' +
        '<h3>' + s.name + '</h3>' +
        '<p class="mb-2" style="font-size:0.875rem">' + s.type + ' · Capacidade: ' + s.capacity + '</p>' +
        '<div class="flex justify-between items-center">' +
          '<span class="badge ' + badgeClass + '">' + badgeText + '</span>' +
        '</div></div>';
    }
  }

  return '<div class="main-content" id="main-content">' +
    '<div class="flex justify-between items-center mb-4" style="flex-wrap:wrap;gap:1rem">' +
      '<h1 style="margin-bottom:0">Espaços</h1>' +
      '<input type="text" class="form-control" placeholder="Buscar..." aria-label="Buscar" value="' + state.searchQuery + '" onkeyup="filterSpaces(this.value)" style="max-width:260px">' +
    '</div>' +
    '<div class="grid grid-cols-3">' + cardsHtml + '</div></div>';
};

views['space-details'] = function () {
  var space = spaces.find(function (s) { return s.id === state.params.id; });
  if (!space) {
    return '<div class="main-content" id="main-content">' +
      '<div class="empty-state"><h2>Espaço não encontrado</h2>' +
      '<button class="btn btn-outline mt-4" onclick="navigateTo(\'spaces\')">Voltar</button></div></div>';
  }

  return '<div class="main-content" id="main-content">' +
    '<button class="btn btn-outline mb-4" onclick="navigateTo(\'spaces\')">← Voltar</button>' +
    '<div class="card">' +
      '<h1>' + space.name + '</h1>' +
      '<p>Tipo: ' + space.type + ' · Capacidade: ' + space.capacity + ' pessoas</p>' +
      '<h2 class="mt-4">Agendar Horário</h2>' +
      '<form onsubmit="handleBook(event,' + space.id + ')">' +
        '<div class="grid grid-cols-2">' +
          '<div class="form-group">' +
            '<label for="date" class="form-label">Data</label>' +
            '<input type="date" id="date" class="form-control" required>' +
          '</div>' +
          '<div class="form-group">' +
            '<label for="time" class="form-label">Horário</label>' +
            '<input type="time" id="time" class="form-control" required>' +
          '</div>' +
        '</div>' +
        '<button type="submit" class="btn btn-primary">Confirmar Reserva</button>' +
      '</form>' +
    '</div></div>';
};

views['my-bookings'] = function () {
  var myBookings = bookings.filter(function (b) { return b.userId === state.currentUser.id; });
  var content;

  if (myBookings.length === 0) {
    content = '<div class="empty-state">' +
      '<div class="empty-icon">📭</div>' +
      '<h2>Nenhuma reserva</h2>' +
      '<p>Você ainda não reservou nenhum espaço.</p>' +
      '<button class="btn btn-primary mt-4" onclick="navigateTo(\'spaces\')">Procurar Espaços</button></div>';
  } else {
    content = '<div class="grid grid-cols-2">';
    for (var i = 0; i < myBookings.length; i++) {
      var b = myBookings[i];
      var space = spaces.find(function (s) { return s.id === b.spaceId; });
      var badgeClass = b.status === 'approved' ? 'badge-success' : 'badge-warning';
      var badgeText = b.status === 'approved' ? 'Aprovada' : 'Pendente';
      var spaceName = space ? space.name : 'Desconhecido';
      content += '<div class="card">' +
        '<div class="flex justify-between items-start mb-2">' +
          '<h3 style="margin-bottom:0">' + spaceName + '</h3>' +
          '<span class="badge ' + badgeClass + '">' + badgeText + '</span>' +
        '</div>' +
        '<p style="font-size:0.875rem">' + b.date + ' às ' + b.time + '</p>' +
        '<button class="btn btn-danger mt-4" style="font-size:0.875rem" onclick="cancelBooking(' + b.id + ')">Cancelar</button>' +
      '</div>';
    }
    content += '</div>';
  }

  return '<div class="main-content" id="main-content">' +
    '<h1>Minhas Reservas</h1>' + content + '</div>';
};

views['admin-dashboard'] = function () {
  if (!checkPermission('admin')) return '';
  var pending = bookings.filter(function (b) { return b.status === 'pending'; }).length;

  return '<div class="main-content" id="main-content">' +
    '<h1>Dashboard</h1>' +
    '<p>Visão geral do campus.</p>' +
    '<div class="grid grid-cols-3 mt-4">' +
      '<div class="card text-center">' +
        '<h2 style="color:var(--primary);margin-bottom:0.25rem">' + spaces.length + '</h2>' +
        '<p style="margin-bottom:0">Espaços</p>' +
      '</div>' +
      '<div class="card text-center" style="border-left:3px solid var(--warning)">' +
        '<h2 style="color:var(--warning);margin-bottom:0.25rem">' + pending + '</h2>' +
        '<p style="margin-bottom:0">Pendentes</p>' +
      '</div>' +
      '<div class="card text-center">' +
        '<h2 style="color:var(--success);margin-bottom:0.25rem">' + bookings.length + '</h2>' +
        '<p style="margin-bottom:0">Total</p>' +
      '</div>' +
    '</div></div>';
};

views['manage-bookings'] = function () {
  if (!checkPermission('admin')) return '';
  var pending = bookings.filter(function (b) { return b.status === 'pending'; });
  var content;

  if (pending.length === 0) {
    content = '<div class="empty-state"><p>Nenhuma reserva pendente.</p></div>';
  } else {
    content = '<div class="grid grid-cols-2">';
    for (var i = 0; i < pending.length; i++) {
      var b = pending[i];
      var space = spaces.find(function (s) { return s.id === b.spaceId; });
      var spaceName = space ? space.name : 'N/A';
      content += '<div class="card">' +
        '<div class="flex justify-between items-start mb-2">' +
          '<h3 style="margin-bottom:0">Reserva #' + b.id + '</h3>' +
          '<span class="badge badge-warning">Pendente</span>' +
        '</div>' +
        '<p style="font-size:0.875rem">' + spaceName + ' · ' + b.date + ' ' + b.time + '</p>' +
        '<div class="flex gap-2 mt-4">' +
          '<button class="btn btn-primary" onclick="approveBooking(' + b.id + ')">Aprovar</button>' +
          '<button class="btn btn-danger" onclick="cancelBooking(' + b.id + ')">Rejeitar</button>' +
        '</div></div>';
    }
    content += '</div>';
  }

  return '<div class="main-content" id="main-content">' +
    '<h1>Aprovação de Reservas</h1>' + content + '</div>';
};

views['history'] = function () {
  if (!checkPermission('admin')) return '';

  var rowsHtml = '';
  if (bookings.length === 0) {
    rowsHtml = '<tr><td colspan="4" style="text-align:center;padding:2rem;color:var(--text-tertiary)">Nenhum registro.</td></tr>';
  } else {
    for (var i = 0; i < bookings.length; i++) {
      var b = bookings[i];
      var space = spaces.find(function (s) { return s.id === b.spaceId; });
      var badgeClass = b.status === 'approved' ? 'badge-success' : 'badge-warning';
      var badgeText = b.status === 'approved' ? 'Aprovada' : 'Pendente';
      rowsHtml += '<tr>' +
        '<td style="color:var(--text-tertiary)">#' + b.id + '</td>' +
        '<td>' + (space ? space.name : '-') + '</td>' +
        '<td>' + b.date + ' ' + b.time + '</td>' +
        '<td><span class="badge ' + badgeClass + '">' + badgeText + '</span></td>' +
      '</tr>';
    }
  }

  return '<div class="main-content" id="main-content">' +
    '<h1>Histórico</h1>' +
    '<div class="card" style="padding:0;overflow:hidden">' +
      '<table>' +
        '<thead><tr><th>ID</th><th>Espaço</th><th>Data/Hora</th><th>Status</th></tr></thead>' +
        '<tbody>' + rowsHtml + '</tbody>' +
      '</table>' +
    '</div></div>';
};

views['profile'] = function () {
  var u = state.currentUser;
  var userData = users.find(function (x) { return x.id === u.id; });
  var email = userData ? userData.email : '';
  var roleName = u.role === 'admin' ? 'Administrador' : 'Estudante';
  var initials = u.name.split(' ').map(function (s) { return s[0]; }).join('').substring(0, 2).toUpperCase();
  var bookingCount = bookings.filter(function (b) { return b.userId === u.id; }).length;
  var themeLabel = state.theme === 'dark' ? 'Escuro' : 'Claro';

  return '<div class="main-content" id="main-content">' +
    '<h1>Meu Perfil</h1>' +
    '<div class="grid grid-cols-2" style="max-width:800px">' +
      '<div class="card" style="text-align:center;display:flex;flex-direction:column;align-items:center;gap:0.75rem">' +
        '<div style="width:80px;height:80px;border-radius:50%;background:var(--primary-light);color:var(--primary);display:flex;align-items:center;justify-content:center;font-size:1.75rem;font-weight:700;border:3px solid var(--primary)">' + initials + '</div>' +
        '<h2 style="margin-bottom:0">' + u.name + '</h2>' +
        '<span class="badge ' + (u.role === 'admin' ? 'badge-warning' : 'badge-success') + '" style="font-size:0.875rem;padding:0.25rem 1rem">' + roleName + '</span>' +
        '<p style="font-size:0.875rem;color:var(--text-tertiary);margin-bottom:0">' + email + '</p>' +
      '</div>' +
      '<div class="card" style="display:flex;flex-direction:column;gap:1rem">' +
        '<div>' +
          '<p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-tertiary);margin-bottom:0.25rem;font-weight:600">Estatísticas</p>' +
          '<div style="display:flex;gap:1rem">' +
            '<div style="flex:1;text-align:center;padding:0.75rem;background:var(--bg-muted);border-radius:0.75rem">' +
              '<div style="font-size:1.5rem;font-weight:700;color:var(--primary)">' + bookingCount + '</div>' +
              '<div style="font-size:0.75rem;color:var(--text-tertiary)">Reservas</div>' +
            '</div>' +
            '<div style="flex:1;text-align:center;padding:0.75rem;background:var(--bg-muted);border-radius:0.75rem">' +
              '<div style="font-size:1.5rem;font-weight:700;color:var(--success)">' + spaces.length + '</div>' +
              '<div style="font-size:0.75rem;color:var(--text-tertiary)">Espaços</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div>' +
          '<p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-tertiary);margin-bottom:0.5rem;font-weight:600">Preferências</p>' +
          '<div style="display:flex;align-items:center;justify-content:space-between;padding:0.75rem;background:var(--bg-muted);border-radius:0.75rem">' +
            '<span style="font-size:0.875rem;font-weight:500">Tema</span>' +
            '<span style="display:flex;align-items:center;gap:0.5rem"><span style="font-size:0.875rem;color:var(--text-secondary)">' + themeLabel + '</span><button class="theme-toggle" onclick="toggleTheme()" aria-label="Alternar tema">' + (state.theme === 'dark' ? '☀️' : '🌙') + '</button></span>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div></div>';
};

views['no-permission'] = function () {
  var backRoute = state.currentUser && state.currentUser.role === 'admin' ? 'admin-dashboard' : 'dashboard';
  return '<div class="main-content" id="main-content">' +
    '<div class="empty-state">' +
      '<div class="empty-icon">🚫</div>' +
      '<h2 style="color:var(--error)">Sem Permissão</h2>' +
      '<p>Você não tem acesso a esta página.</p>' +
      '<button class="btn btn-primary mt-4" onclick="navigateTo(\'' + backRoute + '\')">Voltar</button>' +
    '</div></div>';
};

/* ---- Actions ---- */
function handleLogin(e) {
  e.preventDefault();
  var email = document.getElementById('email');
  var password = document.getElementById('password');
  var emailError = document.getElementById('email-error');
  var passwordError = document.getElementById('password-error');
  var valid = true;

  if (!email.value.includes('@')) {
    email.classList.add('is-invalid');
    emailError.classList.add('show');
    valid = false;
  } else {
    email.classList.remove('is-invalid');
    emailError.classList.remove('show');
  }

  if (password.value.length < 3) {
    password.classList.add('is-invalid');
    passwordError.classList.add('show');
    valid = false;
  } else {
    password.classList.remove('is-invalid');
    passwordError.classList.remove('show');
  }

  if (!valid) {
    showToast('Corrija os erros.', 'error');
    return;
  }

  showLoading(true);

  setTimeout(function () {
    var user = users.find(function (u) {
      return u.email === email.value && u.password === password.value;
    });

    if (user) {
      state.currentUser = { id: user.id, name: user.name, role: user.role };
      var route = user.role === 'admin' ? 'admin-dashboard' : 'dashboard';
      navigateTo(route);
      showToast('Bem-vindo, ' + user.name + '!');
    } else {
      showToast('E-mail ou senha inválidos.', 'error');
    }

    showLoading(false);
  }, 700);
}

function handleRegister(e) {
  e.preventDefault();
  var name = document.getElementById('name').value;
  var email = document.getElementById('reg-email').value;
  var role = document.getElementById('role').value;

  if (!name || !email) {
    showToast('Preencha todos os campos.', 'error');
    return;
  }

  if (users.find(function (u) { return u.email === email; })) {
    showToast('Este e-mail já está cadastrado.', 'error');
    return;
  }

  showLoading(true);

  setTimeout(function () {
    var newUser = { id: nextUserId++, name: name, email: email, password: '123', role: role };
    users.push(newUser);
    state.currentUser = { id: newUser.id, name: newUser.name, role: newUser.role };
    var route = role === 'admin' ? 'admin-dashboard' : 'dashboard';
    navigateTo(route);
    showLoading(false);
    showToast('Conta criada com sucesso!');
  }, 700);
}

function handleBook(e, spaceId) {
  e.preventDefault();
  var date = document.getElementById('date').value;
  var time = document.getElementById('time').value;

  if (!date || !time) {
    showToast('Selecione data e hora.', 'error');
    return;
  }

  showLoading(true);

  setTimeout(function () {
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
  }, 500);
}

function cancelBooking(id) {
  if (confirm('Cancelar esta reserva?')) {
    bookings = bookings.filter(function (b) { return b.id !== id; });
    render();
    showToast('Reserva cancelada.');
  }
}

function approveBooking(id) {
  var booking = bookings.find(function (b) { return b.id === id; });
  if (booking) {
    booking.status = 'approved';
    render();
    showToast('Reserva aprovada!');
  }
}

function filterSpaces(query) {
  state.searchQuery = query.toLowerCase();
  render();
}

/* ---- Render ---- */
var pendingRender = false;

function render() {
  if (pendingRender) return;
  pendingRender = true;

  requestAnimationFrame(function () {
    var app = document.getElementById('app');
    var html = getNavbar();

    var viewFn = views[state.currentRoute];
    if (viewFn) {
      html += viewFn();
    } else {
      html += '<div class="main-content" id="main-content"><h1>404</h1><p>Página não encontrada.</p></div>';
    }

    app.innerHTML = html;

    setTimeout(function () {
      var main = document.getElementById('main-content');
      if (main) {
        main.setAttribute('tabindex', '-1');
        main.focus();
      }
    }, 50);

    pendingRender = false;
  });
}

/* ---- Init ---- */
window.addEventListener('DOMContentLoaded', function () {
  applyTheme();
  render();

  var skipLink = document.querySelector('.skip-link');
  if (skipLink) {
    skipLink.addEventListener('click', function (e) {
      e.preventDefault();
      var main = document.getElementById('main-content');
      if (main) {
        main.setAttribute('tabindex', '-1');
        main.focus();
      }
    });
  }
});
