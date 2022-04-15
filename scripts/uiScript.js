// Grab preview element
const preview = document.getElementById("preview");
// Grab all shape buttons and add eventlisteners
const shapeButtonNames = [
	"square",
	"circle",
	"parallelogram-left",
	"parallelogram-right",
	"diamond",
];
const shapeButtons = [];
shapeButtonNames.forEach((name) => {
	const newButton = {
		listenerState: new ElementListenerState(document.getElementById(name)),
		shapeName: name,
	};
	shapeButtons.push(newButton);
});

const setSelectedShapeBtn = (name) => {
	formOfShape = name;
	preview.className = `preview preview--${name}`;
	shapeButtons.forEach((button) => {
		if (button.shapeName !== name) {
			button.listenerState.element.className = `button`;
		} else {
			button.listenerState.element.className = `button button--selected`;
		}
	});
};

const shapeBtnDrwLstnr = (e, name) => {
	setSelectedShapeBtn(name);
};

const shapeBtnSelLstnr = (e, name, selectedShape) => {
	setSelectedShapeBtn(name);
	selectedShape.className = `shape shape--selected shape--${name}`;
};

// Grab the rest of the UI buttons
const borderPlus = document.getElementById("borderPlus");
const borderMinus = document.getElementById("borderMinus");

// Make delete button for select mode
const deleteContainer = document.createElement("div");
deleteContainer.className = "controls__container";
const deleteButton = document.createElement("button");
deleteButton.addEventListener("click", deleteShape);
deleteButton.className = "button";
const deleteIcon = document.createElement("img");
deleteIcon.setAttribute("src", "./assets/icons/delete.svg");
deleteIcon.setAttribute("alt", "Trash bin icon.");
deleteContainer.appendChild(deleteButton);
deleteButton.appendChild(deleteIcon);

const releaseBorderBtn = (_e, buttonState, interval) => {
	clearInterval(interval);
	buttonState.removeListenerType("mouseup");
};

const borderPlusLstnrState = new ElementListenerState(borderPlus);
const borderMinusLstnrState = new ElementListenerState(borderMinus);

const incrementBorder = (selectedShape) => {
	if (borderThickness < 10) {
		borderThickness++;
		preview.style.borderWidth = sizeToString(borderThickness, "px");
		if (selectedShape) {
			selectedShape.style.borderWidth = sizeToString(
				borderThickness,
				"px"
			);
		}
	}
};

const decrementBorder = (selectedShape) => {
	if (borderThickness > 2) {
		borderThickness--;
		preview.style.borderWidth = sizeToString(borderThickness, "px");
		if (selectedShape) {
			selectedShape.style.borderWidth = sizeToString(
				borderThickness,
				"px"
			);
		}
	}
};
// Button events
const borderPlusHandler = (e, selectedShape) => {
	incrementBorder(selectedShape);
	const timer = setInterval(() => {
		incrementBorder(selectedShape);
	}, 100);
	documentListenerState.addListener(
		new ListenerObject("mouseup", releaseBorderBtn, [
			borderPlusLstnrState,
			timer,
		])
	);
};

const borderMinusHandler = (e, selectedShape) => {
	decrementBorder(selectedShape);
	const timer = setInterval(() => {
		decrementBorder(selectedShape);
	}, 100);
	documentListenerState.addListener(
		new ListenerObject("mouseup", releaseBorderBtn, [
			borderMinusLstnrState,
			timer,
		])
	);
};

// Mode selection buttons
const drawButton = document.getElementById("draw");
const selectButton = document.getElementById("select");
const moveButton = document.getElementById("move");

const setModeButtonClasses = (activeButton, otherButtons) => {
	activeButton.className = "button button--selected";
	otherButtons.forEach((button) => {
		button.className = "button";
	});
};

const setCursorIcon = (fileName) => {
	draggableArea.style.cursor = `url(./assets/icons/${fileName}), auto`;
};

const drawMode = () => {
	setCursorIcon("pencil.svg");
	documentListenerState.removePrevListeners();
	shapeButtons.forEach((button) => {
		button.listenerState.applyModeListeners([
			new ListenerObject("click", shapeBtnDrwLstnr, [button.shapeName]),
		]);
	});
	deleteContainer.remove();
	borderMinusLstnrState.applyModeListeners([
		new ListenerObject("mousedown", borderMinusHandler),
	]);
	borderPlusLstnrState.applyModeListeners([
		new ListenerObject("mousedown", borderPlusHandler),
	]);
	draggableAreaListenerState.applyModeListeners([
		new ListenerObject("mousedown", clickNewShape),
		new ListenerObject("touchstart", touchNewShape),
	]);
	shapesArray.forEach((shape) => {
		shape.removePrevListeners();
	});
	mode = "draw";
	setModeButtonClasses(drawButton, [selectButton, moveButton]);
	removeSelected();
};

const footer = document.querySelector("footer");
const selectMode = () => {
	mode = "select";
	footer.appendChild(deleteContainer);
	setCursorIcon("hand-index.svg");
	const selectedShape = shapesArray[shapesArray.length - 1].element;
	refreshSelectMode(selectedShape);
};

const moveMode = () => {
	shapeButtons.forEach((button) => {
		button.listenerState.applyModeListeners([
			new ListenerObject("click", shapeBtnDrwLstnr, [button.shapeName]),
		]);
	});
	setCursorIcon("arrows-move.svg");
	draggableAreaListenerState.removePrevListeners();
	documentListenerState.removePrevListeners();
	borderMinusLstnrState.applyModeListeners([
		new ListenerObject("mousedown", borderMinusHandler),
	]);
	borderPlusLstnrState.applyModeListeners([
		new ListenerObject("mousedown", borderPlusHandler),
	]);
	deleteContainer.remove();
	shapesArray.forEach((shape) => {
		shape.applyModeListeners([
			new ListenerObject("mousedown", clickShape),
			new ListenerObject("touchstart", touchShape),
		]);
	});
	mode = "move";
	setModeButtonClasses(moveButton, [selectButton, drawButton]);
	removeSelected();
};

// Mode selection listeners
drawButton.addEventListener("click", drawMode);
selectButton.addEventListener("click", selectMode);
moveButton.addEventListener("click", moveMode);

const removeSelected = () => {
	shapesArray.forEach((shape) =>
		shape.element.classList.remove("shape--selected")
	);
};

const refreshSelectMode = (selectedShape) => {
	shapeButtons.forEach((button) => {
		button.listenerState.applyModeListeners([
			new ListenerObject("click", shapeBtnSelLstnr, [
				button.shapeName,
				selectedShape,
			]),
		]);
	});
	borderMinusLstnrState.applyModeListeners([
		new ListenerObject("mousedown", borderMinusHandler, [selectedShape]),
	]);
	borderPlusLstnrState.applyModeListeners([
		new ListenerObject("mousedown", borderPlusHandler, [selectedShape]),
	]);
	draggableAreaListenerState.removePrevListeners();
	if (!selectedShape) {
		return;
	}
	selectedShape.classList.add("shape--selected");
	shapesArray.forEach((shape) => {
		shape.applyModeListeners([
			new ListenerObject("click", shapeClickHandler, [selectedShape]),
		]);
	});
	documentListenerState.applyModeListeners([
		new ListenerObject("keydown", deleteShape, [selectedShape]),
	]);
	setModeButtonClasses(selectButton, [drawButton, moveButton]);
};

// Call function to apply drawMode on page load
drawMode();
