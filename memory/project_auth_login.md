---
name: Auth Login - Temporary Workaround
description: POST /api/Auth/login was removed temporarily; needs to be restored
type: project
---

Login was broken because `/api/Auth/login` stopped responding after `/api/Users` was modified to include `companyid`.

Temporary fix (2026-05-09): replaced `POST /api/Auth/login` with `GET /api/Users` + client-side filter on `username` + `plainpassword`.

**Why:** API Auth endpoint was not responding; needed a working login path immediately.

**How to apply:** Next week, restore `POST /api/Auth/login` as the primary auth method. The GET /api/Users filter is a stopgap — plainpassword is exposed in the API response which is not ideal for production. When restoring, ensure the Auth endpoint also returns/stores `companyid` so it can be saved to localStorage.
