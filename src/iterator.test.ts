import 'jest-extended'
import { Nullable } from '.'
import { IterableExt, once, range } from './iterator'

describe('IteratorExt', () => {
  it('should chain', () => {
    let iter: IterableExt<number>

    iter = IterableExt.from([1, 2, 3]).chain([4, 5, 6])
    expect(iter.next().value).toBe(1)
    expect(iter.next().value).toBe(2)
    expect(iter.next().value).toBe(3)
    expect(iter.next().value).toBe(4)
    expect(iter.next().value).toBe(5)
    expect(iter.next().value).toBe(6)
    expect(iter.next().done).toBeTrue()

    iter = IterableExt.from([]).chain([])
    expect(iter.next().done).toBeTrue()

    iter = IterableExt.from<number>([]).chain(
      (function* () {
        yield 1
      })(),
    )
    expect(iter.next().value).toBe(1)
    expect(iter.next().done).toBeTrue()
  })

  it('should chunks', () => {
    let iter: IterableExt<Array<number>>

    iter = IterableExt.from([1, 2, 3, 4, 5]).chunks(2)
    expect(iter.next().value).toEqual([1, 2])
    expect(iter.next().value).toEqual([3, 4])
    expect(iter.next().value).toEqual([5])
    expect(iter.next().done).toBeTrue()

    iter = IterableExt.from([1, 2, 3, 4, 5]).chunks(3)
    expect(iter.next().value).toEqual([1, 2, 3])
    expect(iter.next().value).toEqual([4, 5])
    expect(iter.next().done).toBeTrue()
  })

  it('should cycle', () => {
    let iter: IterableExt<number>

    iter = IterableExt.from([1, 2, 3]).cycle()
    expect(iter.next().value).toBe(1)
    expect(iter.next().value).toBe(2)
    expect(iter.next().value).toBe(3)
    expect(iter.next().value).toBe(1)

    iter = IterableExt.from([]).cycle()
    expect(iter.next().done).toBeTrue()
  })

  it('should to array', () => {
    let iter: IterableExt<number>

    iter = IterableExt.from([1, 2, 3])
    expect(iter.toArray()).toEqual([1, 2, 3])

    iter = IterableExt.from([])
    expect(iter.toArray()).toEqual([])
  })

  it('should count', () => {
    let iter: IterableExt<number>

    iter = IterableExt.from([1, 2, 3])
    expect(iter.count()).toBe(3)

    iter = IterableExt.from([])
    expect(iter.count()).toBe(0)
  })

  it('should drop', () => {
    let iter: IterableExt<number>

    iter = IterableExt.from([1, 2, 3]).drop(2)
    expect(iter.next().value).toBe(3)
    expect(iter.next().done).toBeTrue()

    iter = IterableExt.from([1, 2, 3]).drop(3)
    expect(iter.next().done).toBeTrue()

    iter = IterableExt.from([]).drop(1)
    expect(iter.next().done).toBeTrue()
  })

  it('should drop while', () => {
    let iter: IterableExt<number>

    iter = IterableExt.from([1, 2, 3]).dropWhile(x => x < 3)
    expect(iter.next().done).toBeTrue()

    iter = IterableExt.from([1, 2, 3]).dropWhile(x => x < 2)
    expect(iter.next().value).toBe(3)
    expect(iter.next().done).toBeTrue()

    iter = IterableExt.from([]).dropWhile(x => x < 4)
    expect(iter.next().done).toBeTrue()
  })

  it('should every', () => {
    expect(IterableExt.from([1, 2, 3]).every(x => x > 0)).toBeTrue()
    expect(IterableExt.from([1, 2, 3]).every(x => x > 1)).toBe(false)
    expect(IterableExt.from([]).every(x => x > 1)).toBeTrue()
  })

  it('should for each', () => {
    const iter = IterableExt.from([1, 2, 3])
    const result: number[] = []
    iter.forEach(x => result.push(x))
    expect(result).toEqual([1, 2, 3])
  })

  it('should filter', () => {
    let iter: IterableExt<number>

    iter = IterableExt.from([1, 2, 3]).filter(x => x > 1)
    expect(iter.next().value).toBe(2)
    expect(iter.next().value).toBe(3)
    expect(iter.next().done).toBeTrue()

    iter = IterableExt.from([1, 2, 3]).filter(x => x > 3)
    expect(iter.next().done).toBeTrue()
  })

  it('should filter map', () => {
    let iter: IterableExt<number>

    iter = IterableExt.from([1, 2, 3, -1, 2]).filterMap(x =>
      x > 1 ? x * 2 : null,
    )
    expect(iter.next().value).toBe(4)
    expect(iter.next().value).toBe(6)
    expect(iter.next().value).toBe(4)
    expect(iter.next().done).toBeTrue()

    iter = IterableExt.from([1, 2, 3]).filterMap(x => (x > 3 ? x * 2 : null))
    expect(iter.next().done).toBeTrue()
  })

  it('should find', () => {
    let found: Nullable<number>, origin: IterableExt<number>

    origin = IterableExt.from([1, 2, 3])
    found = origin.find(x => x === 2)
    expect(found).toBe(2)
    expect(origin.next().value).toBe(3)
    expect(origin.next().done).toBeTrue()

    origin = IterableExt.from([1, 2, 3])
    found = origin.find(x => x === 4)
    expect(found).toBeNil()
    expect(origin.next().done).toBeTrue()

    origin = IterableExt.from([])
    found = origin.find(x => x === 4)
    expect(found).toBeNil()
    expect(origin.next().done).toBeTrue()
  })

  it('should find map', () => {
    let found: Nullable<number>, origin: IterableExt<number>

    origin = IterableExt.from([1, 2, 3])
    found = origin.findMap(x => (x === 2 ? x * 2 : null))
    expect(found).toBe(4)
    expect(origin.next().value).toBe(3)
    expect(origin.next().done).toBeTrue()

    origin = IterableExt.from([1, 2, 3])
    found = origin.findMap(x => (x === 4 ? x * 2 : null))
    expect(found).toBeNil()
    expect(origin.next().done).toBeTrue()

    origin = IterableExt.from([])
    found = origin.findMap(x => (x === 4 ? x * 2 : null))
    expect(found).toBeNil()
    expect(origin.next().done).toBeTrue()
  })

  it('should flat map', () => {
    let iter: IterableExt<number>

    iter = IterableExt.from([1, 2, 3]).flatMap(x => [x, x * 2])
    expect(iter.next().value).toBe(1)
    expect(iter.next().value).toBe(2)
    expect(iter.next().value).toBe(2)
    expect(iter.next().value).toBe(4)
    expect(iter.next().value).toBe(3)
    expect(iter.next().value).toBe(6)
    expect(iter.next().done).toBeTrue()

    iter = IterableExt.from([]).flatMap(x => [x, x * 2])
    expect(iter.next().done).toBeTrue()
  })

  it('should intersperse', () => {
    let iter: IterableExt<number>

    iter = IterableExt.from([1, 2, 3]).intersperse(0)
    expect(iter.next().value).toBe(1)
    expect(iter.next().value).toBe(0)
    expect(iter.next().value).toBe(2)
    expect(iter.next().value).toBe(0)
    expect(iter.next().value).toBe(3)
    expect(iter.next().done).toBeTrue()

    iter = IterableExt.from<number>([]).intersperse(0)
    expect(iter.next().done).toBeTrue()
  })

  it('should join', () => {
    expect(IterableExt.from(['1', '2', '3']).join(', ')).toBe('1, 2, 3')
    expect(IterableExt.from([]).join(', ')).toBe('')
  })

  it('should map', () => {
    let iter: IterableExt<number>

    iter = IterableExt.from([1, 2, 3]).map(x => x * 2)
    expect(iter.next().value).toBe(2)
    expect(iter.next().value).toBe(4)
    expect(iter.next().value).toBe(6)
    expect(iter.next().done).toBeTrue()

    iter = IterableExt.from([]).map(x => x * 2)
    expect(iter.next().done).toBeTrue()
  })

  it('should map while', () => {
    let iter: IterableExt<number>, origin: IterableExt<number>

    origin = IterableExt.from([1, 2, 3, 4])
    iter = origin.mapWhile(x => (x < 3 ? x * 2 : null))
    expect(iter.next().value).toBe(2)
    expect(iter.next().value).toBe(4)
    expect(iter.next().done).toBeTrue()
    expect(origin.next().value).toBe(4)
    expect(origin.next().done).toBeTrue()

    origin = IterableExt.from([])
    iter = origin.mapWhile(x => (x < 3 ? x * 2 : null))
    expect(iter.next().done).toBeTrue()
    expect(origin.next().done).toBeTrue()
  })

  it('should reduce', () => {
    expect(IterableExt.from([1, 2, 3]).reduce((acc, x) => acc + x, 0)).toBe(6)
    expect(IterableExt.from([]).reduce((acc, x) => acc + x, 0)).toBe(0)
  })

  it('should some', () => {
    expect(IterableExt.from([1, 2, 3]).some(x => x > 2)).toBeTrue()
    expect(IterableExt.from([1, 2, 3]).some(x => x > 3)).toBe(false)
    expect(IterableExt.from([]).some(x => x > 3)).toBe(false)
  })

  it('should take', () => {
    let origin: IterableExt<number>, iter: IterableExt<number>

    origin = IterableExt.from([1, 2, 3])
    iter = origin.take(2)
    expect(iter.next().value).toBe(1)
    expect(iter.next().value).toBe(2)
    expect(iter.next().done).toBeTrue()
    expect(origin.next().value).toBe(3)
    expect(origin.next().done).toBeTrue()

    origin = IterableExt.from([])
    iter = origin.take(2)
    expect(iter.next().done).toBeTrue()
    expect(origin.next().done).toBeTrue()
  })

  it('should take while', () => {
    let origin: IterableExt<number>, iter: IterableExt<number>

    origin = IterableExt.from([1, 2, 3, 4, 5])
    iter = origin.takeWhile(x => x < 3)
    expect(iter.next().value).toBe(1)
    expect(iter.next().value).toBe(2)
    expect(iter.next().done).toBeTrue()
    expect(origin.next().value).toBe(4)
    expect(origin.next().value).toBe(5)
    expect(origin.next().done).toBeTrue()

    origin = IterableExt.from([])
    iter = origin.takeWhile(x => x < 3)
    expect(iter.next().done).toBeTrue()
    expect(origin.next().done).toBeTrue()
  })

  it('should tap', () => {
    const cache: number[] = []

    const iter = IterableExt.from([1, 2, 3]).tap(x => cache.push(x))
    expect(iter.next().value).toBe(1)
    expect(iter.next().value).toBe(2)
    expect(iter.next().value).toBe(3)
    expect(iter.next().done).toBeTrue()
    expect(cache).toEqual([1, 2, 3])
  })

  it('should window', () => {
    let iter = IterableExt.from([1, 2, 3, 4]).windows(3)
    expect(iter.next().value).toEqual([1, 2, 3])
    expect(iter.next().value).toEqual([2, 3, 4])
    expect(iter.next().done).toBeTrue()

    iter = IterableExt.from([1, 2, 3, 4]).windows(1)
    expect(iter.next().value).toEqual([1])
    expect(iter.next().value).toEqual([2])
    expect(iter.next().value).toEqual([3])
    expect(iter.next().value).toEqual([4])
    expect(iter.next().done).toBeTrue()

    iter = IterableExt.from([1, 2]).windows(3)
    expect(iter.next().done).toBeTrue()
  })

  it('should zip', () => {
    let iter: IterableExt<[number, number]>

    iter = IterableExt.from([1, 2, 3]).zip([4, 5, 6])
    expect(iter.next().value).toEqual([1, 4])
    expect(iter.next().value).toEqual([2, 5])
    expect(iter.next().value).toEqual([3, 6])
    expect(iter.next().done).toBeTrue()

    const origin = IterableExt.from([1, 2, 3, 4])
    iter = origin.zip([4, 5])
    expect(iter.next().value).toEqual([1, 4])
    expect(iter.next().value).toEqual([2, 5])
    expect(iter.next().done).toBeTrue()
    expect(origin.next().value).toBe(4)
    expect(origin.next().done).toBeTrue()
  })

  it('should zip with', () => {
    let iter: IterableExt<number>

    iter = IterableExt.from([1, 2, 3]).zipWith([4, 5, 6], (a, b) => a + b)
    expect(iter.next().value).toBe(5)
    expect(iter.next().value).toBe(7)
    expect(iter.next().value).toBe(9)
    expect(iter.next().done).toBeTrue()

    const origin = IterableExt.from([1, 2, 3, 4])
    iter = origin.zipWith([4, 5], (a, b) => a + b)
    expect(iter.next().value).toBe(5)
    expect(iter.next().value).toBe(7)
    expect(iter.next().done).toBeTrue()
    expect(origin.next().value).toBe(4)
    expect(origin.next().done).toBeTrue()
  })

  it('should contain only one', () => {
    const iter = once(1)
    expect(iter.next().value).toBe(1)
    expect(iter.next().done).toBeTrue()
  })

  it('should range over', () => {
    const iter = range(1, 4)
    expect(iter.next().value).toBe(1)
    expect(iter.next().value).toBe(2)
    expect(iter.next().value).toBe(3)
    expect(iter.next().done).toBeTrue()
  })

  it('should be lazy', () => {
    const iter = IterableExt.from([
      () => 1,
      () => 2,
      () => {
        throw new Error()
      },
    ]).map(f => f())

    expect(iter.next().value).toBe(1)
    expect(iter.next().value).toBe(2)
  })

  it('could be built from iterator', () => {
    expect(
      IterableExt.from({
        next() {
          return { done: true, value: null }
        },
      }).count(),
    ).toBe(0)
  })

  it('could be built from array', () => {
    expect(IterableExt.from([1, 2, 3]).count()).toBe(3)
  })

  it('could be built from iterable', () => {
    expect(
      IterableExt.from({
        *[Symbol.iterator]() {
          yield 1
        },
      }).count(),
    ).toBe(1)
  })
})
