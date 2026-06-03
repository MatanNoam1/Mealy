import { useEffect, useState } from 'react';
import { getRecipes } from '../services/recipes.service';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import DataTable from '../components/DataTable';
import './Dashboard.css';

// Dashboard / Home (spec component #5): fetches recipes from the backend and
// renders them as reusable Cards plus a DataTable. Handles loading, error and
// empty states.
function Dashboard() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    getRecipes()
      .then((data) => {
        if (active) setRecipes(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Columns for the recipes DataTable; render() builds dynamic cell content.
  const columns = [
    { label: 'Title', field: 'title' },
    { label: 'Cuisine', field: 'cuisineType' },
    { label: 'Prep (min)', field: 'prepTime' },
    { label: 'Servings', field: 'servings' },
    {
      label: 'Tags',
      render: (row) => (row.tags && row.tags.length ? row.tags.join(', ') : '-')
    }
  ];

  return (
    <div className="dashboard">
      <header className="dashboard__head">
        <h1 className="dashboard__title">
          {user ? `Welcome back, ${user.firstName}` : 'Recipes'}
        </h1>
        <p className="dashboard__subtitle">
          Browse the recipes available in your Mealy kitchen.
        </p>
      </header>

      {loading && (
        <div className="dashboard__state">
          <span className="spinner" /> Loading recipes…
        </div>
      )}

      {!loading && error && (
        <div className="dashboard__state dashboard__state--error">{error}</div>
      )}

      {!loading && !error && recipes.length === 0 && (
        <div className="dashboard__state">
          No recipes yet. Add one to get started.
        </div>
      )}

      {!loading && !error && recipes.length > 0 && (
        <>
          <section>
            <h2 className="dashboard__section-title">
              Recipes ({recipes.length})
            </h2>
            <div className="dashboard__grid">
              {recipes.map((recipe) => (
                <Card key={recipe.id} recipe={recipe} />
              ))}
            </div>
          </section>

          <section className="dashboard__table-section">
            <h2 className="dashboard__section-title">All recipes</h2>
            <DataTable
              columns={columns}
              rows={recipes}
              rowKey="id"
              emptyMessage="No recipes to display."
            />
          </section>
        </>
      )}
    </div>
  );
}

export default Dashboard;
