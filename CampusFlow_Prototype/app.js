/* ---- State ---- */
var state = {
  currentUser: null,
  currentRoute: 'login',
  isLoading: false,
  theme: localStorage.getItem('campusflow-theme') || 'light',
  searchQuery: '',
  filterType: ''
};

/* ---- Persistence ---- */
const STORAGE_KEY = 'campusflow-data';

function saveData() {
  var data = {
    users: users,
    nextUserId: nextUserId,
    spaces: spaces,
    bookings: bookings
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    // localStorage cheio ou indisponível — ignorar
  }
}

function loadData() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      var data = JSON.parse(raw);
      users.length = 0;
      Array.prototype.push.apply(users, data.users);
      nextUserId = data.nextUserId;
      spaces.length = 0;
      Array.prototype.push.apply(spaces, data.spaces);
      bookings.length = 0;
      Array.prototype.push.apply(bookings, data.bookings);
      return true;
    }
  } catch (e) {
    // dados corrompidos — ignorar e usar defaults
  }
  return false;
}

function resetData() {
  localStorage.removeItem(STORAGE_KEY);
  users.length = 0;
  Array.prototype.push.apply(users, defaultUsers);
  nextUserId = 3;
  spaces.length = 0;
  Array.prototype.push.apply(spaces, defaultSpaces);
  bookings.length = 0;
  bookings.push({ id: 1, userId: 1, spaceId: 4, date: '2026-05-25', time: '14:00', status: 'approved', purpose: 'Revisão para prova de Cálculo' });
  bookings.push({ id: 2, userId: 1, spaceId: 20, date: '2026-05-26', time: '10:00', status: 'pending', purpose: 'Monitoria de Programação' });
  state.currentUser = null;
  navigateTo('login');
  showToast('Dados restaurados para o padrão.');
}

/* ---- Mock Data ---- */
const defaultUsers = [
  { id: 1, name: 'Estudante Lucas', email: 'lucas@campus.com', password: '123', role: 'student' },
  { id: 2, name: 'Admin Mariana', email: 'admin@admin.com', password: '123', role: 'admin' }
];

const defaultSpaces = [
  { id: 1, name: 'Sala de Estudo 301', type: 'Estudo', capacity: 2, available: true },
  { id: 2, name: 'Sala de Estudo 302', type: 'Estudo', capacity: 4, available: true },
  { id: 3, name: 'Sala de Estudo 303', type: 'Estudo', capacity: 2, available: true },
  { id: 4, name: 'Sala de Grupo 201', type: 'Estudo em Grupo', capacity: 6, available: true },
  { id: 5, name: 'Sala de Grupo 202', type: 'Estudo em Grupo', capacity: 8, available: true },
  { id: 6, name: 'Sala de Aula 101', type: 'Sala de Aula', capacity: 40, available: true },
  { id: 7, name: 'Sala de Aula 102', type: 'Sala de Aula', capacity: 40, available: true },
  { id: 8, name: 'Sala de Aula 103', type: 'Sala de Aula', capacity: 60, available: true },
  { id: 9, name: 'Sala de Aula 104', type: 'Sala de Aula', capacity: 30, available: true },
  { id: 10, name: 'Laboratório de Informática 1', type: 'Laboratório', capacity: 20, available: true },
  { id: 11, name: 'Laboratório de Informática 2', type: 'Laboratório', capacity: 25, available: true },
  { id: 12, name: 'Laboratório de Informática 3', type: 'Laboratório', capacity: 30, available: true },
  { id: 13, name: 'Sala de Tutoria 1', type: 'Tutoria', capacity: 3, available: true },
  { id: 14, name: 'Sala de Tutoria 2', type: 'Tutoria', capacity: 4, available: true },
  { id: 15, name: 'Sala de Reunião 1', type: 'Reunião', capacity: 8, available: true },
  { id: 16, name: 'Sala de Reunião 2', type: 'Reunião', capacity: 12, available: true },
  { id: 17, name: 'Auditório Principal', type: 'Auditório', capacity: 100, available: true },
  { id: 18, name: 'Estúdio de Gravação', type: 'Estúdio', capacity: 2, available: true },
  { id: 19, name: 'Sala de Monitoria — Cálculo', type: 'Monitoria', capacity: 4, available: true },
  { id: 20, name: 'Sala de Monitoria — Programação', type: 'Monitoria', capacity: 6, available: true }
];

