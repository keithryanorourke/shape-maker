const shapesArray = [];
let shapeIndex = 0;
let selectedIndex = 0;
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
let colorIndex = 0;

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

// DRAW MODE HANDLERS
// onClick for draggable area, creates new div and appends to draggable area. This function is unique to Draw mode.
const createNewShape = (e) => {
	// newShape remains true as long as we are creating/resizing a shape
	draggableAreaListenerState.addListener({
		eventType: "mousemove",
		handler: sizeNewShape,
	});
	draggableAreaListenerState.addListener({
		eventType: "mouseup",
		handler: releaseNewShape,
	});
	// Create new DOM element and ElementState object for said array
	const newShapeListenerState = new ElementListenerState(
		document.createElement("div")
	);
	shapesArray.push(newShapeListenerState);
	const newShapeEl = newShapeListenerState.element;
	// Add necessary classes and styles to new DOM element and print it on the page
	newShapeEl.className = `shape shape--${formOfShape}`;
	newShapeEl.style.border = `${sizeToString(borderThickness, "px")} solid ${
		colorArray[colorIndex]
	}`;
	newShapeEl.style.zIndex = shapesArray.length + 1;
	draggableArea.appendChild(newShapeEl);
	selectedIndex = shapeIndex;
	// Set initial values for position of shape
	startingCursorPosition.setX(e.clientX);
	startingCursorPosition.setY(e.clientY);
	newShapeEl.style.top = sizeToString(
		startingCursorPosition.getY() - 80,
		"px"
	);
	newShapeEl.style.left = sizeToString(startingCursorPosition.getX(), "px");
};

// mousemove handler for draggable area, updates size of new shape div until mouse is released.
const sizeNewShape = (e) => {
	const currentShapeEl = shapesArray[shapeIndex].element;
	// Resize shape based on cursor movement
	currentShapeEl.style.width = sizeToString(
		Math.abs(e.clientX - startingCursorPosition.getX()),
		"px"
	);
	currentShapeEl.style.height = sizeToString(
		Math.abs(e.clientY - startingCursorPosition.getY()),
		"px"
	);
	// Handling for cases where user drags up or left
	if (e.clientX < startingCursorPosition.getX()) {
		currentShapeEl.style.left = e.clientX.toString() + "px";
	}
	if (e.clientY < startingCursorPosition.getY()) {
		currentShapeEl.style.top = (e.clientY - 80).toString() + "px";
	}
	// Backup way to force call mouseup handler in case mouseup doesn't register
	if (!e.buttons) {
		releaseNewShape(e);
	}
};

// mouseup handler for draggable area, disables mousemove for draggable area and updated index for colorsArray and shapesArray
const releaseNewShape = (e) => {
	draggableAreaListenerState.removeListener({
		eventType: "mousemove",
		handler: sizeNewShape,
	});
	sortShapesBySize(shapesArray);
	// Cycle through color array and change preview color
	colorIndex++;
	if (colorIndex >= colorArray.length) {
		colorIndex = 0;
	}
	preview.style.borderColor = colorArray[colorIndex];
	// Move on to next shape
	shapeIndex++;
};

// SELECT MODE HANDLERS
// Take in clicked object and make it the selected object, update classList to reflect this change. This function is unique to select mode.
const shapeClickHandler = (e) => {
	const shapeEl = e.target;
	shapesArray[selectedIndex].element.classList.remove("shape--selected");
	selectedIndex = findShape(e.target);
	shapeEl.classList.add("shape--selected");
	borderThickness = stringToSize(shapeEl.style.borderWidth);
	preview.style.borderWidth = sizeToString(borderThickness, "px");
};

// Delete key listener which deletes selected shape and calls functio to re-index event listeners
const deleteShape = (e) => {
	if (
		(e.key === "Delete" || e.key === "Backspace") &&
		shapesArray[selectedIndex]
	) {
		draggableArea.removeChild(shapesArray[selectedIndex].element);
		shapesArray.splice(selectedIndex, 1);
		reIndexShapes();
	}
};

const startingShapePos = new PositionCoordinates();
const currentShapePos = new PositionCoordinates();

// MOVE MODE HANDLERS
// Focus specific shape to move when clicked on
const focusShape = (e) => {
	selectedIndex = findShape(e.target);
	const shapeEl = e.target;
	// Maybe make these two lines of code into a function?
	borderThickness = stringToSize(shapeEl.style.borderWidth);
	preview.style.borderWidth = sizeToString(borderThickness, "px");
	startingCursorPosition.setX(e.clientX);
	startingCursorPosition.setY(e.clientY);
	startingShapePos.setX(stringToSize(shapeEl.style.left));
	startingShapePos.setY(stringToSize(shapeEl.style.top));
	currentShapePos.setX(stringToSize(shapeEl.style.left));
	currentShapePos.setY(stringToSize(shapeEl.style.top));
	draggableAreaListenerState.addListener({
		eventType: "mousemove",
		handler: moveShape,
	});
	draggableAreaListenerState.addListener({
		eventType: "mouseup",
		handler: releaseShape,
	});
};

// Update x/y co-ordinates of shape based on cursor movement
const moveShape = (e) => {
	const shapeEl = shapesArray[selectedIndex].element;
	const newX = sizeToString(
		startingShapePos.getX() + e.clientX - startingCursorPosition.getX(),
		"px"
	);
	const newY = sizeToString(
		startingShapePos.getY() + e.clientY - startingCursorPosition.getY(),
		"px"
	);
	currentShapePos.setX(stringToSize(newX));
	currentShapePos.setY(stringToSize(newY));
	shapeEl.style.left = newX;
	shapeEl.style.top = newY;
	if (!e.buttons) {
		releaseShape(e);
	}
};

const releaseShape = (e) => {
	draggableAreaListenerState.removeListener({
		eventType: "mousemove",
		handler: moveShape,
	});
	draggableAreaListenerState.removeListener({
		eventType: "mouseup",
		handler: releaseShape,
	});
};

// Function to re-index event listeners on all elements of shapesArray and reset all related index variables
const reIndexShapes = () => {
	shapeIndex = shapesArray.length;
	if (!shapeIndex) {
		return;
	}
	selectedIndex = shapeIndex - 1;
	shapesArray[selectedIndex].element.classList.add("shape--selected");
};

const findShape = (shape) => {
	return shapesArray.indexOf(
		shapesArray.find((shapeInArray) => shapeInArray.element === shape)
	);
};
