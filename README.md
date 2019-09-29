### Reapex action monitoring plugin

```
import monitorPlugin from 'reapex-plugin-monitoring'
const app = new App()

function doTrack(data: any[]) {
  console.log(data)
}

const monitor = app.plugin(monitorPlugin, {trackFunc: doTrack, interval: 5000})

monitor.track({
  [actionTypes.decrease]: function* (action: ReturnType<typeof mutations.decrease>, beforeState, afterState) {
    const total = CounterModel.selectors.total(afterState)
    const [num] = action.payload
    return {
      key: actionTypes.decrease,
      data: { total, num },
    }
  },
  [actionTypes.increase]: function* (action: ReturnType<typeof mutations.increase>, beforeState, afterState) {
    const total = yield select(CounterModel.selectors.total)
    const [num] = action.payload
    return {
      key: actionTypes.increase,
      data: { total, num },
    }
  }
})

```