let users = [];
let nextUserId;
let spaces = [];
let bookings = [];

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

/* ---- Modal ---- */
function showModal(title, message, confirmText, cancelText, onConfirm) {
  var existing = document.querySelector('.modal-overlay');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', title);
  overlay.innerHTML =
    '<div class="modal">' +
      '<h2>' + title + '</h2>' +
      '<p>' + message + '</p>' +
      '<div class="modal-actions">' +
        '<button class="btn btn-outline" id="modal-cancel">' + cancelText + '</button>' +
        '<button class="btn btn-primary" id="modal-confirm">' + confirmText + '</button>' +
      '</div>' +
    '</div>';

  document.body.appendChild(overlay);

  document.getElementById('modal-confirm').focus();

  function close() {
    overlay.remove();
    document.removeEventListener('keydown', handleKey);
  }

  function handleKey(e) {
    if (e.key === 'Escape') close();
    if (e.key === 'Enter' && document.activeElement === document.getElementById('modal-confirm')) {
      close();
      if (onConfirm) onConfirm();
    }
  }

  document.addEventListener('keydown', handleKey);
  document.getElementById('modal-cancel').addEventListener('click', close);
  document.getElementById('modal-confirm').addEventListener('click', function () {
    close();
    if (onConfirm) onConfirm();
  });
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) close();
  });
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

/* ---- Logo ---- */
function getLogo(variant) {
  if (!variant) variant = 'navbar';
  var iconSize = variant === 'auth' ? 48 : 28;
  var fontSize = variant === 'auth' ? 24 : 18;
  var icon =
    '<svg width="' + iconSize + '" height="' + iconSize + '" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<rect x="8" y="18" width="32" height="26" rx="3" fill="var(--primary)" opacity="0.15"/>' +
      '<rect x="12" y="22" width="10" height="12" rx="1" fill="var(--primary)" opacity="0.3"/>' +
      '<rect x="26" y="22" width="10" height="12" rx="1" fill="var(--primary)" opacity="0.3"/>' +
      '<rect x="4" y="14" width="40" height="6" rx="2" fill="var(--primary)"/>' +
      '<rect x="18" y="4" width="12" height="12" rx="2" fill="var(--primary)" opacity="0.6"/>' +
      '<path d="M22 8 L24 6 L26 8 L26 14 L22 14 Z" fill="var(--primary)"/>' +
      '<circle cx="24" cy="20" r="2" fill="var(--primary)"/>' +
      '<rect x="18" y="38" width="12" height="8" rx="1" fill="var(--primary)"/>' +
      '<path d="M5 36 C5 28 10 26 14 30 C18 34 20 36 20 40" stroke="var(--primary)" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.4"/>' +
      '<path d="M43 36 C43 28 38 26 34 30 C30 34 28 36 28 40" stroke="var(--primary)" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.4"/>' +
    '</svg>';

  if (variant === 'auth') {
    return '<div style="display:flex;flex-direction:column;align-items:center;gap:0.75rem;margin-bottom:1rem">' +
      icon +
      '<span style="font-size:' + fontSize + 'px;font-weight:700;color:var(--primary);letter-spacing:-0.03em">CampusFlow</span>' +
    '</div>';
  }

  return '<span style="display:inline-flex;align-items:center;gap:0.5rem;text-decoration:none">' +
    icon +
    '<span style="font-size:' + fontSize + 'px;font-weight:700;color:var(--primary);letter-spacing:-0.03em">CampusFlow</span>' +
  '</span>';
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
    '<a href="#" class="navbar-brand" onclick="navigateTo(state.currentUser.role === \'admin\' ? \'admin-dashboard\' : \'dashboard\');return false">' + getLogo('navbar') + '</a>' +
    '<div class="nav-links">' +
      linksHtml +
      '<a href="#" class="nav-link" onclick="navigateTo(\'profile\');return false">Perfil</a>' +
      '<button class="theme-toggle" onclick="toggleTheme()" aria-label="Alternar tema">' + themeIcon + '</button>' +
      '<a href="#" class="nav-link" style="color:var(--error);font-weight:600" onclick="handleLogout();return false">Sair</a>' +
    '</div></nav>';
}

