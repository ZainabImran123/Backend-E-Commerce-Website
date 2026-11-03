import { useEffect, useRef, useState } from "react";

export default function StoreHeader({
  cartCount,
  user,
  theme,
  onThemeToggle,
  onCartClick,
  onAccountClick,
  onSignOut,
}) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    if (!isProfileOpen) return undefined;

    function handlePointerDown(event) {
      if (!profileRef.current?.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") setIsProfileOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isProfileOpen]);

  function handleAccountClick() {
    if (!user) {
      onAccountClick();
      return;
    }
    setIsProfileOpen((isOpen) => !isOpen);
  }

  function handleSignOut() {
    setIsProfileOpen(false);
    onSignOut();
  }

  return (
    <header className="store-header">
      <a className="brand" href="#home" aria-label="Common Goods home">
        <span className="brand-mark" aria-hidden="true">
          c
        </span>
        <span>common goods</span>
      </a>

      <nav className="header-links" aria-label="Main navigation">
        <a href="#shop">Shop all</a>
        <a href="#story">Our approach</a>
      </nav>

      <div className="header-actions">
        <button
          className="theme-toggle"
          onClick={onThemeToggle}
          type="button"
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          aria-pressed={theme === "dark"}
        >
          <svg
            aria-hidden="true"
            className="theme-icon"
            fill="none"
            viewBox="0 0 24 24"
          >
            {theme === "light" ? (
              <path
                d="M20.2 15.1A8.5 8.5 0 0 1 8.9 3.8 8.5 8.5 0 1 0 20.2 15.1Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.6"
              />
            ) : (
              <>
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
                <path
                  d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="1.6"
                />
              </>
            )}
          </svg>
          <span className="theme-toggle-label">{theme === "light" ? "Dark" : "Light"}</span>
        </button>
        <div className="profile-menu" ref={profileRef}>
          <button
            className="account-button"
            onClick={handleAccountClick}
            type="button"
            aria-expanded={user ? isProfileOpen : undefined}
            aria-haspopup={user ? "menu" : undefined}
          >
            <span className="account-icon" aria-hidden="true">♙</span>
            <span>{user?.username || "Account"}</span>
            {user && <span className="profile-chevron" aria-hidden="true">{isProfileOpen ? "⌃" : "⌄"}</span>}
          </button>
          {user && isProfileOpen && (
            <div className="profile-dropdown" role="menu" aria-label="Profile menu">
              <div className="profile-summary">
                <strong>{user.username}</strong>
                <span>{user.email}</span>
                {user.role === "admin" && <span className="profile-role">Administrator</span>}
              </div>
              <button
                className="profile-sign-out"
                onClick={handleSignOut}
                type="button"
                role="menuitem"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
        <button
          className="cart-button"
          onClick={onCartClick}
          type="button"
          aria-label={`Open bag, ${cartCount} items`}
        >
          <span>Bag</span>
          <span className="cart-count">{cartCount}</span>
        </button>
      </div>
    </header>
  );
}
