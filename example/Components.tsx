// import { Registered } from '../../src'
import app, { tracker } from './app'

import { GlobalState } from 'reapex'
import React from 'react'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { select } from 'redux-saga/effects'

const CounterModel = app.model('Counter', { total: 0 })

export const [mutations, actionTypes] = CounterModel.mutations({
  increase: (num = 1) => s => s.set('total', s.total + num),
  decrease: (num = 1) => s => s.set('total', s.total - num),
})

const CounterComponent: React.FC<ReturnType<typeof mapStateToProps> &
  typeof mutations> = props => {
  return (
    <div>
      <button onClick={() => props.decrease(1)}>-</button>
      {props.total}
      <button onClick={() => props.increase(2)}>+</button>
    </div>
  )
}

const mapStateToProps = createStructuredSelector(CounterModel.selectors)

export const Counter = connect(mapStateToProps, mutations)(CounterComponent)

tracker.applyDataModifier(() => {
  return { client: 'Web' }
})

tracker.applyDataModifier(function*() {
  const total = yield select(CounterModel.selectors.total)
  return { total }
})

tracker.track({
  [actionTypes.decrease]: function(
    action: ReturnType<typeof mutations.decrease>,
    beforeState: GlobalState,
    afterState: GlobalState
  ) {
    console.log('beforeState: ', beforeState.toJS())
    console.log('afterState: ', afterState.toJS())
    const [num] = action.payload
    return {
      key: actionTypes.decrease,
      data: { num },
    }
  },
  [actionTypes.increase]: function(
    action: ReturnType<typeof mutations.increase>,
    beforeState: GlobalState,
    afterState: GlobalState
  ) {
    console.log('beforeState: ', beforeState.toJS())
    console.log('afterState: ', afterState.toJS())
    const [num] = action.payload
    return {
      key: actionTypes.increase,
      data: { num },
    }
  },
})
