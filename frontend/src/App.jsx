import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { apiRequest } from "./api.js";
import AdminProductForm from "./components/AdminProductForm.jsx";
import AuthDialog from "./components/AuthDialog.jsx";
import CartDrawer from "./components/CartDrawer.jsx";
import ProductGrid from "./components/ProductGrid.jsx";
import StoreHeader from "./components/StoreHeader.jsx";

function formatPrice(value) {
  return Number(value || 0).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
  });
}

export default function App() {
  const [theme, setTheme] = useState(
    () => window.localStorage.getItem("common-goods-theme") === "dark" ? "dark" : "light",
  );
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [user, setUser] = useState(undefined);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [pendingProductId, setPendingProductId] = useState(null);
  const [updatingProductId, setUpdatingProductId] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [notice, setNotice] = useState(null);
  const brandDashboardRef = useRef(null);

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem("common-goods-theme", theme);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#151815" : "#f7f6f2");
  }, [theme]);

  useEffect(() => {
    let isActive = true;
    apiRequest("/api/auth/me")
      .then((data) => {
        if (isActive) setUser(data.user);
      })
      .catch((error) => {
        if (!isActive) return;
        setUser(null);
        if (error.status !== 401) {
          setNotice({ type: "error", text: error.message });
        }
      });

    apiRequest("/api/product")
      .then((data) => {
        if (isActive) setProducts(data.products || []);
      })
      .catch((error) => {
        if (isActive) setNotice({ type: "error", text: error.message });
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!notice) return undefined;
    const timeout = window.setTimeout(() => setNotice(null), 4200);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  useEffect(() => {
    if (editingProduct) {
      brandDashboardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [editingProduct]);

  useEffect(() => {
    if (!user || !pendingProductId) return;
    const productId = pendingProductId;
    const product = products.find((item) => item._id === productId);
    addProductToCart(productId, product?.name || "Product")
      .finally(() => setPendingProductId(null));
  }, [pendingProductId, user]);

  useEffect(() => {
    if (user === undefined) return;
    if (!user) {
      setCart([]);
      setCartTotal(0);
      return;
    }
    if (pendingProductId) return;
    let isActive = true;
    apiRequest("/api/cart")
      .then((data) => {
        if (!isActive) return;
        setCart(data.cart || []);
        setCartTotal(data.totalPrice || 0);
      })
      .catch((error) => {
        if (!isActive) return;
        setUser(null);
        setNotice({ type: "error", text: error.message });
      });
    return () => {
      isActive = false;
    };
  }, [pendingProductId, user]);

  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return products;
    return products.filter((product) =>
      `${product.name} ${product.desc}`.toLowerCase().includes(normalizedQuery),
    );
  }, [products, query]);

  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

  async function addProductToCart(productId, productName) {
    try {
      const data = await apiRequest("/api/cart/items", {
        method: "POST",
        body: JSON.stringify({ productId }),
      });
      setCart(data.cart || []);
      setCartTotal(data.totalPrice || 0);
      await Swal.fire({
        icon: "success",
        title: "Added to your bag",
        text: `${productName} is in your cart.`,
        confirmButtonText: "Continue shopping",
        confirmButtonColor: "#687258",
      });
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    }
  }

  async function handleAdd(product) {
    if (!user) {
      setPendingProductId(product._id);
      setIsAuthOpen(true);
      return;
    }

    await addProductToCart(product._id, product.name);
  }

  async function handleQuantityChange(productId, change) {
    if (updatingProductId) return;
    setUpdatingProductId(productId);
    try {
      const data = await apiRequest(`/api/cart/items/${productId}`, {
        method: "PATCH",
        body: JSON.stringify({ change }),
      });
      setCart(data.cart || []);
      setCartTotal(data.totalPrice || 0);
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    } finally {
      setUpdatingProductId(null);
    }
  }

  async function handleRemove(productId) {
    try {
      const data = await apiRequest(`/api/cart/items/${productId}`, {
        method: "DELETE",
      });
      setCart(data.cart || []);
      setCartTotal(data.totalPrice || 0);
      setNotice({ type: "success", text: "Removed from your bag." });
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    }
  }

  function handleProductSaved(savedProduct) {
    setProducts((currentProducts) => {
      const alreadyExists = currentProducts.some((product) => product._id === savedProduct._id);
      return alreadyExists
        ? currentProducts.map((product) => product._id === savedProduct._id ? savedProduct : product)
        : [savedProduct, ...currentProducts];
    });
    setEditingProduct(null);
    setNotice({ type: "success", text: "Your product listing has been saved." });
  }

  async function handleDeleteProduct(product) {
    const confirmation = await Swal.fire({
      icon: "warning",
      title: "Delete this product?",
      text: `${product.name} will be removed from the store and customers’ carts.`,
      showCancelButton: true,
      confirmButtonText: "Delete product",
      confirmButtonColor: "#a2422e",
      cancelButtonText: "Keep product",
    });
    if (!confirmation.isConfirmed) return;

    try {
      await apiRequest(`/api/product/${product._id}`, { method: "DELETE" });
      setProducts((currentProducts) => currentProducts.filter((item) => item._id !== product._id));
      if (editingProduct?._id === product._id) setEditingProduct(null);
      setNotice({ type: "success", text: "Product deleted." });
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    }
  }

  function handleAuthSuccess(signedInUser) {
    setUser(signedInUser);
    setIsAuthOpen(false);
    setNotice({ type: "success", text: `Good to have you, ${signedInUser.username}.` });
    if (products.length === 0) {
      apiRequest("/api/product")
        .then((data) => setProducts(data.products || []))
        .catch((error) => setNotice({ type: "error", text: error.message }));
    }
  }

  async function handleSignOut() {
    try {
      await apiRequest("/api/auth/logout", { method: "POST" });
      setUser(null);
      setIsCartOpen(false);
      setNotice({ type: "success", text: "You’ve been signed out." });
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    }
  }

  return (
    <>
      <StoreHeader
        cartCount={itemCount}
        user={user}
        theme={theme}
        onThemeToggle={() => setTheme((currentTheme) => currentTheme === "light" ? "dark" : "light")}
        onCartClick={() => setIsCartOpen(true)}
        onAccountClick={() => setIsAuthOpen(true)}
        onSignOut={handleSignOut}
      />

      <main id="home">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">THE EVERYDAY EDIT · NO. 01</p>
            <h1>Good things,<br />made to <em>stay.</em></h1>
            <p className="hero-description">
              Thoughtful finds for the rituals, rooms, and little moments that make a life.
            </p>
            <a className="button button-dark hero-cta" href="#shop">
              Explore the collection <span aria-hidden="true">↘</span>
            </a>
            <div className="hero-note">
              <span className="hero-note-line" />
              <span>Fewer, better things. Always.</span>
            </div>
          </div>
          <div className="hero-art" aria-label="A still life of everyday objects">
            <div className="art-sun" />
            <div className="art-shelf">
              <div className="art-vase art-vase-one" />
              <div className="art-vase art-vase-two" />
              <div className="art-book art-book-one" />
              <div className="art-book art-book-two" />
              <div className="art-bowl" />
            </div>
            <div className="art-caption">
              <span>01 / 04</span>
              <span>Objects for slower living</span>
            </div>
          </div>
          <div className="hero-index">EST. FOR THE EVERYDAY — 2024</div>
        </section>

        <section className="values-strip" id="story" aria-label="Our values">
          <span>Considered by design</span>
          <span className="values-star" aria-hidden="true">✳</span>
          <span>Made for real life</span>
          <span className="values-star" aria-hidden="true">✳</span>
          <span>Keep what matters</span>
        </section>

        {user?.role === "admin" && (
          <section
            className="brand-dashboard"
            aria-labelledby="brand-dashboard-title"
            ref={brandDashboardRef}
          >
            <div className="brand-dashboard-heading">
              <p className="eyebrow">BRAND STUDIO</p>
              <h2 id="brand-dashboard-title">Welcome, {user.brandName || user.username}</h2>
              <p>Add products to your storefront and manage your own listings.</p>
            </div>
            <AdminProductForm
              key={editingProduct?._id || "new-product"}
              product={editingProduct}
              onSaved={handleProductSaved}
              onCancel={() => setEditingProduct(null)}
            />
          </section>
        )}

        <section className="shop-section" id="shop">
          <div className="shop-heading">
            <div>
              <p className="eyebrow">A LITTLE OF WHAT YOU LOVE</p>
              <h2>The good stuff</h2>
            </div>
            <label className="search-field">
              <span className="search-icon" aria-hidden="true">⌕</span>
              <input
                aria-label="Search products"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Find your thing"
                type="search"
                value={query}
              />
              <span className="search-shortcut">↵</span>
            </label>
          </div>
          <div className="shop-meta">
            <p>Useful, beautiful, and made to be lived with.</p>
            <span>{visibleProducts.length.toString().padStart(2, "0")} OBJECTS</span>
          </div>

          {isLoading ? (
            <div className="loading-state" role="status">Gathering the good stuff…</div>
          ) : (
            <ProductGrid
              products={visibleProducts}
              onAdd={handleAdd}
              user={user}
              onEdit={setEditingProduct}
              onDelete={handleDeleteProduct}
            />
          )}
        </section>

        <section className="closing-note">
          <span className="closing-mark" aria-hidden="true">c</span>
          <p>Make room for what feels like you.</p>
          <span className="closing-small">COMMON GOODS · EVERYDAY, CONSIDERED</span>
        </section>
      </main>

      <footer className="site-footer">
        <a className="brand footer-brand" href="#home">
          <span className="brand-mark" aria-hidden="true">c</span>
          <span>common goods</span>
        </a>
        <span>Good things for the everyday.</span>
        <span>© {new Date().getFullYear()} Common Goods</span>
      </footer>

      {notice && (
        <div className={`notice notice-${notice.type}`} role="status">
          <span aria-hidden="true">{notice.type === "success" ? "✓" : "!"}</span>
          {notice.text}
        </div>
      )}

      <CartDrawer
        isOpen={isCartOpen}
        isSignedIn={Boolean(user)}
        items={cart}
        total={cartTotal}
        onClose={() => setIsCartOpen(false)}
        onRemove={handleRemove}
        onQuantityChange={handleQuantityChange}
        updatingProductId={updatingProductId}
        onSignIn={() => {
          setIsCartOpen(false);
          setIsAuthOpen(true);
        }}
      />
      <AuthDialog
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}
