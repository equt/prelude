const ITERATOR = Symbol('ITERATOR')

export class IteratorExt<T, TReturn = unknown, TNext = undefined>
  implements Iterator<T, TReturn, TNext>
{
  [ITERATOR]: Iterator<T, TReturn, TNext>

  constructor(iterator: Iterator<T, TReturn, TNext>) {
    this[ITERATOR] = iterator
  }

  next(...args: [] | [TNext]): IteratorResult<T, TReturn> {
    return this[ITERATOR].next(...args)
  }
}
