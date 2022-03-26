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

// Grab all shape buttons and add them as properties to shapeButtons object
const shapeButtons = {}
shapeButtons.square = document.getElementById('square-button')
shapeButtons.circle = document.getElementById('circle-button')
shapeButtons.parallelogram = document.getElementById('parallelogram-left-button')
shapeButtons.parallelogram_right = document.getElementById('parallelogram-right-button')
shapeButtons.diamond = document.getElementById('diamond-button')

// Grab the rest of the UI buttons
const borderPlus = document.getElementById('borderPlus')
const borderMinus = document.getElementById('borderMinus')
const preview = document.getElementById('preview')
const drawButton = document.getElementById('draw')
const selectButton = document.getElementById('select')

const draggableArea = document.querySelector('.drawing-area')

/**
 * 
 * @param {number} integer 
 * @param {string} unit 
 * @returns {string} string with measurement and unit
 */
const sizeToString = (integer, unit) => {
  return integer.toString() + unit
}

/**
 * 
 * @param {string} string 
 * @returns {number} measurement from provided string as number
 */
const stringToSize = (string) => {
  const size = string.split('p')[0]
  return Number(size)
}

// Takes array of shape objects and makes a sorted copy to apply sorted z-index
const sortShapesBySize = (arr) => {
  let arrayToSort = [...arr]
  arrayToSort = arrayToSort.filter(shape => shape)
  arrayToSort.sort((shapeA, shapeB) => {
    return (stringToSize(shapeB.style.width) + stringToSize(shapeB.style.height)) - (stringToSize(shapeA.style.width) + stringToSize(shapeA.style.height))
  })
  arrayToSort.forEach((shape, index) => {
    shape.style.zIndex = index+1
  })
}

// Take in clicked object and make it the selected object, update classList to reflect this change.
const shapeClickHandler = (e, currentIndex) => {
    if(mode !== 'select') {
      return
    }
    shapesArray[selectedIndex].classList.remove('shape--selected')
    selectedIndex = currentIndex
    shapesArray[selectedIndex].classList.add('shape--selected')
    borderThickness = stringToSize(shapesArray[selectedIndex].style.borderWidth)
    preview.style.borderWidth = sizeToString(borderThickness, 'px')
}

// onClick for draggable area, creates new div and appends to draggable area.
const addNewBox = (e) => {
  if(mode !== 'draw' || newShape) {
    return
  }
  // newShape remains true as long as we are creating/resizing a shape
  newShape = true;
  const currentIndex = shapeIndex;
  // Store new shape inside of array, this makes it easier to add editing functionality later on
  shapesArray.push(document.createElement('div'))
  shapesArray[currentIndex].addEventListener('click', (e) => shapeClickHandler(e, currentIndex))
  if(shapesArray[selectedIndex]) {
    shapesArray[selectedIndex].classList.remove('shape--selected')
  }
  shapesArray[currentIndex].className = `shape shape--${formOfShape}`
  shapesArray[currentIndex].style.border= `${sizeToString(borderThickness, 'px')} solid ${colorArray[colorIndex]}` 
  draggableArea.appendChild(shapesArray[currentIndex])
  selectedIndex = currentIndex
  
  // Set initial values for position of shape
  startingPosition={x: e.clientX, y: e.clientY}
  shapesArray[currentIndex].style.top=sizeToString(startingPosition.y - 80, 'px')
  shapesArray[currentIndex].style.left=sizeToString(startingPosition.x, 'px')
}

// mousemove handler for draggable area, updates size of new shape div until mouse is released.
const sizeNewShape = (e) => {
  if (newShape && mode === 'draw') {
    // Resize shape based on cursor movement
    shapesArray[shapeIndex].style.width=sizeToString(Math.abs(e.clientX-startingPosition.x), 'px')
    shapesArray[shapeIndex].style.height=sizeToString(Math.abs(e.clientY-startingPosition.y), 'px')
    // Handling for cases where user drags up or left
    if(e.clientX < startingPosition.x) {
      shapesArray[shapeIndex].style.left=e.clientX.toString() +'px'
    }
    if(e.clientY < startingPosition.y) {
      shapesArray[shapeIndex].style.top=(e.clientY-80).toString() +'px'
    }
  }
}

