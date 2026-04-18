# Aeglane

Application de chat en temps réel, multi-salons.

## Stack

- **Frontend** : HTML, CSS custom, JS vanilla
- **Backend** : Vercel Serverless Functions (Node.js)
- **Base de données** : Supabase (PostgreSQL)
- **Temps réel** : Supabase Realtime (Broadcast + Presence)
- **Auth** : JWT (cookie httpOnly) + bcryptjs

## Setup

### 1. Supabase

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Exécuter `supabase/schema.sql` dans l'éditeur SQL Supabase
3. Récupérer `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY` dans **Project Settings → API**

### 2. Variables d'environnement

Copier `.env.example` → `.env.local` :

```
SUPABASE_URL=...
SUPABASE_SERVICE_KEY=...
SUPABASE_ANON_KEY=...
JWT_SECRET=...   # chaîne aléatoire longue
```

### 3. Développement local

```bash
npm install
npx vercel dev
```

### 4. Déploiement

```bash
npx vercel --prod
```

Ajouter les variables d'environnement dans **Vercel → Project Settings → Environment Variables**.

### Compte admin

Après avoir créé un compte normalement, le promouvoir via Supabase SQL Editor :

```sql
UPDATE users SET is_admin = TRUE WHERE username = 'votre_pseudo';
```