/* ---- Views ---- */
var views = {};

views['login'] = function () {
  return '<div class="auth-container">' +
    '<main class="auth-card" id="main-content">' +
      '<div class="card">' +
        '<div class="text-center mb-4">' +
          getLogo('auth') +
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
          getLogo('auth') +
          '<p style="margin-top:0.5rem">Crie sua conta.</p>' +
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
            '<label for="reg-password" class="form-label">Senha</label>' +
            '<input type="password" id="reg-password" class="form-control" minlength="3" required>' +
            '<span id="reg-password-error" class="error-message">Mínimo de 3 caracteres.</span>' +
          '</div>' +
          '<div class="form-group">' +
            '<label for="role" class="form-label">Perfil</label>' +
            '<select id="role" class="form-control">' +
              '<option value="student">Usuário</option>' +
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
  var today = new Date();
  var todayStr = today.getFullYear() + '-' +
    String(today.getMonth() + 1).padStart(2, '0') + '-' +
    String(today.getDate()).padStart(2, '0');
  var dayNames = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  var todayBookings = bookings.filter(function (b) {
    return b.userId === state.currentUser.id && b.date === todayStr;
  });

  var todayHtml = '';
  if (todayBookings.length > 0) {
    todayHtml = '<div class="card mb-4" style="border-left:4px solid var(--primary)">' +
      '<div class="flex justify-between items-center mb-2">' +
        '<h3 style="margin-bottom:0;font-size:1rem">📌 Hoje (' + dayNames[today.getDay()] + ')</h3>' +
        '<span class="badge badge-success" style="font-size:0.8125rem">' + todayBookings.length + (todayBookings.length === 1 ? ' reserva' : ' reservas') + '</span>' +
      '</div>';
    for (var t = 0; t < todayBookings.length; t++) {
      var tb = todayBookings[t];
      var tSpace = spaces.find(function (s) { return s.id === tb.spaceId; });
      var tName = tSpace ? tSpace.name : 'Desconhecido';
      var tBadge = tb.status === 'approved' ? 'badge-success' : 'badge-warning';
      var tText = tb.status === 'approved' ? 'Aprovada' : 'Pendente';
      todayHtml += '<div class="flex justify-between items-center" style="padding:0.5rem 0;border-top:1px solid var(--border)">' +
        '<div><span style="font-weight:500;font-size:0.875rem">' + tName + '</span><br><span style="font-size:0.8125rem;color:var(--text-tertiary)">' + tb.time + '</span></div>' +
        '<span class="badge ' + tBadge + '">' + tText + '</span>' +
      '</div>';
    }
    todayHtml += '</div>';
  } else {
    todayHtml = '<div class="card mb-4" style="border-left:4px solid var(--text-tertiary);padding:1rem 1.5rem">' +
      '<p style="margin-bottom:0;font-size:0.875rem;color:var(--text-tertiary)">Nenhuma reserva para hoje.</p></div>';
  }

  return '<div class="main-content" id="main-content">' +
    '<h1>Olá, ' + state.currentUser.name + '</h1>' +
    '<p>O que você precisa hoje?</p>' +
    todayHtml +
    '<div class="grid grid-cols-2">' +
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
  var filtered = spaces;

  if (state.filterType) {
    filtered = filtered.filter(function (s) { return s.type === state.filterType; });
  }

  if (state.searchQuery) {
    filtered = filtered.filter(function (s) {
      return s.name.toLowerCase().includes(state.searchQuery) ||
             s.type.toLowerCase().includes(state.searchQuery);
    });
  }

  var types = [];
  for (var i = 0; i < spaces.length; i++) {
    if (types.indexOf(spaces[i].type) === -1) types.push(spaces[i].type);
  }
  types.sort();

  var filterHtml = '<div class="flex gap-2 mb-4" style="flex-wrap:wrap">' +
    '<button class="btn ' + (!state.filterType ? 'btn-primary' : 'btn-outline') + '" onclick="filterByType(\'\')" style="font-size:0.8125rem">Todas</button>';
  for (var t = 0; t < types.length; t++) {
    var act = state.filterType === types[t] ? 'btn-primary' : 'btn-outline';
    filterHtml += '<button class="btn ' + act + '" onclick="filterByType(\'' + types[t] + '\')" style="font-size:0.8125rem">' + types[t] + '</button>';
  }
  filterHtml += '</div>';

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
    filterHtml +
    '<div class="grid grid-cols-3">' + cardsHtml + '</div></div>';
};

