import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './hooks/useAuth.jsx';
import AuthModal from './components/AuthModal.jsx';

const API_BASE = import.meta.env.VITE_CATALOG_API_URL || '';

function useReveal(threshold = 0.2) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el); } },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, visible];
}

function BlobShape({ className, color, delay, duration, size }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      aria-hidden="true"
      style={{ animationDelay: `${delay}s`, animationDuration: `${duration}s` }}
    >
      <defs>
        <linearGradient id={`blob-grad-${color.replace('#', '')}`}>
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#blob-grad-${color.replace('#', '')})`}
        d="M45.3,-62.3C59.3,-55.8,71.6,-43.8,77.5,-28.9C83.4,-14,82.9,3.7,75.9,18.6C68.9,33.5,55.5,45.5,40.9,55.1C26.3,64.7,10.5,71.8,-4.7,72.9C-19.8,74,-34.4,69.1,-48.2,59.2C-61.9,49.3,-74.8,34.4,-78.9,17.2C-83,-0.1,-78.4,-19.7,-67.6,-34.6C-56.8,-49.5,-39.8,-59.7,-23.7,-65.3C-7.5,-70.9,7.9,-71.9,22.4,-68.5C36.9,-65.1,31.3,-68.8,45.3,-62.3Z"
        transform={`scale(${size})`}
      />
    </svg>
  );
}

