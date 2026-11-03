import { useEffect, useState } from "react";
import { apiRequest } from "../api.js";

export default function AdminProductForm({ product, onSaved, onCancel }) {
  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.desc || "");
  const [price, setPrice] = useState(product?.price ?? "");
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(product?.name || "");
    setDescription(product?.desc || "");
    setPrice(product?.price ?? "");
    setImage(null);
    setError("");
  }, [product]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (!product && !image) {
      setError("Choose an image file for your product.");
      return;
    }
    setIsSaving(true);

    const body = new FormData();
    body.append("name", name.trim());
    body.append("desc", description.trim());
    body.append("price", String(price));
    if (image) body.append("image", image);

    try {
      const data = await apiRequest(
        product ? `/api/product/${product._id}` : "/api/product/create",
        {
          method: product ? "PATCH" : "POST",
          body,
        },
      );
      onSaved(data.product);
      if (!product) {
        setName("");
        setDescription("");
        setPrice("");
        setImage(null);
        event.currentTarget.reset();
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="admin-product-form" onSubmit={handleSubmit}>
      <div className="admin-form-heading">
        <div>
          <p className="eyebrow">{product ? "UPDATE LISTING" : "NEW LISTING"}</p>
          <h3>{product ? "Edit product" : "Add a product"}</h3>
        </div>
        {product && (
          <button className="text-button" onClick={onCancel} type="button">
            Cancel edit
          </button>
        )}
      </div>
      <div className="admin-form-fields">
        <label>
          Product name
          <input
            maxLength="120"
            onChange={(event) => setName(event.target.value)}
            required
            value={name}
          />
        </label>
        <label>
          Price (USD)
          <input
            min="0"
            onChange={(event) => setPrice(event.target.value)}
            required
            step="0.01"
            type="number"
            value={price}
          />
        </label>
        <label className="admin-description-field">
          Description
          <textarea
            maxLength="1000"
            onChange={(event) => setDescription(event.target.value)}
            required
            rows="3"
            value={description}
          />
        </label>
        <label>
          Product image {product ? "(optional; leave blank to keep current image)" : ""}
          <input
            accept="image/*"
            onChange={(event) => setImage(event.target.files?.[0] || null)}
            required={!product}
            type="file"
          />
        </label>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button button-dark admin-save-button" disabled={isSaving} type="submit">
        {isSaving ? "Saving…" : product ? "Save changes" : "Publish product"}
      </button>
    </form>
  );
}
