import { readFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { parseEnv } from 'node:util'
import { MihomoError } from './contracts.ts'
import type { Connection } from './contracts.ts'

export function parseConnection(env: Record<string, string | undefined>): Connection {
  const baseUrl = env.MIHOMO_API_URL || 'http://127.0.0.1:9090'
  let url: URL
  try { url = new URL(baseUrl) } catch { throw new MihomoError('config', 'Некорректный MIHOMO_API_URL') }
  if (url.protocol !== 'http:' || !['127.0.0.1', '[::1]'].includes(url.hostname) ||
      url.username || url.password || url.search || url.hash || url.pathname !== '/')
    throw new MihomoError('config', 'MIHOMO_API_URL должен указывать на HTTP-контроллер loopback без пути и пароля')
  const group = env.MIHOMO_PROXY_GROUP || 'PROXY'
  const secret = env.MIHOMO_API_SECRET || ''
  if (group.length > 256 || /[\u0000-\u001f\u007f]/.test(group) || /[\r\n\u0000]/.test(secret))
    throw new MihomoError('config', 'Некорректные параметры подключения Mihomo')
  return { baseUrl: url.origin, secret, group }
}

export async function loadConnection(path = join(homedir(), 'Projects', '.env')): Promise<Connection> {
  let content: string
  try { content = await readFile(path, 'utf8') }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return parseConnection({})
    throw new MihomoError('config', 'Не удалось прочитать настройки Mihomo из ~/Projects/.env')
  }
  return parseConnection(parseEnv(content))
}
