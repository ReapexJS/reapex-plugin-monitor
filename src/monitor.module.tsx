import { Action, App, GlobalState, Saga } from 'reapex'
import { all, call, spawn, take } from 'redux-saga/effects'

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
  action: Action<any, any>,
  beforeState: GlobalState,
  afterState: GlobalState
) => Data | null

let intervalId = 0

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
    let trackData: Data | null = yield call(
      monitorMap[action.type],
      action,
      beforeState,
      afterState
    )

    if (trackData) {
      const modifiersData: Data[] = yield all(
        dataModifiers.map((modifier) =>
          call(modifier, trackData!, beforeState, afterState)
        )
      )
      // merge with modifiers data
      modifiersData.forEach((data) => {
        trackData = { ...trackData, ...data }
      })

      if (!config.interval) {
        config.trackFunc([trackData])
      } else {
        bufferedData.push(trackData)
      }
    }
  }

  if (config.interval) {
    window.clearInterval(intervalId)
    intervalId = window.setInterval(() => {
      if (bufferedData.length > 0) {
        config.trackFunc([...bufferedData])
        bufferedData.length = 0
      }
    }, config.interval)
  }

  function* watcher() {
    while (true) {
      const beforeState = app.store.getState()
      const action: Action<string, any> = yield take('*')
      const afterState = app.store.getState()
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

  app.runSaga(watcher as Saga)

  return {
    track: (newTrackingMap: Record<string, MonitorFunc>) => {
      Object.keys(newTrackingMap).forEach((key) => {
        monitorMap[key] = newTrackingMap[key]
      })
    },
    trackData: (trackData: any) => {
      if (!config.interval) {
        config.trackFunc([trackData])
      } else {
        bufferedData.push(trackData)
      }
    },
    applyDataModifier,
  }
}

export default monitorModule
