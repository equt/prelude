import 'jest-extended'
import { absurd, hole, isNullable, todo, unreachable } from '.'

it('should absurd', () => {
  expect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    absurd('foo')
  }).toThrowError('Absurd been called')
})

it('should hole', () => {
  expect<() => number>(() => hole()).toThrowError(
    'Compile time hole been called',
  )
})

it('should todo', () => {
  expect(() => todo('foo')).toThrowError('foo')
})

it('should unreachable', () => {
  expect(() => unreachable('foo')).toThrowError('foo')
})

it('is nullable', () => {
  expect(isNullable(42)).toBeFalse()
  expect(isNullable(null)).toBeTrue()
  expect(isNullable(undefined)).toBeTrue()
})

it('should be non nullable', () => {
  expect(isNullable(42)).toBeFalse()
  expect(isNullable(null)).toBeTrue()
  expect(isNullable(undefined)).toBeTrue()
})
