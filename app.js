(function () {
  "use strict";

  /* ============ STORAGE HELPERS ============ */
  const store = {
    get(key, fallback) {
      try {
        const v = localStorage.getItem(key);
        return v === null ? fallback : JSON.parse(v);
      } catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
    }
  };

  const KEYS = {
    apiKey: "aurelia.apiKey",
    model: "aurelia.model",
    persona: "aurelia.persona",
    chat: "aurelia.chatHistory",
    tasks: "aurelia.tasks",
    notes: "aurelia.notes"
  };

  /* ============ NAVIGATION ============ */
  const navItems = document.querySelectorAll(".nav-item[data-view]");
  const views = document.querySelectorAll(".view");
  navItems.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.view;
      navItems.forEach(b => b.classList.toggle("is-active", b === btn));
      views.forEach(v => v.classList.toggle("is-active", v.id === "view-" + target));
    });
  });

  /* ============ API STATUS ============ */
  function refreshApiStatus() {
    const key = store.get(KEYS.apiKey, "");
    const chip = document.getElementById("apiStatus");
    const text = document.getElementById("apiStatusText");
    if (key) {
      chip.classList.add("is-ready");
      text.textContent = "API tersambung";
    } else {
      chip.classList.remove("is-ready");
      text.textContent = "API belum diatur";
    }
  }

  /* ============ SETTINGS VIEW ============ */
  const apiKeyInput = document.getElementById("apiKeyInput");
  const modelSelect = document.getElementById("modelSelect");
  const personaInput = document.getElementById("personaInput");
  const saveMsg = document.getElementById("saveMsg");

  apiKeyInput.value = store.get(KEYS.apiKey, "");
  modelSelect.value = store.get(KEYS.model, "gemini-2.5-flash");
  personaInput.value = store.get(KEYS.persona, "");

  document.getElementById("saveSettingsBtn").addEventListener("click", () => {
    store.set(KEYS.apiKey, apiKeyInput.value.trim());
    store.set(KEYS.model, modelSelect.value);
    store.set(KEYS.persona, personaInput.value.trim());
    refreshApiStatus();
    saveMsg.textContent = "Pengaturan tersimpan.";
    setTimeout(() => (saveMsg.textContent = ""), 2500);
  });

  document.getElementById("clearChatBtn").addEventListener("click", () => {
    store.set(KEYS.chat, []);
    renderChatHistory();
    saveMsg.textContent = "Riwayat percakapan dihapus.";
    setTimeout(() => (saveMsg.textContent = ""), 2500);
  });

  refreshApiStatus();

  /* ============ CHAT ============ */
  const chatLog = document.getElementById("chatLog");
  const chatEmpty = document.getElementById("chatEmpty");
  const chatScroll = document.getElementById("chatScroll");
  const composerForm = document.getElementById("composerForm");
  const composerInput = document.getElementById("composerInput");
  const sendBtn = document.getElementById("sendBtn");

  let history = store.get(KEYS.chat, []);

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  function renderContent(text) {
    const escaped = escapeHtml(text);
    const withBlocks = escaped.replace(/```(\w*)\n([\s\S]*?)```/g, (m, lang, code) => {
      return `<pre><code>${code}</code></pre>`;
    });
    return withBlocks.replace(/`([^`]+)`/g, "<code>$1</code>");
  }

  function addMessageToDOM(role, text) {
    chatEmpty.style.display = "none";
    const wrap = document.createElement("div");
    wrap.className = "msg is-" + role;
    const roleLabel = role === "user" ? "Kamu" : "Aurelia";
    wrap.innerHTML = `<div class="msg-role">${roleLabel}</div><div class="msg-body">${renderContent(text)}</div>`;
    chatLog.appendChild(wrap);
    chatScroll.scrollTop = chatScroll.scrollHeight;
    return wrap;
  }

  function renderChatHistory() {
    chatLog.innerHTML = "";
    if (history.length === 0) {
      chatEmpty.style.display = "block";
      return;
    }
    history.forEach(m => addMessageToDOM(m.role, m.content));
  }
  renderChatHistory();

  const SYSTEM_PROMPT_BASE =
    "Kamu adalah Aurelia, asisten AI pribadi yang sangat cerdas untuk membantu kegiatan sehari-hari " +
    "(perencanaan, keputusan, tulisan, ide, produktivitas) dan merupakan pemrogram Lua kelas ahli. " +
    "Saat membahas Lua, tulis kode yang idiomatik, jelaskan trade-off singkat, dan gunakan blok kode berpagar (```lua ... ```). " +
    "Jawab dalam Bahasa Indonesia kecuali diminta lain, dengan gaya ringkas namun hangat.";

  /* ============ CALL GOOGLE GEMINI API ============ */
  async function callGemini(userText) {
    const apiKey = store.get(KEYS.apiKey, "");
    const model = store.get(KEYS.model, "gemini-2.5-flash");
    const persona = store.get(KEYS.persona, "");
    if (!apiKey) {
      throw new Error("MISSING_KEY");
    }

    const systemInstruction = persona 
      ? SYSTEM_PROMPT_BASE + " Gaya tambahan yang diminta pengguna: " + persona 
      : SYSTEM_PROMPT_BASE;

    const contents = history.map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));
    contents.push({ role: "user", parts: [{ text: userText }] });

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: contents
      })
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      const msg = (errBody && errBody.error && errBody.error.message) || ("HTTP " + res.status);
      throw new Error(msg);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return text || "(tidak ada respons teks)";
  }

  async function sendMessage(text) {
    history.push({ role: "user", content: text });
    store.set(KEYS.chat, history);
    addMessageToDOM("user", text);

    const thinkingEl = document.createElement("div");
    thinkingEl.className = "msg is-assistant is-thinking";
    thinkingEl.innerHTML = `<div class="msg-role">Aurelia</div><div class="msg-body">Berpikir…</div>`;
    chatLog.appendChild(thinkingEl);
    chatScroll.scrollTop = chatScroll.scrollHeight;

    sendBtn.disabled = true;
    try {
      const reply = await callGemini(text);
      thinkingEl.remove();
      history.push({ role: "assistant", content: reply });
      store.set(KEYS.chat, history);
      addMessageToDOM("assistant", reply);
    } catch (err) {
      thinkingEl.remove();
      let msg;
      if (err.message === "MISSING_KEY") {
        msg = "Kunci API belum diatur. Buka Pengaturan untuk memasukkan Google Gemini API Key milikmu.";
      } else {
        msg = "Terjadi kesalahan saat menghubungi API: " + err.message;
      }
      addMessageToDOM("assistant", msg);
      history.pop();
      store.set(KEYS.chat, history);
    } finally {
      sendBtn.disabled = false;
    }
  }

  composerForm.addEventListener("submit", e => {
    e.preventDefault();
    const text = composerInput.value.trim();
    if (!text) return;
    composerInput.value = "";
    composerInput.style.height = "auto";
    sendMessage(text);
  });

  composerInput.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      composerForm.requestSubmit();
    }
  });

  composerInput.addEventListener("input", () => {
    composerInput.style.height = "auto";
    composerInput.style.height = Math.min(composerInput.scrollHeight, 160) + "px";
  });

  /* ============ TASKS ============ */
  const taskForm = document.getElementById("taskForm");
  const taskInput = document.getElementById("taskInput");
  const taskList = document.getElementById("taskList");
  const taskEmptyHint = document.getElementById("taskEmptyHint");

  let tasks = store.get(KEYS.tasks, []);

  function renderTasks() {
    taskList.innerHTML = "";
    taskEmptyHint.classList.toggle("is-visible", tasks.length === 0);
    tasks.forEach(t => {
      const li = document.createElement("li");
      li.className = "task-row" + (t.done ? " is-done" : "");
      li.innerHTML = `
        <span class="checkbox${t.done ? " is-done" : ""}" data-id="${t.id}"></span>
        <span class="label">${escapeHtml(t.label)}</span>
        <span class="remove" data-id="${t.id}">Hapus</span>
      `;
      taskList.appendChild(li);
    });
  }
  renderTasks();

  taskForm.addEventListener("submit", e => {
    e.preventDefault();
    const label = taskInput.value.trim();
    if (!label) return;
    tasks.push({ id: Date.now().toString(36), label, done: false });
    store.set(KEYS.tasks, tasks);
    taskInput.value = "";
    renderTasks();
  });

  taskList.addEventListener("click", e => {
    const id = e.target.dataset.id;
    if (!id) return;
    if (e.target.classList.contains("checkbox")) {
      tasks = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
      store.set(KEYS.tasks, tasks);
      renderTasks();
    } else if (e.target.classList.contains("remove")) {
      tasks = tasks.filter(t => t.id !== id);
      store.set(KEYS.tasks, tasks);
      renderTasks();
    }
  });

  /* ============ NOTES ============ */
  const notesArea = document.getElementById("notesArea");
  const notesSaved = document.getElementById("notesSaved");
  notesArea.value = store.get(KEYS.notes, "");

  let notesTimer = null;
  notesArea.addEventListener("input", () => {
    notesSaved.textContent = "Menyimpan…";
    clearTimeout(notesTimer);
    notesTimer = setTimeout(() => {
      store.set(KEYS.notes, notesArea.value);
      notesSaved.textContent = "Tersimpan";
    }, 400);
  });

  /* ============ LUA SANDBOX ============ */
  const luaEditor = document.getElementById("luaEditor");
  const luaOutput = document.getElementById("luaOutput");
  const luaRunBtn = document.getElementById("luaRunBtn");
  const luaAskBtn = document.getElementById("luaAskBtn");

  function runLua(code) {
    if (typeof fengari === "undefined") {
      return { ok: false, text: "Mesin Lua (fengari) gagal dimuat. Pastikan kamu terhubung ke internet saat membuka file ini." };
    }
    const { lua, lauxlib, lualib, to_luastring, to_jsstring } = fengari;
    const L = lauxlib.luaL_newstate();
    lualib.luaL_openlibs(L);

    const output = [];
    lua.lua_pushjsfunction(L, function (L) {
      const n = lua.lua_gettop(L);
      const parts = [];
      for (let i = 1; i <= n; i++) {
        parts.push(to_jsstring(lauxlib.luaL_tolstring(L, i)));
        lua.lua_pop(L, 1);
      }
      output.push(parts.join("\t"));
      return 0;
    });
    lua.lua_setglobal(L, to_luastring("print"));

    let ok = true;
    try {
      const status = lauxlib.luaL_dostring(L, to_luastring(code));
      if (status !== lua.LUA_OK) {
        ok = false;
        output.push("Error: " + to_jsstring(lua.lua_tostring(L, -1)));
      }
    } catch (e) {
      ok = false;
      output.push("Error: " + e.message);
    }
    return { ok, text: output.join("\n") || "(program berjalan tanpa keluaran)" };
  }

  luaRunBtn.addEventListener("click", () => {
    const result = runLua(luaEditor.value);
    luaOutput.textContent = result.text;
    luaOutput.classList.toggle("has-error", !result.ok);
    luaOutput.classList.toggle("has-content", result.ok);
  });

  luaAskBtn.addEventListener("click", () => {
    const code = luaEditor.value.trim();
    if (!code) return;
    const prompt = "Tolong jelaskan, dan jika perlu perbaiki, kode Lua berikut:\n```lua\n" + code + "\n```";
    document.querySelector('.nav-item[data-view="chat"]').click();
    composerInput.value = prompt;
    composerForm.requestSubmit();
  });

})();
