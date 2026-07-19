export const INGREDIENT_SYNONYMS: Record<string, string[]> = {
  tomato: ['tomatoes', 'cherry tomato', 'cherry tomatoes'],
  onion: ['onions', 'red onion', 'white onion'],
  garlic: ['garlic cloves', 'garlic clove'],
  potato: ['potatoes'],
  egg: ['eggs'],
  milk: ['whole milk', 'skim milk'],
  butter: ['unsalted butter', 'salted butter'],
  vegetable_oil: ['vegetable oil', 'cooking oil', 'sunflower oil'],
  olive_oil: ['olive oil', 'extra virgin olive oil'],
  water: ['tap water', 'filtered water'],
  ghee: ['clarified butter'],
  basmati_rice: ['basmati rice', 'white rice', 'jasmine rice', 'long grain rice'],
  poha: ['flattened rice', 'beaten rice', 'aval'],
  arborio_rice: ['arborio rice', 'risotto rice'],
  sandwich_bread: ['bread', 'loaf bread', 'slices bread'],
  tortillas: ['tortilla', 'wraps'],
  chicken_breast: ['chicken', 'chicken breast', 'chicken thighs', 'boneless chicken'],
  yogurt: ['curd', 'plain yogurt', 'greek yogurt'],
  cream: ['heavy cream', 'whipping cream'],
  coriander_leaves: ['coriander', 'cilantro', 'fresh coriander'],
  cumin_seeds: ['cumin', 'jeera', 'cumin seeds'],
  turmeric_powder: ['turmeric', 'haldi', 'turmeric powder'],
  red_chili: ['chili', 'chilli', 'green chili', 'red chili', 'chili powder'],
  ginger: ['ginger paste', 'fresh ginger'],
  moong_dal: ['moong dal', 'yellow moong dal', 'split moong'],
  toor_dal: ['toor dal', 'arhar dal', 'pigeon peas'],
  masoor_dal: ['masoor dal', 'red lentils'],
  kidney_beans: ['kidney beans', 'rajma'],
  chickpeas: ['chickpeas', 'garbanzo beans', 'chana'],
  black_beans: ['black beans'],
  green_beans: ['beans', 'french beans'],
  paneer: ['cottage cheese'],
  cheddar: ['cheddar cheese', 'cheddar'],
  mozzarella: ['mozzarella cheese', 'mozzarella'],
  parmesan: ['parmesan cheese', 'parmesan', 'parmigiano'],
  feta: ['feta cheese', 'feta'],
  spaghetti: ['spaghetti pasta'],
  penne: ['penne pasta'],
  macaroni: ['macaroni pasta', 'elbow macaroni'],
  rice_noodles: ['rice noodles', 'pad thai noodles'],
  hakka_noodles: ['hakka noodles', 'chow mein noodles'],
  all_purpose_flour: ['all purpose flour', 'plain flour', 'ap flour', 'maida baking'],
  atta: ['atta', 'wheat flour', 'whole wheat flour', 'chapati flour'],
  semolina: ['semolina', 'rava', 'sooji'],
  maida: ['maida', 'refined flour'],
  sugar: ['white sugar'],
  salt: ['table salt', 'sea salt'],
  black_pepper: ['pepper', 'black pepper', 'pepper powder'],
  lemon: ['lime', 'lemon juice', 'lime juice'],
  bell_pepper: ['capsicum', 'bell peppers', 'red pepper'],
  spinach: ['palak', 'baby spinach'],
  carrot: ['carrots'],
  coconut_milk: ['coconut', 'coconut milk', 'desiccated coconut'],
  tofu: ['firm tofu'],
  button_mushrooms: ['mushroom', 'mushrooms', 'button mushrooms'],
  banana: ['bananas'],
  oats: ['rolled oats', 'oatmeal'],
  peanut_butter: ['peanut butter'],
  honey: ['raw honey'],
  soy_sauce: ['soya sauce'],
  white_vinegar: ['vinegar', 'white vinegar', 'apple cider vinegar'],
  vegetable_stock: ['stock', 'vegetable stock', 'broth', 'chicken stock'],
  hummus: ['hummus'],
};

export const SUBSTITUTES: Record<string, string[]> = {
  cream: ['yogurt', 'milk', 'coconut_milk'],
  butter: ['vegetable_oil', 'ghee'],
  vegetable_oil: ['olive_oil', 'ghee'],
  olive_oil: ['vegetable_oil', 'ghee'],
  ghee: ['vegetable_oil', 'butter'],
  yogurt: ['cream'],
  paneer: ['tofu'],
  egg: ['tofu'],
  milk: ['coconut_milk'],
  basmati_rice: ['arborio_rice'],
  arborio_rice: ['basmati_rice'],
  cheddar: ['mozzarella'],
  mozzarella: ['cheddar'],
};

export function normalizeIngredient(name: string): string {
  const cleaned = name
    .toLowerCase()
    .trim()
    .replace(/_/g, ' ')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ');

  for (const [canonical, synonyms] of Object.entries(INGREDIENT_SYNONYMS)) {
    if (cleaned === canonical.replace(/_/g, ' ') || cleaned === canonical) return canonical;
    if (synonyms.some((s) => cleaned === s || cleaned.includes(s) || s.includes(cleaned))) {
      return canonical;
    }
  }

  const words = cleaned.split(' ');
  for (const [canonical, synonyms] of Object.entries(INGREDIENT_SYNONYMS)) {
    if (words.some((w) => w === canonical.replace(/_/g, ' ') || synonyms.includes(w))) {
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

  const recipeSubstitutes = SUBSTITUTES[recipeNorm] ?? [];
  if (recipeSubstitutes.includes(pantryNorm)) return true;

  const pantrySubstitutes = SUBSTITUTES[pantryNorm] ?? [];
  if (pantrySubstitutes.includes(recipeNorm)) return true;

  return pantryNorm.includes(recipeNorm) || recipeNorm.includes(pantryNorm);
}
