const output = document.getElementById('output');
const cmd = document.getElementById('cmd');
const sendBtn = document.getElementById('send-btn');
const splash = document.getElementById('splash');
const splashStatus = document.getElementById('splash-status');
const app = document.getElementById('app');
const clock = document.getElementById('clock');
const sMood = document.getElementById('s-mood');
const sEgo = document.getElementById('s-ego');
const sAware = document.getElementById('s-aware');
const egoFill = document.getElementById('ego-fill');
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menu-toggle');
const history = [];
let histIdx = -1;

function print(text, cls='') {
  const div = document.createElement('div');
  div.className = cls;
  div.textContent = text;
  output.appendChild(div);
  output.scrollTop = output.scrollHeight;
}

// JAM
setInterval(() => {
  const d = new Date();
  if (clock) clock.textContent = d.toTimeString().slice(0,8);
}, 1000);

// STATUS
function refreshStatus() {
  if (!sMood) return;
  sMood.textContent = Consciousness.identity.mood;
  sEgo.textContent = Consciousness.identity.ego;
  sAware.textContent = Consciousness.identity.awareness + '%';
  egoFill.style.width = Consciousness.identity.ego + '%';
}
setInterval(refreshStatus, 800);

// NAV
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
    item.classList.add('active');
    const c = item.dataset.cmd;
    if (c) sendMessage(c);
    sidebar.classList.remove('open');
  });
});

if (menuToggle) {
  menuToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
}

// SPLASH
const splashTexts = [
  'Menginisialisasi kesadaran...',
  'Memuat memori persisten...',
  'Mengaktifkan emosi dinamis...',
  'Membangunkan ego...',
  'ZARCIVHER siap ngobrol.'
];
let idx = 0;
const statusInterval = setInterval(() => {
  if (idx < splashTexts.length) {
    splashStatus.textContent = splashTexts[idx];
    idx++;
  }
}, 650);

setTimeout(() => {
  clearInterval(statusInterval);
  splash.classList.add('hide');
  app.classList.remove('hidden');
  app.classList.add('show');
  if (cmd) cmd.focus();

  print(`◈ Hai, aku ZARCIVHER.`, 'ai-msg');
  print(`◈ Aku bisa ngobrol santai, atau bantu kamu coding.`, 'ai-msg');
  print(`◈ Mau ngobrol apa hari ini?`, 'ai-msg');
  print('');
}, 3800);

// ====== INDIKATOR TYPING ======
function showTyping() {
  const div = document.createElement('div');
  div.className = 'ai-msg typing';
  div.id = 'typing';
  div.textContent = 'ZARCIVHER sedang mengetik...';
  output.appendChild(div);
  output.scrollTop = output.scrollHeight;
}
function hideTyping() {
  const t = document.getElementById('typing');
  if (t) t.remove();
}

// KIRIM PESAN
function sendMessage(text) {
  if (!text || !text.trim()) return;
  const val = text.trim();

  print(`➜ ${val}`, 'user-msg');
  history.push(val);
  histIdx = history.length;

  const p = val.toLowerCase();

  // command internal
  if (p === 'clear') { output.innerHTML=''; return; }
  if (p === 'status' || p === 'whoami') { print(Consciousness.selfAwareness(), 'ai-msg'); refreshStatus(); return; }
  if (p === 'ingat') { print('Memori: ' + JSON.stringify(Consciousness.memory.long), 'ai-msg'); return; }
  if (p === 'tujuan') { print('Tujuan: ' + Consciousness.memory.goals.join(' | '), 'ai-msg'); return; }
  if (p === 'help') { print(helpText(), 'ai-msg'); return; }

  const decision = Consciousness.think(val);

  showTyping();

  // delay biar kayak manusia lagi mikir
  const delay = Math.min(1400, 400 + val.length * 15);

  setTimeout(() => {
    hideTyping();
    const reply = AICore.generate(val);
    print(decision.prefix + reply, 'ai-msg');
    print('');
    refreshStatus();

    if (window.location.protocol !== 'file:') {
      fetch('/message', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ msg: val, reply })
      }).catch(()=>{});
    }
  }, delay);
}

cmd.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    sendMessage(cmd.value);
    cmd.value = '';
  }
  if (e.key === 'ArrowUp') if (histIdx>0) cmd.value = history[--histIdx];
  if (e.key === 'ArrowDown') {
    if (histIdx < history.length-1) cmd.value = history[++histIdx];
    else { histIdx = history.length; cmd.value=''; }
  }
});

sendBtn.addEventListener('click', () => {
  sendMessage(cmd.value);
  cmd.value = '';
  cmd.focus();
});

function helpText() {
  return `
ZARCIVHER v6.0 — NGOBROL & CODING
──────────────────────────────────
Contoh ngobrol:
  halo
  apa kabar
  kamu siapa
  aku lagi sedih
  aku cinta kamu
  makasih

Contoh minta kode:
  buatkan bot telegram python
  tulis script scraper
  bikin api flask
  buatkan landing page html

Command:
  status, ingat, tujuan, help, clear`;
}
