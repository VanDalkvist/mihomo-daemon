import { loadConnection } from '../src/connection.ts'
import { checkRuntime } from '../src/runtime.ts'
try {
  console.log(JSON.stringify(await checkRuntime(await loadConnection(), fetch, AbortSignal.timeout(5000))))
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Mihomo unavailable')
  process.exitCode = 1
}
