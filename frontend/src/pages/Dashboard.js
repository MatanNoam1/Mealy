import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyRecipes, getSharedRecipes, removeSharedRecipe } from '../services/recipes.service';
import { useAuth } from '../context/AuthContext';
import { useSocketEvent, useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import Card from '../components/Card';
import DataTable from '../components/DataTable';
import RecipeFormModal from '../components/RecipeFormModal';
import ShareModal from '../components/ShareModal';
import './Dashboard.css';

const TABLE_COLUMNS = [
  { label: 'Title', field: 'title' },
  { label: 'Cuisine', field: 'cuisineType' },
  { label: 'Meal Type', render: (r) => (r.mealTypes || []).join(' / ') },
  { label: 'Prep Time', render: (r) => (r.prepTime != null ? `${r.prepTime} min` : '-') },
  { label: 'Servings', field: 'servings' },
  { label: 'Owner', render: (r) => r._owner || r.ownerName || 'You' },
];

function Dashboard() {
  const { user } = useAuth();
  const { connected } = useSocket();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [mine, setMine] = useState([]);
  const [shared, setShared] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [sharingRecipe, setSharingRecipe] = useState(null);

  const loadMine = useCallback(() => getMyRecipes().then((d) => setMine(Array.isArray(d) ? d : [])), []);
  const loadShared = useCallback(() => getSharedRecipes().then((d) => setShared(Array.isArray(d) ? d : [])), []);

  useEffect(() => {
    setLoading(true);
    setError('');
    Promise.all([loadMine(), loadShared()])
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [loadMine, loadShared]);

  useSocketEvent('recipe:shared', useCallback((recipe) => {
    setShared((prev) => (prev.some((r) => r.id === recipe.id) ? prev : [recipe, ...prev]));
    addToast(`${recipe.ownerName || 'Someone'} shared "${recipe.title}" with you`, 'success');
  }, [addToast]));

  useSocketEvent('recipe:unshared', useCallback(({ recipeId }) => {
    setShared((prev) => prev.filter((r) => r.id !== recipeId));
    addToast('A shared recipe was removed', 'warning');
  }, [addToast]));

  useSocketEvent('recipe:updated', useCallback((recipe) => {
    setShared((prev) => prev.map((r) => (r.id === recipe.id ? recipe : r)));
    addToast(`A shared recipe was updated: "${recipe.title}"`, 'info');
  }, [addToast]));

  const handleSaved = () => {
    setFormOpen(false);
    setEditing(null);
    loadMine();
    addToast('Recipe saved', 'success');
  };

  const handleRemoveShared = async (recipe) => {
    try {
      await removeSharedRecipe(recipe.id);
      setShared((prev) => prev.filter((r) => r.id !== recipe.id));
      addToast(`Removed "${recipe.title}" from shared recipes`, 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const q = searchQuery.toLowerCase();
  const filteredMine = q
    ? mine.filter((r) =>
        r.title.toLowerCase().includes(q) ||
        (Array.isArray(r.tags) && r.tags.join(' ').toLowerCase().includes(q))
      )
    : mine;
  const filteredShared = q
    ? shared.filter((r) =>
        r.title.toLowerCase().includes(q) ||
        (Array.isArray(r.tags) && r.tags.join(' ').toLowerCase().includes(q))
      )
    : shared;

  const allRows = [
    ...filteredMine.map((r) => ({ ...r, _owner: 'You' })),
    ...filteredShared,
  ];

  return (
    <div className="dashboard">
      <header className="dashboard__head">
        <div>
          <h1 className="dashboard__title">{user ? `Welcome back, ${user.firstName}` : 'Recipes'}</h1>
          <p className="dashboard__subtitle">
            Your kitchen, your recipes. <span className={`live-dot ${connected ? 'live-dot--on' : ''}`} />
            {connected ? 'Live updates on' : 'Connecting...'}
          </p>
        </div>
        <button type="button" className="dashboard__add" onClick={() => { setEditing(null); setFormOpen(true); }}>
          + Add recipe
        </button>
      </header>

      <div className="dashboard__search">
        <input
          type="search"
          className="dashboard__search-input"
          placeholder="Search recipes by name or tag..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading && <div className="dashboard__state"><span className="spinner" /> Loading...</div>}
      {!loading && error && <div className="dashboard__state dashboard__state--error">{error}</div>}

      {!loading && !error && (
        <>
          <section>
            <h2 className="dashboard__section-title">My recipes ({filteredMine.length})</h2>
            {filteredMine.length === 0 ? (
              <div className="dashboard__state">
                {q ? 'No recipes match your search.' : 'No recipes yet. Click "Add recipe" to create one.'}
              </div>
            ) : (
              <div className="dashboard__grid">
                {filteredMine.map((recipe) => (
                  <Card
                    key={recipe.id}
                    recipe={recipe}
                    onClick={(r) => navigate(`/recipes/${r.id}`)}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="dashboard__table-section">
            <h2 className="dashboard__section-title">Shared with me ({filteredShared.length})</h2>
            {filteredShared.length === 0 ? (
              <div className="dashboard__state">
                {q ? 'No shared recipes match your search.' : 'Nothing shared with you yet.'}
              </div>
            ) : (
              <div className="dashboard__grid">
                {filteredShared.map((recipe) => (
                  <Card
                    key={recipe.id}
                    recipe={recipe}
                    badge={`Shared by ${recipe.ownerName || 'a user'}`}
                    onClick={(r) => navigate(`/recipes/${r.id}`)}
                    onRemove={handleRemoveShared}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="dashboard__table-section">
            <h2 className="dashboard__section-title">All recipes</h2>
            <DataTable
              columns={TABLE_COLUMNS}
              rows={allRows}
              emptyMessage="No recipes found."
            />
          </section>
        </>
      )}

      {formOpen && (
        <RecipeFormModal
          recipe={editing}
          onClose={() => { setFormOpen(false); setEditing(null); }}
          onSaved={handleSaved}
        />
      )}

      {sharingRecipe && (
        <ShareModal
          recipe={sharingRecipe}
          onClose={() => setSharingRecipe(null)}
          onShared={(email) => { setSharingRecipe(null); addToast(`Shared with ${email}`, 'success'); }}
        />
      )}
    </div>
  );
}

export default Dashboard;
