// Maps Sequelize model instances to the JSON shapes the frontend expects.
// Notably exposes the user primary key as `userId` (the frontend stores and
// sends x-user-id based on this field).

const userPublic = (u) => ({
  userId: u.id,
  firstName: u.firstName,
  lastName: u.lastName,
  email: u.email,
  dietaryPreferences: u.dietaryPreferences || [],
  theme: u.theme || 'light',
  userRole: u.userRole
});

// Recipe view. When `owner` is included, expose the owner's name so the
// "Shared with me" section can show who shared it.
const recipePublic = (r) => ({
  id: r.id,
  ownerId: r.ownerId,
  ownerName: r.owner ? `${r.owner.firstName} ${r.owner.lastName}` : undefined,
  title: r.title,
  ingredients: r.ingredients || [],
  instructions: r.instructions,
  prepTime: r.prepTime,
  servings: r.servings,
  mealTypes: r.mealTypes || ['dinner'],
  isPublic: r.isPublic,
  imageUrl: r.imageUrl,
  cuisineType: r.cuisineType,
  tags: r.tags || [],
  createdAt: r.createdAt
});

module.exports = { userPublic, recipePublic };
