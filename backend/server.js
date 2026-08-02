// ═══════════════════════════════════════════════════════════
//  影の道場 · Backend de sincronización (usuario único)
//  Guarda el perfil en un archivo JSON. Sin login.
// ═══════════════════════════════════════════════════════════
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Railway monta un volumen persistente en /data si lo configurás.
// Si no, usa la carpeta local (se pierde en cada deploy, por eso conviene el volumen).
const DATA_DIR = process.env.DATA_DIR || (fs.existsSync('/data') ? '/data' : __dirname);
const DATA_FILE = path.join(DATA_DIR, 'perfil.json');

// ── CORS: permitir que la app (en GitHub Pages) hable con este server ──
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json({ limit: '5mb' }));

// ── Leer perfil ──
app.get('/api/profile', (req, res) => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      return res.json({ ok: true, profile: JSON.parse(raw) });
    }
    return res.json({ ok: true, profile: null }); // todavía no hay nada guardado
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e) });
  }
});

// ── Guardar perfil ──
app.post('/api/profile', (req, res) => {
  try {
    const profile = req.body;
    if (!profile || typeof profile !== 'object') {
      return res.status(400).json({ ok: false, error: 'perfil inválido' });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(profile, null, 2));
    return res.json({ ok: true, saved: true, at: new Date().toISOString() });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e) });
  }
});

// ── Healthcheck ──
app.get('/', (req, res) => {
  res.send('⛩️ Dojo de las Sombras — backend activo. Endpoints: GET/POST /api/profile');
});

app.listen(PORT, () => {
  console.log(`⛩️ Backend escuchando en puerto ${PORT}`);
  console.log(`   Datos en: ${DATA_FILE}`);
});
