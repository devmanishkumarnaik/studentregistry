# Student Registry — Admin Panel

A secure, full-stack student management system.

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.local.example .env.local
```
Edit `.env.local` with your actual values:
- `MONGODB_URI` — your database connection string
- `ADMIN_USERNAME` — admin login username
- `ADMIN_PASSWORD` — admin login password
- `ADMIN_DISPLAY_NAME` — display name shown in the dashboard

### 3. Run the app
```bash
npm run dev
# → http://localhost:3000
```

---

## Environment Variables

| Variable            | Description                          | Required |
|---------------------|--------------------------------------|----------|
| `MONGODB_URI`       | Database connection string           | ✅        |
| `ADMIN_USERNAME`    | Admin login username                 | ✅        |
| `ADMIN_PASSWORD`    | Admin login password                 | ✅        |
| `ADMIN_DISPLAY_NAME`| Display name for the admin user      | Optional |
| `NEXTAUTH_SECRET`   | App session secret (any long string) | ✅        |

> **Note:** Admin credentials are automatically seeded on first login using the values from your `.env.local` file.

---

## Features

- Full CRUD student management
- Gmail-only email validation
- CGPA tracking (0.0 – 10.0 scale)
- Age validation (5 – 60 years)
- Sortable, searchable student table
- Multi-row selection & Excel export
- Fully responsive (mobile, tablet, desktop)
- Secure admin authentication

---

## Production Build

```bash
npm run build
npm start
```
