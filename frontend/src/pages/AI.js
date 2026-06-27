import { useState } from 'react';
import { getRecommendations } from '../services/ai.service';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './MealPlans.css';

// AI page: recipe recommendations. Asks the backend (which calls Gemini) for new
// recipe ideas based on the user's dietary preferences and existing recipes.
function AI() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [asked, setAsked] = useState(false);

  const handleAsk = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getRecommendations(user?.dietaryPreferences || []);
      setItems(Array.isArray(data?.recommendations) ? data.recommendations : []);
      setAsked(true);
    } catch (err) {
      setError(err.message);
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mealplans">
      <header className="mealplans__head">
        <h1>AI Recommendations</h1>
        <p className="mealplans__subtitle">
          New recipe ideas based on your dietary preferences{user?.dietaryPreferences?.length ? `: ${user.dietaryPreferences.join(', ')}` : ''}.
        </p>
      </header>

      <button type="button" className="mealplans__generate" onClick={handleAsk} disabled={loading}>
        {loading ? 'Thinking…' : 'Suggest recipes'}
      </button>

      {error && <div className="dashboard__state dashboard__state--error" style={{ marginTop: '1rem' }}>{error}</div>}

      {!loading && asked && items.length === 0 && !error && (
        <div className="dashboard__state" style={{ marginTop: '1rem' }}>No suggestions returned.</div>
      )}

      <div className="dashboard__grid" style={{ marginTop: '1.25rem' }}>
        {items.map((rec, i) => (
          <article key={i} className="plan-card">
            <div className="plan-card__head"><h3>{rec.title}</h3></div>
            <p style={{ margin: '0.25rem 0', color: 'var(--muted, #6b7280)' }}>
              {[rec.cuisineType, rec.mealType || (rec.mealTypes || []).join('/')].filter(Boolean).join(' · ')}
            </p>
            <p style={{ margin: 0 }}>{rec.reason}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

export default AI;
