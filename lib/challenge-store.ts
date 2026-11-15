import { get, put } from '@vercel/blob';
import type { ChallengeStore } from './challenge-service.js';

export const challengeStore: ChallengeStore = {
  async read<T>(pathname: string): Promise<T | null> {
    const result = await get(pathname, { access: 'private', useCache: false });
    if (!result || result.statusCode !== 200) return null;
    return await new Response(result.stream).json() as T;
  },
  async create(pathname, value) {
    try {
      await put(pathname, JSON.stringify(value), { access: 'private', addRandomSuffix: false, allowOverwrite: false, contentType: 'application/json', cacheControlMaxAge: 60, ttlDays: 1 });
      return true;
    } catch (error) {
      // An immutable slot may have been claimed by a simultaneous request. Read it
      // from origin, rather than overwriting or relying on a stale CDN response.
      if (await challengeStore.read(pathname)) return false;
      throw error;
    }
  },
};
