import { useState } from 'react';
import { shareRecipe } from '../services/recipes.service';
import './Modal.css';

// Modal to share a recipe with another user by email. On success the backend
// pushes a live socket notification to that user.
function ShareModal({ recipe, onClose, onShared }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sharing, setSharing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Enter the email of the user to share with.');
      return;
    }
    setSharing(true);
    setError('');
    try {
      await shareRecipe(recipe.id, email.trim());
      onShared(email.trim());
    } catch (err) {
      setError(err.message);
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <div className="modal__head">
          <h2 className="modal__title">Share "{recipe.title}"</h2>
          <button type="button" className="modal__close" onClick={onClose}>×</button>
        </div>

        {error && <p className="modal__error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="modal__field">
            <label>Share with (user email)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="dana@mealy.com"
            />
            <p className="modal__hint">They will see this recipe appear live in their "Shared with me" section.</p>
          </div>

          <div className="modal__actions">
            <button type="button" className="modal__btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="modal__btn modal__btn--primary" disabled={sharing}>
              {sharing ? 'Sharing…' : 'Share'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ShareModal;
