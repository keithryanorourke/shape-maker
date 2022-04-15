/**
 *
 * @param {number} integer
 * @param {string} unit
 * @returns {string} string with measurement and unit
 */
const sizeToString = (integer, unit) => {
	return integer.toString() + unit;
};

/**
 *
 * @param {string} string
 * @returns {number} measurement from provided string as number
 */
const stringToSize = (string) => {
	const size = string.split("p")[0];
	return Number(size);
};


const compareObjectKeyValues = (obj1, obj2, keys) => {
		for (let i = 0; i < keys.length; i++) {
			const key = keys[i];
			if (obj1[key] !== obj2[key]) {
				return false;
			}
		}
		return true;
}