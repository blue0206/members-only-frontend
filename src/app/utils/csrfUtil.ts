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
