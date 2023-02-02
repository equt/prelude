import '../src'

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

it('Array.prototype.inspect', () => {
  const accumulator: Array<number> = []
  ;[42, 0].inspect(n => accumulator.push(n))
  expect(accumulator).toEqual([42, 0])
})

it('Array.prototype.intersperse', () => {
  expect([42, 42, 42, 42].intersperse(0)).toEqual([42, 0, 42, 0, 42, 0, 42])
  expect(([] as Array<number>).intersperse(0)).toEqual([])
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
