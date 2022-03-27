const removePrevListeners = (target, reset) => {
  target.currentListeners.forEach(listener => {
    target.element.removeEventListener(listener.eventType, listener.Handler)
  })
  if(reset) {
    target.currentListeners = []
  }
}

/**
 * 
 * @param {object} target 
 * @param {object[]} listenersToAdd 
 */
const applyModeListeners = (target, listenersToAdd) => {
  // Remove all previous listeners for fresh start
  removePrevListeners(target)
  listenersToAdd.forEach(listener => {
    target.element.addEventListener(listener.eventType, listener.handler)
  })
  target.removeListeners = listenersToAdd
}