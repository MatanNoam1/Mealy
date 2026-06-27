import './Footer.css';

// Footer shown on all main pages (spec component #3):
// project/team name, year, and a short slogan.
function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="footer__inner">
        <span className="footer__brand">Mealy - Matan &amp; Or</span>
        <span className="footer__slogan">
          Plan your meals, skip the stress.
        </span>
        <span className="footer__year">&copy; {year}</span>
      </div>
    </footer>
  );
}

export default Footer;
