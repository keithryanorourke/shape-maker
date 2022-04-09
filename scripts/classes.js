// This class is used to create a state-like object to keep track of registered event listeners of a DOM element
// The intended usage of this class is to keep track of registered listeners so that they can be more easily and consistently removed / applied
// Objects with this class should only be created for DOM elements that will need to frequently update event listeners.
class ElementListenerState {
	/**
	 * @param {object} element - pass DOM element to track listeners for (required)
	 * @param {[object]} initialListeners - Initial list of Listeners to register
	 * @returns
	 */
	constructor(element, initialListeners) {
		if (!element) {
			console.warn(
				"Valid DOM element was not provided, ElementListenerState object will still be created but will not function as intended. Please rewrite object declaration to include DOM element or use fixElement method with DOM element as an argument."
			);
		}
		this.element = element;
		this.currentListeners = initialListeners || [];
	}

	getCurrentListeners() {
		return this.currentListeners;
	}

	removePrevListeners() {
		this.currentListeners.forEach((listener) => {
			this.element.removeEventListener(
				listener.eventType,
				listener.handler
			);
		});
		this.currentListeners = [];
	}

	/**
	 *
	 * @param {*} listener
	 * @returns {number} Error code 404 will be returned if listener is not registered, nothing will be returned if method was successful.
	 */
	removeListener(listener) {
		// Begin by comparing properties of listeners in list to passed in listener to validate it's registration
		const listenerKeys = Object.keys(listener);
		const listenerIndex = this.currentListeners.findIndex(
			(listenerInArr) => {
				for (let i = 0; i < listenerKeys.length; i++) {
					const key = listenerKeys[i];
					if (listenerInArr[key] !== listener[key]) {
						return false;
					}
				}
				return true;
			}
		);
		// Return error code if passed in listener is not registered with list
		if (listenerIndex === -1) {
			console.log(this.currentListeners)
			console.warn(
				`Listener to be removed is not currently registered in list! The listener cannot be removed. \n${listener.eventType}`
			);
			return 404;
		}
		// Remove listener from DOM element and then update registered list in state
		this.element.removeEventListener(listener.eventType, listener.handler);
		this.currentListeners.splice(listenerIndex, 1);
	}

	/**
	 *
	 * @param {object} listener
	 * @returns Error code -1 will be returned if listener is already registered, nothing will be returned if method was successful.
	 */
	addListener(listener) {
		// Return error code if listener already registered in list
		if (this.currentListeners.includes(listener)) {
			console.warn("Provided listener is already registered in list!");
			return -1;
		}
		this.element.addEventListener(listener.eventType, listener.handler);
		this.currentListeners.push(listener);
	}

	/**
	 *
	 * @param {object[]} listenersToAdd
	 */
	applyModeListeners(listenersToAdd) {
		// Remove all previous listeners for fresh start
		this.removePrevListeners();
		listenersToAdd.forEach((listener) => {
			this.element.addEventListener(listener.eventType, listener.handler);
		});
		this.currentListeners = listenersToAdd;
	}

	/**
	 *
	 * @param {object} element - DOM element to write to the ListenerState Object
	 * @param {bool} hardFix
	 * @returns 400 error code if method failed, nothing if method was successful.
	 */
	fixElement(element, hardFix) {
		if (!element) {
			console.warn(
				"DOM element was not provided, please provide a DOM element as the first argument for this method"
			);
			return 400;
		}
		if (!this.element || hardFix) {
			this.element = element;
			return;
		}
		console.warn(
			"There is already a DOM element registered to this ListenerState. If you wish to overwrite said element, pass true as the second argument in this method for a hard fix."
		);
		return 400;
	}
}

class PositionCoordinates {
	constructor(x, y) {
		this.x = x || 0
		this.y = y || 0
	}

	getX() {
		return this.x;
	}

	getY() {
		return this.y;
	}

	setX(num) {
		this.x = num;
	}

	setY(num) {
		this.y = num;
	}
}