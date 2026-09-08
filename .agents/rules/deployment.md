# CyberMedia AI Editorial Copilot — Deployment Reference

## Architecture
- Browser → Apache (TLS termination) → internal ports (loopback only)
- Frontend: `editorial.cybermedia.in` → `127.0.0.1:3002`
- Backend: `api.cybermedia.in` → `127.0.0.1:8019`
- Both apps are **loopback-bound only** — never expose to `0.0.0.0`
- Frontend calls the backend via `https://api.cybermedia.in` (not `127.0.0.1` directly)
- Backend uses an **external MongoDB** — no local DB on the server

---

## Server Accounts & Paths

| Component | cPanel Account | Project Path |
|-----------|---------------|--------------|
| Frontend (Next.js) | `editorialcmil26` | `~/public_html/editorial-frontend/` |
| Backend (FastAPI) | `apicybermedia26` | `~/public_html/editorial-backend-api/` |

---

## How to Deploy

### Frontend (as `editorialcmil26`)
```bash
cd ~/public_html/editorial-frontend/
npm install              # only if package.json changed
npm run build
pm2 restart editorial-frontend
pm2 save                 # persist across reboots
```

### Backend (as `apicybermedia26`)
```bash
cd ~/public_html/editorial-backend-api/
source venv/bin/activate
pip install -r requirements.txt   # only if requirements changed
deactivate
sudo systemctl restart editorial-fastapi.service
sudo systemctl status editorial-fastapi.service
```

---

## Day-to-Day Service Management

### Frontend (PM2 — no sudo needed)
```bash
pm2 status editorial-frontend
pm2 restart editorial-frontend
pm2 logs editorial-frontend
pm2 logs editorial-frontend --lines 100 --nostream
```

### Backend (systemd — scoped sudo)
```bash
sudo systemctl status editorial-fastapi.service
sudo systemctl restart editorial-fastapi.service
sudo journalctl -u editorial-fastapi.service -n 100
sudo journalctl -u editorial-fastapi.service -f    # live tail
```
> ⚠️ `sudo systemctl status editorial-fastapi.service` must match exactly — adding flags like `--no-pager` will fail. `journalctl` accepts extra flags fine.

---

## Tech Stack & Versions

### Frontend
| Layer | Value |
|-------|-------|
| Runtime | Node.js v20.20.2 |
| Package manager | npm 10.8.2 |
| Framework | Next.js 15.5.23 |
| UI | React 19.1.1, React DOM 19.1.1 |
| Process manager | PM2 6.0.8 |
| PM2 process name | `editorial-frontend` |
| Boot unit | `pm2-editorialcmil26.service` |
| Internal port | `127.0.0.1:3002` |

### Backend
| Layer | Value |
|-------|-------|
| Runtime | Python 3.12.0 |
| Framework | FastAPI 0.115.12 |
| ASGI server | Uvicorn 0.34.2 + Gunicorn 23.0.0 (2 workers) |
| ODM | Beanie 1.29.0, Motor 3.7.0 |
| Virtual env | `editorial-backend-api/venv/` |
| systemd unit | `editorial-fastapi.service` |
| Entrypoint | `main:app` (must stay `main.py` with var `app`) |
| Internal port | `127.0.0.1:8019` |

---

## Key Gotchas

1. **Never bind Next.js to `0.0.0.0`** — always use `-H 127.0.0.1` if manually starting:
   ```bash
   pm2 start npm --name "editorial-frontend" -- start -- -p 3002 -H 127.0.0.1
   ```
2. **Run `pm2 start` from inside `editorial-frontend/`** — PM2 uses cwd; running from home dir causes `ENOENT: package.json`.
3. **After `pm2 stop/start/restart` always run `pm2 save`** to persist state across reboots.
4. **Backend entrypoint must stay `main:app`** — the systemd unit's `ExecStart` is hardcoded to this.
5. **Do not edit** `/etc/apache2/conf.d/userdata/.../proxy.conf` or `.htaccess` — these are ops-owned.

---

## Environment Files
- Frontend: `.env.local` — contains `NEXT_PUBLIC_API_BASE_URL=https://api.cybermedia.in`; add any extra keys here
- Backend: `.env` — contains `MONGODB_URI` and any secrets; both files are `chmod 600`
- **Never commit either file to git**

---

## Quick Reference
| Item | Value |
|------|-------|
| Frontend URL | `https://editorial.cybermedia.in` |
| Backend URL | `https://api.cybermedia.in` |
| Frontend process | PM2 → `editorial-frontend` |
| Backend process | systemd → `editorial-fastapi.service` |
| Search indexing | Blocked on both domains (X-Robots-Tag + robots.txt) |