// mouseup handler for draggable area, disables mousemove for draggable area and updated index for colorsArray and shapesArray
const releaseNewShape = (e) => {
  if(mode !== 'draw') {
    return
  }
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

// Drawing area events
draggableArea.addEventListener('mousedown', addNewBox)
draggableArea.addEventListener('mousemove', sizeNewShape)
draggableArea.addEventListener('mouseup', releaseNewShape)

// Button events
borderPlus.addEventListener('mousedown', () => {
  releaseBorderButton = false
  const increaseBorderThickness = setInterval(() => {
    if (releaseBorderButton) {
      clearInterval(increaseBorderThickness)
    }
    if(borderThickness<10) {
      borderThickness++
      preview.style.borderWidth = sizeToString(borderThickness, 'px')
      if(mode==='select') {
        shapesArray[selectedIndex].style.borderWidth = sizeToString(borderThickness, 'px')
      }
    }
  }, 300)
})

borderMinus.addEventListener('mousedown', () => {
  releaseBorderButton = false
  const reduceBorderThickness = setInterval(() => {
  if (releaseBorderButton) {
    clearInterval(reduceBorderThickness)
  }
  if(borderThickness>2) {
    borderThickness--
    preview.style.borderWidth = sizeToString(borderThickness, 'px')
    if(mode==='select' && shapesArray[selectedIndex]) {
      shapesArray[selectedIndex].style.borderWidth = sizeToString(borderThickness, 'px')
    }
  }
  }, 300)
})

borderPlus.addEventListener('mouseup', () => {
  releaseBorderButton = true;
})

borderMinus.addEventListener('mouseup', () => {
  releaseBorderButton = true;
})

// Make list of names of shape buttons
const shapeButtonsList = Object.keys(shapeButtons)

// Universal shape button onClick listener
const shapeButtonListener = (e, key) => {
  formOfShape = key
  preview.className = `preview ${key}`
  if(mode === 'select' && shapesArray[selectedIndex]) {
    shapesArray[selectedIndex].className = `shape shape--${key}`
  }
  shapeButtonsList.forEach(buttonName => {
    if(buttonName !== key) {
      shapeButtons[buttonName].className = `button`
    }
    else {
      shapeButtons[buttonName].className = `button button--selected`
    }
  })
}

// Loop through array of shape button names and add listener to each
shapeButtonsList.forEach(key => {
  shapeButtons[key].addEventListener('click', (e) => shapeButtonListener(e, key))
})

drawButton.addEventListener('click', () => {
  mode = 'draw'
  drawButton.className = "button button--selected"
  selectButton.className = "button"
  if(shapesArray[selectedIndex]) {
    shapesArray[selectedIndex].classList.remove('shape--selected')
  }
})

selectButton.addEventListener('click', () => {
  mode = 'select'
  drawButton.className = "button"
  selectButton.className = "button button--selected"
  if(shapesArray[selectedIndex]) {
    shapesArray[selectedIndex].classList.add('shape--selected')
  }
})

// Function to re-index event listeners on all elements of shapesArray and reset all related index variables
const reIndexShapes = () => {
  shapeIndex = shapesArray.length
  selectedIndex = shapeIndex-1
  shapesArray[selectedIndex].classList.add('shape--selected')
  shapesArray.forEach((shape, index) => {
    shape.addEventListener('click', (e) => shapeClickHandler(e, index))
  })
}

// Delete key listener which deletes selected shape and calls functio to re-index event listeners
document.addEventListener('keydown', (e) => {
  if((e.key==='Delete' || e.key==='Backspace') && mode==='select' && shapesArray[selectedIndex]) {
    draggableArea.removeChild(shapesArray[selectedIndex])
    shapesArray.splice(selectedIndex, 1)
    reIndexShapes()
  }
})