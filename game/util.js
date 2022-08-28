loaded = () => {
  console.log('LOADED: ./util.js');
}

// * counter functions
const createCounter = (countLimit = 0) => {
  const limit = countLimit;
  let count = 0;

  return () => {
    if (count < limit) {
      count++
      return true;
    }

    return false;
  }
}
