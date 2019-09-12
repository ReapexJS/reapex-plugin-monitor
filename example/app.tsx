import { App } from 'reapex'
import trackPlugin from '../src'

const app = new App()

function doTrack(data: any[]) {
  console.log(data)
}

export const tracker = app.plugin(trackPlugin, {trackFunc: doTrack, interval: 5000})

export default app
