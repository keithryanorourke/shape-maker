const shapesArray=[];
let shapeIndex = 0;
let selectedIndex = 0;
let borderThickness = 5;
let startingPosition={};
let newShape = false;
let releaseBorderButton = false;
let mode = 'draw';
let formOfShape = 'square';
const colorArray = ['#FF0000', '#00FF00', '#8844FF', '#FFFF00', '#00BBFF', '#FF00FF']
let colorIndex = 0;

const draggableArea = document.querySelector('.drawing-area')

class ElementState {
  constructor(element) {
    this.element = element
    this.currentListeners = []
  }
}

const documentState = new ElementState(document)
const draggableAreaState = new ElementState(draggableArea)

// Takes array of shape objects and makes a sorted copy to apply sorted z-index
const sortShapesBySize = (arr) => {
  let arrayToSort = [...arr]
  arrayToSort.sort((shapeA, shapeB) => {
    return (stringToSize(shapeB.element.style.width) + stringToSize(shapeB.element.style.height)) - (stringToSize(shapeA.element.style.width) + stringToSize(shapeA.element.style.height))
  })
  arrayToSort.forEach((shape, index) => {
    shape.element.style.zIndex = index+1
  })
}

// Take in clicked object and make it the selected object, update classList to reflect this change.
const shapeClickHandler = (e, currentIndex) => {
  const shapeEl = shapesArray[selectedIndex].element
    if(mode !== 'select') {
      return
    }
    shapeEl.classList.remove('shape--selected')
    selectedIndex = currentIndex
    shapeEl.classList.add('shape--selected')
    borderThickness = stringToSize(shapeEl.style.borderWidth)
    preview.style.borderWidth = sizeToString(borderThickness, 'px')
}

// onClick for draggable area, creates new div and appends to draggable area.
const createNewShape = (e) => {
  if(mode !== 'draw' || newShape) {
    return
  }
  // newShape remains true as long as we are creating/resizing a shape
  draggableArea.addEventListener('mousemove', sizeNewShape)
  newShape = true;
  const currentIndex = shapeIndex;
  // Store new shape inside of array, this makes it easier to add editing functionality later on
  const newShapeState = new ElementState(document.createElement('div'))
  shapesArray.push(newShapeState)
  const newShapeEl = shapesArray[currentIndex].element
  newShapeEl.addEventListener('click', (e) => shapeClickHandler(e, currentIndex))
  if(shapesArray[selectedIndex]) {
    shapesArray[selectedIndex].element.classList.remove('shape--selected')
  }
  newShapeEl.className = `shape shape--${formOfShape}`
  newShapeEl.style.border= `${sizeToString(borderThickness, 'px')} solid ${colorArray[colorIndex]}` 
  draggableArea.appendChild(newShapeEl)
  selectedIndex = currentIndex
  
  // Set initial values for position of shape
  startingPosition={x: e.clientX, y: e.clientY}
  newShapeEl.style.top=sizeToString(startingPosition.y - 80, 'px')
  newShapeEl.style.left=sizeToString(startingPosition.x, 'px')
}

// mousemove handler for draggable area, updates size of new shape div until mouse is released.
const sizeNewShape = (e) => {
  const currentShapeEl = shapesArray[shapeIndex].element
  if (newShape && mode === 'draw') {
    // Resize shape based on cursor movement
    currentShapeEl.style.width=sizeToString(Math.abs(e.clientX-startingPosition.x), 'px')
    currentShapeEl.style.height=sizeToString(Math.abs(e.clientY-startingPosition.y), 'px')
    // Handling for cases where user drags up or left
    if(e.clientX < startingPosition.x) {
      currentShapeEl.style.left=e.clientX.toString() +'px'
    }
    if(e.clientY < startingPosition.y) {
      currentShapeEl.style.top=(e.clientY-80).toString() +'px'
    }
  }
}

// mouseup handler for draggable area, disables mousemove for draggable area and updated index for colorsArray and shapesArray
const releaseNewShape = (e) => {
  if(mode !== 'draw') {
    return
  }
  draggableArea.removeEventListener('mousemove', sizeNewShape)
  newShape = false
  sortShapesBySize(shapesArray)
  // Cycle through color array and change preview color
  colorIndex++
  if(colorIndex >= colorArray.length) {
    colorIndex=0;
  }
  preview.style.borderColor = colorArray[colorIndex]
  // Move on to next shape
  shapeIndex++
}

// Delete key listener which deletes selected shape and calls functio to re-index event listeners
const deleteShape = (e) => {
  if((e.key==='Delete' || e.key==='Backspace') && mode==='select' && shapesArray[selectedIndex]) {
    draggableArea.removeChild(shapesArray[selectedIndex].element)
    shapesArray.splice(selectedIndex, 1)
    reIndexShapes()
  }
}

// Function to re-index event listeners on all elements of shapesArray and reset all related index variables
const reIndexShapes = () => {
  shapeIndex = shapesArray.length
  selectedIndex = shapeIndex-1
  shapesArray[selectedIndex].element.classList.add('shape--selected')
  shapesArray.forEach((shape, index) => {
    shape.element.addEventListener('click', (e) => shapeClickHandler(e, index))
  })
}
