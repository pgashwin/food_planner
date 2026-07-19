import type { Recipe } from '../types';

function r(
  id: string,
  name: string,
  cuisine: string,
  mealSlots: Recipe['mealSlots'],
  prep: number,
  cook: number,
  tags: string[],
  ingredients: Recipe['ingredients'],
  steps: string[],
  opts: Partial<Pick<Recipe, 'kidFriendly' | 'vegetarian' | 'spiceLevel' | 'difficulty' | 'baseServings'>> = {},
): Recipe {
  return {
    id,
    name,
    cuisine,
    mealSlots,
    prepMinutes: prep,
    cookMinutes: cook,
    baseServings: opts.baseServings ?? 4,
    difficulty: opts.difficulty ?? 'easy',
    tags,
    kidFriendly: opts.kidFriendly ?? true,
    vegetarian: opts.vegetarian ?? false,
    spiceLevel: opts.spiceLevel ?? 'mild',
    ingredients,
    steps,
  };
}

export const recipes: Recipe[] = [
  r('masala-omelette', 'Masala Omelette', 'indian', ['breakfast'], 5, 8, ['quick', 'one_pan', 'protein'],
    [{ name: 'egg', quantity: '4' }, { name: 'onion', quantity: '1 small' }, { name: 'tomato', quantity: '1' }, { name: 'red chili', quantity: '1' }, { name: 'salt' }, { name: 'black pepper' }, { name: 'vegetable oil', quantity: '1 tbsp' }],
    ['Beat eggs with salt and pepper.', 'Sauté onion and chili in oil.', 'Add tomato, pour eggs, cook until set.', 'Fold and serve hot.']),

  r('poha', 'Poha (Flattened Rice)', 'indian', ['breakfast'], 10, 10, ['quick', 'vegetarian', 'one_pan'],
    [{ name: 'poha', quantity: '2 cups' }, { name: 'onion', quantity: '1' }, { name: 'potato', quantity: '1 small' }, { name: 'peanut', quantity: '2 tbsp', optional: true }, { name: 'turmeric powder' }, { name: 'lemon' }, { name: 'vegetable oil' }, { name: 'salt' }],
    ['Rinse poha and drain.', 'Sauté onion and potato.', 'Add turmeric, poha, salt.', 'Garnish with lemon and peanuts.'], { vegetarian: true }),

  r('upma', 'Rava Upma', 'indian', ['breakfast'], 5, 15, ['quick', 'vegetarian'],
    [{ name: 'semolina', quantity: '1 cup' }, { name: 'onion', quantity: '1' }, { name: 'carrot', quantity: '1', optional: true }, { name: 'green beans', quantity: 'handful', optional: true }, { name: 'mustard seeds' }, { name: 'vegetable oil' }, { name: 'salt' }],
    ['Dry roast semolina.', 'Temper mustard seeds in oil.', 'Sauté veggies, add water and semolina.', 'Cook until fluffy.'], { vegetarian: true }),

  r('idli-sambar', 'Quick Idli with Sambar', 'indian', ['breakfast'], 10, 20, ['south_indian', 'vegetarian'],
    [{ name: 'toor dal', quantity: '1/2 cup' }, { name: 'tomato', quantity: '2' }, { name: 'onion', quantity: '1' }, { name: 'carrot', quantity: '1' }, { name: 'green beans', quantity: 'handful' }, { name: 'turmeric powder' }, { name: 'sambar powder' }, { name: 'tamarind', quantity: 'small piece', optional: true }],
    ['Pressure cook dal with veggies.', 'Add sambar powder and tamarind.', 'Serve with store-bought or homemade idli.'], { vegetarian: true }),

  r('paratha-paneer', 'Paneer Paratha', 'indian', ['breakfast', 'lunch'], 15, 15, ['north_indian', 'vegetarian'],
    [{ name: 'atta', quantity: '2 cups' }, { name: 'paneer', quantity: '200g' }, { name: 'onion', quantity: '1 small' }, { name: 'red chili', quantity: '1' }, { name: 'coriander leaves' }, { name: 'salt' }, { name: 'vegetable oil' }],
    ['Make dough with flour and water.', 'Stuff with spiced paneer mix.', 'Roll and cook on tawa with oil.'], { vegetarian: true }),

  r('avocado-toast', 'Avocado Toast', 'american', ['breakfast'], 5, 5, ['quick', 'vegetarian'],
    [{ name: 'sandwich bread', quantity: '4 slices' }, { name: 'avocado', quantity: '2' }, { name: 'lemon' }, { name: 'salt' }, { name: 'black pepper' }],
    ['Toast bread.', 'Mash avocado with lemon, salt, pepper.', 'Spread and serve.'], { vegetarian: true }),

  r('oats-porridge', 'Banana Oats Porridge', 'american', ['breakfast'], 5, 10, ['quick', 'healthy', 'vegetarian'],
    [{ name: 'oats', quantity: '1 cup' }, { name: 'milk', quantity: '2 cups' }, { name: 'banana', quantity: '2' }, { name: 'honey', quantity: '1 tbsp', optional: true }],
    ['Cook oats in milk.', 'Slice banana on top.', 'Drizzle honey if desired.'], { vegetarian: true }),

  r('scrambled-eggs', 'Fluffy Scrambled Eggs', 'american', ['breakfast'], 3, 5, ['quick', 'protein', 'kid_friendly'],
    [{ name: 'egg', quantity: '4' }, { name: 'butter', quantity: '1 tbsp' }, { name: 'milk', quantity: '2 tbsp' }, { name: 'salt' }, { name: 'black pepper' }],
    ['Whisk eggs with milk.', 'Melt butter on low heat.', 'Stir gently until just set.']),

  r('pancakes', 'Classic Pancakes', 'american', ['breakfast'], 10, 15, ['kid_friendly', 'vegetarian'],
    [{ name: 'all purpose flour', quantity: '1.5 cups' }, { name: 'milk', quantity: '1.25 cups' }, { name: 'egg', quantity: '1' }, { name: 'sugar', quantity: '2 tbsp' }, { name: 'butter', quantity: '2 tbsp' }, { name: 'baking powder', quantity: '2 tsp' }],
    ['Mix dry ingredients.', 'Whisk in wet ingredients.', 'Cook on griddle until golden.'], { vegetarian: false }),

  r('smoothie-bowl', 'Berry Smoothie Bowl', 'american', ['smoothie', 'breakfast', 'snack'], 5, 0, ['healthy', 'vegetarian', 'no_cook'],
    [{ name: 'banana', quantity: '2 frozen' }, { name: 'yogurt', quantity: '1 cup' }, { name: 'honey', quantity: '1 tbsp', optional: true }, { name: 'oats', quantity: '2 tbsp', optional: true }],
    ['Blend banana and yogurt.', 'Pour into bowl.', 'Top with oats and honey.'], { vegetarian: true }),

  r('dal-rice', 'Simple Dal Rice', 'indian', ['lunch', 'dinner'], 10, 25, ['comfort', 'vegetarian', 'one_pot'],
    [{ name: 'moong dal', quantity: '1 cup' }, { name: 'basmati rice', quantity: '2 cups' }, { name: 'onion', quantity: '1' }, { name: 'tomato', quantity: '2' }, { name: 'turmeric powder' }, { name: 'cumin seeds' }, { name: 'garlic' }, { name: 'vegetable oil' }, { name: 'salt' }],
    ['Cook rice.', 'Pressure cook dal with turmeric.', 'Temper cumin, garlic, onion.', 'Mix and serve with ghee.'], { vegetarian: true }),

  r('rajma-chawal', 'Rajma Chawal', 'indian', ['lunch', 'dinner'], 15, 40, ['north_indian', 'comfort', 'vegetarian'],
    [{ name: 'kidney beans', quantity: '1.5 cups' }, { name: 'basmati rice', quantity: '2 cups' }, { name: 'onion', quantity: '2' }, { name: 'tomato', quantity: '3' }, { name: 'ginger' }, { name: 'garlic' }, { name: 'cumin seeds' }, { name: 'red chili' }, { name: 'vegetable oil' }],
    ['Soak and cook rajma.', 'Make onion-tomato masala.', 'Simmer rajma in masala.', 'Serve with rice.'], { vegetarian: true }),

  r('chicken-curry', 'Home-style Chicken Curry', 'indian', ['lunch', 'dinner'], 15, 35, ['protein', 'one_pot'],
    [{ name: 'chicken breast', quantity: '500g' }, { name: 'onion', quantity: '2' }, { name: 'tomato', quantity: '2' }, { name: 'yogurt', quantity: '1/2 cup' }, { name: 'ginger' }, { name: 'garlic' }, { name: 'turmeric powder' }, { name: 'cumin seeds' }, { name: 'red chili' }, { name: 'vegetable oil' }],
    ['Marinate chicken briefly.', 'Brown onions, add spices.', 'Add chicken and tomato.', 'Simmer until tender.'], { spiceLevel: 'medium' }),

  r('paneer-butter-masala', 'Paneer Butter Masala', 'indian', ['lunch', 'dinner'], 15, 25, ['north_indian', 'vegetarian', 'kid_friendly'],
    [{ name: 'paneer', quantity: '250g' }, { name: 'tomato', quantity: '4' }, { name: 'onion', quantity: '1' }, { name: 'cream', quantity: '1/4 cup' }, { name: 'butter', quantity: '2 tbsp' }, { name: 'ginger' }, { name: 'garlic' }, { name: 'salt' }],
    ['Blend tomato-onion base.', 'Cook with butter and spices.', 'Add paneer and cream.', 'Simmer 10 minutes.'], { vegetarian: true }),

  r('veg-biryani', 'Vegetable Biryani', 'indian', ['lunch', 'dinner'], 20, 40, ['festive', 'vegetarian', 'one_pot'],
    [{ name: 'basmati rice', quantity: '2 cups' }, { name: 'potato', quantity: '2' }, { name: 'carrot', quantity: '2' }, { name: 'green beans', quantity: '1 cup' }, { name: 'onion', quantity: '2' }, { name: 'yogurt', quantity: '1/2 cup' }, { name: 'biryani masala' }, { name: 'vegetable oil' }],
    ['Par-cook rice.', 'Layer spiced veggies and rice.', 'Dum cook 20 minutes.'], { vegetarian: true, difficulty: 'medium' }),

  r('palak-paneer', 'Palak Paneer', 'indian', ['lunch', 'dinner'], 15, 20, ['north_indian', 'vegetarian', 'healthy'],
    [{ name: 'spinach', quantity: '500g' }, { name: 'paneer', quantity: '200g' }, { name: 'onion', quantity: '1' }, { name: 'tomato', quantity: '1' }, { name: 'garlic' }, { name: 'ginger' }, { name: 'cream', quantity: '2 tbsp', optional: true }, { name: 'vegetable oil' }],
    ['Blanch and blend spinach.', 'Sauté onion-tomato masala.', 'Add spinach puree and paneer.', 'Finish with cream.'], { vegetarian: true }),

  r('chana-masala', 'Chana Masala', 'indian', ['lunch', 'dinner'], 10, 25, ['vegetarian', 'protein', 'one_pot'],
    [{ name: 'chickpeas', quantity: '2 cups' }, { name: 'onion', quantity: '2' }, { name: 'tomato', quantity: '3' }, { name: 'ginger' }, { name: 'garlic' }, { name: 'cumin seeds' }, { name: 'red chili' }, { name: 'vegetable oil' }],
    ['Cook chickpeas until soft.', 'Make onion-tomato masala.', 'Simmer chickpeas in masala.'], { vegetarian: true }),

  r('sambar-rice', 'Sambar Rice', 'indian', ['lunch', 'dinner'], 10, 30, ['south_indian', 'vegetarian'],
    [{ name: 'basmati rice', quantity: '2 cups' }, { name: 'toor dal', quantity: '1/2 cup' }, { name: 'drumstick', quantity: '2', optional: true }, { name: 'carrot', quantity: '1' }, { name: 'green beans', quantity: 'handful' }, { name: 'tamarind' }, { name: 'sambar powder' }],
    ['Cook rice and dal separately.', 'Make sambar with veggies.', 'Mix rice with sambar and serve.'], { vegetarian: true }),

  r('lemon-rice', 'Lemon Rice', 'indian', ['lunch', 'dinner'], 5, 15, ['south_indian', 'quick', 'vegetarian'],
    [{ name: 'basmati rice', quantity: '3 cups cooked' }, { name: 'lemon', quantity: '2' }, { name: 'peanut', quantity: '2 tbsp' }, { name: 'mustard seeds' }, { name: 'turmeric powder' }, { name: 'vegetable oil' }, { name: 'red chili' }],
    ['Temper mustard, peanuts, chili.', 'Add turmeric and rice.', 'Mix with lemon juice.'], { vegetarian: true }),

  r('fried-rice', 'Veg Fried Rice', 'asian', ['lunch', 'dinner'], 10, 15, ['quick', 'one_pan', 'vegetarian'],
    [{ name: 'basmati rice', quantity: '3 cups cooked' }, { name: 'carrot', quantity: '1' }, { name: 'green beans', quantity: '1/2 cup' }, { name: 'bell pepper', quantity: '1' }, { name: 'onion', quantity: '1' }, { name: 'soy sauce' }, { name: 'vegetable oil' }, { name: 'garlic' }],
    ['Stir-fry veggies on high heat.', 'Add cold rice and soy sauce.', 'Toss and serve hot.'], { vegetarian: true }),

  r('chicken-fried-rice', 'Chicken Fried Rice', 'asian', ['lunch', 'dinner'], 10, 15, ['quick', 'one_pan', 'protein'],
    [{ name: 'basmati rice', quantity: '3 cups cooked' }, { name: 'chicken breast', quantity: '300g' }, { name: 'egg', quantity: '2' }, { name: 'carrot', quantity: '1' }, { name: 'green beans', quantity: '1/2 cup' }, { name: 'soy sauce' }, { name: 'vegetable oil' }, { name: 'garlic' }],
    ['Cook chicken pieces.', 'Scramble eggs, set aside.', 'Stir-fry veggies, rice, chicken, eggs.']),

  r('noodles-stirfry', 'Garlic Noodle Stir Fry', 'asian', ['lunch', 'dinner'], 10, 12, ['quick', 'vegetarian'],
    [{ name: 'spaghetti', quantity: '300g' }, { name: 'garlic', quantity: '4 cloves' }, { name: 'soy sauce' }, { name: 'bell pepper', quantity: '1' }, { name: 'carrot', quantity: '1' }, { name: 'vegetable oil' }],
    ['Boil noodles.', 'Stir-fry garlic and veggies.', 'Toss noodles with soy sauce.'], { vegetarian: true }),

  r('pad-thai-simple', 'Simple Pad Thai', 'asian', ['lunch', 'dinner'], 15, 15, ['quick'],
    [{ name: 'rice noodles', quantity: '250g' }, { name: 'egg', quantity: '2' }, { name: 'tofu', quantity: '200g', optional: true }, { name: 'bean sprouts', quantity: '1 cup', optional: true }, { name: 'soy sauce' }, { name: 'peanut', quantity: '2 tbsp' }, { name: 'lime' }],
    ['Soak noodles.', 'Stir-fry tofu and egg.', 'Add noodles and sauce.', 'Garnish with peanuts and lime.']),

  r('pasta-marinara', 'Pasta Marinara', 'italian', ['lunch', 'dinner'], 5, 20, ['quick', 'kid_friendly', 'vegetarian'],
    [{ name: 'spaghetti', quantity: '400g' }, { name: 'tomato', quantity: '4' }, { name: 'garlic', quantity: '3 cloves' }, { name: 'olive oil' }, { name: 'basil', quantity: 'handful', optional: true }, { name: 'salt' }],
    ['Boil pasta.', 'Simmer garlic and tomatoes.', 'Toss pasta with sauce.'], { vegetarian: true }),

  r('pasta-alfredo', 'Creamy Pasta Alfredo', 'italian', ['lunch', 'dinner'], 10, 15, ['comfort', 'kid_friendly', 'vegetarian'],
    [{ name: 'spaghetti', quantity: '400g' }, { name: 'cream', quantity: '1 cup' }, { name: 'butter', quantity: '3 tbsp' }, { name: 'garlic', quantity: '2 cloves' }, { name: 'parmesan', quantity: '1/2 cup' }],
    ['Cook pasta.', 'Make cream-butter-garlic sauce.', 'Toss with cheese.'], { vegetarian: true }),

  r('spaghetti-bolognese', 'Spaghetti Bolognese', 'italian', ['lunch', 'dinner'], 15, 35, ['comfort', 'kid_friendly'],
    [{ name: 'spaghetti', quantity: '400g' }, { name: 'chicken breast', quantity: '400g mince', optional: true }, { name: 'moong dal', quantity: '1 cup', optional: true }, { name: 'tomato', quantity: '3' }, { name: 'onion', quantity: '1' }, { name: 'garlic' }, { name: 'olive oil' }],
    ['Brown mince or cook lentils.', 'Add tomato and simmer.', 'Serve over spaghetti.']),

  r('margherita-pizza', 'Homemade Margherita Pizza', 'italian', ['lunch', 'dinner'], 20, 15, ['kid_friendly', 'vegetarian'],
    [{ name: 'all purpose flour', quantity: '2 cups' }, { name: 'yeast', quantity: '1 tsp' }, { name: 'tomato', quantity: '2' }, { name: 'mozzarella', quantity: '200g' }, { name: 'olive oil' }, { name: 'basil', optional: true }],
    ['Make pizza dough.', 'Top with tomato and cheese.', 'Bake until bubbly.'], { vegetarian: true, difficulty: 'medium' }),

  r('greek-salad', 'Greek Salad Bowl', 'mediterranean', ['lunch', 'dinner'], 15, 0, ['healthy', 'no_cook', 'vegetarian'],
    [{ name: 'tomato', quantity: '3' }, { name: 'cucumber', quantity: '1' }, { name: 'onion', quantity: '1/2' }, { name: 'bell pepper', quantity: '1' }, { name: 'feta', quantity: '100g' }, { name: 'olive oil' }, { name: 'lemon' }],
    ['Chop all vegetables.', 'Crumble feta on top.', 'Dress with olive oil and lemon.'], { vegetarian: true }),

  r('hummus-wrap', 'Hummus Veggie Wrap', 'mediterranean', ['lunch', 'snack'], 10, 0, ['quick', 'vegetarian', 'no_cook'],
    [{ name: 'tortillas', quantity: '4' }, { name: 'hummus', quantity: '1 cup' }, { name: 'cucumber', quantity: '1' }, { name: 'tomato', quantity: '2' }, { name: 'spinach', quantity: '1 cup' }],
    ['Spread hummus on wrap.', 'Add veggies.', 'Roll and slice.'], { vegetarian: true }),

  r('shakshuka', 'Shakshuka', 'mediterranean', ['breakfast', 'lunch'], 10, 20, ['one_pan', 'vegetarian'],
    [{ name: 'egg', quantity: '4' }, { name: 'tomato', quantity: '4' }, { name: 'bell pepper', quantity: '1' }, { name: 'onion', quantity: '1' }, { name: 'garlic' }, { name: 'cumin seeds' }, { name: 'olive oil' }],
    ['Cook pepper-onion-tomato base.', 'Make wells and crack eggs.', 'Cover until eggs set.'], { vegetarian: false }),

  r('falafel-bowl', 'Falafel Rice Bowl', 'mediterranean', ['lunch', 'dinner'], 15, 20, ['vegetarian', 'protein'],
    [{ name: 'chickpeas', quantity: '1 cup' }, { name: 'onion', quantity: '1' }, { name: 'garlic' }, { name: 'cumin seeds' }, { name: 'coriander leaves' }, { name: 'basmati rice', quantity: '2 cups cooked' }, { name: 'yogurt', quantity: '1/2 cup' }, { name: 'vegetable oil' }],
    ['Blend and shape falafel.', 'Bake or shallow fry.', 'Serve over rice with yogurt.'], { vegetarian: true }),

  r('grilled-chicken-salad', 'Grilled Chicken Salad', 'american', ['lunch', 'dinner'], 10, 15, ['healthy', 'protein'],
    [{ name: 'chicken breast', quantity: '400g' }, { name: 'spinach', quantity: '4 cups' }, { name: 'tomato', quantity: '2' }, { name: 'cucumber', quantity: '1' }, { name: 'lemon' }, { name: 'olive oil' }],
    ['Grill seasoned chicken.', 'Toss greens with lemon dressing.', 'Slice chicken on top.']),

  r('quesadilla', 'Cheese Quesadilla', 'mexican', ['lunch', 'snack'], 5, 10, ['quick', 'kid_friendly', 'vegetarian'],
    [{ name: 'tortillas', quantity: '4' }, { name: 'cheddar', quantity: '2 cups' }, { name: 'bell pepper', quantity: '1', optional: true }, { name: 'onion', quantity: '1/2', optional: true }],
    ['Fill tortilla with cheese and veggies.', 'Cook on pan until golden.', 'Cut into wedges.'], { vegetarian: true }),

  r('bean-tacos', 'Black Bean Tacos', 'mexican', ['lunch', 'dinner'], 10, 15, ['quick', 'vegetarian'],
    [{ name: 'black beans', quantity: '2 cups' }, { name: 'tortillas', quantity: '8 taco shells' }, { name: 'tomato', quantity: '2' }, { name: 'onion', quantity: '1' }, { name: 'cheddar', quantity: '1 cup', optional: true }, { name: 'lime' }],
    ['Warm beans with spices.', 'Fill shells with beans and toppings.', 'Squeeze lime on top.'], { vegetarian: true }),

  r('burrito-bowl', 'Chicken Burrito Bowl', 'mexican', ['lunch', 'dinner'], 15, 25, ['protein', 'one_bowl'],
    [{ name: 'basmati rice', quantity: '2 cups' }, { name: 'chicken breast', quantity: '400g' }, { name: 'black beans', quantity: '1 cup' }, { name: 'tomato', quantity: '2' }, { name: 'onion', quantity: '1' }, { name: 'cheddar', quantity: '1 cup' }, { name: 'lime' }],
    ['Cook rice and beans.', 'Season and cook chicken.', 'Assemble bowls with toppings.']),

  r('tomato-soup', 'Creamy Tomato Soup', 'american', ['lunch', 'dinner'], 10, 25, ['comfort', 'vegetarian', 'kid_friendly'],
    [{ name: 'tomato', quantity: '6' }, { name: 'onion', quantity: '1' }, { name: 'garlic' }, { name: 'cream', quantity: '1/4 cup' }, { name: 'butter' }, { name: 'vegetable stock', quantity: '2 cups' }],
    ['Sauté onion and garlic.', 'Add tomatoes and stock, simmer.', 'Blend and finish with cream.'], { vegetarian: true }),

  r('grilled-cheese', 'Grilled Cheese Sandwich', 'american', ['lunch', 'snack'], 5, 10, ['quick', 'kid_friendly', 'vegetarian'],
    [{ name: 'sandwich bread', quantity: '4 slices' }, { name: 'cheddar', quantity: '4 slices' }, { name: 'butter', quantity: '2 tbsp' }],
    ['Butter bread.', 'Add cheese and grill until melted.'], { vegetarian: true }),

  r('mac-cheese', 'Stovetop Mac and Cheese', 'american', ['lunch', 'dinner'], 5, 15, ['kid_friendly', 'comfort', 'vegetarian'],
    [{ name: 'macaroni', quantity: '300g' }, { name: 'cheddar', quantity: '2 cups' }, { name: 'milk', quantity: '1 cup' }, { name: 'butter', quantity: '2 tbsp' }, { name: 'all purpose flour', quantity: '2 tbsp' }],
    ['Cook pasta.', 'Make cheese sauce.', 'Combine and serve.'], { vegetarian: true }),

  r('chicken-soup', 'Chicken Veg Soup', 'american', ['lunch', 'dinner'], 15, 35, ['comfort', 'healthy'],
    [{ name: 'chicken breast', quantity: '300g' }, { name: 'carrot', quantity: '2' }, { name: 'celery', quantity: '2 stalks', optional: true }, { name: 'onion', quantity: '1' }, { name: 'vegetable stock', quantity: '6 cups' }, { name: 'garlic' }],
    ['Simmer chicken in stock.', 'Add chopped veggies.', 'Shred chicken and serve.']),

  r('stir-fry-tofu', 'Tofu Stir Fry', 'asian', ['lunch', 'dinner'], 10, 15, ['vegetarian', 'protein', 'quick'],
    [{ name: 'tofu', quantity: '400g' }, { name: 'bell pepper', quantity: '2' }, { name: 'broccoli', quantity: '2 cups', optional: true }, { name: 'soy sauce' }, { name: 'garlic' }, { name: 'ginger' }, { name: 'vegetable oil' }],
    ['Crisp tofu in pan.', 'Stir-fry veggies.', 'Toss with sauce.'], { vegetarian: true }),

  r('mushroom-risotto', 'Mushroom Risotto', 'italian', ['lunch', 'dinner'], 10, 30, ['comfort', 'vegetarian'],
    [{ name: 'arborio rice', quantity: '1.5 cups' }, { name: 'button mushrooms', quantity: '300g' }, { name: 'onion', quantity: '1' }, { name: 'vegetable stock', quantity: '4 cups' }, { name: 'parmesan', quantity: '1/2 cup' }, { name: 'butter' }],
    ['Sauté mushrooms.', 'Toast rice, add stock gradually.', 'Finish with butter and cheese.'], { vegetarian: true, difficulty: 'medium' }),

  r('egg-fried-noodles', 'Egg Hakka Noodles', 'asian', ['lunch', 'dinner'], 10, 12, ['quick'],
    [{ name: 'hakka noodles', quantity: '300g' }, { name: 'egg', quantity: '3' }, { name: 'cabbage', quantity: '2 cups', optional: true }, { name: 'carrot', quantity: '1' }, { name: 'soy sauce' }, { name: 'vegetable oil' }],
    ['Boil noodles.', 'Scramble eggs, stir-fry veggies.', 'Toss everything together.']),

  r('khichdi', 'Moong Dal Khichdi', 'indian', ['lunch', 'dinner'], 5, 25, ['comfort', 'vegetarian', 'one_pot', 'kid_friendly'],
    [{ name: 'basmati rice', quantity: '1 cup' }, { name: 'moong dal', quantity: '1/2 cup' }, { name: 'turmeric powder' }, { name: 'cumin seeds' }, { name: 'ginger' }, { name: 'ghee', quantity: '2 tbsp', optional: true }, { name: 'salt' }],
    ['Wash rice and dal.', 'Pressure cook with turmeric.', 'Temper cumin in ghee.'], { vegetarian: true }),

  r('aloo-gobi', 'Aloo Gobi', 'indian', ['lunch', 'dinner'], 10, 25, ['vegetarian', 'north_indian'],
    [{ name: 'potato', quantity: '3' }, { name: 'cauliflower', quantity: '1 head' }, { name: 'onion', quantity: '1' }, { name: 'tomato', quantity: '1' }, { name: 'turmeric powder' }, { name: 'cumin seeds' }, { name: 'red chili' }, { name: 'vegetable oil' }],
    ['Sauté onion and spices.', 'Add potato and cauliflower.', 'Cook until tender.'], { vegetarian: true }),

  r('baingan-bharta', 'Baingan Bharta', 'indian', ['lunch', 'dinner'], 10, 30, ['vegetarian', 'north_indian'],
    [{ name: 'eggplant', quantity: '2 large' }, { name: 'onion', quantity: '2' }, { name: 'tomato', quantity: '2' }, { name: 'garlic' }, { name: 'ginger' }, { name: 'cumin seeds' }, { name: 'vegetable oil' }],
    ['Roast eggplant.', 'Mash and cook with masala.', 'Serve with roti or rice.'], { vegetarian: true }),

  r('fish-curry', 'Quick Fish Curry', 'indian', ['lunch', 'dinner'], 10, 20, ['coastal', 'protein'],
    [{ name: 'fish', quantity: '500g', optional: true }, { name: 'coconut milk', quantity: '1 cup' }, { name: 'tomato', quantity: '2' }, { name: 'onion', quantity: '1' }, { name: 'turmeric powder' }, { name: 'red chili' }, { name: 'vegetable oil' }],
    ['Make coconut-tomato base.', 'Add fish pieces gently.', 'Simmer 10 minutes.'], { spiceLevel: 'medium' }),

  r('egg-curry', 'Egg Curry', 'indian', ['lunch', 'dinner'], 10, 20, ['protein', 'budget'],
    [{ name: 'egg', quantity: '6' }, { name: 'onion', quantity: '2' }, { name: 'tomato', quantity: '2' }, { name: 'ginger' }, { name: 'garlic' }, { name: 'turmeric powder' }, { name: 'cumin seeds' }, { name: 'vegetable oil' }],
    ['Boil and peel eggs.', 'Make onion-tomato curry.', 'Add halved eggs and simmer.']),

  r('miso-soup', 'Miso Soup with Tofu', 'asian', ['lunch', 'dinner', 'snack'], 5, 10, ['light', 'vegetarian', 'quick'],
    [{ name: 'tofu', quantity: '200g' }, { name: 'miso paste', quantity: '2 tbsp' }, { name: 'vegetable stock', quantity: '4 cups' }, { name: 'seaweed', quantity: '1 sheet', optional: true }, { name: 'green onion', quantity: '2', optional: true }],
    ['Heat stock.', 'Dissolve miso.', 'Add tofu and garnish.'], { vegetarian: true }),

  r('caprese-salad', 'Caprese Salad', 'italian', ['lunch', 'snack'], 10, 0, ['no_cook', 'vegetarian'],
    [{ name: 'tomato', quantity: '4' }, { name: 'mozzarella', quantity: '200g' }, { name: 'basil', quantity: 'handful' }, { name: 'olive oil' }, { name: 'balsamic', quantity: '1 tbsp', optional: true }],
    ['Slice tomato and mozzarella.', 'Layer with basil.', 'Drizzle olive oil.'], { vegetarian: true }),

  r('peanut-butter-sandwich', 'PB Banana Sandwich', 'american', ['breakfast', 'snack'], 3, 0, ['no_cook', 'kid_friendly', 'quick'],
    [{ name: 'sandwich bread', quantity: '2 slices' }, { name: 'peanut_butter', quantity: '2 tbsp' }, { name: 'banana', quantity: '1' }, { name: 'honey', quantity: '1 tsp', optional: true }],
    ['Spread peanut butter on bread.', 'Add banana slices.', 'Drizzle honey if desired.']),

  r('fruit-parfait', 'Yogurt Fruit Parfait', 'american', ['dessert', 'breakfast', 'snack'], 5, 0, ['no_cook', 'healthy', 'vegetarian'],
    [{ name: 'yogurt', quantity: '2 cups' }, { name: 'banana', quantity: '1' }, { name: 'oats', quantity: '1/4 cup' }, { name: 'honey', quantity: '1 tbsp', optional: true }],
    ['Layer yogurt and fruit.', 'Top with oats and honey.'], { vegetarian: true }),

  r('veggie-omelette', 'Veggie Loaded Omelette', 'american', ['breakfast', 'lunch'], 5, 10, ['quick', 'protein', 'vegetarian'],
    [{ name: 'egg', quantity: '3' }, { name: 'bell pepper', quantity: '1/2' }, { name: 'spinach', quantity: '1 cup' }, { name: 'onion', quantity: '1/4' }, { name: 'cheddar', quantity: '1/4 cup', optional: true }, { name: 'butter' }],
    ['Sauté veggies briefly.', 'Pour beaten eggs.', 'Add cheese, fold and serve.'], { vegetarian: false }),

  r('chicken-wrap', 'Chicken Caesar Wrap', 'american', ['lunch', 'snack'], 10, 10, ['quick', 'protein'],
    [{ name: 'chicken breast', quantity: '300g' }, { name: 'tortillas', quantity: '4' }, { name: 'spinach', quantity: '2 cups' }, { name: 'yogurt', quantity: '1/4 cup' }, { name: 'lemon' }],
    ['Cook seasoned chicken.', 'Mix yogurt-lemon dressing.', 'Wrap with greens and chicken.']),

  r('potato-wedges', 'Baked Potato Wedges', 'american', ['snack', 'dinner'], 10, 30, ['kid_friendly', 'vegetarian'],
    [{ name: 'potato', quantity: '4 large' }, { name: 'vegetable oil', quantity: '3 tbsp' }, { name: 'salt' }, { name: 'black pepper' }, { name: 'paprika', quantity: '1 tsp', optional: true }],
    ['Cut potatoes into wedges.', 'Toss with oil and spices.', 'Bake until crispy.'], { vegetarian: true }),

  r('mug-cake', 'Microwave Mug Cake', 'american', ['dessert', 'snack'], 3, 2, ['quick', 'dessert', 'vegetarian'],
    [{ name: 'all purpose flour', quantity: '4 tbsp' }, { name: 'sugar', quantity: '3 tbsp' }, { name: 'cocoa', quantity: '2 tbsp', optional: true }, { name: 'milk', quantity: '3 tbsp' }, { name: 'vegetable oil', quantity: '2 tbsp' }],
    ['Mix ingredients in mug.', 'Microwave 90 seconds.'], { vegetarian: true }),

  r('banana-smoothie', 'Banana Peanut Smoothie', 'american', ['smoothie', 'breakfast', 'snack'], 3, 0, ['no_cook', 'quick'],
    [{ name: 'banana', quantity: '2' }, { name: 'milk', quantity: '1 cup' }, { name: 'peanut_butter', quantity: '1 tbsp' }, { name: 'honey', quantity: '1 tsp', optional: true }],
    ['Blend all ingredients.', 'Serve chilled.']),

  r('coconut-rice', 'Coconut Rice', 'indian', ['lunch', 'dinner'], 5, 20, ['south_indian', 'vegetarian'],
    [{ name: 'basmati rice', quantity: '2 cups' }, { name: 'coconut milk', quantity: '1 cup' }, { name: 'vegetable oil' }, { name: 'mustard seeds' }, { name: 'curry leaves', quantity: 'handful', optional: true }],
    ['Cook rice with coconut milk.', 'Temper mustard seeds.', 'Mix and serve.'], { vegetarian: true }),

  r('tadka-dal', 'Tadka Dal', 'indian', ['lunch', 'dinner'], 5, 25, ['comfort', 'vegetarian', 'budget'],
    [{ name: 'toor dal', quantity: '1 cup' }, { name: 'onion', quantity: '1' }, { name: 'tomato', quantity: '1' }, { name: 'garlic' }, { name: 'cumin seeds' }, { name: 'turmeric powder' }, { name: 'red chili' }, { name: 'ghee', quantity: '1 tbsp' }],
    ['Pressure cook dal.', 'Temper cumin, garlic, chili in ghee.', 'Pour over dal and serve.'], { vegetarian: true }),

  r('veg-pulao', 'Mixed Veg Pulao', 'indian', ['lunch', 'dinner'], 10, 25, ['one_pot', 'vegetarian'],
    [{ name: 'basmati rice', quantity: '2 cups' }, { name: 'carrot', quantity: '1' }, { name: 'green beans', quantity: '1/2 cup' }, { name: 'peas', quantity: '1/2 cup', optional: true }, { name: 'onion', quantity: '1' }, { name: 'cumin seeds' }, { name: 'vegetable oil' }],
    ['Sauté onion and spices.', 'Add rice, veggies, water.', 'Cook until rice is fluffy.'], { vegetarian: true }),

  r('butter-chicken', 'Butter Chicken', 'indian', ['lunch', 'dinner'], 20, 30, ['north_indian', 'festive'],
    [{ name: 'chicken breast', quantity: '500g' }, { name: 'tomato', quantity: '4' }, { name: 'cream', quantity: '1/2 cup' }, { name: 'butter', quantity: '3 tbsp' }, { name: 'yogurt', quantity: '1/2 cup' }, { name: 'ginger' }, { name: 'garlic' }, { name: 'garam masala' }],
    ['Marinate chicken in yogurt.', 'Grill or pan-sear chicken.', 'Simmer in tomato-butter-cream sauce.'], { spiceLevel: 'mild' }),

  r('dosa-potato', 'Masala Dosa Filling', 'indian', ['breakfast', 'lunch'], 15, 20, ['south_indian', 'vegetarian'],
    [{ name: 'potato', quantity: '4' }, { name: 'onion', quantity: '2' }, { name: 'mustard seeds' }, { name: 'turmeric powder' }, { name: 'curry leaves', optional: true }, { name: 'vegetable oil' }],
    ['Boil and mash potatoes.', 'Temper mustard and curry leaves.', 'Mix with spiced onions.'], { vegetarian: true }),

  r('overnight-oats', 'Overnight Oats', 'american', ['breakfast'], 5, 0, ['no_cook', 'healthy', 'vegetarian'],
    [{ name: 'oats', quantity: '1 cup' }, { name: 'milk', quantity: '1 cup' }, { name: 'yogurt', quantity: '1/2 cup' }, { name: 'banana', quantity: '1', optional: true }, { name: 'honey', optional: true }],
    ['Mix oats, milk, yogurt.', 'Refrigerate overnight.', 'Top with fruit before serving.'], { vegetarian: true }),

  r('chicken-tikka', 'Pan Chicken Tikka', 'indian', ['lunch', 'dinner'], 15, 20, ['protein', 'grilled'],
    [{ name: 'chicken breast', quantity: '500g' }, { name: 'yogurt', quantity: '1 cup' }, { name: 'ginger' }, { name: 'garlic' }, { name: 'lemon' }, { name: 'tikka masala' }, { name: 'vegetable oil' }],
    ['Marinate chicken 30 min or overnight.', 'Pan-grill until charred.', 'Serve with onion and lemon.'], { spiceLevel: 'medium' }),
];

export default recipes;
