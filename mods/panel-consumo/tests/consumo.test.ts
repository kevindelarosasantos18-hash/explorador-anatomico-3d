import { expect, test } from 'claude-code/testing'

import { barra, k, reloj } from '../hooks/register'

test('formatea tokens, tiempo y barra de contexto', async () => {
  expect(k(950)).toBe('950')
  expect(k(12_345)).toBe('12.3k')
  expect(k(2_500_000)).toBe('2.5M')
  expect(reloj(65_000)).toBe('01m 05s')
  expect(reloj(3_725_000)).toBe('1h 02m 05s')
  expect(barra(50, 10)).toBe('█████░░░░░')
  expect(barra(150, 4)).toBe('████')
})
