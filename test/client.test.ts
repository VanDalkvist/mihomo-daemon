import { test } from 'node:test'
import assert from 'node:assert/strict'
import { MihomoClient } from '../src/client.ts'
import { parseConnection } from '../src/connection.ts'
import { checkRuntime } from '../src/runtime.ts'

const connection = {baseUrl:'http://127.0.0.1:9090',secret:'',group:'PROXY'}
const signal = () => new AbortController().signal

test('only loopback HTTP controller configuration is admitted', () => {
  assert.deepEqual(parseConnection({}), connection)
  for (const url of ['https://example.com','http://localhost:9090','http://127.0.0.1/a','http://u:p@127.0.0.1','http://127.0.0.1/?secret=x'])
    assert.throws(()=>parseConnection({MIHOMO_API_URL:url}))
  assert.throws(()=>parseConnection({MIHOMO_API_SECRET:'a\nb'}))
  assert.throws(()=>parseConnection({MIHOMO_PROXY_GROUP:'a\nb'}))
})

test('auth and upstream errors do not expose raw body or credentials', async () => {
  for (const status of [401,403,500]) {
    const client=new MihomoClient({...connection,secret:'sensitive-value'},async()=>new Response('sensitive-value',{status}))
    await assert.rejects(client.request('/version',signal()), error => {
      assert.ok(error instanceof Error)
      assert.ok(!error.message.includes('sensitive-value'))
      return true
    })
  }
})

test('deadline and caller abort are bounded and sanitized', async () => {
  const hang:typeof fetch=async(_url,init)=>new Promise((_resolve,reject)=>{
    init!.signal!.addEventListener('abort',()=>reject(new Error('private-network-detail')),{once:true})
    if(init!.signal!.aborted) reject(new Error('private-network-detail'))
  })
  const client=new MihomoClient(connection,hang,5)
  const keeper=setInterval(()=>{},100)
  try {await assert.rejects(client.request('/version',signal()),/вовремя/)}
  finally {clearInterval(keeper)}
  const abort=new AbortController();abort.abort()
  await assert.rejects(client.request('/version',abort.signal),/отменён/)
})

test('rejects malformed and oversized JSON responses', async () => {
  const malformed=new MihomoClient(connection,async()=>new Response('not json'))
  await assert.rejects(malformed.request('/version',signal()),/JSON/)
  const large=new MihomoClient(connection,async()=>new Response('x'.repeat(2_000_001)))
  await assert.rejects(large.request('/version',signal()),/размер/)
})

test('readiness uses GET only with no redirects, bounded signal and server-side authorization', async () => {
  const calls:RequestInit[]=[]
  const clientFetch:typeof fetch=async(url,init)=>{
    assert.equal(url,connection.baseUrl+'/version')
    calls.push(init!)
    assert.equal((init!.headers as Record<string,string>).Authorization,'Bearer test-fixture-only')
    return Response.json({version:'1.19.32'})
  }
  const result=await checkRuntime({...connection,secret:'test-fixture-only'},clientFetch,signal())
  assert.equal(result.version,'1.19.32')
  assert.equal(calls[0]!.method,'GET');assert.equal(calls[0]!.redirect,'error')
  assert.ok(calls[0]!.signal instanceof AbortSignal)
})
