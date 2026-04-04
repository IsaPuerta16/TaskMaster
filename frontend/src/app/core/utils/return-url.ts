/** Evita redirecciones abiertas: solo rutas internas relativas. */
export function safeInternalPath(url: string | null | undefined): string | null {
  if (url == null || typeof url !== 'string') return null;
  const t = url.trim();
  if (!t.startsWith('/') || t.startsWith('//')) return null;
  return t;
}
