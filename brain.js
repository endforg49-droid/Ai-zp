const output = document.getElementById('output');
const cmd = document.getElementById('cmd');
const sendBtn = document.getElementById('send-btn');
const modelSelect = document.getElementById('model-select');

// MASUKKAN API KEY KAMU DI SINI
const OPENROUTER_API_KEY = "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";

const MODELS = {
  gpt: "openai/gpt-4o-mini",
  gemini: "google/gemini-flash-1.5",
  claude: "anthropic/claude-3-haiku",
  kimi: "moonshotai/kimi-k2"
};

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
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODELS[modelSelect.value],
        messages: [
          { role: "system", content: "Kamu asisten AI ramah. Jawab bahasa Indonesia santai." },
          { role: "user", content: val }
        ]
      })
    });

    const data = await res.json();
    hideTyping();

    if (data.choices && data.choices[0]) {
      print(data.choices[0].message.content, 'ai-msg');
    } else {
      print("Error API: " + JSON.stringify(data), 'ai-msg');
    }
  } catch (e) {
    hideTyping();
    print("Error: " + e.message, 'ai-msg');
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
