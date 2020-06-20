import { App } from 'reapex'
import monitorModule from '../src'

const app = new App()

function doTrack(data: any[]) {
  console.log(data)
}

export const tracker = app.use(monitorModule, {
  trackFunc: doTrack,
  interval: 5000,
})

export default app
