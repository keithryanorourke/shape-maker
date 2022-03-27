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