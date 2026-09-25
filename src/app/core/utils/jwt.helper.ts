import { JwtPayload } from '../models/auth.model';

export class JwtHelper {

  static decodeToken(token: string): JwtPayload | null {
    try {
      if (token.split('.').length !== 3) return null;
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const bytes = Uint8Array.from(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')), c => c.charCodeAt(0));
      const payload = JSON.parse(new TextDecoder().decode(bytes));
      if (typeof payload.sub !== 'string' || !Number.isFinite(payload.exp) || !Array.isArray(payload.roles)) return null;
      return payload as JwtPayload;
    } catch {
      return null;
    }
  }

  static isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload?.exp) return true;
    const now = Math.floor(Date.now() / 1000);
    return payload.exp <= now;
  }
}
