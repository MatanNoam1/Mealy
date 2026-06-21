import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMealPlans, deleteMealPlan, renameMealPlan } from '../services/mealplans.service';
import { generateMealPlan } from '../services/ai.service';
import { useToast } from '../context/ToastContext';
import './MealPlans.css';

const MEAL_TYPE_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack' };
const MAIN_SLOT_ORDER = ['breakfast', 'lunch', 'dinner'];

function SlotRecipe({ meal }) {
  if (!meal) return <span className="plan-day__empty">-</span>;
  if (!meal.recipeId) return <span>{meal.title}</span>;
  return (
    <Link to={`/recipes/${meal.recipeId}`} className="slot-recipe-link">{meal.title}</Link>
  );
}

function PlanDay({ entry }) {
  const slotsObj = entry.slots
    ? entry.slots
    : Object.fromEntries(
        (entry.meals || []).map((m) => [m.mealType, { recipeId: m.recipeId, title: `Recipe #${m.recipeId}`, servings: m.servings }])
      );

  const mainSlots = MAIN_SLOT_ORDER.filter((s) => s in slotsObj);
  const snack = slotsObj.snack;

  return (
    <div className="plan-day">
      <h4 className="plan-day__title">{entry.day}</h4>
      <ul className="plan-day__slots">
        {mainSlots.map((slot) => (
          <li key={slot} className="plan-day__slot">
            <span className="plan-day__slot-name">{MEAL_TYPE_LABELS[slot]}</span>
            <SlotRecipe meal={slotsObj[slot]} />
          </li>
        ))}
      </ul>
      {snack && (
        <p className="plan-day__snack-note">
          <span className="plan-day__slot-name">Snack</span>
          <SlotRecipe meal={snack} />
        </p>
      )}
    </div>
  );
}

function PlanTitle({ plan, onRename }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(plan.title || `Plan #${plan.id}`);
  const inputRef = useRef(null);

  const startEdit = () => {
    setEditing(true);
    setTimeout(() => inputRef.current && inputRef.current.select(), 0);
  };

  const commit = async () => {
    setEditing(false);
    const trimmed = value.trim();
    if (!trimmed || trimmed === (plan.title || `Plan #${plan.id}`)) return;
    try {
      await onRename(plan.id, trimmed);
    } catch {
      setValue(plan.title || `Plan #${plan.id}`);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') commit();
    if (e.key === 'Escape') { setEditing(false); setValue(plan.title || `Plan #${plan.id}`); }
  };

  return (
    <div className="plan-card__title-row">
      {editing ? (
        <input
          ref={inputRef}
          className="plan-card__rename-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={commit}
          onKeyDown={onKeyDown}
          autoFocus
        />
      ) : (
        <>
          <h3 style={{ margin: 0 }}>{value}</h3>
          <button type="button" className="plan-card__pencil" onClick={startEdit} title="Rename">
            &#9998;
          </button>
        </>
      )}
    </div>
  );
}

function MealPlans() {
  const { addToast } = useToast();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    days: 5,
    diversity: 2,
    name: '',
    mealTypes: { breakfast: true, lunch: true, dinner: true, snack: false },
  });
  const [generating, setGenerating] = useState(false);

  const load = () => {
    setLoading(true);
    getMealPlans()
      .then((d) => setPlans(Array.isArray(d) ? d : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const toggleMealType = (type) => (e) =>
    setForm((f) => ({ ...f, mealTypes: { ...f.mealTypes, [type]: e.target.checked } }));

  const handleGenerate = async (e) => {
    e.preventDefault();
    const selectedTypes = Object.entries(form.mealTypes)
      .filter(([, v]) => v)
      .map(([k]) => k);
    if (selectedTypes.length === 0) {
      addToast('Select at least one meal type.', 'error');
      return;
    }
    setGenerating(true);
    setError('');
    try {
      await generateMealPlan({
        days: Number(form.days),
        diversity: Number(form.diversity),
        mealTypes: selectedTypes,
        name: form.name.trim() || undefined,
      });
      addToast('AI meal plan generated', 'success');
      setForm((f) => ({ ...f, name: '' }));
      load();
    } catch (err) {
      setError(err.message);
      addToast(err.message, 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this meal plan?')) return;
    try {
      await deleteMealPlan(id);
      setPlans((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleRename = async (id, title) => {
    await renameMealPlan(id, title);
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, title } : p)));
    addToast('Plan renamed', 'success');
  };

  return (
    <div className="mealplans">
      <header className="mealplans__head">
        <h1>Meal Plans</h1>
        <p className="mealplans__subtitle">Generate an AI plan from your recipes, scaled to your servings per meal.</p>
      </header>

      <form className="mealplans__form" onSubmit={handleGenerate}>
        <div className="mealplans__field">
          <label>Plan name</label>
          <input
            type="text"
            className="mealplans__name-input"
            placeholder="Auto-named if empty"
            value={form.name}
            onChange={set('name')}
          />
        </div>
        <div className="mealplans__field">
          <label>Days (1-14)</label>
          <input type="number" min="1" max="14" value={form.days} onChange={set('days')} />
        </div>
        <div className="mealplans__field">
          <label>Recipe variety per slot</label>
          <input type="number" min="1" max="7" value={form.diversity} onChange={set('diversity')} />
        </div>
        <div className="mealplans__field">
          <label>Meal types</label>
          <div className="mealplans__meal-types">
            {Object.keys(MEAL_TYPE_LABELS).map((type) => (
              <label key={type} className="mealplans__meal-type-label">
                <input
                  type="checkbox"
                  checked={form.mealTypes[type]}
                  onChange={toggleMealType(type)}
                />
                {MEAL_TYPE_LABELS[type]}
              </label>
            ))}
          </div>
        </div>
        <button type="submit" className="mealplans__generate" disabled={generating}>
          {generating ? 'Generating...' : 'Generate with AI'}
        </button>
      </form>

      {error && <div className="dashboard__state dashboard__state--error">{error}</div>}
      {loading && <div className="dashboard__state"><span className="spinner" /> Loading...</div>}

      {!loading && plans.length === 0 && <div className="dashboard__state">No meal plans yet.</div>}

      {!loading && plans.map((plan) => {
        const pd = plan.planData || {};
        const planDays = Array.isArray(pd) ? pd : (pd.days || []);
        const shoppingList = !Array.isArray(pd) ? (pd.shoppingList || []) : [];
        return (
          <section key={plan.id} className="plan-card">
            <div className="plan-card__head">
              <div>
                <PlanTitle plan={plan} onRename={handleRename} />
                <span className="plan-card__meta">{planDays.length} days</span>
              </div>
            </div>
            <div className="plan-card__days">
              {planDays.map((entry, i) => (
                <PlanDay key={i} entry={entry} />
              ))}
            </div>
            {shoppingList.length > 0 && (
              <details className="plan-card__shopping">
                <summary className="plan-card__shopping-toggle">Meal prep shopping list ({shoppingList.length} items)</summary>
                <ul className="plan-card__shopping-list">
                  {shoppingList.map((ing, i) => (
                    <li key={i} className="plan-card__shopping-item">
                      <span className="plan-card__shopping-name">{ing.name}</span>
                      <span className="plan-card__shopping-qty">{ing.quantity} {ing.unit}</span>
                    </li>
                  ))}
                </ul>
              </details>
            )}
            <div className="plan-card__footer">
              <button type="button" className="plan-card__delete" onClick={() => handleDelete(plan.id)}>
                Delete
              </button>
            </div>
          </section>
        );
      })}
    </div>
  );
}

export default MealPlans;
