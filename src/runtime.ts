import { MihomoClient } from './client.ts'
import { MihomoError } from './contracts.ts'
import type { Connection, Fetch } from './contracts.ts'

export async function checkRuntime(connection: Connection, fetcher: Fetch, signal: AbortSignal) {
  const client = new MihomoClient(connection, fetcher)
  const raw = await client.request('/version', signal)
  if (!raw || typeof raw !== 'object' || !('version' in raw) || typeof raw.version !== 'string')
    throw new MihomoError('invalid', 'Mihomo вернул некорректную версию')
  return { available: true, version: raw.version }
}
