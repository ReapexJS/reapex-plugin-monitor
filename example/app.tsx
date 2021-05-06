import { App } from 'reapex'
import monitorModule from '../src'

const app = new App()

function doTrack(data: any[]) {
  console.log(data)
}

export const store = app.createStore()

export const tracker = app.use(monitorModule, {
  trackFunc: doTrack,
})

export default app
