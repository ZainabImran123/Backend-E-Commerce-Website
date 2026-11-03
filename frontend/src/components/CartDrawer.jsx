function formatPrice(value) {
  return Number(value || 0).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
  });
}

export default function CartDrawer({
  isOpen,
  isSignedIn,
  items,
  total,
  onClose,
  onRemove,
  onQuantityChange,
  updatingProductId,
  onSignIn,
}) {
  if (!isOpen) return null;

  return (
    <div className="drawer-layer" onMouseDown={onClose}>
      <aside
        className="cart-drawer"
        aria-label="Shopping bag"
        aria-modal="true"
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="drawer-heading">
          <div>
            <p className="eyebrow">YOUR EDIT</p>
            <h2>Your bag</h2>
          </div>
          <button
            className="icon-button close-button"
            type="button"
            onClick={onClose}
            aria-label="Close bag"
          >
            ×
          </button>
        </div>

        {!isSignedIn ? (
          <div className="drawer-empty">
            <p>Sign in to see your bag and keep your picks close.</p>
            <button className="button button-dark" onClick={onSignIn} type="button">
              Sign in
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="drawer-empty">
            <p>Your bag is taking a well-deserved breather.</p>
            <button className="text-button" onClick={onClose} type="button">
              Continue browsing <span aria-hidden="true">→</span>
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map((item) => {
                const product = item.product;
                if (!product) return null;
                return (
                  <article className="cart-item" key={product._id}>
                    <img src={product.image} alt="" />
                    <div className="cart-item-copy">
                      <h3>{product.name}</h3>
                      <div className="quantity-control" aria-label={`${product.name} quantity`}>
                        <button
                          className="quantity-button"
                          type="button"
                          aria-label={`Decrease ${product.name} quantity`}
                          disabled={Boolean(updatingProductId)}
                          onClick={() => onQuantityChange(product._id, -1)}
                        >
                          −
                        </button>
                        <span aria-live="polite">{item.quantity}</span>
                        <button
                          className="quantity-button"
                          type="button"
                          aria-label={`Increase ${product.name} quantity`}
                          disabled={Boolean(updatingProductId)}
                          onClick={() => onQuantityChange(product._id, 1)}
                        >
                          +
                        </button>
                      </div>
                      <button
                        className="text-button remove-button"
                        type="button"
                        onClick={() => onRemove(product._id)}
                      >
                        Remove
                      </button>
                    </div>
                    <span>{formatPrice(product.price * item.quantity)}</span>
                  </article>
                );
              })}
            </div>
            <div className="cart-summary">
              <div className="summary-line">
                <span>Subtotal</span>
                <strong>{formatPrice(total)}</strong>
              </div>
              <p>Shipping and any applicable taxes are calculated at checkout.</p>
              <button className="button button-dark checkout-button" type="button" disabled>
                Checkout coming soon
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
