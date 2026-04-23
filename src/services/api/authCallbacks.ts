// Circular import prevention: axios.ts calls callLogout() without importing AuthContext directly.
// AuthContext registers its logout function via setLogoutCallback on mount.

let logoutCallback: (() => void) | null = null;

export function setLogoutCallback(fn: () => void): void {
  logoutCallback = fn;
}

export function callLogout(): void {
  if (logoutCallback) {
    logoutCallback();
  }
}
