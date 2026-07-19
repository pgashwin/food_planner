# Food Planner

A client-side meal planning PWA. Suggests what to cook next based on your pantry, learns your preferences over time, and supports optional BYOK AI (OpenAI, Gemini, Claude).

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:5173/food_planner/](http://localhost:5173/food_planner/)

## Deploy to GitHub Pages

The build workflow is in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). **You must enable Pages once** before the deploy job can succeed.

### One-time setup (required)

1. Open **Settings ? Pages** for your repo:  
   [https://github.com/pgashwin/food_planner/settings/pages](https://github.com/pgashwin/food_planner/settings/pages)
2. Under **Build and deployment ? Source**, choose **GitHub Actions** (not ùDeploy from a branchù).
3. Re-run the failed workflow, or push a new commit to `main`.

After that, the site will be available at:  
**https://pgashwin.github.io/food_planner/**

### If deploy still fails

- Confirm the repo is **public**, or that your GitHub plan includes Pages for private repos.
- In **Settings ? Actions ? General**, set **Workflow permissions** to **Read and write permissions** (or ensure `pages: write` and `id-token: write` are allowed).
- Check **Settings ? Environments ? github-pages** for approval rules blocking the deploy job.

### Node.js warnings in Actions

Messages about Node.js 20 being deprecated are warnings from GitHubùs runners, not build failures. This workflow uses Node 22 for the app build.

## Features

- Pantry-first meal suggestions with match scoring (Ready now ? Missing 1 item ? Need shopping)
- Meal filters: breakfast, lunch, dinner, snack, dessert, smoothie, or **Any**
- Cuisine filter with South Indian / North Indian under Indian
- Ingredient-aware pantry quantities (count, cups, grams, tbsp per item type); nothing is assumed in stock unless you add it
- Vegetarian preference persists across the app (Home + Settings)
- Number of people on the home page scales pantry matching, ingredients, and cook mode
- Preference learning from thumbs up/down and cook history
- BYOK AI for meal ideas and pantry parsing
- PWA with offline support; all data stored locally in the browser

## Suggestion ordering

Cards are sorted in two passes:

1. **Pantry match group** ù Ready now, then Missing 1 item, then Need shopping (based on scaled ingredients vs pantry stock for your selected number of people).
2. **Cook time within each group** ù shortest total time (prep + cook) first, respecting your ùTime availableù filter.
3. **Tie-breaker** ù preference score from your likes, favorites, and cook history.

With **Pantry validation** on, AI suggestions are also restricted to meals your pantry can fully cover at the selected serving size.
