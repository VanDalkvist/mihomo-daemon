import { MihomoError } from './contracts.ts'
import type { Connection, Fetch } from './contracts.ts'

export class MihomoClient {
  readonly connection: Connection
  private readonly fetcher: Fetch
  private readonly timeoutMs: number

  constructor(connection: Connection, fetcher: Fetch, timeoutMs = 5000) {
    this.connection = connection; this.fetcher = fetcher; this.timeoutMs = timeoutMs
  }

  async request(path: string, signal: AbortSignal, method = 'GET', body?: unknown): Promise<unknown> {
    const deadline = AbortSignal.timeout(this.timeoutMs)
    const combined = AbortSignal.any([signal, deadline])
    try {
      const response = await this.fetcher(this.connection.baseUrl + path, {
        method, redirect: 'error', signal: combined,
        headers: {
          'Content-Type': 'application/json',
          ...(this.connection.secret ? { Authorization: `Bearer ${this.connection.secret}` } : {}),
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      })
      if (response.status === 401 || response.status === 403)
        throw new MihomoError('auth', 'Mihomo требует авторизацию; проверьте MIHOMO_API_SECRET в ~/Projects/.env')
      if (!response.ok) throw new MihomoError('api', `Mihomo: HTTP ${response.status}`)
      if (response.status === 204) return null
      const reader = response.body?.getReader()
      if (!reader) throw new MihomoError('invalid', 'Mihomo вернул пустой ответ')
      const chunks: Uint8Array[] = []
      let size = 0
      try {
        for (;;) {
          const { value, done } = await reader.read()
          if (done) break
          size += value.byteLength
          if (size > 2_000_000) throw new MihomoError('invalid', 'Ответ Mihomo превышает допустимый размер')
          chunks.push(value)
        }
      } finally { await reader.cancel() }
      try { return JSON.parse(Buffer.concat(chunks).toString('utf8')) }
      catch { throw new MihomoError('invalid', 'Mihomo вернул некорректный JSON') }
    } catch (error) {
      if (signal.aborted) throw new MihomoError('offline', 'Запрос VPN отменён')
      if (error instanceof MihomoError) throw error
      throw new MihomoError('offline', deadline.aborted ? 'Mihomo не ответил вовремя' : 'Нет связи с Mihomo')
    }
  }
}
