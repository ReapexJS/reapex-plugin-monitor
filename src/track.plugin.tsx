import { Action, App } from 'reapex'
import { all, call, select, spawn, take } from 'redux-saga/effects'

export interface PluginConfig {
  trackFunc: Function
  interval?: number
}

export type ModifierData = {
  [key: string]: any
}

type Modifier = (...args: any[]) => ModifierData

const plugin = (app: App, config: PluginConfig) => {
  const bufferedData: any[] = []
  const trackingMap: Record<string, any> = {}
  // The global data modifier which applied to every monitor data
  const dataModifiers: Modifier[] = []

  function* handleAction(action: Action<string, any>, beforeState: any, afterState: any) {
    let trackData = yield call(trackingMap[action.type], action, beforeState, afterState)
    const modifiersData: ModifierData[] = yield all(dataModifiers.map(modifier => call(modifier, trackData)))
    // merge with modifiers data
    modifiersData.forEach(data => {
      trackData = {...trackData, ...data}
    })
    bufferedData.push(trackData)
  }

  setInterval(() => {
    if (bufferedData.length > 0) {
      config.trackFunc([...bufferedData])
      bufferedData.length = 0
    }
  }, config.interval === undefined ? 3000 : config.interval)

  function* watcher() {
    while(true) {
      const beforeState = yield select()
      const action: Action<string, any> = yield take('*')
      const afterState = yield select()
      if (trackingMap[action.type]) {
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
    track: (newTrackingMap: Record<string, any>) => {
      Object.keys(newTrackingMap).forEach(key => {
        trackingMap[key] = newTrackingMap[key]
      })
    },
    trackData: (trackData: any) => {
      bufferedData.push(trackData)
    },
    applyDataModifier,
  }

}

export default plugin
