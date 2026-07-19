# Conflits

Générateur de situations déclenchantes pédagogiques. L'outil produit, pour un concept et un contexte métier donnés, une situation conçue pour provoquer un conflit cognitif chez des apprenants professionnels : représentation erronée ciblée, situation déclenchante, question de bascule, mécanisme cognitif, ancrage théorique et débrief formateur.

En ligne : https://ia-conflits.rochane.fr/

## Fonctionnement

- Frontend React + TypeScript + Vite (`src/`). Le navigateur appelle uniquement `POST /api/generate`.
- Backend Node sans dépendance (`server.mjs`) : sert le build statique et relaie la génération vers l'API DeepSeek (`deepseek-chat`). La clé API, le prompt système, la validation des entrées et la limite de débit (10 requêtes par IP par 10 minutes) restent côté serveur.

## Configuration

Créer un fichier `.env.local` à la racine :

```
DEEPSEEK_API_KEY=sk-...
```

Ne jamais utiliser de variable préfixée `VITE_` pour la clé : elle serait incluse dans le bundle envoyé au navigateur.

## Commandes

```
npm install
npm run dev      # frontend Vite sur :5173, proxy /api vers :3001
npm start        # backend sur :3001 (node --env-file=.env.local server.mjs)
npm run build    # build de production dans dist/
```

En développement, lancer `npm start` et `npm run dev` en parallèle.

## Déploiement

Build Docker multi-stage (`Dockerfile`) : compilation du frontend puis image finale contenant `dist/` et `server.mjs`, exposée sur le port 3001. La clé est injectée au conteneur via `env_file`. En production, l'application est servie derrière Traefik avec certificat Let's Encrypt.

## Historique

Version initiale : appel direct OpenRouter (Gemini) depuis le navigateur, hébergement GitHub Pages. Juillet 2026 : migration vers DeepSeek avec backend proxy pour protéger la clé API, hébergement auto-géré.