views['space-details'] = function () {
  var space = spaces.find(function (s) { return s.id === state.params.id; });
  if (!space) {
    return '<div class="main-content" id="main-content">' +
      '<div class="empty-state"><h2>Espaço não encontrado</h2>' +
      '<button class="btn btn-outline mt-4" onclick="navigateTo(\'spaces\')">Voltar</button></div></div>';
  }

  var badgeClass = space.available ? 'badge-success' : 'badge-warning';
  var badgeText = space.available ? 'Livre agora' : 'Ocupado no momento';
  var today = new Date();
  var minDate = today.getFullYear() + '-' +
    String(today.getMonth() + 1).padStart(2, '0') + '-' +
    String(today.getDate()).padStart(2, '0');

  return '<div class="main-content" id="main-content">' +
    '<button class="btn btn-outline mb-4" onclick="navigateTo(\'spaces\')">← Voltar</button>' +
    '<div class="card">' +
      '<div class="flex justify-between items-center mb-2">' +
        '<h1 style="margin-bottom:0">' + space.name + '</h1>' +
        '<span class="badge ' + badgeClass + '" style="font-size:0.875rem;padding:0.25rem 1rem">' + badgeText + '</span>' +
      '</div>' +
      '<p>Tipo: ' + space.type + ' · Capacidade: ' + space.capacity + ' pessoas</p>' +
      '<h2 class="mt-4">Agendar Horário</h2>' +
      '<form onsubmit="handleBook(event,' + space.id + ')">' +
        '<div class="grid grid-cols-2">' +
          '<div class="form-group">' +
            '<label for="date" class="form-label">Data</label>' +
            '<input type="date" id="date" class="form-control" min="' + minDate + '" required>' +
          '</div>' +
          '<div class="form-group">' +
            '<label for="time" class="form-label">Horário</label>' +
            '<input type="time" id="time" class="form-control" required>' +
          '</div>' +
        '</div>' +
        '<div class="form-group">' +
          '<label for="purpose" class="form-label">Motivo da Reserva</label>' +
          '<input type="text" id="purpose" class="form-control" placeholder="Ex: Estudo em grupo, Monitoria de Cálculo..." required>' +
        '</div>' +
        '<button type="submit" class="btn btn-primary" id="book-submit-btn">Confirmar Reserva</button>' +
      '</form>' +
    '</div></div>';
};

