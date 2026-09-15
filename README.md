# Quick Poll — sondages express

Application Next.js (App Router) pour créer un sondage, voter une seule fois et
voir les résultats immédiatement. Pas d'authentification, pas de base de
données : les sondages sont stockés dans un fichier JSON.


## Prérequis

- Node.js 20.9 ou supérieur (testé avec Node 22)
- npm

## Installation et lancement

```bash
npm install          # installe les dépendances
npm run dev          # développement, sur http://localhost:3000
```




Le dépôt contient déjà `data/polls.json` avec **deux sondages remplis** : la
liste et les résultats sont visibles sans rien saisir.

> Un vote est mémorisé par un cookie `httpOnly` nommé `voted`. Pour revoter sur
> un sondage pendant vos essais, supprimez ce cookie (ou ouvrez une fenêtre de
> navigation privée).

## Composants client

Tout le reste de l'application est en composants serveur. Seuls les trois
composants ci-dessous portent `'use client'`.

| Composant | Raison du `'use client'` |
| --- | --- |
| `app/delete-poll-button.tsx` | Demande une confirmation via `window.confirm` (API navigateur) avant d'appeler l'action, gère l'état d'attente et affiche l'erreur éventuelle. |
| `app/polls/new/new-poll-form.tsx` | Ajoute et retire dynamiquement les champs de choix (bornés à 2–5), garde les saisies dans un état React pour ne rien perdre en cas d'erreur, et affiche le message renvoyé par l'action. |
| `app/polls/[id]/vote-form.tsx` | Mémorise le choix sélectionné (boutons radio contrôlés) et affiche le message d'erreur renvoyé par l'action de vote. |

Les pourcentages, eux, ne sont jamais calculés dans un composant client : ils
sont produits par `app/polls/[id]/results.tsx`, un composant serveur (RG-06).

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

## Architecture

- **Mutations.** Les trois seules mutations sont des server actions exportées
  par `lib/actions.ts` : `createPoll(formData)`, `vote(pollId, choiceId)` et
  `deletePoll(pollId)`. Aucun `route.ts`, aucun `app/api`, aucun `fetch` du
  client vers le serveur.
- **Erreurs.** Une erreur de validation n'est jamais levée : l'action renvoie
  `{ error: string }` que le formulaire concerné affiche (RG-08).
- **Stockage.** `lib/polls.ts` lit et écrit `data/polls.json` avec
  `fs/promises`. Chaque écriture relit le fichier, le modifie en mémoire puis
  le réécrit entièrement ; les écritures sont sérialisées pour que deux votes
  simultanés ne s'écrasent pas.
- **Identifiants.** Générés côté serveur avec `crypto.randomUUID()`.

## Règles de gestion

| Règle | Où elle est appliquée |
| --- | --- |
| RG-01 — question de 5 à 120 caractères après trim | `lib/validation.ts` → `validateQuestion`, appelée par `createPoll` |
| RG-02 — 2 à 5 choix, non vides, sans doublon insensible à la casse | `lib/validation.ts` → `validateChoices`, appelée par `createPoll` |
| RG-03 — le choix doit appartenir au sondage visé | `vote` vérifie l'appartenance, et `incrementVote` cherche le choix dans ce sondage uniquement |
| RG-04 — compteur incrémenté et stocké côté serveur | `lib/polls.ts` → `incrementVote` ; le client n'envoie que deux identifiants |
| RG-05 — un vote par navigateur et par sondage | cookie `httpOnly` `voted` (`lib/voted.ts`) : `vote` refuse le second vote et `app/polls/[id]/page.tsx` n'affiche plus le formulaire |
| RG-06 — pourcentages calculés côté serveur | `app/polls/[id]/results.tsx`, composant serveur ; 0 % partout si aucun vote, sans division par zéro |
| RG-07 — toute mutation passe par une server action | `lib/actions.ts` (`'use server'`) |
| RG-08 — une erreur de validation est affichée, pas levée | les actions renvoient `{ error }`, affiché par le formulaire concerné |
| RG-09 — supprimer un sondage supprime ses votes, après confirmation | `removePoll` retire le sondage et ses choix ; `DeletePollButton` confirme d'abord |

Toutes ces règles sont revérifiées côté serveur, même lorsque l'interface les
empêche déjà.
