export type Connection = { baseUrl: string; secret: string; group: string }
export type Fetch = typeof globalThis.fetch
export type IssueCode = 'offline' | 'auth' | 'invalid' | 'api' | 'config' | 'conflict'
export class MihomoError extends Error {
  readonly code: IssueCode
  constructor(code: IssueCode, message: string, options?: ErrorOptions) {
    super(message, options); this.name = 'MihomoError'; this.code = code
  }
}