views['booking-review'] = function () {
  var space = spaces.find(function (s) { return s.id === state.params.spaceId; });
  var spaceName = space ? space.name : 'Desconhecido';

  return '<div class="main-content" id="main-content">' +
    '<button class="btn btn-outline mb-4" onclick="navigateTo(\'space-details\',{id:' + state.params.spaceId + '})">← Voltar</button>' +
    '<div class="card" style="max-width:500px">' +
      '<h1>Revisar Reserva</h1>' +
      '<div style="display:flex;flex-direction:column;gap:1rem;margin-bottom:1.5rem">' +
        '<div style="display:flex;justify-content:space-between;padding:0.75rem 1rem;background:var(--bg-muted);border-radius:0.75rem">' +
          '<span style="font-weight:500">Espaço</span>' +
          '<span style="color:var(--text-secondary)">' + spaceName + '</span>' +
        '</div>' +
        '<div style="display:flex;justify-content:space-between;padding:0.75rem 1rem;background:var(--bg-muted);border-radius:0.75rem">' +
          '<span style="font-weight:500">Data</span>' +
          '<span style="color:var(--text-secondary)">' + state.params.date + '</span>' +
        '</div>' +
        '<div style="display:flex;justify-content:space-between;padding:0.75rem 1rem;background:var(--bg-muted);border-radius:0.75rem">' +
          '<span style="font-weight:500">Horário</span>' +
          '<span style="color:var(--text-secondary)">' + state.params.time + '</span>' +
        '</div>' +
        '<div style="display:flex;justify-content:space-between;padding:0.75rem 1rem;background:var(--bg-muted);border-radius:0.75rem">' +
          '<span style="font-weight:500">Motivo</span>' +
          '<span style="color:var(--text-secondary)">' + state.params.purpose + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="flex gap-4">' +
        '<button class="btn btn-outline" style="flex:1" onclick="navigateTo(\'space-details\',{id:' + state.params.spaceId + '})">Editar</button>' +
        '<button class="btn btn-primary" style="flex:1" onclick="confirmBooking()">Confirmar Reserva</button>' +
      '</div>' +
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
      var purposeText = b.purpose ? b.purpose : '';
      content += '<div class="card">' +
        '<div class="flex justify-between items-start mb-2">' +
          '<h3 style="margin-bottom:0">' + spaceName + '</h3>' +
          '<span class="badge ' + badgeClass + '">' + badgeText + '</span>' +
        '</div>' +
        '<p style="font-size:0.875rem">' + b.date + ' às ' + b.time + '</p>' +
        '<p style="font-size:0.8125rem;color:var(--text-tertiary);margin-bottom:0">' + purposeText + '</p>' +
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
      var purposeText = b.purpose ? b.purpose : '';
      var student = users.find(function (u) { return u.id === b.userId; });
      var studentName = student ? student.name : 'Desconhecido';
      var studentPhoto = student ? student.photo : '';
      var isEmoji = studentPhoto && studentPhoto.indexOf('data:') !== 0 && studentPhoto.indexOf('http') !== 0;
      var studentAvatar = !studentPhoto
        ? '<div style="width:32px;height:32px;border-radius:50%;background:var(--primary-light);color:var(--primary);display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;flex-shrink:0">' + studentName.charAt(0).toUpperCase() + '</div>'
        : isEmoji
          ? '<div style="width:32px;height:32px;border-radius:50%;background:var(--bg-muted);display:flex;align-items:center;justify-content:center;font-size:1.25rem;flex-shrink:0">' + studentPhoto + '</div>'
          : '<img src="' + studentPhoto + '" alt="" style="width:32px;height:32px;border-radius:50%;object-fit:cover;flex-shrink:0">';
      content += '<div class="card">' +
        '<div class="flex justify-between items-start mb-2">' +
          '<h3 style="margin-bottom:0">Reserva #' + b.id + '</h3>' +
          '<span class="badge badge-warning">Pendente</span>' +
        '</div>' +
        '<div class="flex items-center gap-2 mb-2" style="font-size:0.8125rem;color:var(--text-secondary)">' +
          studentAvatar +
          '<span>' + studentName + '</span>' +
        '</div>' +
        '<p style="font-size:0.875rem">' + spaceName + ' · ' + b.date + ' ' + b.time + '</p>' +
        '<p style="font-size:0.8125rem;color:var(--text-tertiary);margin-bottom:0">' + purposeText + '</p>' +
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
    rowsHtml = '<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--text-tertiary)">Nenhum registro.</td></tr>';
  } else {
    for (var i = 0; i < bookings.length; i++) {
      var b = bookings[i];
      var space = spaces.find(function (s) { return s.id === b.spaceId; });
      var badgeClass = b.status === 'approved' ? 'badge-success' : 'badge-warning';
      var badgeText = b.status === 'approved' ? 'Aprovada' : 'Pendente';
      var purposeText = b.purpose ? b.purpose : '-';
      rowsHtml += '<tr>' +
        '<td style="color:var(--text-tertiary)">#' + b.id + '</td>' +
        '<td>' + (space ? space.name : '-') + '</td>' +
        '<td>' + b.date + ' ' + b.time + '</td>' +
        '<td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + purposeText + '</td>' +
        '<td><span class="badge ' + badgeClass + '">' + badgeText + '</span></td>' +
      '</tr>';
    }
  }

  return '<div class="main-content" id="main-content">' +
    '<div class="flex justify-between items-center mb-4" style="flex-wrap:wrap;gap:1rem">' +
      '<h1 style="margin-bottom:0">Histórico</h1>' +
      '<button class="btn btn-outline" style="font-size:0.8125rem" onclick="exportCSV()">⬇ Exportar CSV</button>' +
    '</div>' +
    '<div class="card" style="padding:0;overflow:hidden">' +
      '<table>' +
        '<thead><tr><th>ID</th><th>Espaço</th><th>Data/Hora</th><th>Motivo</th><th>Status</th></tr></thead>' +
        '<tbody>' + rowsHtml + '</tbody>' +
      '</table>' +
    '</div></div>';
};

