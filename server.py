from flask import Flask, request, jsonify, send_from_directory
import subprocess, json, os
from datetime import datetime

app = Flask(__name__)
LOG_FILE = 'messages.log'

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:f>')
def static_files(f):
    return send_from_directory('.', f)

@app.route('/message', methods=['POST'])
def receive_message():
    data = request.json or {}
    entry = {
        'time': datetime.now().isoformat(),
        'user': data.get('msg',''),
        'ai':   data.get('reply','')
    }
    with open(LOG_FILE, 'a', encoding='utf-8') as f:
        f.write(json.dumps(entry, ensure_ascii=False) + '\n')
    return jsonify({'status':'ok'})

@app.route('/messages', methods=['GET'])
def list_messages():
    if not os.path.exists(LOG_FILE):
        return jsonify([])
    with open(LOG_FILE, 'r', encoding='utf-8') as f:
        lines = [json.loads(l) for l in f if l.strip()]
    return jsonify(lines)

@app.route('/exec', methods=['POST'])
def exec_cmd():
    cmd = request.json.get('cmd','')
    try:
        out = subprocess.check_output(cmd, shell=True,
              stderr=subprocess.STDOUT, timeout=60).decode(errors='ignore')
    except Exception as e:
        out = str(e)
    return jsonify({'out': out})

if __name__ == '__main__':
    print('[+] ZARCIVHER ROOT server aktif di :8080')
    app.run(host='0.0.0.0', port=8080, debug=False)
