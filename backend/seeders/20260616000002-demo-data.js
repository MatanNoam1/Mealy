'use strict';

const bcrypt = require('bcryptjs');

// Demo data so a classmate can log in and see a populated app immediately.
// All demo users share the password "123456" (hashed with bcrypt at seed time).
// JSON columns are stringified because bulkInsert bypasses model serialization.
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const hash = bcrypt.hashSync('123456', 10);
    const j = (v) => JSON.stringify(v);

    await queryInterface.bulkInsert('users', [
      { id: 1, firstName: 'Matan', lastName: 'Noam', email: 'matan@mealy.com', passwordHash: hash, dietaryPreferences: j(['vegetarian']), theme: 'light', userRole: 'admin', createdAt: now, updatedAt: now },
      { id: 2, firstName: 'Moshe', lastName: 'Cohen', email: 'moshe@mealy.com', passwordHash: hash, dietaryPreferences: j(['vegan', 'gluten-free']), theme: 'light', userRole: 'manager', createdAt: now, updatedAt: now },
      { id: 3, firstName: 'Yossi', lastName: 'Levi', email: 'yossi@mealy.com', passwordHash: hash, dietaryPreferences: j([]), theme: 'light', userRole: 'user', createdAt: now, updatedAt: now }
    ]);

    await queryInterface.bulkInsert('admins', [
      { id: 1, userId: 1, permissions: j(['manage_users', 'manage_recipes']), notes: 'Primary admin', createdAt: now, updatedAt: now }
    ]);

    await queryInterface.bulkInsert('recipes', [
      // --- Matan owns ---
      { id: 1, ownerId: 1, title: 'Spaghetti Bolognese', ingredients: j([{ name: 'Spaghetti', quantity: 200, unit: 'g' }, { name: 'Ground beef', quantity: 300, unit: 'g' }, { name: 'Tomato sauce', quantity: 400, unit: 'ml' }]), instructions: 'Brown ground beef, add tomato sauce, simmer 20 min. Cook pasta and combine.', prepTime: 40, servings: 4, mealTypes: j(['dinner']), isPublic: true, imageUrl: null, cuisineType: 'Italian', tags: j(['pasta', 'meat']), createdAt: now, updatedAt: now },
      { id: 2, ownerId: 1, title: 'French Toast', ingredients: j([{ name: 'Bread', quantity: 4, unit: 'slices' }, { name: 'Eggs', quantity: 2, unit: 'pcs' }, { name: 'Milk', quantity: 50, unit: 'ml' }]), instructions: 'Whisk eggs with milk, dip bread slices, fry in butter until golden on both sides.', prepTime: 15, servings: 2, mealTypes: j(['breakfast']), isPublic: false, imageUrl: null, cuisineType: 'French', tags: j(['breakfast', 'sweet']), createdAt: now, updatedAt: now },
      { id: 3, ownerId: 1, title: 'Caesar Salad', ingredients: j([{ name: 'Romaine lettuce', quantity: 1, unit: 'head' }, { name: 'Parmesan', quantity: 40, unit: 'g' }, { name: 'Croutons', quantity: 50, unit: 'g' }, { name: 'Caesar dressing', quantity: 3, unit: 'tbsp' }]), instructions: 'Chop romaine lettuce. Toss with Caesar dressing, parmesan, and croutons. Serve immediately.', prepTime: 10, servings: 2, mealTypes: j(['lunch']), isPublic: true, imageUrl: null, cuisineType: 'American', tags: j(['salad', 'vegetarian', 'quick']), createdAt: now, updatedAt: now },
      { id: 4, ownerId: 1, title: 'Lentil Soup', ingredients: j([{ name: 'Red lentils', quantity: 200, unit: 'g' }, { name: 'Onion', quantity: 1, unit: 'pcs' }, { name: 'Carrots', quantity: 2, unit: 'pcs' }, { name: 'Cumin', quantity: 1, unit: 'tsp' }, { name: 'Olive oil', quantity: 2, unit: 'tbsp' }]), instructions: 'Saute chopped onion and carrots in olive oil. Add lentils, cumin, and 1L water. Simmer 25 minutes until lentils are soft. Blend partially for a creamy texture.', prepTime: 35, servings: 4, mealTypes: j(['lunch', 'dinner']), isPublic: true, imageUrl: null, cuisineType: 'Middle Eastern', tags: j(['vegan', 'healthy', 'vegetarian']), createdAt: now, updatedAt: now },
      { id: 5, ownerId: 1, title: 'Overnight Oats', ingredients: j([{ name: 'Rolled oats', quantity: 80, unit: 'g' }, { name: 'Milk', quantity: 200, unit: 'ml' }, { name: 'Chia seeds', quantity: 1, unit: 'tbsp' }, { name: 'Honey', quantity: 1, unit: 'tbsp' }, { name: 'Banana', quantity: 1, unit: 'pcs' }]), instructions: 'Mix oats, milk, and chia seeds in a jar. Refrigerate overnight. Top with sliced banana and honey before serving.', prepTime: 5, servings: 1, mealTypes: j(['breakfast']), isPublic: true, imageUrl: null, cuisineType: 'International', tags: j(['healthy', 'vegetarian', 'quick', 'meal-prep']), createdAt: now, updatedAt: now },
      { id: 6, ownerId: 1, title: 'Caprese Pasta', ingredients: j([{ name: 'Penne', quantity: 200, unit: 'g' }, { name: 'Cherry tomatoes', quantity: 200, unit: 'g' }, { name: 'Mozzarella', quantity: 125, unit: 'g' }, { name: 'Basil', quantity: 10, unit: 'leaves' }, { name: 'Olive oil', quantity: 3, unit: 'tbsp' }]), instructions: 'Cook pasta. Halve tomatoes and cube mozzarella. Toss hot pasta with tomatoes, mozzarella, basil, and olive oil. Season and serve.', prepTime: 20, servings: 2, mealTypes: j(['lunch', 'dinner']), isPublic: true, imageUrl: null, cuisineType: 'Italian', tags: j(['vegetarian', 'pasta', 'quick']), createdAt: now, updatedAt: now },

      // --- Moshe owns ---
      { id: 7, ownerId: 2, title: 'Shakshuka', ingredients: j([{ name: 'Eggs', quantity: 4, unit: 'pcs' }, { name: 'Tomatoes', quantity: 3, unit: 'pcs' }, { name: 'Olive oil', quantity: 2, unit: 'tbsp' }]), instructions: 'Heat oil in a pan, add diced tomatoes and spices, simmer 10 min, crack eggs on top, cook until whites set.', prepTime: 20, servings: 2, mealTypes: j(['breakfast', 'lunch']), isPublic: true, imageUrl: null, cuisineType: 'Middle Eastern', tags: j(['vegetarian', 'quick']), createdAt: now, updatedAt: now },
      { id: 8, ownerId: 2, title: 'Hummus', ingredients: j([{ name: 'Chickpeas', quantity: 400, unit: 'g' }, { name: 'Tahini', quantity: 3, unit: 'tbsp' }, { name: 'Lemon juice', quantity: 2, unit: 'tbsp' }]), instructions: 'Blend chickpeas with tahini, lemon juice, garlic and olive oil until smooth.', prepTime: 10, servings: 6, mealTypes: j(['snack']), isPublic: true, imageUrl: null, cuisineType: 'Middle Eastern', tags: j(['vegetarian', 'vegan', 'quick']), createdAt: now, updatedAt: now },
      { id: 9, ownerId: 2, title: 'Grilled Cheese Sandwich', ingredients: j([{ name: 'Bread', quantity: 2, unit: 'slices' }, { name: 'Cheddar cheese', quantity: 60, unit: 'g' }, { name: 'Butter', quantity: 1, unit: 'tbsp' }]), instructions: 'Butter the bread slices on one side. Place cheese between unbuttered sides. Grill on medium heat until golden and cheese melts, about 3-4 minutes per side.', prepTime: 10, servings: 1, mealTypes: j(['breakfast', 'lunch']), isPublic: true, imageUrl: null, cuisineType: 'American', tags: j(['quick', 'comfort food']), createdAt: now, updatedAt: now },
      { id: 10, ownerId: 2, title: 'Vegetable Stew', ingredients: j([{ name: 'Potatoes', quantity: 3, unit: 'pcs' }, { name: 'Carrots', quantity: 2, unit: 'pcs' }, { name: 'Zucchini', quantity: 1, unit: 'pcs' }, { name: 'Tomato paste', quantity: 2, unit: 'tbsp' }, { name: 'Olive oil', quantity: 2, unit: 'tbsp' }]), instructions: 'Chop vegetables, saute in olive oil, add tomato paste and water, season and simmer 30 minutes until tender.', prepTime: 40, servings: 4, mealTypes: j(['lunch', 'dinner']), isPublic: true, imageUrl: null, cuisineType: 'Mediterranean', tags: j(['vegan', 'vegetarian', 'healthy']), createdAt: now, updatedAt: now },
      { id: 11, ownerId: 2, title: 'Avocado Toast', ingredients: j([{ name: 'Sourdough bread', quantity: 2, unit: 'slices' }, { name: 'Avocado', quantity: 1, unit: 'pcs' }, { name: 'Lemon juice', quantity: 1, unit: 'tsp' }, { name: 'Red pepper flakes', quantity: 0.5, unit: 'tsp' }]), instructions: 'Toast bread. Mash avocado with lemon juice and salt. Spread on toast, sprinkle with red pepper flakes.', prepTime: 5, servings: 1, mealTypes: j(['breakfast', 'snack']), isPublic: true, imageUrl: null, cuisineType: 'International', tags: j(['vegan', 'vegetarian', 'quick']), createdAt: now, updatedAt: now },

      // --- Yossi owns ---
      { id: 12, ownerId: 3, title: 'Chicken Stir Fry', ingredients: j([{ name: 'Chicken breast', quantity: 400, unit: 'g' }, { name: 'Bell peppers', quantity: 2, unit: 'pcs' }, { name: 'Soy sauce', quantity: 3, unit: 'tbsp' }]), instructions: 'Slice chicken, stir fry with vegetables in high heat, add soy sauce, serve over rice.', prepTime: 25, servings: 3, mealTypes: j(['lunch', 'dinner']), isPublic: true, imageUrl: null, cuisineType: 'Asian', tags: j(['quick', 'healthy']), createdAt: now, updatedAt: now },
      { id: 13, ownerId: 3, title: 'Oatmeal with Fruits', ingredients: j([{ name: 'Rolled oats', quantity: 80, unit: 'g' }, { name: 'Banana', quantity: 1, unit: 'pcs' }, { name: 'Berries', quantity: 50, unit: 'g' }, { name: 'Honey', quantity: 1, unit: 'tbsp' }]), instructions: 'Cook oats in water or milk for 5 minutes. Top with sliced banana, berries, and a drizzle of honey.', prepTime: 10, servings: 1, mealTypes: j(['breakfast']), isPublic: true, imageUrl: null, cuisineType: 'International', tags: j(['healthy', 'vegetarian', 'quick']), createdAt: now, updatedAt: now },
      { id: 14, ownerId: 3, title: 'Tuna Wrap', ingredients: j([{ name: 'Tuna (canned)', quantity: 150, unit: 'g' }, { name: 'Tortilla', quantity: 1, unit: 'pcs' }, { name: 'Lettuce', quantity: 2, unit: 'leaves' }, { name: 'Mayonnaise', quantity: 1, unit: 'tbsp' }]), instructions: 'Mix tuna with mayonnaise. Lay lettuce on tortilla, add tuna mix, roll tightly and serve.', prepTime: 8, servings: 1, mealTypes: j(['lunch']), isPublic: true, imageUrl: null, cuisineType: 'International', tags: j(['quick', 'high-protein']), createdAt: now, updatedAt: now },
      { id: 15, ownerId: 3, title: 'Pasta Primavera', ingredients: j([{ name: 'Pasta', quantity: 200, unit: 'g' }, { name: 'Broccoli', quantity: 150, unit: 'g' }, { name: 'Cherry tomatoes', quantity: 100, unit: 'g' }, { name: 'Parmesan', quantity: 40, unit: 'g' }, { name: 'Olive oil', quantity: 2, unit: 'tbsp' }]), instructions: 'Cook pasta, blanch broccoli. Toss together with tomatoes, olive oil, and parmesan. Season and serve warm.', prepTime: 20, servings: 2, mealTypes: j(['lunch', 'dinner']), isPublic: true, imageUrl: null, cuisineType: 'Italian', tags: j(['vegetarian', 'healthy']), createdAt: now, updatedAt: now },
      { id: 16, ownerId: 3, title: 'Fruit Smoothie', ingredients: j([{ name: 'Banana', quantity: 1, unit: 'pcs' }, { name: 'Strawberries', quantity: 100, unit: 'g' }, { name: 'Yogurt', quantity: 150, unit: 'ml' }, { name: 'Honey', quantity: 1, unit: 'tsp' }]), instructions: 'Blend banana, strawberries, and yogurt until smooth. Sweeten with honey to taste. Serve chilled.', prepTime: 5, servings: 1, mealTypes: j(['snack', 'breakfast']), isPublic: true, imageUrl: null, cuisineType: 'International', tags: j(['healthy', 'quick', 'vegetarian']), createdAt: now, updatedAt: now }
    ]);

    // Sharing: give Matan access to diverse recipes from Moshe and Yossi
    await queryInterface.bulkInsert('recipe_shares', [
      { id: 1, recipeId: 1,  sharedWithUserId: 2, sharedByUserId: 1, createdAt: now, updatedAt: now }, // Matan shares Bolognese with Moshe
      { id: 2, recipeId: 7,  sharedWithUserId: 1, sharedByUserId: 2, createdAt: now, updatedAt: now }, // Moshe shares Shakshuka with Matan
      { id: 3, recipeId: 10, sharedWithUserId: 1, sharedByUserId: 2, createdAt: now, updatedAt: now }, // Moshe shares Vegetable Stew with Matan
      { id: 4, recipeId: 11, sharedWithUserId: 1, sharedByUserId: 2, createdAt: now, updatedAt: now }, // Moshe shares Avocado Toast with Matan
      { id: 5, recipeId: 15, sharedWithUserId: 1, sharedByUserId: 3, createdAt: now, updatedAt: now }, // Yossi shares Pasta Primavera with Matan
      { id: 6, recipeId: 12, sharedWithUserId: 1, sharedByUserId: 3, createdAt: now, updatedAt: now }  // Yossi shares Chicken Stir Fry with Matan
    ]);

    await queryInterface.bulkInsert('meal_plans', [
      { id: 1, userId: 2, title: 'Sample Week', planStartDate: '2025-04-21', planEndDate: '2025-04-27', planData: j({
        days: [
          { day: 'Monday',    slots: { lunch: { recipeId: 9, title: 'Grilled Cheese Sandwich', servings: 2 }, dinner: { recipeId: 10, title: 'Vegetable Stew', servings: 2 } } },
          { day: 'Tuesday',   slots: { lunch: { recipeId: 7, title: 'Shakshuka', servings: 2 },              dinner: { recipeId: 1,  title: 'Spaghetti Bolognese', servings: 2 } } },
          { day: 'Wednesday', slots: { lunch: { recipeId: 3, title: 'Caesar Salad', servings: 2 },           dinner: { recipeId: 10, title: 'Vegetable Stew', servings: 2 } } }
        ],
        shoppingList: []
      }), createdAt: now, updatedAt: now }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('meal_plans', null, {});
    await queryInterface.bulkDelete('recipe_shares', null, {});
    await queryInterface.bulkDelete('recipes', null, {});
    await queryInterface.bulkDelete('admins', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};