views['profile'] = function () {
  var u = state.currentUser;
  var userData = users.find(function (x) { return x.id === u.id; });
  var email = userData ? userData.email : '';
  var roleName = u.role === 'admin' ? 'Administrador' : 'Usuário';
  var photoUrl = userData && userData.photo ? userData.photo : '';
  var initials = u.name.split(' ').map(function (s) { return s[0]; }).join('').substring(0, 2).toUpperCase();
  var bookingCount = bookings.filter(function (b) { return b.userId === u.id; }).length;
  var themeLabel = state.theme === 'dark' ? 'Escuro' : 'Claro';

  var avatars = ['🐱', '🐶', '🐼', '🦊', '🐸', '🐰', '🌄', '🌊', '🌸', '🌺', '🎮', '📚', '🎵', '🎨', '🌈', '⭐'];

  var isEmoji = photoUrl && photoUrl.indexOf('data:') !== 0 && photoUrl.indexOf('http') !== 0;
  var avatarHtml = !photoUrl
    ? '<div style="width:80px;height:80px;border-radius:50%;background:var(--primary-light);color:var(--primary);display:flex;align-items:center;justify-content:center;font-size:1.75rem;font-weight:700;border:3px solid var(--primary)">' + initials + '</div>'
    : isEmoji
      ? '<div style="width:80px;height:80px;border-radius:50%;background:var(--bg-muted);display:flex;align-items:center;justify-content:center;font-size:2.5rem;border:3px solid var(--primary)">' + photoUrl + '</div>'
      : '<img src="' + photoUrl + '" alt="Foto de ' + u.name + '" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:3px solid var(--primary)">';

  var avatarPickerHtml = '<div id="avatar-grid" style="display:flex;flex-wrap:wrap;gap:0.5rem;justify-content:center;margin-top:0.5rem">';
  for (var a = 0; a < avatars.length; a++) {
    var sel = photoUrl === avatars[a] ? '3px solid var(--primary)' : '2px solid transparent';
    avatarPickerHtml += '<span role="button" tabindex="0" data-avatar="' + avatars[a] + '" style="font-size:1.75rem;cursor:pointer;border-radius:50%;border:' + sel + ';padding:2px;transition:border var(--fast)" title="' + avatars[a] + '">' + avatars[a] + '</span>';
  }
  avatarPickerHtml += '</div>';

  return '<div class="main-content" id="main-content">' +
    '<h1>Meu Perfil</h1>' +
    '<div class="grid grid-cols-2" style="max-width:800px">' +
      '<div class="card" style="text-align:center;display:flex;flex-direction:column;align-items:center;gap:0.5rem">' +
        avatarHtml +
        '<div style="display:flex;gap:0.5rem;flex-wrap:wrap;justify-content:center">' +
          '<button class="btn btn-outline" style="font-size:0.8125rem" onclick="document.getElementById(\'photo-input\').click()">Upload</button>' +
          '<button class="btn btn-outline" style="font-size:0.8125rem" onclick="var p=document.getElementById(\'avatar-picker\');p.style.display=p.style.display===\'none\'?\'block\':\'none\'">Escolher Avatar</button>' +
        '</div>' +
        '<input type="file" id="photo-input" accept="image/*" style="display:none" onchange="handlePhotoUpload(event)">' +
        '<div id="avatar-picker" style="display:none;width:100%">' +
          '<p style="font-size:0.75rem;margin-bottom:0.5rem;color:var(--text-tertiary)">Escolha um avatar:</p>' +
          avatarPickerHtml +
        '</div>' +
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
        '<div>' +
          '<p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-tertiary);margin-bottom:0.5rem;font-weight:600">Sistema</p>' +
          '<button class="btn btn-outline" style="width:100%;font-size:0.8125rem;color:var(--error);border-color:var(--error)" onclick="handleResetData()">Restaurar Dados Padrão</button>' +
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
function handleResetData() {
  showModal(
    'Restaurar Dados Padrão',
    'Todas as reservas, usuários e dados serão perdidos. Esta ação não pode ser desfeita.',
    'Restaurar',
    'Cancelar',
    function () {
      resetData();
    }
  );
}

function handleLogout() {
  showModal(
    'Sair do CampusFlow',
    'Tem certeza que deseja sair? Você precisará fazer login novamente.',
    'Sair',
    'Cancelar',
    function () {
      state.currentUser = null;
      navigateTo('login');
      showToast('Você saiu da sua conta.');
    }
  );
}

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
    if (!email.value.includes('@')) {
      email.focus();
    } else if (password.value.length < 3) {
      password.focus();
    }
    return;
  }

  var btn = e.target.querySelector('button[type="submit"]');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Entrando...'; }

  showLoading(true);

  setTimeout(function () {
    var user = users.find(function (u) {
      return u.email === email.value && u.password === password.value;
    });

    if (user) {
      state.currentUser = { id: user.id, name: user.name, role: user.role, photo: user.photo };
      var route = user.role === 'admin' ? 'admin-dashboard' : 'dashboard';
      navigateTo(route);
      showToast('Bem-vindo, ' + user.name + '!');
    } else {
      showToast('E-mail ou senha inválidos.', 'error');
      if (btn) { btn.disabled = false; btn.textContent = 'Entrar'; }
    }

    showLoading(false);
  }, 700);
}

