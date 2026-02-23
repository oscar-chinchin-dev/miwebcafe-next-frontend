export const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function getApiUrl() {
    if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL no está configurada");
    return API_URL;
}

export function api(path: string) {
    const base = getApiUrl();
    return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}