import './Card.css';

// Presentational card for a single recipe. Click opens the detail modal.
// `badge` shows context such as "Shared by Dana".
function Card({ recipe, onClick, badge, onRemove }) {
  if (!recipe) return null;

  const { title, cuisineType, prepTime, servings, mealTypes = [], tags = [], imageUrl } = recipe;

  return (
    <article className="card card--clickable" onClick={() => onClick && onClick(recipe)}>
      <div className="card__media">
        {imageUrl ? (
          <img
            className="card__img"
            src={imageUrl}
            alt={title}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement.classList.add('card__media--fallback');
            }}
          />
        ) : (
          <span className="card__emoji" aria-hidden="true">🍲</span>
        )}
        <span className="card__emoji card__emoji--bg" aria-hidden="true">🍲</span>
        {mealTypes.length > 0 && <span className="card__mealtype">{mealTypes.join(' / ')}</span>}
      </div>

      <div className="card__body">
        {badge && <p className="card__badge">{badge}</p>}
        <h3 className="card__title">{title}</h3>
        {cuisineType && <p className="card__cuisine">{cuisineType}</p>}

        <div className="card__meta">
          <span>⏱ {prepTime != null ? `${prepTime} min` : '-'}</span>
          <span>🍽 {servings} servings</span>
        </div>

        {tags.length > 0 && (
          <div className="card__tags">
            {tags.map((tag) => (
              <span key={tag} className="card__tag">{tag}</span>
            ))}
          </div>
        )}

        <p className="card__tap-hint">Tap to view details</p>

        {onRemove && (
          <button
            type="button"
            className="card__btn card__btn--danger card__btn--remove"
            onClick={(e) => { e.stopPropagation(); onRemove(recipe); }}
          >
            Remove
          </button>
        )}
      </div>
    </article>
  );
}

export default Card;