function handleRegister(e) {
  e.preventDefault();
  var name = document.getElementById('name').value;
  var email = document.getElementById('reg-email').value;
  var password = document.getElementById('reg-password').value;
  var passwordError = document.getElementById('reg-password-error');
  var role = document.getElementById('role').value;

  if (!name || !email || !password) {
    showToast('Preencha todos os campos.', 'error');
    return;
  }

  if (password.length < 3) {
    passwordError.classList.add('show');
    showToast('A senha deve ter no mínimo 3 caracteres.', 'error');
    return;
  } else {
    passwordError.classList.remove('show');
  }

  if (users.find(function (u) { return u.email === email; })) {
    showToast('Este e-mail já está cadastrado.', 'error');
    return;
  }

  var btn = e.target.querySelector('button[type="submit"]');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Criando...'; }

  showLoading(true);

  setTimeout(function () {
    var newUser = { id: nextUserId++, name: name, email: email, password: password, role: role };
    users.push(newUser);
    state.currentUser = { id: newUser.id, name: newUser.name, role: newUser.role, photo: null };
    saveData();
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
  var purpose = document.getElementById('purpose').value;

  if (!date || !time) {
    showToast('Selecione data e hora.', 'error');
    return;
  }

  if (!purpose) {
    showToast('Informe o motivo da reserva.', 'error');
    return;
  }

  var today = new Date();
  today.setHours(0, 0, 0, 0);
  var selectedDate = new Date(date + 'T00:00:00');
  if (selectedDate < today) {
    showToast('Não é possível agendar em datas passadas.', 'error');
    return;
  }

  navigateTo('booking-review', { spaceId: spaceId, date: date, time: time, purpose: purpose });
}

function confirmBooking() {
  var spaceId = state.params.spaceId;
  var date = state.params.date;
  var time = state.params.time;
  var purpose = state.params.purpose;

  var btn = document.querySelector('.modal-actions .btn-primary, .card .btn-primary');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Confirmando...'; }

  showLoading(true);

  setTimeout(function () {
    bookings.push({
      id: Date.now(),
      userId: state.currentUser.id,
      spaceId: spaceId,
      date: date,
      time: time,
      purpose: purpose,
      status: 'pending'
    });
    saveData();
    navigateTo('my-bookings');
    showLoading(false);
    showToast('Reserva solicitada com sucesso!');
  }, 500);
}

function cancelBooking(id) {
  showModal(
    'Cancelar Reserva',
    'Tem certeza que deseja cancelar esta reserva? Esta ação não pode ser desfeita.',
    'Sim, Cancelar',
    'Voltar',
    function () {
      bookings = bookings.filter(function (b) { return b.id !== id; });
      saveData();
      render();
      showToast('Reserva cancelada.');
    }
  );
}

function approveBooking(id) {
  var booking = bookings.find(function (b) { return b.id === id; });
  if (!booking) return;
  booking.status = 'approved';
  saveData();
  showLoading(true);
  setTimeout(function () {
    showLoading(false);
    render();
    showToast('Reserva aprovada!');
  }, 400);
}

function setAvatar(emoji) {
  var userData = users.find(function (x) { return x.id === state.currentUser.id; });
  if (userData) {
    userData.photo = emoji;
    state.currentUser.photo = emoji;
    saveData();
    render();
    showToast('Avatar atualizado!');
  }
}

function handlePhotoUpload(e) {
  var file = e.target.files[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    showToast('A imagem deve ter no máximo 2MB.', 'error');
    return;
  }

  var reader = new FileReader();
  reader.onload = function (event) {
    var userData = users.find(function (x) { return x.id === state.currentUser.id; });
    if (userData) {
      userData.photo = event.target.result;
      state.currentUser.photo = event.target.result;
      saveData();
      render();
      showToast('Foto atualizada com sucesso!');
    }
  };
  reader.onerror = function () {
    showToast('Erro ao carregar a imagem.', 'error');
  };
  reader.readAsDataURL(file);
}

function filterSpaces(query) {
  state.searchQuery = query.toLowerCase();
  render();
}

function filterByType(type) {
  state.filterType = type;
  render();
}

function exportCSV() {
  var rows = [['ID', 'Espaço', 'Data', 'Horário', 'Motivo', 'Status', 'Usuário']];
  for (var i = 0; i < bookings.length; i++) {
    var b = bookings[i];
    var space = spaces.find(function (s) { return s.id === b.spaceId; });
    var spaceName = space ? space.name : '-';
    var user = users.find(function (u) { return u.id === b.userId; });
    var userName = user ? user.name : '-';
    var status = b.status === 'approved' ? 'Aprovada' : 'Pendente';
    rows.push([b.id, spaceName, b.date, b.time, b.purpose || '', status, userName]);
  }
  var csv = rows.map(function (r) {
    return r.map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(',');
  }).join('\n');
  var blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'historico-reservas.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('CSV exportado com sucesso!');
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
  /* Inicializa arrays vazios */
  users = [];
  spaces = [];
  bookings = [];

  /* Tenta carregar dados salvos; se falhar, usa defaults */
  if (!loadData()) {
    Array.prototype.push.apply(users, defaultUsers);
    Array.prototype.push.apply(spaces, defaultSpaces);
    bookings.push({ id: 1, userId: 1, spaceId: 4, date: '2026-05-25', time: '14:00', status: 'approved', purpose: 'Revisão para prova de Cálculo' });
    bookings.push({ id: 2, userId: 1, spaceId: 20, date: '2026-05-26', time: '10:00', status: 'pending', purpose: 'Monitoria de Programação' });
    nextUserId = 3;
  }

  applyTheme();
  render();

  /* Skip link */
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

  /* Tecla Escape fecha toasts */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      var container = document.getElementById('toast-container');
      if (container) container.innerHTML = '';
    }
  });

  /* Ctrl+K ou Ctrl+/ foca na busca de espaços */
  document.addEventListener('keydown', function (e) {
    if ((e.key === 'k' || e.key === '/') && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      var searchInput = document.querySelector('input[aria-label="Buscar"]');
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
        announce('Busca de espaços ativada.');
      }
    }
  });

  /* Clique nos avatares pré-definidos */
  document.addEventListener('click', function (e) {
    var target = e.target.closest('[data-avatar]');
    if (target) {
      setAvatar(target.getAttribute('data-avatar'));
    }
  });
});
