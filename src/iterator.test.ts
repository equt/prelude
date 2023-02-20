import { IterableExt, once, range } from './iterator'

describe('IteratorExt', () => {
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

  it('should chain', () => {
    const iter = IterableExt.from([1, 2, 3])
    const chained = iter.chain([4, 5, 6])
    expect(chained.next().value).toBe(1)
    expect(chained.next().value).toBe(2)
    expect(chained.next().value).toBe(3)
    expect(chained.next().value).toBe(4)
    expect(chained.next().value).toBe(5)
    expect(chained.next().value).toBe(6)
    expect(chained.next().done).toBe(true)
  })

  it('should chunks', () => {
    const iter = IterableExt.from([1, 2, 3, 4, 5])
    const chunks = iter.chunks(2)
    expect(chunks.next().value).toEqual([1, 2])
    expect(chunks.next().value).toEqual([3, 4])
    expect(chunks.next().value).toEqual([5])
    expect(chunks.next().done).toBe(true)
  })

  it('should cycle', () => {
    const iter = IterableExt.from([1, 2, 3]).cycle()
    expect(iter.next().value).toBe(1)
    expect(iter.next().value).toBe(2)
    expect(iter.next().value).toBe(3)
    expect(iter.next().value).toBe(1)
  })

  it('should to array', () => {
    const iter = IterableExt.from([1, 2, 3])
    expect(iter.toArray()).toEqual([1, 2, 3])
  })

  it('should count', () => {
    const iter = IterableExt.from([1, 2, 3])
    expect(iter.count()).toBe(3)
  })

  it('should drop', () => {
    const iter = IterableExt.from([1, 2, 3])
    const dropped = iter.drop(2)
    expect(dropped.next().value).toBe(3)
    expect(dropped.next().done).toBe(true)
  })

  it('should drop while', () => {
    const iter = IterableExt.from([1, 2, 3])
    const dropped = iter.dropWhile(x => x < 3)
    expect(dropped.next().value).toBe(3)
    expect(dropped.next().done).toBe(true)
  })

  it('should every', () => {
    expect(IterableExt.from([1, 2, 3]).every(x => x > 0)).toBe(true)
    expect(IterableExt.from([1, 2, 3]).every(x => x > 1)).toBe(false)
  })

  it('should for each', () => {
    const iter = IterableExt.from([1, 2, 3])
    const result: number[] = []
    iter.forEach(x => result.push(x))
    expect(result).toEqual([1, 2, 3])
  })

  it('should filter', () => {
    const iter = IterableExt.from([1, 2, 3])
    const filtered = iter.filter(x => x > 1)
    expect(filtered.next().value).toBe(2)
    expect(filtered.next().value).toBe(3)
    expect(filtered.next().done).toBe(true)
  })

  it('should filter map', () => {
    const iter = IterableExt.from([1, 2, 3])
    const filtered = iter.filterMap(x => (x > 1 ? x * 2 : null))
    expect(filtered.next().value).toBe(4)
    expect(filtered.next().value).toBe(6)
    expect(filtered.next().done).toBe(true)
  })

  it('should find', () => {
    expect(IterableExt.from([1, 2, 3]).find(x => x > 2)).toBe(3)
    expect(IterableExt.from([1, 2, 3]).find(x => x > 3)).toBeNull()
  })

  it('should find map', () => {
    expect(
      IterableExt.from([1, 2, 3]).findMap(x => (x > 2 ? x * 2 : null)),
    ).toBe(6)
    expect(
      IterableExt.from([1, 2, 3]).findMap(x => (x > 3 ? x * 2 : null)),
    ).toBeNull()
  })

  it('should intersperse', () => {
    const iter = IterableExt.from([1, 2, 3])
    const interspersed = iter.intersperse(0)
    expect(interspersed.next().value).toBe(1)
    expect(interspersed.next().value).toBe(0)
    expect(interspersed.next().value).toBe(2)
    expect(interspersed.next().value).toBe(0)
    expect(interspersed.next().value).toBe(3)
    expect(interspersed.next().done).toBe(true)
  })

  it('should join', () => {
    const iter = IterableExt.from(['1', '2', '3'])
    expect(iter.join(', ')).toBe('1, 2, 3')
  })

  it('should map', () => {
    const iter = IterableExt.from([1, 2, 3])
    const mapped = iter.map(x => x * 2)
    expect(mapped.next().value).toBe(2)
    expect(mapped.next().value).toBe(4)
    expect(mapped.next().value).toBe(6)
    expect(mapped.next().done).toBe(true)
  })

  it('should map while', () => {
    let iter = IterableExt.from([1, 2, 3]).mapWhile(x => (x < 3 ? x * 2 : null))
    expect(iter.next().value).toBe(2)
    expect(iter.next().value).toBe(4)
    expect(iter.next().done).toBe(true)

    iter = IterableExt.from([]).mapWhile(x => (x < 3 ? x * 2 : null))
    expect(iter.next().done).toBe(true)
  })

  it('should reduce', () => {
    const iter = IterableExt.from([1, 2, 3])
    const reduced = iter.reduce((acc, x) => acc + x, 0)
    expect(reduced).toBe(6)
  })

  it('should some', () => {
    expect(IterableExt.from([1, 2, 3]).some(x => x > 2)).toBe(true)
    expect(IterableExt.from([1, 2, 3]).some(x => x > 3)).toBe(false)
  })

  it('should take', () => {
    const iter = IterableExt.from([1, 2, 3])
    const taken = iter.take(2)
    expect(taken.next().value).toBe(1)
    expect(taken.next().value).toBe(2)
    expect(taken.next().done).toBe(true)
  })

  it('should take while', () => {
    const iter = IterableExt.from([1, 2, 3])
    const taken = iter.takeWhile(x => x < 3)
    expect(taken.next().value).toBe(1)
    expect(taken.next().value).toBe(2)
    expect(taken.next().done).toBe(true)
  })

  it('should window', () => {
    let iter = IterableExt.from([1, 2, 3, 4]).windows(3)
    expect(iter.next().value).toEqual([1, 2, 3])
    expect(iter.next().value).toEqual([2, 3, 4])
    expect(iter.next().done).toBe(true)

    iter = IterableExt.from([1, 2]).windows(3)
    expect(iter.next().done).toBe(true)
  })

  it('should zip', () => {
    const iter = IterableExt.from([1, 2, 3])
    const zipped = iter.zip([4, 5, 6])
    expect(zipped.next().value).toEqual([1, 4])
    expect(zipped.next().value).toEqual([2, 5])
    expect(zipped.next().value).toEqual([3, 6])
    expect(zipped.next().done).toBe(true)
  })

  it('should zip with', () => {
    const iter = IterableExt.from([1, 2, 3])
    const zipped = iter.zipWith([4, 5, 6], (a, b) => a + b)
    expect(zipped.next().value).toBe(5)
    expect(zipped.next().value).toBe(7)
    expect(zipped.next().value).toBe(9)
    expect(zipped.next().done).toBe(true)
  })

  it('should contain only one', () => {
    const iter = once(1)
    expect(iter.next().value).toBe(1)
    expect(iter.next().done).toBe(true)
  })

  it('should range over', () => {
    const iter = range(1, 4)
    expect(iter.next().value).toBe(1)
    expect(iter.next().value).toBe(2)
    expect(iter.next().value).toBe(3)
    expect(iter.next().done).toBe(true)
  })
})
