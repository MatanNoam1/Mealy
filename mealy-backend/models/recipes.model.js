const recipes = [
  {
    id: 1,
    userId: 2,
    title: 'Shakshuka',
    ingredients: [
      { name: 'Eggs', quantity: 4, unit: 'pcs' },
      { name: 'Tomatoes', quantity: 3, unit: 'pcs' },
      { name: 'Olive oil', quantity: 2, unit: 'tbsp' }
    ],
    instructions: 'Heat oil in a pan, add diced tomatoes and spices, simmer 10 min, crack eggs on top, cook until whites set.',
    prepTime: 20,
    servings: 2,
    isPublic: true,
    imageUrl: 'https://example.com/shakshuka.jpg',
    cuisineType: 'Middle Eastern',
    tags: ['vegetarian', 'quick'],
    createDate: '2025-02-01T08:00:00Z'
  },
  {
    id: 2,
    userId: 1,
    title: 'Spaghetti Bolognese',
    ingredients: [
      { name: 'Spaghetti', quantity: 200, unit: 'g' },
      { name: 'Ground beef', quantity: 300, unit: 'g' },
      { name: 'Tomato sauce', quantity: 400, unit: 'ml' }
    ],
    instructions: 'Brown ground beef, add tomato sauce, simmer 20 min. Cook pasta and combine.',
    prepTime: 40,
    servings: 4,
    isPublic: true,
    imageUrl: 'https://example.com/bolognese.jpg',
    cuisineType: 'Italian',
    tags: ['pasta', 'meat'],
    createDate: '2025-02-05T10:00:00Z'
  },
  {
    id: 3,
    userId: 3,
    title: 'Chicken Stir Fry',
    ingredients: [
      { name: 'Chicken breast', quantity: 400, unit: 'g' },
      { name: 'Bell peppers', quantity: 2, unit: 'pcs' },
      { name: 'Soy sauce', quantity: 3, unit: 'tbsp' }
    ],
    instructions: 'Slice chicken, stir fry with vegetables in high heat, add soy sauce, serve over rice.',
    prepTime: 25,
    servings: 3,
    isPublic: true,
    imageUrl: 'https://example.com/stirfry.jpg',
    cuisineType: 'Asian',
    tags: ['quick', 'healthy'],
    createDate: '2025-02-10T12:00:00Z'
  },
  {
    id: 4,
    userId: 2,
    title: 'Hummus',
    ingredients: [
      { name: 'Chickpeas', quantity: 400, unit: 'g' },
      { name: 'Tahini', quantity: 3, unit: 'tbsp' },
      { name: 'Lemon juice', quantity: 2, unit: 'tbsp' }
    ],
    instructions: 'Blend chickpeas with tahini, lemon juice, garlic and olive oil until smooth.',
    prepTime: 10,
    servings: 6,
    isPublic: true,
    imageUrl: 'https://example.com/hummus.jpg',
    cuisineType: 'Middle Eastern',
    tags: ['vegetarian', 'vegan', 'quick'],
    createDate: '2025-02-15T09:00:00Z'
  },
  {
    id: 5,
    userId: 1,
    title: 'French Toast',
    ingredients: [
      { name: 'Bread', quantity: 4, unit: 'slices' },
      { name: 'Eggs', quantity: 2, unit: 'pcs' },
      { name: 'Milk', quantity: 50, unit: 'ml' }
    ],
    instructions: 'Whisk eggs with milk, dip bread slices, fry in butter until golden on both sides.',
    prepTime: 15,
    servings: 2,
    isPublic: false,
    imageUrl: 'https://example.com/frenchtoast.jpg',
    cuisineType: 'French',
    tags: ['breakfast', 'sweet'],
    createDate: '2025-02-20T07:00:00Z'
  }
];

let nextId = 6;

module.exports = { recipes, getNextId: () => nextId++ };
