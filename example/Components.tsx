// import { Registered } from '../../src'
import app, { tracker } from './app'

import { GlobalState } from 'reapex'
import React from 'react'
import { select } from 'redux-saga/effects'

const CounterModel = app.model('Counter', { total: 0 })

export const [mutations, actionTypes] = CounterModel.mutations({
  increase: (num = 1) => (s) => ({ ...s, total: s.total + num }),
  decrease: (num = 1) => (s) => ({ ...s, total: s.total - num }),
})

export const Counter: React.FC = () => {
  const total = CounterModel.useState((s) => s.total)

  return (
    <div>
      <button onClick={() => mutations.decrease(1)}>-</button>
      {total}
      <button onClick={() => mutations.increase(2)}>+</button>
    </div>
  )
}

tracker.applyDataModifier(() => {
  return { client: 'Web' }
})

tracker.applyDataModifier(function* () {
  const total = yield select(CounterModel.selectors.total)
  return { total }
})

tracker.track({
  [actionTypes.decrease]: function (
    action: ReturnType<typeof mutations.decrease>,
    beforeState: GlobalState,
    afterState: GlobalState
  ) {
    console.log('beforeState: ', beforeState)
    console.log('afterState: ', afterState)
    const [num] = action.payload
    return {
      key: actionTypes.decrease,
      data: { num },
    }
  },
  [actionTypes.increase]: function (
    action: ReturnType<typeof mutations.increase>,
    beforeState: GlobalState,
    afterState: GlobalState
  ) {
    console.log('beforeState: ', beforeState)
    console.log('afterState: ', afterState)
    const [num] = action.payload
    return {
      key: actionTypes.increase,
      data: { num },
    }
  },
})
