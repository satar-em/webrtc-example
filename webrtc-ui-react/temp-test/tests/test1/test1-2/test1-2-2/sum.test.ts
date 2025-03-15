import { expect, test } from 'vitest'
import { sum } from './sum'

test('adds 5 + 9 to equal 14', () => {
    expect(sum(5, 9)).toBe(14)
})