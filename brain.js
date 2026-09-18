const output = document.getElementById('output');
const cmd = document.getElementById('cmd');
const sendBtn = document.getElementById('send-btn');
const modelSelect = document.getElementById('model-select');

function print(text, cls = '') {
  const div = document.createElement('div');
  div.className = cls;
  div.textContent = text;
  output.appendChild(div);
  output.scrollTop = output.scrollHeight;
}

function showTyping() {
  const div = document.createElement('div');
  div.className = 'ai-msg typing';
  div.id = 'typing';
  div.textContent = 'AI sedang mengetik...';
  output.appendChild(div);
  output.scrollTop = output.scrollHeight;
}

function hideTyping() {
  const t = document.getElementById('typing');
  if (t) t.remove();
}

async function sendMessage(text) {
  const val = text.trim();
  if (!val) return;

  print(`➜ ${val}`, 'user-msg');
  showTyping();

  try {
    const res = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: val,
        model: modelSelect.value
      })
    });

    const data = await res.json();
    hideTyping();
    print(data.reply, 'ai-msg');
  } catch (e) {
    hideTyping();
    print('Error: ' + e.message, 'ai-msg');
  }
}

cmd.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    sendMessage(cmd.value);
    cmd.value = '';
  }
});

sendBtn.addEventListener('click', () => {
  sendMessage(cmd.value);
  cmd.value = '';
  cmd.focus();
});

print('Hai. Pilih model di atas, lalu ketik apa saja.', 'ai-msg');
