function make2DArray(arr, w = 3) {
  const newArr = [];
  while (arr.length) {
    newArr.push(arr.splice(0, w));
  }
  return newArr;
}
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array.slice();
}
function findArray2D(array, findNum) {
  let x = 0,
    y = 0;
  for (let i = 0; i < array.length; i++) {
    y = i;
    if (array[i].includes(findNum)) {
      x = array[i].indexOf(findNum);
      break;
    }
  }
  return { x, y };
}
