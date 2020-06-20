import { Action, App, GlobalState } from 'reapex'
import { all, call, select, spawn, take } from 'redux-saga/effects'

export interface ModuleConfig {
  trackFunc: Function
  interval?: number
}

export type Data = {
  [key: string]: any
}

type Modifier = (
  data: Data,
  beforeState: GlobalState,
  afterState: GlobalState
) => Data
type MonitorFunc = (
  action: Action<string, any>,
  beforeState: GlobalState,
  afterState: GlobalState
) => Data

const monitorModule = (app: App, config: ModuleConfig) => {
  const bufferedData: Data[] = []
  const monitorMap: Record<string, MonitorFunc> = {}
  // The global data modifier which applied to every monitor data
  const dataModifiers: Modifier[] = []

  function* handleAction(
    action: Action<string, any>,
    beforeState: GlobalState,
    afterState: GlobalState
  ) {
    let trackData: Data = yield call(
      monitorMap[action.type],
      action,
      beforeState,
      afterState
    )

    const modifiersData: Data[] = yield all(
      dataModifiers.map(modifier =>
        call(modifier, trackData, beforeState, afterState)
      )
    )
    // merge with modifiers data
    modifiersData.forEach(data => {
      trackData = { ...trackData, ...data }
    })

    bufferedData.push(trackData)
  }

  setInterval(
    () => {
      if (bufferedData.length > 0) {
        config.trackFunc([...bufferedData])
        bufferedData.length = 0
      }
    },
    config.interval === undefined ? 3000 : config.interval
  )

  function* watcher() {
    while (true) {
      const beforeState = yield select()
      const action: Action<string, any> = yield take('*')
      const afterState = yield select()
      if (monitorMap[action.type]) {
        yield spawn(handleAction, action, beforeState, afterState)
      }
    }
  }

  function applyDataModifier(modifier: Modifier) {
    if (!dataModifiers.includes(modifier)) {
      dataModifiers.push(modifier)
    }
  }

  app.runSaga(watcher)

  return {
    track: (newTrackingMap: Record<string, MonitorFunc>) => {
      Object.keys(newTrackingMap).forEach(key => {
        monitorMap[key] = newTrackingMap[key]
      })
    },
    trackData: (trackData: any) => {
      bufferedData.push(trackData)
    },
    applyDataModifier,
  }
}

export default monitorModule
