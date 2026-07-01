# TechCorp Financial AI - DEV WEB

Interface React pour discuter avec le modèle financier TechCorp via Ollama.

## Prérequis

- Node.js 20 ou plus récent
- npm
- Ollama installé et lancé

## Préparer le modèle Ollama

Depuis `rendu/devweb/`, les commandes probables côté INFRA sont:

```bash
ollama create phi3-financial -f ../../ollama_server/Modelfile
ollama run phi3-financial
```

Fallback de démonstration si le modèle custom n’est pas encore créé:

```bash
ollama run phi3.5
```

## Configurer l’environnement

Le fichier `.env.local` est ignoré par Git. Pour démarrer en local:

```bash
cp .env.example .env.local
```

Valeurs par défaut:

```bash
VITE_OLLAMA_BASE_URL=http://localhost:11434
VITE_OLLAMA_MODEL=phi3-financial
```

Pour utiliser un tunnel ngrok fourni par l’équipe INFRA, remplacez uniquement `VITE_OLLAMA_BASE_URL` dans `.env.local`.

## Installer

```bash
npm install
```

## Lancer

```bash
npm run dev
```

L’app utilise Vite et expose un proxy local:

- Frontend: `http://localhost:5173`
- API appelée par le frontend: `/api/chat`
- Proxy Vite vers: `${VITE_OLLAMA_BASE_URL}/api/chat`
- Health-check: `/api/tags`
- Header ngrok ajouté par le proxy: `ngrok-skip-browser-warning: true`

## Changer le modèle

Le modèle par défaut est `phi3-financial`.

Options:

- Modifier le champ "Modèle actif" dans le panneau Ollama.
- Définir `VITE_OLLAMA_MODEL` dans `.env.local`.
- Utiliser le bouton `phi3.5` si le modèle custom n’est pas encore disponible.

Exemple:

```bash
VITE_OLLAMA_MODEL=phi3.5 npm run dev
```

## Changer l’URL Ollama

Par défaut, le proxy cible `http://localhost:11434`.

```bash
VITE_OLLAMA_BASE_URL=http://localhost:11434 npm run dev
```

## Si l’app affiche "Déconnecté"

1. Vérifier qu’Ollama tourne:

```bash
ollama list
```

2. Vérifier que l’API répond:

```bash
curl http://localhost:11434/api/tags
```

3. Créer ou lancer le modèle attendu:

```bash
ollama create phi3-financial -f ../../ollama_server/Modelfile
ollama run phi3-financial
```

4. Relancer `npm run dev` si l’URL Ollama a changé.

## Build

```bash
npm run build
```
