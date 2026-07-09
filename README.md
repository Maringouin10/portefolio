# Portefolio

Site portfolio personnel, style sobre noir & blanc inspire de Thingiverse : une
grille de projets (image, description, video, fichier 3D telechargeable) cote
public, et un dashboard d'administration sur `/admin` pour tout gerer.

## Stack

- [Next.js 14](https://nextjs.org/) (App Router, TypeScript)
- [Tailwind CSS](https://tailwindcss.com/) pour le style
- [Prisma](https://www.prisma.io/) + SQLite pour les donnees
- Authentification admin maison (cookie JWT httpOnly + bcrypt), sans service externe
- [`<model-viewer>`](https://modelviewer.dev/) pour l'apercu 3D des fichiers `.glb`/`.gltf`
- Docker / Docker Compose pour le deploiement

## Fonctionnalites

- **Public (`/`)** : grille de projets façon Thingiverse, filtre par categorie,
  page detail par projet avec galerie d'images, une ou plusieurs videos
  (upload et/ou liens YouTube/Vimeo), apercu 3D interactif et bouton de
  telechargement du fichier 3D.
- **Admin (`/admin`)** : connexion, liste des projets, creation/edition avec
  upload d'images (couverture + galerie), plusieurs videos (fichiers et/ou
  URLs, ajout et suppression individuelle) et fichier 3D (`.glb`, `.gltf`,
  `.stl`, `.obj`, `.3mf`, `.fbx`), suppression, statut publie/brouillon.

## Demarrage rapide avec Docker

1. Copier le fichier d'environnement et generer un secret JWT :

   ```bash
   cp .env.example .env
   openssl rand -base64 32   # coller le resultat dans JWT_SECRET, dans .env
   ```

2. Construire et lancer :

   ```bash
   docker compose up --build -d
   ```

3. Ouvrir http://localhost:3000/admin : au tout premier acces, un ecran de
   configuration s'affiche pour creer le compte administrateur (email + mot
   de passe). Le mot de passe saisi est hache (bcrypt) et enregistre en base
   automatiquement — aucune manipulation de `.env` n'est necessaire pour les
   identifiants. Aux visites suivantes, cet ecran est remplace par la page de
   connexion normale.

4. Le site public est disponible sur http://localhost:3000

Les donnees (base SQLite, y compris le compte admin) et les fichiers uploades
sont persistes dans des volumes Docker nommes (`portfolio_data`,
`portfolio_uploads`), donc ils survivent aux redemarrages/rebuilds du
conteneur.

### Mot de passe oublie

```bash
docker compose exec web npm run reset-admin -- "admin@example.com" "nouveau-mot-de-passe"
```

Ce script cree le compte s'il n'existe pas encore, ou met a jour son mot de
passe (hache) sinon.

### Mettre a jour apres un changement de code

```bash
docker compose up --build -d
```

Les migrations Prisma sont appliquees automatiquement au demarrage du
conteneur (`docker-entrypoint.sh` execute `prisma migrate deploy`).

## Developpement local (sans Docker)

```bash
npm install
cp .env.example .env   # renseigner JWT_SECRET
npx prisma migrate dev
npm run dev
```

Rendez-vous sur http://localhost:3000/admin pour creer le compte admin via
l'ecran de premiere configuration, comme avec Docker.

## Variables d'environnement

| Variable       | Description                                     |
| -------------- | ------------------------------------------------ |
| `DATABASE_URL` | Chemin SQLite, ex. `file:./data/app.db`          |
| `JWT_SECRET`   | Secret aleatoire pour signer les sessions admin  |

Les identifiants admin (email + mot de passe hache) sont stockes en base de
donnees, pas dans les variables d'environnement — voir "Demarrage rapide"
ci-dessus.

## Structure du projet

```
src/
  app/
    (site)/            page d'accueil + detail projet (public)
    admin/              dashboard, login, setup (premiere config), formulaires
    api/                routes API (auth, setup, CRUD projets)
  components/           composants partages (galerie, video, model-viewer...)
  lib/                   prisma, auth (JWT), admin (creation/verification), uploads, slug
  middleware.ts          protection des routes /admin et des mutations API
prisma/
  schema.prisma          modele de donnees (Project, ProjectImage, Admin)
  migrations/             migrations SQL
storage/uploads/         fichiers uploades (monte en volume Docker, sert via
                          src/app/uploads/[...path]/route.ts)
```

## Limites connues / pistes d'amelioration

- L'apercu 3D (`<model-viewer>`) charge sa librairie depuis un CDN public
  (unpkg.com) : une connexion internet est necessaire pour afficher l'apercu
  interactif (le telechargement du fichier fonctionne toujours hors-ligne).
- Un seul compte administrateur (pas de multi-utilisateurs).
- Pas de redimensionnement/optimisation automatique des images a l'upload
  au-dela de ce que fait `next/image` a l'affichage.
