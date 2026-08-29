import { describe, expect, it } from 'vitest';
import { appVersionFromPath } from './versioning';

describe('appVersionFromPath', () => {
  it('keeps the legacy app on /v0 paths', () => {
    expect(appVersionFromPath('/v0')).toBe('v0');
    expect(appVersionFromPath('/v0/workstreams')).toBe('v0');
  });

  it('uses the new board on /v1 and default paths', () => {
    expect(appVersionFromPath('/v1')).toBe('v1');
    expect(appVersionFromPath('/v1/board')).toBe('v1');
    expect(appVersionFromPath('/')).toBe('v1');
  });
});
