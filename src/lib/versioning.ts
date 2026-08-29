export type AppVersion = 'v0' | 'v1';

export function appVersionFromPath(pathname: string): AppVersion {
  return pathname === '/v0' || pathname.startsWith('/v0/') ? 'v0' : 'v1';
}
