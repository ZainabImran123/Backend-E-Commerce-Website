export default function ProductCard({ product, onAdd, canManage, onEdit, onDelete }) {
  const brandName = product.admin?.brandName || "Common Goods";

  return (
    <article className="product-card">
      <div className="product-image-wrap">
        {product.image ? (
          <img
            className="product-image"
            src={product.image}
            alt={product.name}
            loading="lazy"
          />
        ) : (
          <div className="product-image-placeholder" aria-hidden="true">
            CG
          </div>
        )}
        <button
          className="quick-add"
          type="button"
          onClick={() => onAdd(product)}
          aria-label={`Add ${product.name} to bag`}
        >
          <span aria-hidden="true">+</span>
        </button>
        {canManage && (
          <div className="product-management-actions">
            <button type="button" onClick={() => onEdit(product)}>Edit</button>
            <button type="button" onClick={() => onDelete(product)}>Delete</button>
          </div>
        )}
      </div>
      <div className="product-details">
        <div>
          <p className="product-brand">{brandName}</p>
          <h3>{product.name}</h3>
          <p>{product.desc}</p>
        </div>
        <span className="product-price">
          {Number(product.price).toLocaleString(undefined, {
            style: "currency",
            currency: "USD",
          })}
        </span>
      </div>
    </article>
  );
}
