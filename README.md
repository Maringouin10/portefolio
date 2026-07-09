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
  page detail par projet avec galerie d'images, lecteur video (upload ou lien
  YouTube/Vimeo), apercu 3D interactif et bouton de telechargement du fichier 3D.
- **Admin (`/admin`)** : connexion, liste des projets, creation/edition avec
  upload d'images (couverture + galerie), video (fichier ou URL) et fichier 3D
  (`.glb`, `.gltf`, `.stl`, `.obj`, `.3mf`, `.fbx`), suppression, statut
  publie/brouillon.

## Demarrage rapide avec Docker

1. Copier le fichier d'environnement et le remplir :

   ```bash
   cp .env.example .env
   ```

2. Generer un secret JWT et le hash de votre mot de passe admin :

   ```bash
   openssl rand -base64 32
   npm install            # installe les dependances (necessaire pour le script ci-dessous)
   npm run hash-password -- "votre-mot-de-passe"
   ```

   Renseignez dans `.env` : `JWT_SECRET`, `ADMIN_EMAIL` et `ADMIN_PASSWORD_HASH`
   (le hash bcrypt genere, avec les `$` **non echappes** — Docker Compose lit ce
   fichier tel quel).

3. Construire et lancer :

   ```bash
   docker compose up --build -d
   ```

4. Le site est disponible sur http://localhost:3000 et l'admin sur
   http://localhost:3000/admin

Les donnees (base SQLite) et les fichiers uploades sont persistes dans des
volumes Docker nommes (`portfolio_data`, `portfolio_uploads`), donc ils
survivent aux redemarrages/rebuilds du conteneur.

### Mettre a jour apres un changement de code

```bash
docker compose up --build -d
```

Les migrations Prisma sont appliquees automatiquement au demarrage du
conteneur (`docker-entrypoint.sh` execute `prisma migrate deploy`).

## Developpement local (sans Docker)

```bash
npm install
npx prisma migrate dev
npm run dev
```

> **Important** : en local, Next.js charge et interprete lui-meme le fichier
> `.env` (via `dotenv-expand`), ce qui signifie que tout `$` litteral dans une
> valeur (comme un hash bcrypt du type `$2a$10$...`) doit etre echappe en
> `\$2a\$10\$...` dans `.env`, sinon la partie apres chaque `$` sera
> silencieusement supprimee et la connexion admin echouera. Ce n'est **pas**
> necessaire pour Docker Compose (qui lit `.env` directement sans cette
> transformation) — uniquement pour `npm run dev` / `npm start` en local.

## Variables d'environnement

| Variable              | Description                                                        |
| ---------------------- | ------------------------------------------------------------------- |
| `DATABASE_URL`         | Chemin SQLite, ex. `file:./data/app.db`                            |
| `JWT_SECRET`            | Secret aleatoire pour signer les sessions admin                    |
| `ADMIN_EMAIL`           | Email de connexion admin                                            |
| `ADMIN_PASSWORD_HASH`   | Hash bcrypt du mot de passe admin (`npm run hash-password -- ...`) |

## Structure du projet

```
src/
  app/
    (site)/            page d'accueil + detail projet (public)
    admin/              dashboard, login, formulaires (proteges par middleware)
    api/                routes API (auth, CRUD projets)
  components/           composants partages (galerie, video, model-viewer...)
  lib/                   prisma, auth (JWT), uploads, slug
  middleware.ts          protection des routes /admin et des mutations API
prisma/
  schema.prisma          modele de donnees (Project, ProjectImage)
  migrations/             migrations SQL
public/uploads/          fichiers uploades (monte en volume Docker)
```

## Limites connues / pistes d'amelioration

- L'apercu 3D (`<model-viewer>`) charge sa librairie depuis un CDN public
  (unpkg.com) : une connexion internet est necessaire pour afficher l'apercu
  interactif (le telechargement du fichier fonctionne toujours hors-ligne).
- Un seul compte administrateur (pas de multi-utilisateurs).
- Pas de redimensionnement/optimisation automatique des images a l'upload
  au-dela de ce que fait `next/image` a l'affichage.
