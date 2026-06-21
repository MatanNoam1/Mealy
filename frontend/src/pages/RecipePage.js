import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRecipe, deleteRecipe } from '../services/recipes.service';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import RecipeFormModal from '../components/RecipeFormModal';
import ShareModal from '../components/ShareModal';
import './RecipePage.css';

function scale(val, factor) {
  if (val == null) return val;
  const n = Number(val);
  if (Number.isNaN(n)) return val;
  const result = n * factor;
  return Number.isInteger(result) ? result : parseFloat(result.toFixed(2));
}

function RecipePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [servings, setServings] = useState(1);
  const [editOpen, setEditOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    getRecipe(id)
      .then((r) => {
        setRecipe(r);
        setServings(r.servings || 1);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const isOwn = recipe && user && recipe.ownerId === user.userId;
  const base = recipe ? (recipe.servings || 1) : 1;
  const factor = servings / base;
  const ingredients = recipe && Array.isArray(recipe.ingredients) ? recipe.ingredients : [];

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${recipe.title}"?`)) return;
    try {
      await deleteRecipe(recipe.id);
      addToast('Recipe deleted', 'info');
      navigate('/');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleSaved = () => {
    setEditOpen(false);
    getRecipe(id).then(setRecipe).catch(() => {});
    addToast('Recipe saved', 'success');
  };

  const steps = recipe
    ? recipe.instructions
        .split(/\n/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  if (loading) {
    return (
      <div className="rp-shell">
        <div className="dashboard__state"><span className="spinner" /> Loading...</div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="rp-shell">
        <div className="dashboard__state dashboard__state--error">{error || 'Recipe not found.'}</div>
      </div>
    );
  }

  return (
    <div className="rp">
      <div className="rp__nav">
        <button type="button" className="rp__back" onClick={() => navigate(-1)}>
          &larr; Back
        </button>
        {isOwn && (
          <div className="rp__actions">
            <button type="button" className="rp__action-btn" onClick={() => setEditOpen(true)}>Edit</button>
            <button type="button" className="rp__action-btn" onClick={() => setShareOpen(true)}>Share</button>
            <button type="button" className="rp__action-btn rp__action-btn--delete" onClick={handleDelete}>Delete</button>
          </div>
        )}
      </div>

      <div className="rp__hero">
        {recipe.imageUrl ? (
          <img
            className="rp__hero-img"
            src={recipe.imageUrl}
            alt={recipe.title}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ) : (
          <div className="rp__hero-fallback">
            <span aria-hidden="true">🍲</span>
          </div>
        )}
        <div className="rp__hero-overlay">
          <h1 className="rp__title">{recipe.title}</h1>
        </div>
      </div>

      <div className="rp__meta-strip">
        {recipe.prepTime != null && (
          <div className="rp__meta-item">
            <span className="rp__meta-icon">⏱</span>
            <span className="rp__meta-label">Prep time</span>
            <span className="rp__meta-value">{recipe.prepTime} min</span>
          </div>
        )}
        <div className="rp__meta-item">
          <span className="rp__meta-icon">🍽</span>
          <span className="rp__meta-label">Base servings</span>
          <span className="rp__meta-value">{base}</span>
        </div>
        {recipe.cuisineType && (
          <div className="rp__meta-item">
            <span className="rp__meta-icon">🌍</span>
            <span className="rp__meta-label">Cuisine</span>
            <span className="rp__meta-value">{recipe.cuisineType}</span>
          </div>
        )}
        {recipe.mealTypes && recipe.mealTypes.length > 0 && (
          <div className="rp__meta-item">
            <span className="rp__meta-icon">🕐</span>
            <span className="rp__meta-label">Meal type</span>
            <span className="rp__meta-value rp__meta-value--cap">{recipe.mealTypes.join(' / ')}</span>
          </div>
        )}
      </div>

      {Array.isArray(recipe.tags) && recipe.tags.length > 0 && (
        <div className="rp__tags">
          {recipe.tags.map((t) => (
            <span key={t} className="rp__tag">{t}</span>
          ))}
        </div>
      )}

      <div className="rp__body">
        <div className="rp__col rp__col--ing">
          <div className="rp__section-head">
            <h2 className="rp__section-title">Ingredients</h2>
            <div className="rp__servings-ctrl">
              <button type="button" className="rp__srv-btn" onClick={() => setServings((s) => Math.max(1, s - 1))}>-</button>
              <span className="rp__srv-count">{servings} srv</span>
              <button type="button" className="rp__srv-btn" onClick={() => setServings((s) => s + 1)}>+</button>
            </div>
          </div>
          {ingredients.length > 0 ? (
            <ul className="rp__ingredients">
              {ingredients.map((ing, i) => (
                <li key={i} className="rp__ingredient">
                  <span className="rp__ing-dot" />
                  <span className="rp__ing-name">{ing.name}</span>
                  {ing.quantity != null && (
                    <span className="rp__ing-qty">
                      {scale(ing.quantity, factor)}{ing.unit ? ` ${ing.unit}` : ''}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="rp__empty">No ingredients listed.</p>
          )}
        </div>

        <div className="rp__col rp__col--steps">
          <h2 className="rp__section-title">Instructions</h2>
          {steps.length > 0 ? (
            <ol className="rp__steps">
              {steps.map((step, i) => (
                <li key={i} className="rp__step">{step}</li>
              ))}
            </ol>
          ) : (
            <p className="rp__empty">No instructions provided.</p>
          )}
        </div>
      </div>

      {editOpen && (
        <RecipeFormModal
          recipe={recipe}
          onClose={() => setEditOpen(false)}
          onSaved={handleSaved}
        />
      )}

      {shareOpen && (
        <ShareModal
          recipe={recipe}
          onClose={() => setShareOpen(false)}
          onShared={(email) => { setShareOpen(false); addToast(`Shared with ${email}`, 'success'); }}
        />
      )}
    </div>
  );
}

export default RecipePage;
