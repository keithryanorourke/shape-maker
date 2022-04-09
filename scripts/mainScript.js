const shapesArray = [];
let shapeIndex = 0;
let selectedIndex = 0;
let borderThickness = 5;
let startingPosition = {};
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
	const currentIndex = shapeIndex;
	// Create new DOM element and ElementState object for said array
	const newShapeListenerState = new ElementListenerState(
		document.createElement("div")
	);
	shapesArray.push(newShapeListenerState);
	const newShapeEl = shapesArray[currentIndex].element;
	// Add necessary classes and styles to new DOM element and print it on the page
	newShapeEl.className = `shape shape--${formOfShape}`;
	newShapeEl.style.border = `${sizeToString(borderThickness, "px")} solid ${
		colorArray[colorIndex]
	}`;
	draggableArea.appendChild(newShapeEl);
	selectedIndex = currentIndex;
	// Set initial values for position of shape
	startingPosition = { x: e.clientX, y: e.clientY };
	newShapeEl.style.top = sizeToString(startingPosition.y - 80, "px");
	newShapeEl.style.left = sizeToString(startingPosition.x, "px");
};

// mousemove handler for draggable area, updates size of new shape div until mouse is released.
const sizeNewShape = (e) => {
	const currentShapeEl = shapesArray[shapeIndex].element;
		// Resize shape based on cursor movement
		currentShapeEl.style.width = sizeToString(
			Math.abs(e.clientX - startingPosition.x),
			"px"
		);
		currentShapeEl.style.height = sizeToString(
			Math.abs(e.clientY - startingPosition.y),
			"px"
		);
		// Handling for cases where user drags up or left
		if (e.clientX < startingPosition.x) {
			currentShapeEl.style.left = e.clientX.toString() + "px";
		}
		if (e.clientY < startingPosition.y) {
			currentShapeEl.style.top = (e.clientY - 80).toString() + "px";
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
	const currentIndex = shapesArray.indexOf(
		shapesArray.find((shape) => shape.element === e.target)
	);
	const shapeEl = shapesArray[currentIndex].element;
	shapesArray[selectedIndex].element.classList.remove("shape--selected");
	selectedIndex = currentIndex;
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

// MOVE MODE HANDLERS
// Focus specific shape to move when clicked on
const focusShape = (e) => {

}

// Update x/y co-ordinates of shape based on cursor movement
const moveShape = (e) => {

}

// Function to re-index event listeners on all elements of shapesArray and reset all related index variables
const reIndexShapes = () => {
	shapeIndex = shapesArray.length;
	if (!shapeIndex) {
		return;
	}
	selectedIndex = shapeIndex - 1;
	shapesArray[selectedIndex].element.classList.add("shape--selected");
};
