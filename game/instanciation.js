loaded = () => {
  console.log('LOADED: ./instanciation.js');
}

// * elements
const timeDisplay = document.getElementById('timerText')
const healthBarOne = document.getElementById('healthBarOne')
const healthBarTwo = document.getElementById('healthBarTwo')

// * instances
const player = new Fighter({
  name: "leftPlayer", 
  position: { x: 100, y: 200 }, 
  size: { w: 20, h: 60 }, 
  isPlayer: true 
});

const target = new Fighter({
  name: "rightPlayer", 
  position: { x: 400, y: 200 }, 
  size: { w: 20, h: 60 }
});

const background = new Sprite({ 
  name: "background",
  position: { x: 0, y: 0 }, 
  size: { w: canvas.width, h: canvas.height }, 
  imageSrc: './sprites/background/background_layer_1.png' 
})

const shop = new Sprite({ 
  name: "shop",
  cut: true,
  // cutPosition: { x: 0, y: 0 }, 
  // cutSize: { w: canvas.width, h: canvas.height }, 
  position: { x: 300, y: 300 }, 
  size: { w: 300, h: 300 }, 
  cutLayout: { x: 6, y: 1 },
  animationFrames: { start: 0, end: 5 },
  imageSrc: './sprites/decorations/shop_anim.png' 
})
