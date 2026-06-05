// In-memory seed meal plans, each linking days to recipes. Resets on restart;
// getNextId assigns ids for generated plans.
const mealplans = [
  {
    id: 1,
    userId: 2,
    planStartDate: '2025-04-21',
    planEndDate: '2025-04-27',
    planData: [
      { day: 'Monday',    meals: [{ recipeId: 1, mealType: 'dinner',    servings: 2 }] },
      { day: 'Tuesday',   meals: [{ recipeId: 1, mealType: 'dinner',    servings: 2 }] },
      { day: 'Wednesday', meals: [{ recipeId: 2, mealType: 'dinner',    servings: 4 }] },
      { day: 'Thursday',  meals: [{ recipeId: 2, mealType: 'dinner',    servings: 4 }] },
      { day: 'Friday',    meals: [{ recipeId: 5, mealType: 'breakfast', servings: 2 }, { recipeId: 3, mealType: 'dinner', servings: 3 }] }
    ],
    createdAt: '2025-04-20T09:00:00Z'
  },
  {
    id: 2,
    userId: 3,
    planStartDate: '2025-04-28',
    planEndDate: '2025-05-04',
    planData: [
      { day: 'Monday',    meals: [{ recipeId: 4, mealType: 'lunch',  servings: 6 }] },
      { day: 'Tuesday',   meals: [{ recipeId: 4, mealType: 'lunch',  servings: 6 }] },
      { day: 'Wednesday', meals: [{ recipeId: 1, mealType: 'dinner', servings: 2 }] },
      { day: 'Friday',    meals: [{ recipeId: 2, mealType: 'dinner', servings: 4 }] }
    ],
    createdAt: '2025-04-27T08:00:00Z'
  }
];

let nextId = 3;

module.exports = { mealplans, getNextId: () => nextId++ };
