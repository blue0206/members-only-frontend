export const getCsrfTokenFromCookie = () => {
  // Get all cookies in array.
  const cookies = document.cookie.split(";");
  // Get CSRF cookie from array.
  const csrfCookie = cookies.find((cookie) => cookie.startsWith("csrf-token"));
  // Extract CSRF token from cookie.
  const csrfToken = csrfCookie?.split("=")[1];
  // Trim and return the token.
  return csrfToken?.trim();
};

export const setCsrfHeader = (): Headers => {
  // Create headers object.
  const headers = new Headers();
  // Get CSRF token from cookie.
  const csrfToken = getCsrfTokenFromCookie();
  // Append to headers if present.
  if (csrfToken) {
    if (headers.get("x-csrf-token")) {
      headers.set("x-csrf-token", csrfToken);
    } else {
      headers.append("x-csrf-token", csrfToken);
    }
  }
  // Return headers.
  return headers;
};
