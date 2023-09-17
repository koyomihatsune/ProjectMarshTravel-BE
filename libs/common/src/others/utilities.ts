export function isValidPositionArray(n: number, arr: number[]): boolean {
  if (arr.length !== n) {
    return false;
  }
  // Check if each number only appears once in the array
  const uniqueNumbers = new Set(arr);
  if (uniqueNumbers.size !== arr.length) {
    return false;
  }

  // Check if all numbers in the array are within the range [0, n-1]
  const validRange = Array.from({ length: n }, (_, i) => i);
  for (const num of arr) {
    if (num < 0 || num >= n || !validRange.includes(num)) {
      return false;
    }
  }
  // Check if the numbers form an increasing sequence from 0
  const tempArr = [...arr];
  tempArr.sort((a, b) => a - b);
  for (let i = 0; i < tempArr.length; i++) {
    if (tempArr[i] !== i) {
      return false;
    }
  }

  return true;
}
