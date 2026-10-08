export type Pedido = {
  input: number
  output: number
  cacheRead: number
  cacheWrite: number
  ms: number
  tools: number
}

export type Medida = {
  tokens?: number
  window: number
  percent?: number
  autoCompactAt?: number
  usd?: number
  limits: { kind: string; percentUsed: number; resetsAt?: string }[]
}

declare module 'claude-code' {
  interface PluginState {
    'panel-consumo': {
      pedidos: Pedido[]
      herramientas: Record<string, number>
      errores: number
      medida: Medida | null
      inicio: number
      ahora: number
    }
  }
}
