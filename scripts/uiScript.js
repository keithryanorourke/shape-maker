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