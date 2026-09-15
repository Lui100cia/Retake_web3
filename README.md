# Quick Poll — sondages express

Application Next.js (App Router) pour créer un sondage


## Prérequis

- Node.js 20.9 ou supérieur 
- npm

## Installation et lancement

```bash
npm install          # installe les dépendances
npm run dev          # développement, sur http://localhost:3000
```


## Structure

```
app/
  layout.tsx                  coquille et navigation
  page.tsx                    liste des sondages (serveur)
  delete-poll-button.tsx      bouton Supprimer (client)
  polls/
    new/
      page.tsx                page de création (serveur)
      new-poll-form.tsx       formulaire (client)
    [id]/
      page.tsx                sondage : vote ou résultats (serveur)
      vote-form.tsx           formulaire de vote (client)
      results.tsx             barres et pourcentages (serveur)
      not-found.tsx           404 dédiée
lib/
  actions.ts                  server actions ('use server')
  polls.ts                    lecture/écriture de data/polls.json
  validation.ts               règles de validation partagées
  voted.ts                    cookie httpOnly 'voted'
  types.ts                    types Poll et Choice
data/
  polls.json                  stockage
```


