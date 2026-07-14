export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-contact-section">
          <h4>Contacts</h4>
          <div className="footer-contact-row">
            <div className="footer-contact-section">
              <div className="footer-contact-heading">
                <span className="footer-link-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                    <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 2v.511l-8 4.889-8-4.89V6h16Zm-16 12V8.434l7.293 4.462c.18.11.383.166.607.166s.427-.056.607-.166L20 8.434V18H4Z" />
                  </svg>
                </span>
                Email Us
              </div>
              <div className="footer-contact-values">
                <a href="mailto:info@mollashinvestments.africa">info@mollashinvestments.africa</a>
                <a href="mailto:aj@mollashinvestments.africa">aj@mollashinvestments.africa</a>
                <a href="mailto:edwin@mollashinvestments.africa">edwin@mollashinvestments.africa</a>
              </div>
            </div>
            <div className="footer-contact-section">
              <div className="footer-contact-heading">
                <span className="footer-link-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                    <path d="M6.62 10.79a15.053 15.053 0 0 0 6.58 6.58l2.2-2.2a1 1 0 0 1 1.11-.21c1.21.49 2.53.76 3.88.76a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C9.16 21 3 14.84 3 6a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.35.26 2.67.76 3.88a1 1 0 0 1-.21 1.11l-2.43 2.43Z" />
                  </svg>
                </span>
                Call Us
              </div>
              <div className="footer-contact-values">
                <a href="tel:+263710872487">+263 710 872 487</a>
                <a href="tel:+263778123303">+263 778 123 303</a>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-social">
          <h4>Follow Us</h4>
          <div className="footer-social-links">
            <a href="https://www.facebook.com/people/Mollash-Car-Rental/61571365200284/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            <a href="https://www.instagram.com/mollash_carrental/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
