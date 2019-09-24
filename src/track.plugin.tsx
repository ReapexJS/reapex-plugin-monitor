import { Action, App } from 'reapex'
import { call, spawn, take, select } from 'redux-saga/effects';

export interface PluginConfig {
  trackFunc: Function
  interval?: number
}

const plugin = (app: App, config: PluginConfig) => {
  const bufferedData: any[] = []
  const trackingMap: Record<string, any> = {}

  function* handleAction(action: Action<string, any>, beforeState: any) {
    const trackData = yield call(trackingMap[action.type], action, beforeState)
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
      const beforeState = yield select();
      const action: Action<string, any> = yield take('*')
      if (trackingMap[action.type]) {
        yield spawn(handleAction, action, beforeState)
      }
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
  }

}

export default plugin
