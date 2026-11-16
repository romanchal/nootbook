/**
 * Route classification for the auth guard.
 * Pure so it can be unit-tested.
 */

const PUBLIC_PATHS = ["/login", "/signup", "/auth", "/unauthorized"];

/** True for pages reachable without signing in. */
export function isPublicPath(pathname: string): boolean {
  if (pathname === "/") return true;
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}
