# conflits

Générateur de situations déclenchantes pédagogiques (conflit cognitif) pour formateurs. React + Vite + TypeScript, backend Node minimal.

## Architecture

- `src/` : frontend React. `src/api.ts` appelle `POST /api/generate` (aucune clé ni prompt côté client).
- `server.mjs` : serveur Node sans dépendance. Sert `dist/` et expose `POST /api/generate` qui appelle DeepSeek (`deepseek-chat`, API compatible OpenAI, `https://api.deepseek.com`). Le prompt système, la validation des entrées (max 500 caractères, niveau dans une liste fermée) et la limite de débit (10 requêtes/IP/10 min, IP lue dans `x-forwarded-for`) sont côté serveur.
- `.env.local` : contient `DEEPSEEK_API_KEY` (jamais de préfixe `VITE_`, la clé ne doit jamais entrer dans le bundle). Non commité (`*.local` dans `.gitignore`), exclu de l'image Docker (`.dockerignore`), injecté au conteneur via `env_file`.

## Historique

- Le projet utilisait OpenRouter + Gemini avec une clé `VITE_OPENROUTER_API_KEY` exposée dans le bundle (via `define` dans `vite.config.ts`). Migré en juillet 2026 vers DeepSeek en direct avec proxy backend. Ne pas réintroduire de clé `VITE_`.

## Développement

```
npm run dev        # Vite sur 5173, proxy /api vers localhost:3001
npm start          # backend seul (node --env-file=.env.local server.mjs)
npm run build      # tsc + vite build vers dist/
```

## Déploiement

- Conteneur Docker `conflits` défini dans `/root/docker-compose.yml`, build multi-stage depuis ce dossier, servi par Traefik sur `https://ia-conflits.rochane.fr` (port interne 3001).
- Redéployer : `cd /root && docker compose up -d --build conflits`
- DNS : enregistrement A `ia-conflits` → `168.231.81.126` (en place depuis le 19 juillet 2026, remplaçait un CNAME vers GitHub Pages). Certificat Let's Encrypt émis via Traefik.
- Le dépôt GitHub (`Rochikh/conflits`) sert uniquement d'hébergement du code source, plus d'hébergement du site. Les modifications de juillet 2026 (migration DeepSeek, backend, Docker) sont locales et non poussées sur GitHub.
