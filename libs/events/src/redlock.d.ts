// redlock@5 beta ships types at dist/index.d.ts but its package.json
// "exports" map omits a "types" condition, so TS module resolution can't
// find them under Bundler/NodeNext resolution. Minimal ambient shim.
declare module "redlock" {
  export interface Lock {
    release(): Promise<unknown>;
  }
  export default class Redlock {
    constructor(clients: unknown[], settings?: Record<string, unknown>);
    acquire(resources: string[], ttl: number): Promise<Lock>;
  }
}
