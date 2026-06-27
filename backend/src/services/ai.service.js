// Gemini AI integration. The API key lives only here (backend) via env vars and
// is never exposed to the frontend. Provides three domain features:
//   1. meal-plan generation  2. recipe recommendations  3. recipe image scan.
const { GoogleGenerativeAI } = require('@google/generative-ai');

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

function getModel() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    const err = new Error('GEMINI_API_KEY is not configured on the server.');
    err.code = 'AI_NOT_CONFIGURED';
    throw err;
  }
  return new GoogleGenerativeAI(key).getGenerativeModel({ model: MODEL });
}

// Gemini often wraps JSON in ```json fences; strip them and parse.
function parseJson(text) {
  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned);
}

// Build a `days`-long plan from the user's recipes, grouped by mealType,
// honoring diversity (distinct options per slot) and scaling ingredient
// quantities to targetServings.
async function generateMealPlan({ days, diversity, allowedTypes, dietaryPreferences, recipes }) {
  const model = getModel();
  const slots = allowedTypes && allowedTypes.length > 0 ? allowedTypes : ['breakfast', 'lunch', 'dinner'];
  const filledSlotExample = { recipeId: 1, title: 'Example Recipe' };
  const nullSlotExample = slots.reduce((acc, s, i) => { acc[s] = i === 0 ? filledSlotExample : null; return acc; }, {});
  const prompt = `You are a meal planning assistant. Build a ${days}-day meal plan.

Available recipes (only use these):
${JSON.stringify(recipes)}

Rules:
- Each day has ONLY these meal slots: ${slots.join(', ')}. Do NOT include any other slots.
- Fill a slot only with a recipe whose "mealTypes" array includes that slot type. If no recipe qualifies, set it to null.
- Diversity = ${diversity}: rotate ${diversity} distinct recipe option(s) per slot across the days (1 = same recipe repeats, 2 = alternate two, etc.). Never exceed the number of available recipes for that mealType.
- Respect these dietary preferences where possible: ${JSON.stringify(dietaryPreferences || [])}.

Return ONLY valid JSON, no prose, in this exact shape. Each filled slot must be an object with "recipeId" (the recipe's numeric id) and "title" (exact recipe title). Null means no recipe available for that slot:
{"days":[{"day":"Day 1","slots":${JSON.stringify(nullSlotExample)}}]}`;

  const result = await model.generateContent(prompt);
  return parseJson(result.response.text());
}

// Recommend new recipe ideas based on preferences and what the user already has.
async function recommendRecipes({ dietaryPreferences, recipeTitles }) {
  const model = getModel();
  const prompt = `You are a recipe recommendation assistant.
The user's dietary preferences: ${JSON.stringify(dietaryPreferences || [])}.
Recipes they already have: ${JSON.stringify(recipeTitles || [])}.

Suggest 5 NEW recipes they don't already have that fit their preferences.
Return ONLY valid JSON, no prose, in this shape:
{"recommendations":[{"title":"...","cuisineType":"...","mealType":"breakfast|lunch|dinner|snack","reason":"one short sentence"}]}`;

  const result = await model.generateContent(prompt);
  return parseJson(result.response.text());
}

// Extract a structured recipe from a photo (vision / OCR).
async function scanRecipeImage(base64, mimeType) {
  const model = getModel();
  const prompt = `Look at this image of a recipe (a photo of a dish, a handwritten card, or a printed recipe).
Extract a single structured recipe. Guess reasonable values where the image is unclear.
Return ONLY valid JSON, no prose, in this shape:
{"title":"...","mealType":"breakfast|lunch|dinner|snack","cuisineType":"...","prepTime":0,"servings":1,"ingredients":[{"name":"...","quantity":0,"unit":"..."}],"instructions":"...","tags":["..."]}`;

  const result = await model.generateContent([
    prompt,
    { inlineData: { data: base64, mimeType: mimeType || 'image/jpeg' } }
  ]);
  return parseJson(result.response.text());
}

module.exports = { generateMealPlan, recommendRecipes, scanRecipeImage };
