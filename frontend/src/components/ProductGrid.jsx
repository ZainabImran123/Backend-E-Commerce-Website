import ProductCard from "./ProductCard.jsx";

export default function ProductGrid({ products, onAdd, user, onEdit, onDelete }) {
  if (products.length === 0) {
    return (
      <div className="empty-products">
        <span className="empty-mark" aria-hidden="true">
          ✳
        </span>
        <h3>Nothing on the shelves just yet</h3>
        <p>Check back soon for new everyday essentials.</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          onAdd={onAdd}
          canManage={user?.role === "admin" && product.admin?._id === user.id}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
