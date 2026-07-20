// Industry Standard — Bessemer backend
// Generic JSON key-value API backed by Postgres, so all managers/devices
// see the same shared data (meal counts, cost logs, inventory, menus, notes).

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

if (!process.env.DATABASE_URL) {
  console.error('Missing DATABASE_URL environment variable.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
});

async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_data (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  console.log('Database ready.');
}

app.get('/health', (req, res) => res.json({ ok: true }));

// GET /api/data/:key  -> { value }  (value is null if not yet set)
app.get('/api/data/:key', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT value FROM app_data WHERE key = $1', [req.params.key]);
    res.json({ value: rows.length ? rows[0].value : null });
  } catch (err) {
    console.error('GET /api/data error:', err);
    res.status(500).json({ error: 'db_error' });
  }
});

// PUT /api/data/:key  body: { value: <any JSON> }
app.put('/api/data/:key', async (req, res) => {
  try {
    if (!('value' in req.body)) return res.status(400).json({ error: 'missing_value' });
    await pool.query(
      `INSERT INTO app_data (key, value, updated_at) VALUES ($1, $2, now())
       ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = now()`,
      [req.params.key, JSON.stringify(req.body.value)]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('PUT /api/data error:', err);
    res.status(500).json({ error: 'db_error' });
  }
});

const PORT = process.env.PORT || 3000;
init()
  .then(() => app.listen(PORT, () => console.log('Bessemer backend listening on port', PORT)))
  .catch(err => { console.error('Failed to initialize database:', err); process.exit(1); });
