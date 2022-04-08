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

const drawMode = () => {
	documentListenerState.removePrevListeners();
	shapesArray.forEach((shape) => {
		shape.removePrevListeners();
	});
	draggableAreaListenerState.applyModeListeners([
		{ eventType: "mousedown", handler: createNewShape },
		{ eventType: "mouseup", handler: releaseNewShape },
	]);
	mode = "draw";
	drawButton.className = "button button--selected";
	selectButton.className = "button";
	if (shapesArray[selectedIndex]) {
		shapesArray[selectedIndex].element.classList.remove("shape--selected");
	}
};

const selectMode = () => {
	shapesArray.forEach((shape) => {
		shape.applyModeListeners([
			{ eventType: "click", handler: shapeClickHandler },
		]);
	});
	draggableAreaListenerState.removePrevListeners();
	documentListenerState.applyModeListeners([
		{ eventType: "keydown", handler: deleteShape },
	]);
	mode = "select";
	drawButton.className = "button";
	selectButton.className = "button button--selected";
	if (shapesArray[selectedIndex]) {
		shapesArray[selectedIndex].element.classList.add("shape--selected");
	}
};

// Mode selection listeners
drawButton.addEventListener("click", drawMode);
selectButton.addEventListener("click", selectMode);

// Call function to apply drawMode on page load
drawMode();