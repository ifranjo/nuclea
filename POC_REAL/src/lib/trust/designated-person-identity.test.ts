import assert from 'node:assert/strict'
import test from 'node:test'
import { canAssignDesignatedPerson } from './designated-person-identity'

test('canAssignDesignatedPerson allows different user', () => {
  const result = canAssignDesignatedPerson('owner-1', 'contact-1')
  assert.equal(result.ok, true)
})

test('canAssignDesignatedPerson blocks missing contact account', () => {
  const result = canAssignDesignatedPerson('owner-1', null)
  assert.equal(result.ok, false)
  assert.match(result.reason || '', /cuenta NUCLEA/i)
})

test('canAssignDesignatedPerson blocks owner self-assignment', () => {
  const result = canAssignDesignatedPerson('owner-1', 'owner-1')
  assert.equal(result.ok, false)
  assert.match(result.reason || '', /ti mismo/i)
})
