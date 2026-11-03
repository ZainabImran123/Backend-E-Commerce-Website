const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export async function apiRequest(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...options.headers,
      },
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error(
      "Cannot reach the backend. Start it with `npm start` in the backend folder, then try again.",
    );
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json().catch(() => ({}))
    : {};
  if (!response.ok) {
    const requestError = new Error(
      data.message || `The backend request failed (${response.status}). Please try again.`,
    );
    requestError.status = response.status;
    if (response.status === 502 || response.status === 504) {
      requestError.message =
        "The backend is not reachable. Start it from the backend folder and confirm its MongoDB connection succeeds.";
    } else if (!data.message && response.status >= 500) {
      requestError.message =
        `The backend returned an error (${response.status}). Check its terminal for a database or server error.`;
    }
    throw requestError;
  }
  return data;
}
