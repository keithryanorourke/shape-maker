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
		element: document.getElementById(name),
		shapeName: name,
	};
	shapeButtons.push(newButton);
});

const shapeButtonListener = (e, name) => {
	formOfShape = name;
	preview.className = `preview preview--${name}`;
	if (mode === "select" && shapesArray[selectedIndex]) {
		shapesArray[selectedIndex].element.className = `shape shape--${name}`;
	}
	shapeButtonNames.forEach((buttonName) => {
		const currentButton = shapeButtons.find(
			(button) => button.shapeName === buttonName
		);
		if (buttonName !== name) {
			currentButton.element.className = `button`;
		} else {
			currentButton.element.className = `button button--selected`;
		}
	});
};

shapeButtons.forEach((button) => {
	button.element.addEventListener("click", (e) =>
		shapeButtonListener(e, button.shapeName)
	);
});

// Grab the rest of the UI buttons
const borderPlus = document.getElementById("borderPlus");
const borderMinus = document.getElementById("borderMinus");

// Button events
borderPlus.addEventListener("mousedown", () => {
	releaseBorderButton = false;
	const increaseBorderThickness = setInterval(() => {
		if (releaseBorderButton) {
			clearInterval(increaseBorderThickness);
		}
		if (borderThickness < 10) {
			borderThickness++;
			preview.style.borderWidth = sizeToString(borderThickness, "px");
			if (mode === "select") {
				shapesArray[selectedIndex].element.style.borderWidth =
					sizeToString(borderThickness, "px");
			}
		}
	}, 300);
});

borderMinus.addEventListener("mousedown", () => {
	releaseBorderButton = false;
	const reduceBorderThickness = setInterval(() => {
		if (releaseBorderButton) {
			clearInterval(reduceBorderThickness);
		}
		if (borderThickness > 2) {
			borderThickness--;
			preview.style.borderWidth = sizeToString(borderThickness, "px");
			if (mode === "select" && shapesArray[selectedIndex]) {
				shapesArray[selectedIndex].element.style.borderWidth =
					sizeToString(borderThickness, "px");
			}
		}
	}, 300);
});

borderPlus.addEventListener("mouseup", () => {
	releaseBorderButton = true;
});

borderMinus.addEventListener("mouseup", () => {
	releaseBorderButton = true;
});

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
	draggableAreaListenerState.removePrevListeners();
	shapesArray.forEach((shape) => {
		shape.removePrevListeners();
	});
	draggableAreaListenerState.applyModeListeners([
		{ eventType: "mousedown", handler: createNewShape },
	]);
	mode = "draw";
	setModeButtonClasses(drawButton, [selectButton, moveButton]);
	if (shapesArray[selectedIndex]) {
		shapesArray[selectedIndex].element.classList.remove("shape--selected");
	}
};

const selectMode = () => {
	setCursorIcon("hand-index.svg");
	draggableAreaListenerState.removePrevListeners();
	shapesArray.forEach((shape) => {
		shape.applyModeListeners([
			{ eventType: "click", handler: shapeClickHandler },
		]);
	});
	documentListenerState.applyModeListeners([
		{ eventType: "keydown", handler: deleteShape },
	]);
	mode = "select";
	setModeButtonClasses(selectButton, [drawButton, moveButton]);
	if (shapesArray[selectedIndex]) {
		shapesArray[selectedIndex].element.classList.add("shape--selected");
	}
};

const moveMode = () => {
	setCursorIcon("arrows-move.svg");
	draggableAreaListenerState.removePrevListeners();
	documentListenerState.removePrevListeners();
	shapesArray.forEach((shape) => {
		shape.applyModeListeners([
			{ eventType: "mousedown", handler: focusShape },
		]);
	});
	mode = "move";
	setModeButtonClasses(moveButton, [selectButton, drawButton]);
	if (shapesArray[selectedIndex]) {
		shapesArray[selectedIndex].element.classList.remove("shape--selected");
	}
};

// Mode selection listeners
drawButton.addEventListener("click", drawMode);
selectButton.addEventListener("click", selectMode);
moveButton.addEventListener("click", moveMode);

// Call function to apply drawMode on page load
drawMode();
