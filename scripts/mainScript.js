const shapesArray = [];
let borderThickness = 5;
const startingCursorPosition = new PositionCoordinates();
let releaseBorderButton = false;
let mode = "draw";
let formOfShape = "square";
const colorArray = [
	"#FF0000",
	"#00FF00",
	"#8844FF",
	"#FFFF00",
	"#00BBFF",
	"#FF00FF",
];

const draggableArea = document.querySelector(".drawing-area");

const documentListenerState = new ElementListenerState(document);
const draggableAreaListenerState = new ElementListenerState(draggableArea);

// Takes array of shape objects and makes a sorted copy to apply sorted z-index
const sortShapesBySize = (arr) => {
	let arrayToSort = [...arr];
	arrayToSort.sort((shapeA, shapeB) => {
		return (
			stringToSize(shapeB.element.style.width) +
			stringToSize(shapeB.element.style.height) -
			(stringToSize(shapeA.element.style.width) +
				stringToSize(shapeA.element.style.height))
		);
	});
	arrayToSort.forEach((shape, index) => {
		shape.element.style.zIndex = index + 1;
	});
};

const createNewShape = (clientX, clientY) => {
	// Create new DOM element and ElementState object for said array
	const newShapeListenerState = new ElementListenerState(
		document.createElement("div")
	);
	shapesArray.push(newShapeListenerState);
	const colorIndex =
		(shapesArray.length % colorArray.length || colorArray.length) - 1;
	const newShapeEl = newShapeListenerState.element;
	// Add necessary classes and styles to new DOM element and print it on the page
	newShapeEl.className = `shape shape--${formOfShape}`;
	newShapeEl.style.border = `${sizeToString(borderThickness, "px")} solid ${
		colorArray[colorIndex]
	}`;
	newShapeEl.style.zIndex = shapesArray.length + 1;
	draggableArea.appendChild(newShapeEl);
	// Set initial values for position of shape
	startingCursorPosition.setX(clientX);
	startingCursorPosition.setY(clientY);
	newShapeEl.style.top = sizeToString(
		startingCursorPosition.getY() - 80,
		"px"
	);
	newShapeEl.style.left = sizeToString(startingCursorPosition.getX(), "px");
	return newShapeEl
};

// DRAW MODE HANDLERS
// onClick for draggable area, creates new div and appends to draggable area. This function is unique to Draw mode.
const clickNewShape = (e) => {
	// Redirect to touch handler if event type was touch
	// create new shape and add mouse listeners
	const currentShapeEl = createNewShape(e.clientX, e.clientY);
	draggableAreaListenerState.addListener(
		new ListenerObject("mousemove", sizeNewShapeMouse, [currentShapeEl])
	);
	draggableAreaListenerState.addListener(
		new ListenerObject("mouseup", releaseNewShapeMouse)
	);
};

const touchNewShape = (e) => {
	e.preventDefault();
	const touchCoordinates = e.targetTouches[0];
	if (e.touches.length > 1) {
		draggableAreaListenerState.removeListenerType("touchmove");
		return;
	}
	// Create new shape and add touch listeners
	const currentShapeEl = createNewShape(
		parseInt(touchCoordinates.clientX),
		parseInt(touchCoordinates.clientY)
	);
	draggableAreaListenerState.addListener(
		new ListenerObject("touchmove", sizeNewShapeTouch, [currentShapeEl])
	);
	draggableAreaListenerState.addListener(
		new ListenerObject("touchend", releaseNewShapeTouch)
	);
};

const sizeShapeMath = (shape, clientX, clientY) => {
	shape.style.width = sizeToString(
		Math.abs(clientX - startingCursorPosition.getX()),
		"px"
	);
	shape.style.height = sizeToString(
		Math.abs(clientY - startingCursorPosition.getY()),
		"px"
	);
	// Handling for cases where user drags up or left
	if (clientX < startingCursorPosition.getX()) {
		shape.style.left = clientX.toString() + "px";
	}
	if (clientY < startingCursorPosition.getY()) {
		shape.style.top = (clientY - 80).toString() + "px";
	}
};

const sizeNewShapeTouch = (e, currentShapeEl) => {
	e.preventDefault();
	const currentTouchCoords = e.touches[0];
	sizeShapeMath(
		currentShapeEl,
		parseInt(currentTouchCoords.clientX),
		parseInt(currentTouchCoords.clientY)
	);
};

// mousemove handler for draggable area, updates size of new shape div until mouse is released.
const sizeNewShapeMouse = (e, currentShapeEl) => {
	// Resize shape based on cursor movement
	sizeShapeMath(currentShapeEl, e.clientX, e.clientY);
	// Backup way to force call mouseup handler in case mouseup doesn't register
	if (!e.buttons) {
		releaseNewShapeMouse(e);
	}
};

const finalizeShape = () => {
	sortShapesBySize(shapesArray);
	// Cycle through color array and change preview color
	const colorIndex = shapesArray.length % colorArray.length;
	preview.style.borderColor = colorArray[colorIndex];
};

