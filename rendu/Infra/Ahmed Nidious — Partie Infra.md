# Déploiement INFRA - Serveur Ollama

**Ahmed Nidious — Partie Infra**

## Pourquoi Ollama et pas Triton

On avait le choix entre Ollama, Triton et un serveur maison. J'ai pris Ollama assez vite en fait, parce qu'on n'avait que 7h et Triton demande de convertir le modèle en ONNX/TensorRT + monter toute une structure model_repository. Ça prend du temps qu'on n'avait pas.

Un serveur maison (FastAPI par exemple) ça aurait voulu dire coder moi-même le chargement du modèle et toute l'API, donc encore plus long.

Ollama fait tout ça direct : tu pull le modèle, tu configures un Modelfile, et t'as une API qui tourne. C'est clairement moins pro que Triton pour scaler à beaucoup d'utilisateurs, mais pour une démo d'équipe ça suffit largement.

## Ce que j'ai fait concrètement

J'ai installé Ollama sur mon PC, cloné le repo de l'équipe pour récupérer le Modelfile qui était déjà dans `ollama_server/`.

En l'ouvrant j'ai vu qu'il y avait 2 typos qui empêchaient carrément le build de marcher :
- `ROM phi3.5` au lieu de `FROM phi3.5` (première ligne)
- `PRAMETER num_ctx 4096` au lieu de `PARAMETER`

Une fois ça corrigé, j'ai rempli le TODO qui restait avec les paramètres d'inférence (temperature, top_p, num_predict, num_ctx). Ensuite build du modèle avec :

```
ollama create phi3-financial -f Modelfile
```

Testé en local, ça répondait bien, donc j'ai push la correction sur GitHub pour que le reste de l'équipe ait la bonne version.

## Le vrai problème : rendre ça accessible à distance

Comme DEV WEB n'est pas sur le même réseau que moi, donner mon IP locale servait à rien. Direction ngrok pour avoir une URL publique.

Et là ça a coincé un moment. Le tunnel marchait, mais dès que je testais l'URL ngrok, Ollama me renvoyait du 403 Forbidden. En local par contre ça marchait nickel.

J'ai perdu pas mal de temps là-dessus honnêtement. Mon premier réflexe c'était de penser que c'était du CORS, donc j'ai essayé `OLLAMA_ORIGINS=*`, redémarré Ollama, redémarré carrément le PC deux fois... toujours 403.

Ce qui a débloqué le truc c'est d'aller lire les logs du serveur directement (`%LOCALAPPDATA%\Ollama\server.log`). Et là je vois qu'Ollama check en fait le header `Host` de chaque requête pour des raisons de sécu, pas les origins CORS. Une requête qui passe par ngrok arrive avec le domaine ngrok dans le Host, donc Ollama la voit pas comme une requête locale et bloque.

La solution était de relancer ngrok en lui disant de réécrire le Host header avant de transmettre à Ollama :

```
ngrok http 11434 --host-header="localhost:11434"
```

Et là ça a marché direct, 200 OK.

## Pourquoi ngrok

Pour rendre le serveur accessible à distance, plusieurs options existaient :

- **Port forwarding sur le routeur** : expose direct le port de mon PC sur internet. Rejeté — trop risqué niveau sécu (ça ouvre littéralement une porte vers ma machine depuis n'importe où), et configuration réseau que je ne maîtrise pas forcément (accès admin au routeur, box internet, etc.).
- **Déployer sur un vrai serveur cloud** (AWS, OVH...) : solution la plus "propre" pour de la prod, mais overkill et beaucoup trop long à mettre en place pour une démo de 7h.
- **ngrok** : crée un tunnel sécurisé vers mon serveur local sans toucher à la config réseau, sans exposer directement mon PC, et sans rien à héberger ailleurs. Gratuit, une commande suffit, marche en quelques secondes.

Pour un besoin temporaire (démo hackathon, équipe à distance), ngrok était clairement le bon compromis entre rapidité de mise en place et sécurité — pas besoin de toucher au routeur ni de payer un serveur cloud pour quelques heures d'utilisation.

**Limite assumée :** l'URL ngrok gratuite change à chaque redémarrage du tunnel, et le service ne fonctionne que tant que mon PC et le tunnel restent allumés — pas une solution permanente, mais suffisante pour ce contexte.

## Accès pour l'équipe

| | |
|---|---|
| **URL publique** | `https://sesame-debating-resilient.ngrok-free.dev` |
| **Endpoint** | `/api/generate` |
| **Modèle** | `phi3-financial` |
| **Header à ajouter côté navigateur** | `ngrok-skip-browser-warning: true` |

Ce dernier header c'est pour éviter la page d'avertissement que ngrok affiche automatiquement — sinon les requêtes faites depuis un navigateur (donc le code de DEV WEB) tombent sur cette page au lieu de la vraie réponse.

## Captures d'écran

### Le pull du modèle de base
<img width="938" height="198" alt="image" src="https://github.com/user-attachments/assets/cefb9582-4a25-4757-9e1b-28123b81dbce" />

*2.2 GB, ça a pris quelques minutes*


### fichier Modelfile 
<img width="938" height="269" alt="image" src="https://github.com/user-attachments/assets/28834584-9708-4cbb-9c69-96f9b47cdaae" />


### Le tunnel ngrok
<img width="938" height="464" alt="image" src="https://github.com/user-attachments/assets/957b19ea-9a80-48a6-afe3-dadb30067554" />

*Avec le flag --host-header *

### Et la preuve que ça répond bien en public
<img width="938" height="453" alt="image" src="https://github.com/user-attachments/assets/92d20ad4-a61f-4290-b721-4d986754a88c" />

*Requête faite depuis l'URL ngrok, pas en local*

C'est ce test qui confirme que le serveur est bien joignable depuis l'extérieur, pas juste sur ma machine.

### Les deux modèles présents en local
<img width="905" height="200" alt="image" src="https://github.com/user-attachments/assets/3de4b818-246a-47bb-a7a3-abeeef74c211" />

*phi3.5 (base) et phi3-financial (le mien)*





## Test d'intégration avec l'app DEV WEB

Une fois l'app de DEV WEB connectée à mon URL ngrok, on a fait un test réel ensemble pour vérifier que toute la chaîne fonctionne, pas juste mes tests curl en isolation.

<img width="1782" height="1376" alt="image" src="https://github.com/user-attachments/assets/b0a5bd1a-4c14-4560-afc2-debe0c6c8a34" />

*L'app affiche "Connecté" à l'URL ngrok, la question posée depuis l'interface obtient une vraie réponse du modèle*

Résultat : question posée depuis l'interface ("Explique la différence entre EBITDA et résultat net"), réponse complète et cohérente reçue en ~7,4 secondes. Le panneau de droite dans leur app confirme les paramètres reçus côté serveur (endpoint `/api/chat`, modèle `phi3.5`, top_p `0.9`, 512 tokens max).

Petite différence remarquée : leur app envoie une temperature de `0.3` dans le payload plutôt que le `0.7` défini dans mon Modelfile — DEV WEB doit passer ses propres paramètres d'inférence directement dans chaque requête plutôt que de laisser les valeurs par défaut du Modelfile s'appliquer. Pas un problème en soi, juste une chose à savoir si les réponses semblent plus "conservatrices" que prévu.

Ce test confirme que le serveur est bien accessible et utilisable de bout en bout, pas seulement via des appels API isolés.
