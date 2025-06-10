// pkce.js  – verifier 86文字、challenge 43文字、RFC準拠
export async function createPKCE() {
  const bytes = crypto.getRandomValues(new Uint8Array(64));    // 64 random bytes

  const toB64url = a =>
    btoa(String.fromCharCode(...a))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const verifier  = toB64url(bytes);                           // 86 chars
  const data      = new TextEncoder().encode(verifier);        // UTF-8
  const digest    = await crypto.subtle.digest('SHA-256', data);
  const challenge = toB64url(new Uint8Array(digest));          // 43 chars

  return { verifier, challenge };
}
