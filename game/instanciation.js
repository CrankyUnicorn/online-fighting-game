loaded = () => {
  console.log('LOADED: ./instanciation.js');
}

// * elements
const timeDisplay = document.getElementById('timerText')
const healthBarOne = document.getElementById('healthBarOne')
const healthBarTwo = document.getElementById('healthBarTwo')

// * instances
const player = new Fighter({ 
  position: { x: 100, y: 200 }, 
  size: { w: 20, h: 60 }, 
  isPlayer: true 
});

const target = new Fighter({ 
  position: { x: 400, y: 200 }, 
  size: { w: 20, h: 60 } 
});

const background = new Sprite({ 
  position: { x: 0, y: 0 }, 
  size: { w: canvas.width, h: canvas.height }, 
  imageSrc: './sprites/background/background_layer_1.png' 
})

const shop = new Sprite({ 
  cut: true,
  // cutPosition: { x: 0, y: 0 }, 
  // cutSize: { w: canvas.width, h: canvas.height }, 
  position: { x: 300, y: 300 }, 
  size: { w: 300, h: 300 }, 
  maxFrames: 6,
  imageSrc: './sprites/decorations/shop_anim.png' 
})
