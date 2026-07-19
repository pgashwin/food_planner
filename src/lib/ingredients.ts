export const INGREDIENT_SYNONYMS: Record<string, string[]> = {
  tomato: ['tomatoes', 'cherry tomato', 'cherry tomatoes'],
  onion: ['onions', 'red onion', 'white onion'],
  garlic: ['garlic cloves', 'garlic clove'],
  potato: ['potatoes'],
  egg: ['eggs'],
  milk: ['whole milk', 'skim milk'],
  butter: ['unsalted butter', 'salted butter'],
  oil: ['vegetable oil', 'cooking oil', 'olive oil', 'sunflower oil'],
  rice: ['basmati rice', 'white rice', 'jasmine rice'],
  bread: ['loaf bread', 'sandwich bread'],
  chicken: ['chicken breast', 'chicken thighs', 'boneless chicken'],
  yogurt: ['curd', 'plain yogurt', 'greek yogurt'],
  cream: ['heavy cream', 'whipping cream'],
  coriander: ['cilantro', 'fresh coriander'],
  cumin: ['jeera', 'cumin seeds'],
  turmeric: ['haldi', 'turmeric powder'],
  chili: ['chilli', 'green chili', 'red chili', 'chili powder'],
  ginger: ['ginger paste', 'fresh ginger'],
  lentil: ['lentils', 'dal', 'toor dal', 'moong dal', 'masoor dal'],
  paneer: ['cottage cheese'],
  cheese: ['cheddar', 'mozzarella', 'shredded cheese'],
  pasta: ['spaghetti', 'penne', 'macaroni'],
  flour: ['all purpose flour', 'wheat flour', 'maida', 'atta'],
  sugar: ['white sugar'],
  salt: ['table salt', 'sea salt'],
  pepper: ['black pepper', 'pepper powder'],
  lemon: ['lime', 'lemon juice', 'lime juice'],
  bell_pepper: ['capsicum', 'bell peppers', 'red pepper'],
  spinach: ['palak', 'baby spinach'],
  carrot: ['carrots'],
  beans: ['green beans', 'french beans'],
  coconut: ['coconut milk', 'desiccated coconut'],
  tofu: ['firm tofu'],
  mushroom: ['mushrooms', 'button mushrooms'],
  banana: ['bananas'],
  oats: ['rolled oats', 'oatmeal'],
  peanut_butter: ['peanut butter'],
  honey: ['raw honey'],
  soy_sauce: ['soya sauce'],
  vinegar: ['white vinegar', 'apple cider vinegar'],
  stock: ['vegetable stock', 'chicken stock', 'broth'],
};

export const SUBSTITUTES: Record<string, string[]> = {
  cream: ['yogurt', 'milk', 'coconut milk'],
  butter: ['oil', 'ghee'],
  yogurt: ['cream', 'sour cream'],
  paneer: ['tofu', 'cheese'],
  egg: ['tofu'],
  milk: ['coconut milk', 'oat milk'],
};

export function normalizeIngredient(name: string): string {
  const cleaned = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ');

  for (const [canonical, synonyms] of Object.entries(INGREDIENT_SYNONYMS)) {
    if (cleaned === canonical || synonyms.some((s) => cleaned.includes(s) || s.includes(cleaned))) {
      return canonical;
    }
  }

  const words = cleaned.split(' ');
  for (const [canonical, synonyms] of Object.entries(INGREDIENT_SYNONYMS)) {
    if (words.some((w) => w === canonical || synonyms.includes(w))) {
      return canonical;
    }
  }

  return cleaned.replace(/\s+/g, '_');
}

export function parseBulkIngredients(text: string): string[] {
  return text
    .split(/[\n,;]+/)
    .map((line) => line.replace(/^\d+[\s./-]*\w*\s*/i, '').trim())
    .map((line) => line.replace(/^[-•*]\s*/, '').trim())
    .filter((line) => line.length > 1)
    .map((line) => normalizeIngredient(line));
}

export function ingredientMatches(pantryName: string, recipeIngredient: string): boolean {
  const pantryNorm = normalizeIngredient(pantryName);
  const recipeNorm = normalizeIngredient(recipeIngredient);

  if (pantryNorm === recipeNorm) return true;

  const pantrySynonyms = INGREDIENT_SYNONYMS[pantryNorm] ?? [];
  const recipeSynonyms = INGREDIENT_SYNONYMS[recipeNorm] ?? [];

  if (pantrySynonyms.includes(recipeNorm) || recipeSynonyms.includes(pantryNorm)) return true;

  const substitutes = SUBSTITUTES[recipeNorm] ?? [];
  if (substitutes.includes(pantryNorm)) return true;

  return pantryNorm.includes(recipeNorm) || recipeNorm.includes(pantryNorm);
}
