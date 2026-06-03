import './Card.css';

// Reusable presentational card (spec component #6). Receives one recipe via
// props and is rendered once per recipe on the dashboard (>= 3 instances).
function Card({ recipe }) {
  if (!recipe) return null;

  const { title, cuisineType, prepTime, servings, tags = [], imageUrl } = recipe;
e
  return (
    <article className="card">
      <div className="card__media">
        {imageUrl ? (
          <img
            className="card__img"
            src={imageUrl}
            alt={title}
            onError={(e) => {
              // Seed images use placeholder URLs; fall back to an emoji tile.
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement.classList.add('card__media--fallback');
            }}
          />
        ) : (
          <span className="card__emoji" aria-hidden="true">
            🍲
          </span>
        )}
        <span className="card__emoji card__emoji--bg" aria-hidden="true">
          🍲
        </span>
      </div>

      <div className="card__body">
        <h3 className="card__title">{title}</h3>
        {cuisineType && <p className="card__cuisine">{cuisineType}</p>}

        <div className="card__meta">
          <span>⏱ {prepTime} min</span>
          <span>🍽 {servings} servings</span>
        </div>

        {tags.length > 0 && (
          <div className="card__tags">
            {tags.map((tag) => (
              <span key={tag} className="card__tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

export default Card;
