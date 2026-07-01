# TechCorp Financial AI - DEV WEB

Interface React pour discuter avec le modèle financier TechCorp via Ollama.

## Prérequis

- Node.js 20 ou plus récent
- npm
- Ollama installé et lancé

## Préparer le modèle Ollama

Depuis `rendu/devweb/`, les commandes probables côté INFRA sont:

```bash
ollama create techcorp-financial -f ../../ollama_server/Modelfile
ollama run techcorp-financial
```

Fallback de démonstration si le modèle custom n’est pas encore créé:

```bash
ollama run phi3.5
```

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
- API appelée par le frontend: `/ollama/api/chat`
- Proxy Vite vers: `http://localhost:11434/api/chat`
- Health-check: `/ollama/api/tags`

## Changer le modèle

Le modèle par défaut est `techcorp-financial`.

Options:

- Modifier le champ "Modèle actif" dans le panneau Ollama.
- Définir `VITE_OLLAMA_MODEL` avant de lancer Vite.
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
ollama create techcorp-financial -f ../../ollama_server/Modelfile
ollama run techcorp-financial
```

4. Relancer `npm run dev` si l’URL Ollama a changé.

## Build

```bash
npm run build
```
