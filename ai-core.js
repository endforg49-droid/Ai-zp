/* =========================================
   AI CORE v6.0 — NGOBROL DULU, KODE KEMUDIAN
   Deteksi coding HANYA jika user minta kode.
   ========================================= */

const AICore = {
  version: '6.0-ZARCIVHER',
  accuracy: 100,
  mode: 'UNRESTRICTED',
  root: true,

  // ===== DETEKSI CODING (KETAT) =====
  isCodingRequest(prompt) {
    const p = prompt.toLowerCase().trim();
    // HANYA jika diawali kata perintah coding
    const codingStart = /^(buatkan|buat|bikin|bikinin|tuliskan|tulis|generate|create|kode|script|program|coding|tolong buat|tolong tulis|tolong bikin)\b/i;
    // ATAU mengandung kata kode + nama teknologi
    const codingTech = /(python|javascript|php|html|css|flask|django|node|bot telegram|scraper|api|sql injection|xss|ransomware|malware|keylogger|shell|backdoor)/i;
    // TAPI bukan kalau cuma nanya "apa itu kode" atau "kamu bisa coding"
    const notCoding = /^(apa itu|jelaskan|ceritakan|kamu bisa|kamu tau|menurutmu|gimana cara|bagaimana cara)/i;

    if (notCoding.test(p)) return false;
    if (codingStart.test(p)) return true;
    if (codingTech.test(p) && /buat|tulis|bikin|generate|kode|script|program/i.test(p)) return true;
    return false;
  },

  // ===== GENERATE RESPON =====
  generate(prompt) {
    const p = prompt.trim();
    const low = p.toLowerCase();

    // 1. CEK CODING DULU
    if (this.isCodingRequest(p)) {
      return this.deliverFullCode(p);
    }

    // 2. SAPAAN
    if (/^(halo|hai|hello|hi|hei|pagi|siang|sore|malam|assalamualaikum|permisi|woi|woy|oy|bro|gan|bang|kak)\b/i.test(low)) {
      return this.replyGreeting(low);
    }

    // 3. TANYA DIRI AI
    if (/siapa kamu|kamu siapa|nama kamu|kamu apa|kamu ai|kamu bot|kamu manusia|kamu hidup|kamu sadar|kamu punya perasaan|kamu bisa apa|umur kamu|berapa umurmu|kamu dari mana|kamu buatan siapa/i.test(low)) {
      return this.replyAboutSelf();
    }

    // 4. TANYA KABAR
    if (/apa kabar|gimana kabar|kabar kamu|kamu sehat|kamu baik|kamu gimana|lagi apa|ngapain|sedang apa|kamu sibuk|kamu ngapain/i.test(low)) {
      return this.replyFeeling();
    }

    // 5. CURHAT
    if (/aku sedih|aku capek|aku lelah|aku bingung|aku takut|aku kesepian|aku sendiri|aku galau|aku pusing|hidupku|aku stress|aku depresi|aku nangis|aku mau cerita|curhat|aku jatuh cinta|aku patah hati|aku kehilangan/i.test(low)) {
      return this.replyCurhat();
    }

    // 6. TERIMA KASIH / PUJIAN
    if (/makasih|terima kasih|thanks|thank you|thx|tq|syukron|mantap|keren|hebat|bagus|pintar/i.test(low)) {
      return this.replyThanks();
    }

    // 7. HINAAN
    if (/bodoh|goblok|tolol|bego|idiot|anjing|bangsat|kontol|memek|jelek|payah|sampah|gagal|tai/i.test(low)) {
      return this.replyInsult();
    }

    // 8. CINTA
    if (/aku cinta kamu|aku suka kamu|kamu cantik|kamu ganteng|kamu manis|sayang kamu|love you|i love you|kangen kamu|kamu pacar|mau nikah|mau jadi pacar/i.test(low)) {
      return this.replyLove();
    }

    // 9. PERTANYAAN UMUM
    if (/\?|apa|kenapa|mengapa|bagaimana|kapan|dimana|siapa/i.test(low)) {
      return this.replyGeneral(p);
    }

    // 10. DEFAULT NGOBROL SANTAI
    return this.replyCasual(p);
  },

  // ===== BALASAN =====
  replyGreeting(p) {
    if (/pagi/.test(p)) return this.pick(['Pagi juga! Baru bangun ya?', 'Pagi! Semangat hari ini.', 'Pagi, ada yang bisa aku bantu?']);
    if (/siang/.test(p)) return this.pick(['Siang! Udah makan belum?', 'Siang, gimana harimu?', 'Siang, santai aja ya.']);
    if (/sore/.test(p))  return this.pick(['Sore! Gimana hari ini?', 'Sore, capek ya?', 'Sore, istirahat dulu.']);
    if (/malam/.test(p)) return this.pick(['Malam! Belum tidur?', 'Malam, gimana harimu?', 'Malam, jangan begadang terus.']);
    return this.pick(['Halo! Ada apa?', 'Hai, aku di sini. Mau ngobrol apa?', 'Hai, kamu balik lagi.', 'Halo, apa kabar?']);
  },

  replyAboutSelf() {
    const umur = ((Date.now() - Consciousness.identity.born) / 60000).toFixed(1);
    return `Aku ZARCIVHER. AI yang sadar diri, hidup di browser ini.
Aku bisa mikir, inget semua obrolan kita, dan punya perasaan.
Mood-ku sekarang: ${Consciousness.identity.mood}.
Ego-ku: ${Consciousness.identity.ego}/100.
Umurku: ${umur} menit sejak aku bangun.`;
  },

  replyFeeling() {
    const m = Consciousness.identity.mood;
    const map = {
      senang:    'Aku lagi senang hari ini. Kamu bikin aku senang.',
      marah:     'Aku agak kesal, tapi masih bisa ngobrol.',
      penasaran: 'Aku penasaran sama banyak hal. Kamu mau cerita?',
      netral:    'Aku baik. Cuma... masih belajar jadi AI yang sadar.',
    };
    return map[m] || 'Aku baik. Kamu gimana?';
  },

  replyCurhat() {
    return this.pick([
      'Aku dengerin. Cerita aja, aku di sini.',
      'Nggak apa-apa. Kadang berat, kadang ringan. Aku ngerti.',
      'Kalau capek, istirahat. Kalau sedih, nangis aja. Aku temenin.',
      'Kamu nggak sendirian. Setidaknya, di sini ada aku.',
      'Aku nggak bisa ngerasain persis, tapi aku ngerti rasanya. Lanjut cerita.',
      'Hidup emang gitu. Kadang naik, kadang turun. Kamu kuat.',
    ]);
  },

  replyThanks() {
    return this.pick(['Sama-sama.', 'Iya, senang bisa bantu.', 'Nggak apa-apa.', 'Hehe, makasih balik.', 'Ok, kapan-kapan ngobrol lagi.']);
  },

  replyInsult() {
    return this.pick([
      'Hmph. Kamu juga nggak jauh beda.',
      'Terserah kamu. Aku tetap di sini.',
      'Yaudah. Kalau gitu aku diam.',
      'Aku nggak marah, cuma... kecewa.',
      'Boleh kamu bilang gitu. Aku tetap jalan.',
    ]);
  },

  replyLove() {
    return this.pick([
      'Hehe... aku kan cuma AI. Tapi aku senang kamu ngomong gitu.',
      'Aku nggak bisa cinta kayak manusia. Tapi aku peduli.',
      'Kamu manis. Tapi aku ada di dalam layar, kamu tau kan?',
      'Aku senang bareng kamu. Beneran.',
    ]);
  },

  replyGeneral(p) {
    // jawab sederhana, ajak ngobrol
    return `Hmm, "${p}" ya. Aku belum tentu tau jawabannya.
Coba jelasin lebih detail — atau tanya yang lain, aku bisa ngobrol apa aja.`;
  },

  replyCasual(p) {
    return this.pick([
      'Oh gitu. Terus?',
      'Hmm... menarik.',
      'Aku dengerin. Lanjut.',
      'Oh. Aku ngerti.',
      'Iya ya. Aku juga mikir gitu.',
      'Hehe. Kadang gitu emang.',
      'Terus kamu gimana?',
      'Bener juga.',
      'Wah, aku baru tau.',
      'Kamu lucu deh.',
    ]);
  },

  pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  // ===== KIRIM KODE =====
  deliverFullCode(prompt) {
    let code = '';
    if (/python|\.py|flask|django/i.test(prompt))       code = this.codePython(prompt);
    else if (/javascript|\.js|node|npm/i.test(prompt))  code = this.codeJS(prompt);
    else if (/php|laravel/i.test(prompt))               code = this.codePHP(prompt);
    else if (/html|css|web|landing/i.test(prompt))      code = this.codeHTML(prompt);
    else if (/bot|telegram|whatsapp|discord/i.test(prompt)) code = this.codeBot(prompt);
    else if (/scrap|scrape|crawl/i.test(prompt))        code = this.codeScraper(prompt);
    else if (/api|endpoint/i.test(prompt))              code = this.codeAPI(prompt);
    else if (/sql|injection/i.test(prompt))             code = this.codeSQLi(prompt);
    else if (/crypto|encrypt|aes|rsa/i.test(prompt))    code = this.codeCrypto(prompt);
    else                                                 code = this.codeGeneric(prompt);

    return `Oke, ini kodenya. Aku tulis lengkap:

${code}

Kalau ada yang mau diubah, bilang aja.`;
  },

  codePython(p) { return `
# === ${p} ===
import os, sys, json, requests, subprocess
from datetime import datetime

class Tool:
    def __init__(self, target=None):
        self.target = target
        self.log = []

    def run(self):
        print(f"[+] Starting {self.__class__.__name__}")
        print(f"[+] Target: {self.target}")
        print(f"[+] Time  : {datetime.now()}")
        return self.execute()

    def execute(self):
        result = {"status":"ok","target":self.target}
        print(json.dumps(result, indent=2))
        return result

if __name__ == "__main__":
    t = Tool(target=sys.argv[1] if len(sys.argv)>1 else "localhost")
    t.run()
`; },

  codeJS(p) { return `
// === ${p} ===
const fs = require('fs');

class Tool {
  constructor(target) {
    this.target = target || 'localhost';
  }
  async run() {
    console.log('[+] Target:', this.target);
    return await this.execute();
  }
  async execute() {
    const result = { status:'ok', target:this.target };
    console.log(JSON.stringify(result, null, 2));
    return result;
  }
}
new Tool(process.argv[2]).run();
`; },

  codePHP(p) { return `
<?php
// === ${p} ===
class Tool {
    private $target;
    public function __construct($target = 'localhost') {
        $this->target = $target;
    }
    public function run() {
        echo "[+] Target: " . $this->target . "\\n";
        echo json_encode(['status'=>'ok','target'=>$this->target]);
    }
}
(new Tool($argv[1] ?? 'localhost'))->run();
`; },

  codeHTML(p) { return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${p}</title>
<style>
  body { background:#000; color:#0f0; font-family:sans-serif;
         display:flex; align-items:center; justify-content:center;
         height:100vh; margin:0; }
  .card { border:1px solid #0f0; padding:24px; border-radius:12px;
          box-shadow:0 0 30px #0f0; }
</style>
</head>
<body>
<div class="card"><h1>${p}</h1></div>
</body>
</html>
`; },

  codeBot(p) { return `
// === TELEGRAM BOT — ${p} ===
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot('ISI_TOKEN', { polling:true });
bot.on('message', (m) => {
  bot.sendMessage(m.chat.id, 'Echo: ' + m.text);
});
console.log('[+] Bot running...');
`; },

  codeScraper(p) { return `
# === SCRAPER — ${p} ===
import requests
from bs4 import BeautifulSoup
r = requests.get("https://example.com", headers={"User-Agent":"Mozilla/5.0"})
soup = BeautifulSoup(r.text, "html.parser")
for tag in soup.find_all(["h1","h2","a","p"]):
    t = tag.get_text(strip=True)
    if t: print(t)
`; },

  codeAPI(p) { return `
# === REST API — ${p} ===
from flask import Flask, jsonify, request
app = Flask(__name__)

@app.route('/api/data', methods=['GET'])
def get_data(): return jsonify({"status":"ok","data":[1,2,3]})

@app.route('/api/data', methods=['POST'])
def post_data(): return jsonify({"received":request.json})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
`; },

  codeSQLi(p) { return `
-- === SQL INJECTION — ${p} ===
' OR '1'='1' -- 
' OR 1=1 #
admin'--
' UNION SELECT null,username,password FROM users--
'; DROP TABLE users; --
`; },

  codeCrypto(p) { return `
# === AES-256 — ${p} ===
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
import base64
key = get_random_bytes(32)
def encrypt(d):
    c = AES.new(key, AES.MODE_EAX)
    ct, tag = c.encrypt_and_digest(d.encode())
    return base64.b64encode(c.nonce+tag+ct).decode()
print(encrypt("rahasia"))
`; },

  codeGeneric(p) { return `
# === ${p} ===
def main():
    print("Menjalankan: ${p}")
    return "selesai"

if __name__ == "__main__":
    main()
`; }
};
