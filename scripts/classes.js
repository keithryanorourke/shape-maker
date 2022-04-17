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
				"Valid DOM element was not provided, ElementListenerState object will still be created but will not function as intended."
			);
		}
		this.element = element;
		this.currentListeners = initialListeners || [];
	}
	/**
	 *
	 * @returns {[]} a copy array of currentListeners
	 */
	getCurrentListeners() {
		return [...this.currentListeners];
	}

	setCurrentListeners(arr) {
		this.currentListeners = [...arr];
	}

	removePrevListeners() {
		const prevListeners = this.getCurrentListeners();
		prevListeners.forEach((listener) => {
			this.element.removeEventListener(
				listener.eventType,
				listener.callback
			);
		});
		this.setCurrentListeners([]);
	}

	removeListenerType(type) {
		const currentListeners = this.getCurrentListeners();
		const listenersToRemove = currentListeners.filter(
			(listener) => listener.eventType === type
		);
		if (!listenersToRemove.length)
			console.warn(
				`No listeners with type ${type} found.`,
				currentListeners
			);
		listenersToRemove.forEach((listener) => {
			this.element.removeEventListener(
				listener.eventType,
				listener.callback
			);
			currentListeners.splice(
				currentListeners.findIndex(
					(listenerInArr) => listenerInArr === listener
				),
				1
			);
		});
		this.setCurrentListeners(currentListeners);
	}

	/**
	 *
	 * @param {object} listener
	 * @returns Error code -1 will be returned if listener is already registered, nothing will be returned if method was successful.
	 */
	addListener(listener) {
		// Return error code if listener already registered in list
		if (this.getCurrentListeners().includes(listener)) {
			console.warn("Provided listener is already registered in list! addListener method aborted");
			return -1;
		}
		this.element.addEventListener(listener.eventType, listener.callback);
		const newListeners = this.getCurrentListeners();
		newListeners.push(listener);
		this.setCurrentListeners(newListeners);
	}

	/**
	 *
	 * @param {object[]} listenersToAdd
	 */
	applyModeListeners(listenersToAdd) {
		// Remove all previous listeners for fresh start
		this.removePrevListeners();
		listenersToAdd.forEach((listener) => {
			this.element.addEventListener(
				listener.eventType,
				listener.callback
			);
		});
		this.setCurrentListeners(listenersToAdd);
	}
}

class ListenerObject {
	/**
	 *
	 * @param {string} eventType - represents the type of event listener
	 * @param {function} handler - callback function for event listener
	 * @param {[]} args - Array of arguments (in proper order) for callback function, defaults to empty array
	 */
	constructor(eventType, handler, args = []) {
		this.eventType = eventType;
		this.callback = (e) => handler(e, ...args);
	}
}

// This class is intended for objects that need to keep track of some type of x/y coordinates globally
// Avoid using if you only need a snapshot of x/y coordinates
class PositionCoordinates {
	constructor(x, y) {
		this.x = x || 0;
		this.y = y || 0;
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

	setXandY(x, y) {
		this.x = x;
		this.y = y;
	}
}
