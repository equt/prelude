import '../src'

it('absurd', () => {
  const v = 'a' as const
  switch (v) {
    case 'a':
      break
    default:
      absurd(v)
  }

  expect(() => absurd(42 as unknown as never)).toThrow()
})

it('unreachable', () => {
  expect(() => unreachable()).toThrow()
  expect(() => unreachable('42')).toThrow('42')
})

it('todo', () => {
  expect(() => todo()).toThrow()
  expect(() => todo('42')).toThrow('42')
})

it('debug', () => {
  const log = globalThis.console.log
  const fake = jest.fn()
  globalThis.console.log = fake
  expect(debug(42)).toEqual(42)
  expect(fake).toBeCalledWith(42)
  globalThis.console.log = log
})

it('range', () => {
  expect(range(0, 3)).toEqual([0, 1, 2])
  expect(range(0, 0)).toEqual([])
  expect(range(0.1, 3.1)).toEqual([0, 1, 2])
})

it('isNullable', () => {
  expect(isNullable(undefined)).toBeTruthy()
  expect(isNullable(null)).toBeTruthy()
  expect(isNullable(0)).toBeFalsy()
})

it('isNonNullable', () => {
  expect(isNonNullable(undefined)).toBeFalsy()
  expect(isNonNullable(null)).toBeFalsy()
  expect(isNonNullable(0)).toBeTruthy()
})

it('Array.prototype.exact', () => {
  expect([42].exact()).toEqual(42)
  expect(() => [42, 42].exact()).toThrow()
})

it('Array.prototype.extends', () => {
  const origin = [42]
  expect(origin.extends(0)).toEqual([42, 0])
  expect(origin).toEqual([42])
})

it('Array.prototype.copy', () => {
  const origin = [42, 42],
    copy = origin.copy()
  expect(copy).toEqual([42, 42])
  copy.push(0)
  expect(origin).toEqual([42, 42])
  expect(copy).toEqual([42, 42, 0])
})

it('Array.prototype.chain', () => {
  const lhs = [42],
    rhs = [0]
  expect([42].chain([0])).toEqual([42, 0])
  expect(lhs).toEqual([42])
  expect(rhs).toEqual([0])
})

it('Array.prototype.chunks', () => {
  expect([42, 42, 42, 42].chunks(2)).toEqual([
    [42, 42],
    [42, 42],
  ])
  expect([41, 42, 43].chunks(2)).toEqual([[41, 42], [43]])
  expect([42].chunks(2)).toEqual([[42]])
  expect([].chunks(2)).toEqual([])
})

it('Array.prototype.filterMap', () => {
  expect([42, -42].filterMap(n => (n >= 0 ? n : undefined))).toEqual([42])
  expect([42, -42].filterMap(n => (n >= 0 ? n : undefined))).toEqual([42])
})

it('Array.prototype.findMap', () => {
  expect([0, 42].findMap(n => (n >= 42 ? n : undefined))).toEqual(42)
  expect([0, 0].findMap(n => (n >= 42 ? n : undefined))).toEqual(undefined)
  expect([0, 42, 84].findMap(n => (n >= 42 ? n : undefined))).toEqual(42)
})

it('Array.prototype.group', () => {
  expect([42, 42, 42, 0, 0].group((a, b) => a === b)).toEqual([
    [42, 42, 42],
    [0, 0],
  ])
  expect([42, 42, 42, 0, 0, 42].group((a, b) => a === b)).toEqual([
    [42, 42, 42],
    [0, 0],
    [42],
  ])
  expect([].group((a, b) => a === b)).toEqual([])
})

it('Array.prototype.inspect', () => {
  const accumulator: Array<number> = []
  ;[42, 0].inspect(n => accumulator.push(n))
  expect(accumulator).toEqual([42, 0])
})

it('Array.prototype.intersperse', () => {
  expect([42, 42, 42, 42].intersperse(0)).toEqual([42, 0, 42, 0, 42, 0, 42])
  expect(([] as Array<number>).intersperse(0)).toEqual([])
})

it('Array.prototype.mapWhile', () => {
  expect(
    [0, 0, 0, 42].mapWhile(n => (n + 42 === 42 ? true : undefined)),
  ).toEqual([true, true, true])
  expect(
    [0, 0, 0, 42, 0].mapWhile(n => (n + 42 === 42 ? true : undefined)),
  ).toEqual([true, true, true])
  expect([].mapWhile(n => (n + 42 === 42 ? true : undefined))).toEqual([])
})

it('Array.prototype.product', () => {
  expect([1, 2, 3].product([4, 5, 6])).toEqual([
    [1, 4],
    [1, 5],
    [1, 6],
    [2, 4],
    [2, 5],
    [2, 6],
    [3, 4],
    [3, 5],
    [3, 6],
  ])
})

it('Array.prototype.takeWhile', () => {
  expect([42, 42, 42, 0].takeWhile(n => n === 42)).toEqual([42, 42, 42])
  expect([42, 42, 42, 0, 42].takeWhile(n => n === 42)).toEqual([42, 42, 42])
  expect([].takeWhile(n => n === 42)).toEqual([])
})

it('Array.prototype.windows', () => {
  expect([0, 42, 21, 10.5].windows(2)).toEqual([
    [0, 42],
    [42, 21],
    [21, 10.5],
  ])
  expect([0, 42, 21, 10.5].windows(3)).toEqual([
    [0, 42, 21],
    [42, 21, 10.5],
  ])
  expect([0, 42].windows(2)).toEqual([[0, 42]])
  expect([0].windows(2)).toEqual([])
})

it('Array.prototype.zipWith', () => {
  expect([42, 42, 42].zipWith([0, 0, 0], (a, b) => a + b)).toEqual([42, 42, 42])
  expect([42, 42, 42].zipWith([0, 0], (a, b) => a + b)).toEqual([42, 42])
  expect([42, 42].zipWith([0, 0, 0], (a, b) => a + b)).toEqual([42, 42])
})

it('Array.prototype.zip', () => {
  expect([42, 42, 42].zip([0, 0, 0])).toEqual([
    [42, 0],
    [42, 0],
    [42, 0],
  ])
  expect([42, 42].zip([0, 0, 0])).toEqual([
    [42, 0],
    [42, 0],
  ])
  expect([42, 42, 42].zip([0, 0])).toEqual([
    [42, 0],
    [42, 0],
  ])
})
