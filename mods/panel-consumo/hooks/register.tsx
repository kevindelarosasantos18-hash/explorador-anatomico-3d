import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Medida, Pedido } from '../types'

const PANE = 'panel-consumo'
const pedidos = atom({ plugin: 'panel-consumo', key: 'pedidos' } as const, [])
const herramientas = atom({ plugin: 'panel-consumo', key: 'herramientas' } as const, {})
const errores = atom({ plugin: 'panel-consumo', key: 'errores' } as const, 0)
const medida = atom({ plugin: 'panel-consumo', key: 'medida' } as const, null)
const inicio = atom({ plugin: 'panel-consumo', key: 'inicio' } as const, 0)
const ahora = atom({ plugin: 'panel-consumo', key: 'ahora' } as const, 0)

export const k = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`

export const reloj = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const pad = (x: number) => String(x).padStart(2, '0')
  return `${h > 0 ? `${h}h ` : ''}${pad(m)}m ${pad(s % 60)}s`
}

export const barra = (pct: number, ancho = 20) => {
  const lleno = Math.round((Math.min(100, Math.max(0, pct)) / 100) * ancho)
  return '█'.repeat(lleno) + '░'.repeat(ancho - lleno)
}

const semaforo = (pct: number) => (pct >= 80 ? 'red' : pct >= 50 ? 'yellow' : 'green')

const totalIn = (p: Pedido) => p.input + p.cacheRead + p.cacheWrite

async function medir($: EngineInterface) {
  const u = await $.session.usage()
  const m: Medida = {
    tokens: u.context.tokens,
    window: u.context.window,
    percent: u.context.percent,
    usd: u.cost?.usd,
    limits: u.rateLimits.map(r => ({ kind: r.kind, percentUsed: r.percentUsed, resetsAt: r.resetsAt })),
  }
  await update($, medida, () => m)
  if ((await read($, inicio)) === 0) await update($, inicio, () => u.startedAt)
}

export const register: Register = on => {
  let toolsTurno = 0

  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'consumo', description: 'Abre el panel de consumo de la conversación' })
    await medir($)
    await update($, ahora, () => 0)
    $.clock.every(1000, () => {
      void $.clock.now().then(t => update($, ahora, () => t))
    })
    void $.ui.open({ id: PANE, title: 'Consumo' })
    return next(e)
  })

  on('command.run', { command: 'consumo' }, async $ => {
    await $.ui.open({ id: PANE, title: 'Consumo' })
    return { text: 'Panel de consumo abierto.' }
  })

  on('turn.start', ($, e, next) => {
    toolsTurno = 0
    return next(e)
  })

  on('tool.call', async ($, e, next) => {
    if (!e.agentId) toolsTurno += 1
    await update($, herramientas, h => ({ ...h, [e.tool]: (h[e.tool] ?? 0) + 1 }))
    const r = await next(e)
    if (r.deny !== undefined || r.isError === true) await update($, errores, n => n + 1)
    return r
  }).catch(($, e, next) => next(e))

  on('turn.complete', async ($, e, next) => {
    const r = await next(e)
    if (!e.agentId && e.usage) {
      const p: Pedido = {
        input: e.usage.input_tokens,
        output: e.usage.output_tokens,
        cacheRead: e.usage.cache_read_input_tokens,
        cacheWrite: e.usage.cache_creation_input_tokens,
        ms: e.durationMs,
        tools: toolsTurno,
      }
      await update($, pedidos, l => [...l, p].slice(-50))
    }
    return r
  })

  on('session.measure', async ($, e, next) => {
    await update($, medida, () => ({
      tokens: e.context.tokens,
      window: e.context.window,
      percent: e.context.percent,
      usd: e.cost?.usd,
      limits: e.rateLimits.map(r => ({ kind: r.kind, percentUsed: r.percentUsed, resetsAt: r.resetsAt })),
    }))
    return next(e)
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    const lista = await read($, pedidos)
    const tools = await read($, herramientas)
    const nErr = await read($, errores)
    const m = await read($, medida)
    const t0 = await read($, inicio)
    const t = await read($, ahora)

    const ultimo = lista[lista.length - 1]
    const sumIn = lista.reduce((a, p) => a + totalIn(p), 0)
    const sumOut = lista.reduce((a, p) => a + p.output, 0)
    const sumCache = lista.reduce((a, p) => a + p.cacheRead, 0)
    const cachePct = sumIn > 0 ? Math.round((sumCache / sumIn) * 100) : 0
    const nTools = Object.values(tools).reduce((a, n) => a + n, 0)
    const top = Object.entries(tools).sort((a, b) => b[1] - a[1]).slice(0, 5)
    const pct = m?.percent ?? 0
    const libres = m && m.tokens !== undefined ? m.window - m.tokens : undefined
    const avgMs = lista.length ? lista.reduce((a, p) => a + p.ms, 0) / lista.length : 0
    const caro = lista.length ? Math.max(...lista.map(p => totalIn(p) + p.output)) : 0

    const T = (s: string) => <Text bold color="cyan">{s}</Text>

    return (
      <Box flexDirection="column">
        {T('1 · Tokens por pedido')}
        {ultimo ? (
          <Box flexDirection="column">
            <Text>Último: {k(totalIn(ultimo))} entrada · {k(ultimo.output)} salida</Text>
            <Text dimColor>  (sin caché {k(ultimo.input)} · caché leída {k(ultimo.cacheRead)} · escrita {k(ultimo.cacheWrite)})</Text>
            {lista.slice(-5).reverse().map((p, i) => (
              <Text dimColor>  #{lista.length - i}: {k(totalIn(p) + p.output)} tok · {p.tools} herr · {(p.ms / 1000).toFixed(1)}s</Text>
            ))}
          </Box>
        ) : (
          <Text dimColor>Aún sin pedidos completados.</Text>
        )}

        {T('2 · Contexto')}
        {m && m.percent !== undefined ? (
          <Box flexDirection="column">
            <Text color={semaforo(pct)}>{barra(pct)} {pct}%</Text>
            <Text dimColor>{k(m.tokens ?? 0)} / {k(m.window)} · libres {k(libres ?? 0)}</Text>
          </Box>
        ) : (
          <Text dimColor>Sin lectura todavía{m ? ` (ventana ${k(m.window)})` : ''}.</Text>
        )}

        {T('3 · Herramientas')}
        <Text>{nTools} llamadas · {nErr} con error</Text>
        {top.map(([n, c]) => <Text dimColor>  {n}: {c}</Text>)}

        {T('4 · Tiempo de sesión')}
        <Text>{t0 && t ? reloj(t - t0) : '—'} · {lista.length} pedidos · media {(avgMs / 1000).toFixed(1)}s/pedido</Text>

        {T('5 · Costo')}
        <Text>{m?.usd !== undefined ? `US$ ${m.usd.toFixed(4)}` : 'Sin registro de costo'}{lista.length && m?.usd !== undefined ? ` · US$ ${(m.usd / lista.length).toFixed(4)}/pedido` : ''}</Text>

        {T('6 · Límites de uso')}
        {m && m.limits.length ? (
          m.limits.map(l => (
            <Text color={semaforo(l.percentUsed)}>{l.kind}: {barra(l.percentUsed, 12)} {l.percentUsed}%{l.resetsAt ? ` · reinicia ${l.resetsAt.slice(11, 16)}` : ''}</Text>
          ))
        ) : (
          <Text dimColor>Sin datos (solo en suscripción).</Text>
        )}

        {T('7 · Eficiencia de caché')}
        <Text color={cachePct >= 70 ? 'green' : cachePct >= 40 ? 'yellow' : 'red'}>{cachePct}% de la entrada servida desde caché</Text>

        {T('8 · Totales')}
        <Text>{k(sumIn)} entrada · {k(sumOut)} salida · pedido más caro {k(caro)}</Text>
      </Box>
    )
  })
}
