import { useState } from "react";
import { apiRequest } from "../api.js";

function getSafeUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    brandName: user.brandName || null,
  };
}

export default function AuthDialog({ isOpen, onClose, onSuccess }) {
  const [mode, setMode] = useState("login");
  const [accountType, setAccountType] = useState("shopper");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const usernameOrEmail = String(formData.get("usernameOrEmail") || "").trim();
    const password = String(formData.get("password") || "");
    const username = String(formData.get("username") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const brandName = String(formData.get("brandName") || "").trim();

    try {
      const data =
        mode === "login"
          ? await apiRequest("/api/auth/login", {
              method: "POST",
              body: JSON.stringify({
                username: usernameOrEmail,
                email: usernameOrEmail,
                password,
              }),
            })
          : await apiRequest("/api/auth/register", {
              method: "POST",
              body: JSON.stringify({
                username,
                email,
                password,
                accountType,
                ...(accountType === "brand" ? { brandName } : {}),
              }),
            });

      onSuccess(getSafeUser(data.user));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setAccountType("shopper");
    setError("");
  }

  return (
    <div className="modal-layer" onMouseDown={onClose}>
      <section
        className="auth-dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          className="icon-button modal-close"
          type="button"
          onClick={onClose}
          aria-label="Close sign in"
        >
          ×
        </button>
        <p className="eyebrow">{mode === "login" ? "WELCOME BACK" : "A GOOD PLACE TO START"}</p>
        <h2 id="auth-title">{mode === "login" ? "Sign in" : "Create your account"}</h2>
        <p className="auth-intro">
          {mode === "login"
            ? "Pick up right where you left off."
            : "Save your favorites and make room for the good stuff."}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "login" ? (
            <label>
              Username or email
              <input
                autoComplete="username"
                name="usernameOrEmail"
                placeholder="you@example.com"
                required
              />
            </label>
          ) : (
            <>
              <fieldset className="account-type-options">
                <legend>Choose account type</legend>
                <label>
                  <input
                    checked={accountType === "shopper"}
                    name="accountType"
                    onChange={() => setAccountType("shopper")}
                    type="radio"
                    value="shopper"
                  />
                  Shopper
                </label>
                <label>
                  <input
                    checked={accountType === "brand"}
                    name="accountType"
                    onChange={() => setAccountType("brand")}
                    type="radio"
                    value="brand"
                  />
                  Brand
                </label>
              </fieldset>
              <label>
                Your name
                <input autoComplete="username" name="username" required />
              </label>
              <label>
                Email address
                <input autoComplete="email" name="email" type="email" required />
              </label>
              {accountType === "brand" && (
                <label>
                  Brand name
                  <input autoComplete="organization" name="brandName" required />
                </label>
              )}
            </>
          )}
          <label>
            Password
            <input
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              minLength="6"
              name="password"
              type="password"
              required
            />
          </label>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button className="button button-dark auth-submit" disabled={isSubmitting} type="submit">
            {isSubmitting
              ? "One moment…"
              : mode === "login"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>

        <p className="auth-switch">
          {mode === "login" ? "New around here?" : "Already have an account?"}{" "}
          <button
            className="text-button"
            onClick={() => switchMode(mode === "login" ? "register" : "login")}
            type="button"
          >
            {mode === "login" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </section>
    </div>
  );
}
