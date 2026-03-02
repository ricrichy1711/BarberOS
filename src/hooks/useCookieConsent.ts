const STORAGE_KEY = 'barberos_cookie_consent';

export function hasAdConsent(): boolean {
    try {
        return localStorage.getItem(STORAGE_KEY) === 'accepted';
    } catch {
        return false;
    }
}
