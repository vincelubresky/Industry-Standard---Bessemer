# Bessemer Backend

Small Express API backed by Postgres. It stores all shared site data
(meal counts, cost logs, inventory — including cafe inventory, both menus,
and manager notes) as JSON blobs under simple keys, so every manager on
every device/browser sees the same data.

## Deploy on Render (one-time setup)

1. **Create the database**
   - Render dashboard → **New** → **PostgreSQL**
   - Name it anything (e.g. `bessemer-db`)
   - Once created, copy the **Internal Database URL** (or External, if the
     web service will live on a different host)

2. **Create the web service**
   - Render dashboard → **New** → **Web Service**
   - Connect it to this same GitHub repo: `vincelubresky/Industry-Standard---Bessemer`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     - `DATABASE_URL` = the connection string copied above
   - Deploy

3. **Point the frontend at it**
   - Once deployed, Render gives you a URL like
     `https://bessemer-backend.onrender.com`
   - Update the `API_BASE` constant near the top of the `<script>` section
     in `index.html` to that URL, then push.

That's it — no manual table creation needed; the server creates its one
table automatically on first boot.

## API

- `GET /api/data/:key` → `{ value }` (value is `null` if never set)
- `PUT /api/data/:key` with body `{ "value": <any JSON> }` → `{ ok: true }`

Keys currently used by the frontend:
`bessemerWeeks`, `costLog`, `invLog`, `cafeInvLog`, `cafeInventoryItems`,
`populationMenu`, `cafeMenu`, `managerNotes`.