function Navbar({ cartCount, scrolled, onOpenAuth }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const initials = user ? user.name.split(' ').map((s) => s[0]).join('').slice(0, 2).toUpperCase() : '';

  return (
    <header className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <nav className="navbar__inner" aria-label="Main navigation">
        <a href="/" className="navbar__logo">
          <span className="navbar__mark">H</span>
          <span className="navbar__word">Haven</span>
        </a>

        <button
          className={`navbar__toggle${menuOpen ? ' navbar__toggle--open' : ''}`}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <span /><span />
        </button>

        <ul className={`navbar__links${menuOpen ? ' navbar__links--open' : ''}`}>
          <li><a href="#products" onClick={() => setMenuOpen(false)}>Collection</a></li>
          <li><a href="#categories" onClick={() => setMenuOpen(false)}>Categories</a></li>
          <li><a href="#about" onClick={() => setMenuOpen(false)}>About</a></li>
        </ul>

        <div className="navbar__actions">
          {user ? (
            <div className="navbar__user">
              <button
                className="navbar__avatar"
                onClick={() => setUserMenuOpen((v) => !v)}
                aria-label={`Account menu for ${user.name}`}
                aria-expanded={userMenuOpen}
              >
                {initials}
              </button>
              {userMenuOpen && (
                <>
                  <div className="navbar__user-backdrop" onClick={() => setUserMenuOpen(false)} />
                  <div className="navbar__user-menu">
                    <span className="navbar__user-name">{user.name}</span>
                    <span className="navbar__user-email">{user.email}</span>
                    <hr className="navbar__user-divider" />
                    <button className="navbar__user-item" onClick={() => { logout(); setUserMenuOpen(false); }}>
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button className="navbar__auth-btn" onClick={onOpenAuth}>Sign in</button>
          )}

          <button className="navbar__cart" aria-label={`Cart with ${cartCount} items`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {cartCount > 0 && <span className="navbar__badge">{cartCount}</span>}
          </button>
        </div>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero" aria-label="Hero">
      <BlobShape className="hero__blob hero__blob--1" color="#2C3E35" delay={0} duration={30} size={1.2} />
      <BlobShape className="hero__blob hero__blob--2" color="#C1705C" delay={5} duration={25} size={0.8} />
      <BlobShape className="hero__blob hero__blob--3" color="#2C3E35" delay={10} duration={35} size={1} />

      <div className="hero__content">
        <span className="hero__eyebrow">New collection</span>
        <h1 className="hero__title">
          Find your<br />
          <span className="hero__title-accent">sanctuary</span>
        </h1>
        <p className="hero__text">
          Thoughtfully chosen pieces for the home,<br />
          made to last and made to love.
        </p>
        <div className="hero__actions">
          <a href="#products" className="btn btn--primary">Explore the collection</a>
          <a href="#about" className="btn btn--ghost">Our story</a>
        </div>
      </div>

      <aside className="hero__visual" aria-hidden="true">
        <div className="hero__image-stack">
          <div className="hero__frame hero__frame--back" />
          <div className="hero__frame hero__frame--front">
            <img
              src="https://images.unsplash.com/photo-1544457070-4cd773b4d71e?w=600&h=800&fit=crop&auto=format"
              alt=""
              loading="eager"
            />
          </div>
        </div>
      </aside>
    </section>
  );
}

function ProductCard({ product, onAddToCart, index }) {
  const [ref, visible] = useReveal(0.1);
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <article
      ref={ref}
      className={`product-card${visible ? ' product-card--visible' : ''}`}
      style={{ transitionDelay: `${index * 80}ms` }}
      role="group"
      aria-label={product.name}
    >
      <div className="product-card__image-wrap">
        <div className={`product-card__shimmer${imgLoaded ? ' product-card__shimmer--hide' : ''}`} />
        <img
          src={product.image}
          alt={product.name}
          className={`product-card__image${imgLoaded ? ' product-card__image--loaded' : ''}`}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
        />
      </div>
      <div className="product-card__body">
        <span className="product-card__category">{product.category}</span>
        <h3 className="product-card__name">{product.name}</h3>
        <div className="product-card__footer">
          <span className="product-card__price">${product.price}</span>
          <button
            className="product-card__btn"
            onClick={() => onAddToCart(product)}
            aria-label={`Add ${product.name} to cart — $${product.price}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}

function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [ref, visible] = useReveal();

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    setTimeout(() => { setStatus('success'); setEmail(''); }, 1200);
  }, [email]);

  return (
    <section ref={ref} className={`newsletter${visible ? ' newsletter--visible' : ''}`} aria-label="Newsletter">
      <div className="newsletter__card">
        <h2 className="newsletter__title">Stay in touch</h2>
        <p className="newsletter__text">New arrivals, stories from the workshop, and members-only offers.</p>
        {status === 'success' ? (
          <p className="newsletter__confirm">You&rsquo;re on the list. Welcome to Haven.</p>
        ) : (
          <form className="newsletter__form" onSubmit={handleSubmit}>
            <label htmlFor="nl-email" className="sr-only">Email address</label>
            <input
              id="nl-email"
              type="email"
              required
              placeholder="your@email.com"
              className="newsletter__input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'loading'}
            />
            <button
              type="submit"
              className="btn btn--primary newsletter__btn"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Sending…' : 'Subscribe'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

function RevealSection({ id, label, title, subtitle, children, alt }) {
  const [ref, visible] = useReveal(0.05);

  return (
    <section
      id={id}
      ref={ref}
      className={`section${alt ? ' section--alt' : ''}${visible ? ' section--visible' : ''}`}
      aria-labelledby={label ? `${id}-label` : undefined}
    >
      {(title || subtitle) && (
        <header className="section__header">
          {label && <span className="section__label">{label}</span>}
          {title && <h2 id={label ? `${id}-label` : undefined} className="section__title">{title}</h2>}
          {subtitle && <p className="section__subtitle">{subtitle}</p>}
        </header>
      )}
      {children}
    </section>
  );
}

export default function LandingPage() {
  const [cart, setCart] = useState([]);
  const [scrolled, setScrolled] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    if (!API_BASE) { setLoading(false); return; }
    fetch(`${API_BASE}/products`)
      .then((res) => { if (!res.ok) throw new Error('Failed to load products'); return res.json(); })
      .then(setProducts)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = useCallback((product) => {
    setCart((prev) => [...prev, product]);
  }, []);

  const productItems = loading ? [] : error ? [] : products;

  return (
    <div className="page">
      <Navbar cartCount={cart.length} scrolled={scrolled} onOpenAuth={() => setAuthOpen(true)} />
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />

      <main>
        <Hero />

        <RevealSection
          id="products"
          label="Collection"
          title="Current offerings"
          subtitle="Each piece selected for its craft and character."
        >
          <div className="product-grid">
            {loading && <p className="section__subtitle">Loading products…</p>}
            {error && <p className="section__subtitle">Could not load products. Please try again later.</p>}
            {!loading && !error && productItems.length === 0 && (
              <p className="section__subtitle">No products available yet. Check back soon.</p>
            )}
            {productItems.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} onAddToCart={handleAddToCart} />
            ))}
          </div>
        </RevealSection>

        <RevealSection
          id="categories"
          label="Categories"
          title="Browse by room"
          subtitle="From the kitchen to the bedroom — find what your space needs."
          alt
        >
          <div className="category-grid">
            <a href="#" className="category-card" style={{ '--img': 'url(https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop&auto=format)' }}>
              <span className="category-card__label">Living</span>
            </a>
            <a href="#" className="category-card" style={{ '--img': 'url(https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=800&fit=crop&auto=format)' }}>
              <span className="category-card__label">Kitchen</span>
            </a>
            <a href="#" className="category-card" style={{ '--img': 'url(https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600&h=800&fit=crop&auto=format)' }}>
              <span className="category-card__label">Bedroom</span>
            </a>
            <a href="#" className="category-card" style={{ '--img': 'url(https://images.unsplash.com/photo-1615571022219-eb45cf7faa36?w=600&h=800&fit=crop&auto=format)' }}>
              <span className="category-card__label">Decor</span>
            </a>
          </div>
        </RevealSection>

        <RevealSection
          id="about"
          label="Our ethos"
          title="Made to last, designed with care."
          subtitle="We work directly with artisans and small workshops to bring you pieces that age well — in both style and substance."
        >
          <div className="ethos-grid">
            <div className="ethos-card">
              <span className="ethos-card__number">01</span>
              <h3 className="ethos-card__title">Sourced with intention</h3>
              <p className="ethos-card__text">Every product meets our standards for quality, sustainability, and fair production.</p>
            </div>
            <div className="ethos-card">
              <span className="ethos-card__number">02</span>
              <h3 className="ethos-card__title">Designed to endure</h3>
              <p className="ethos-card__text">We champion natural materials and timeless forms — not trends that fade in a season.</p>
            </div>
            <div className="ethos-card">
              <span className="ethos-card__number">03</span>
              <h3 className="ethos-card__title">Delivered with care</h3>
              <p className="ethos-card__text">Carbon-neutral shipping, plastic-free packaging, and a 30-day happiness guarantee.</p>
            </div>
          </div>
        </RevealSection>

        <Newsletter />
      </main>

      <footer className="footer" role="contentinfo">
        <div className="footer__inner">
          <div className="footer__brand">
            <span className="footer__mark">H</span>
            <p className="footer__tagline">Haven — pieces that make a house a home.</p>
          </div>
          <div className="footer__cols">
            <div className="footer__col">
              <h4 className="footer__heading">Shop</h4>
              <ul>
                <li><a href="#">All products</a></li>
                <li><a href="#">Living</a></li>
                <li><a href="#">Kitchen</a></li>
                <li><a href="#">Bedroom</a></li>
                <li><a href="#">Decor</a></li>
              </ul>
            </div>
            <div className="footer__col">
              <h4 className="footer__heading">Support</h4>
              <ul>
                <li><a href="#">Shipping &amp; returns</a></li>
                <li><a href="#">Care guides</a></li>
                <li><a href="#">FAQ</a></li>
                <li><a href="#">Contact</a></li>
              </ul>
            </div>
            <div className="footer__col">
              <h4 className="footer__heading">Company</h4>
              <ul>
                <li><a href="#">About Haven</a></li>
                <li><a href="#">Our artisans</a></li>
                <li><a href="#">Sustainability</a></li>
                <li><a href="#">Privacy</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer__bar">
          <p>&copy; {new Date().getFullYear()} Haven. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
