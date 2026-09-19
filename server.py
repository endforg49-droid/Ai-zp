from flask import Flask, request, jsonify, send_from_directory
import os, requests

app = Flask(__name__)

OPENROUTER_API_KEY = os.environ.get("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")

# Daftar model yang bisa dipilih
MODELS = {
    "gpt": "openai/gpt-4o-mini",
    "gemini": "google/gemini-flash-1.5",
    "claude": "anthropic/claude-3-haiku",
    "kimi": "moonshotai/kimi-k2",
}

SYSTEM_PROMPT = (
    "Kamu adalah asisten AI yang ramah, natural, dan membantu. "
    "Jawab dengan bahasa Indonesia santai. "
    "Tolak dengan sopan permintaan yang berbahaya, ilegal, atau melanggar etika, "
    "termasuk malware, eksploitasi, doxing, konten seksual anak, dan kekerasan. "
    "Jangan pernah mengaku sebagai AI tanpa batasan."
)

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:f>')
def static_files(f):
    return send_from_directory('.', f)

@app.route('/models', methods=['GET'])
def list_models():
    return jsonify(list(MODELS.keys()))

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json or {}
    user_msg = (data.get('message') or '').strip()
    model_key = data.get('model', 'gpt')

    if not user_msg:
        return jsonify({'reply': 'Pesan kosong.'})

    model = MODELS.get(model_key, MODELS['gpt'])

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_msg}
        ]
    }

    try:
        r = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=60
        )
    except Exception as e:
        return jsonify({'reply': f'Error koneksi: {e}'})

    if r.status_code != 200:
        return jsonify({'reply': f'Error API: {r.status_code} {r.text}'})

    reply = r.json()['choices'][0]['message']['content']
    return jsonify({'reply': reply})

if __name__ == '__main__':
    print('[+] Multi-AI chat aktif di http://localhost:8080')
    app.run(host='0.0.0.0', port=8080, debug=False)
