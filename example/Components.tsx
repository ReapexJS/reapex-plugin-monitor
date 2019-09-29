// import { Registered } from '../../src'
import app, {tracker} from './app'

import React from 'react'
import {connect} from 'react-redux';
import {createStructuredSelector} from 'reselect'

const CounterModel = app.model('Counter', { total: 0 })

export const [mutations, actionTypes] = CounterModel.mutations({
  increase: (num = 1) => s => s.set('total', s.total + num),
  decrease: (num = 1) => s => s.set('total', s.total - num),
})

const CounterComponent: React.FC<ReturnType<typeof mapStateToProps> & typeof mutations> = props => {
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


tracker.track({
  [actionTypes.decrease]: function(action: ReturnType<typeof mutations.decrease>, beforeState: any, afterState: any) {
    console.log('beforeState: ', beforeState.toJS())
    console.log('afterState: ', afterState.toJS())
    const total = CounterModel.selectors.total(afterState)
    const [num] = action.payload
    return {
      key: actionTypes.decrease,
      data: { total, num },
    }
  },
  [actionTypes.increase]: function(action: ReturnType<typeof mutations.increase>, beforeState: any, afterState: any) {
    console.log('beforeState: ', beforeState.toJS())
    console.log('afterState: ', afterState.toJS())
    const total = CounterModel.selectors.total(afterState)
    const [num] = action.payload
    return {
      key: actionTypes.increase,
      data: { total, num },
    }
  }
})

