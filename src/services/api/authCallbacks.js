// Circular import prevention: axios.ts calls callLogout() without importing AuthContext directly.
// AuthContext registers its logout function via setLogoutCallback on mount.
let logoutCallback = null;
export function setLogoutCallback(fn) {
    logoutCallback = fn;
}
export function callLogout() {
    if (logoutCallback) {
        logoutCallback();
    }
}