const releaseNewShapeTouch = (e) => {
	console.log("Release new shape touch")
	draggableAreaListenerState.removeListenerType("touchmove");
	draggableAreaListenerState.removeListenerType("touchend");
	finalizeShape();
};

// mouseup handler for draggable area, disables mousemove for draggable area and updated index for colorsArray and shapesArray
const releaseNewShapeMouse = (e) => {
	console.log("Release new shape mouse")
	draggableAreaListenerState.removeListenerType("mousemove");
	draggableAreaListenerState.removeListenerType("mouseup")
	finalizeShape();
};

// SELECT MODE HANDLERS
// Take in clicked object and make it the selected object, update classList to reflect this change. This function is unique to select mode.
const shapeClickHandler = (e, selectedShape) => {
	const shapeEl = e.target;
	selectedShape.classList.remove("shape--selected");
	shapeEl.classList.add("shape--selected");
	borderThickness = stringToSize(shapeEl.style.borderWidth);
	preview.style.borderWidth = sizeToString(borderThickness, "px");
	refreshSelectMode(shapeEl)
};

// Delete key listener which deletes selected shape and calls functio to re-index event listeners
const deleteShape = (e, selectedShape) => {
	if (
		(e.key === "Delete" || e.key === "Backspace" || e.type === "click") &&
		selectedShape
	) {
		draggableArea.removeChild(selectedShape);
		shapesArray.splice(shapesArray.findIndex(shape => shape.element === selectedShape), 1);
		refreshSelectMode(shapesArray[shapesArray.length-1].element);
	}
};

const startingShapePos = new PositionCoordinates();
const currentShapePos = new PositionCoordinates();

// MOVE MODE HANDLERS
// Focus specific shape to move when clicked on
const grabShape = (shapeEl, clientX, clientY) => {
	borderThickness = stringToSize(shapeEl.style.borderWidth);
	preview.style.borderWidth = sizeToString(borderThickness, "px");
	startingCursorPosition.setX(clientX);
	startingCursorPosition.setY(clientY);
	startingShapePos.setX(stringToSize(shapeEl.style.left));
	startingShapePos.setY(stringToSize(shapeEl.style.top));
	currentShapePos.setX(stringToSize(shapeEl.style.left));
	currentShapePos.setY(stringToSize(shapeEl.style.top));
};

const clickShape = (e) => {
	const shapeEl = e.target;
	// Maybe make these two lines of code into a function?
	grabShape(shapeEl, e.clientX, e.clientY);
	draggableAreaListenerState.addListener(
		new ListenerObject("mousemove", moveShapeMouse, [shapeEl])
	);
	draggableAreaListenerState.addListener(
		new ListenerObject("mouseup", releaseShapeMouse)
	);
};

const touchShape = (e) => {
	e.preventDefault();
	if (e.touches > 1) {
		draggableAreaListenerState.removeListenerType("touchmove")
		draggableAreaListenerState.removeListenerType("touchend")
		return;
	}
	const shapeEl = e.target;
	const touchCoordinates = e.touches[0];
	grabShape(
		shapeEl,
		parseInt(touchCoordinates.clientX),
		parseInt(touchCoordinates.clientY)
	);
	draggableAreaListenerState.addListener(
		new ListenerObject("touchmove", moveShapeTouch, [shapeEl])
	);
	draggableAreaListenerState.addListener(
		new ListenerObject("touchend", releaseShapeTouch)
	);
};

const movementMath = (shapeEl, clientX, clientY) => {
	const newX = sizeToString(
		startingShapePos.getX() + clientX - startingCursorPosition.getX(),
		"px"
	);
	const newY = sizeToString(
		startingShapePos.getY() + clientY - startingCursorPosition.getY(),
		"px"
	);
	currentShapePos.setX(stringToSize(newX));
	currentShapePos.setY(stringToSize(newY));
	shapeEl.style.left = newX;
	shapeEl.style.top = newY;
};

// Update x/y co-ordinates of shape based on cursor movement
const moveShapeMouse = (e, currentShapeEl) => {
	movementMath(currentShapeEl, e.clientX, e.clientY);
	// Fallback to remove listeners if mouseup is not registered in browser
	if (!e.buttons) {
		releaseShapeMouse(e);
	}
};

const moveShapeTouch = (e, currentShapeEl) => {
	if (e.touches.length > 1) {
		draggableAreaListenerState.removeListenerType("touchmove");
		return;
	}
	const touchCoordinates = e.touches[0];
	movementMath(
		currentShapeEl,
		parseInt(touchCoordinates.clientX),
		parseInt(touchCoordinates.clientY)
	);
};

const releaseShapeMouse = (e) => {
	console.log("Release move mouse")
	draggableAreaListenerState.removeListenerType("mousemove")
	draggableAreaListenerState.removeListenerType("mouseup")
};

const releaseShapeTouch = (e) => {
	draggableAreaListenerState.removeListenerType("touchmove")
	draggableAreaListenerState.removeListenerType("touchend")
};

// Function to re-index event listeners on all elements of shapesArray and reset all related index variables
const findShape = (shape) => {
	return shapesArray.indexOf(
		shapesArray.find((shapeInArray) => shapeInArray.element === shape)
	);
};
