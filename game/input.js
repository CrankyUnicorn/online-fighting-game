loaded = () => {
  console.log('LOADED: ./input.js');
}

// * Keyboard Input
let keysDown = [];
let keysUp = [];
const keysPressed = {
  r: { solved: true, pressed: false },
  a: { solved: true, pressed: false },
  s: { solved: true, pressed: false },
  d: { solved: true, pressed: false },
  w: { solved: true, pressed: false },
  j: { solved: true, pressed: false },
  k: { solved: true, pressed: false },
  l: { solved: true, pressed: false },
  i: { solved: true, pressed: false }
};

window.addEventListener('keydown', event => {
  keysDown.push(event.key)
});

window.addEventListener('keyup', event => {
  keysUp.push(event.key)
});
