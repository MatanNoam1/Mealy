import { useState } from 'react';
import { createRecipe, updateRecipe } from '../services/recipes.service';
import { scanRecipeImage } from '../services/ai.service';
import './Modal.css';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

// Ingredients are edited as plain text, one "name, quantity, unit" per line, so
// the form stays simple. These helpers convert to/from the API's array shape.
const ingredientsToText = (arr) =>
  (arr || []).map((i) => [i.name, i.quantity, i.unit].filter((v) => v !== undefined && v !== '').join(', ')).join('\n');

const textToIngredients = (text) =>
  text.split('\n').map((line) => line.trim()).filter(Boolean).map((line) => {
    const [name, quantity, unit] = line.split(',').map((s) => s.trim());
    return { name, quantity: quantity ? Number(quantity) || quantity : undefined, unit };
  });

const emptyForm = {
  title: '', mealTypes: ['dinner'], servings: 1, prepTime: '', cuisineType: '',
  instructions: '', tags: '', ingredientsText: '', imageUrl: ''
};

// Modal for creating or editing a recipe. When `recipe` is passed it edits;
// otherwise it creates. Supports an AI image scan that prefills the fields.
function RecipeFormModal({ recipe, onClose, onSaved }) {
  const editing = !!recipe;
  const [form, setForm] = useState(
    editing
      ? {
          title: recipe.title || '', mealTypes: Array.isArray(recipe.mealTypes) && recipe.mealTypes.length > 0 ? recipe.mealTypes : ['dinner'],
          servings: recipe.servings || 1, prepTime: recipe.prepTime ?? '',
          cuisineType: recipe.cuisineType || '', instructions: recipe.instructions || '',
          tags: (recipe.tags || []).join(', '), ingredientsText: ingredientsToText(recipe.ingredients),
          imageUrl: recipe.imageUrl || ''
        }
      : emptyForm
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [scanning, setScanning] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const toggleMealType = (type) => (e) =>
    setForm((f) => {
      const types = e.target.checked
        ? [...f.mealTypes, type]
        : f.mealTypes.filter((t) => t !== type);
      return { ...f, mealTypes: types.length > 0 ? types : [type] };
    });

  const handleScan = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanning(true);
    setError('');
    try {
      const parsed = await scanRecipeImage(file);
      setForm((f) => ({
        ...f,
        title: parsed.title || f.title,
        mealTypes: MEAL_TYPES.includes(parsed.mealType) ? [parsed.mealType] : f.mealTypes,
        servings: parsed.servings || f.servings,
        prepTime: parsed.prepTime ?? f.prepTime,
        cuisineType: parsed.cuisineType || f.cuisineType,
        instructions: parsed.instructions || f.instructions,
        tags: (parsed.tags || []).join(', ') || f.tags,
        ingredientsText: ingredientsToText(parsed.ingredients) || f.ingredientsText
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setScanning(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.instructions.trim()) {
      setError('Title and instructions are required.');
      return;
    }
    setSaving(true);
    setError('');
    const payload = {
      title: form.title.trim(),
      mealTypes: form.mealTypes,
      servings: Number(form.servings) || 1,
      prepTime: form.prepTime === '' ? null : Number(form.prepTime),
      cuisineType: form.cuisineType.trim(),
      instructions: form.instructions.trim(),
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      ingredients: textToIngredients(form.ingredientsText),
      imageUrl: form.imageUrl.trim()
    };
    try {
      if (editing) await updateRecipe(recipe.id, payload);
      else await createRecipe(payload);
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <h2 className="modal__title">{editing ? 'Edit recipe' : 'Add recipe'}</h2>
          <button type="button" className="modal__close" onClick={onClose}>×</button>
        </div>

        {error && <p className="modal__error">{error}</p>}

        {!editing && (
          <div className="modal__field">
            <label>Scan a recipe photo (AI)</label>
            <input type="file" accept="image/*" onChange={handleScan} disabled={scanning} />
            <p className="modal__hint">{scanning ? 'Reading image with AI…' : 'Optional: upload a photo and AI fills the fields.'}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="modal__field">
            <label>Title *</label>
            <input value={form.title} onChange={set('title')} placeholder="e.g. Shakshuka" />
          </div>

          <div className="modal__row">
            <div className="modal__field">
              <label>Meal type (pick one or more)</label>
              <div className="modal__checkboxes">
                {MEAL_TYPES.map((m) => (
                  <label key={m} className="modal__checkbox-label">
                    <input
                      type="checkbox"
                      checked={form.mealTypes.includes(m)}
                      onChange={toggleMealType(m)}
                    />
                    {m}
                  </label>
                ))}
              </div>
            </div>
            <div className="modal__field">
              <label>Servings</label>
              <input type="number" min="1" value={form.servings} onChange={set('servings')} />
            </div>
            <div className="modal__field">
              <label>Prep (min)</label>
              <input type="number" min="0" value={form.prepTime} onChange={set('prepTime')} />
            </div>
          </div>

          <div className="modal__field">
            <label>Cuisine</label>
            <input value={form.cuisineType} onChange={set('cuisineType')} placeholder="e.g. Italian" />
          </div>

          <div className="modal__field">
            <label>Ingredients (one per line: name, quantity, unit)</label>
            <textarea rows="4" value={form.ingredientsText} onChange={set('ingredientsText')} placeholder="Eggs, 4, pcs" />
          </div>

          <div className="modal__field">
            <label>Instructions *</label>
            <textarea rows="4" value={form.instructions} onChange={set('instructions')} />
          </div>

          <div className="modal__field">
            <label>Tags (comma separated)</label>
            <input value={form.tags} onChange={set('tags')} placeholder="vegetarian, quick" />
          </div>

          <div className="modal__field">
            <label>Image URL</label>
            <input value={form.imageUrl} onChange={set('imageUrl')} placeholder="https://…" />
          </div>

          <div className="modal__actions">
            <button type="button" className="modal__btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="modal__btn modal__btn--primary" disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Create recipe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RecipeFormModal;
