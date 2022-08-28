loaded = () => {
  console.log('LOADED: ./draw.js');
}

// * Setup Canvas
const canvas = document.getElementById('mainCanvas');
const context = canvas.getContext('2d');

canvas.width =  800; // visualViewport.width;
canvas.height = 600; // visualViewport.height;

// * Drawing helpers
const gradiant = context.createLinearGradient(0, 0, 0, visualViewport.height);
gradiant.addColorStop(0, "#9CE");
gradiant.addColorStop(1, "white");

const redrawBackground = () => {
  context.fillStyle = gradiant
  context.fillRect(0, 0, canvas.width, canvas.height)
}

const drawRect = (props) => {
  const { x, y, w, h, c } = props;
  context.fillStyle = c;
  context.fillRect(x, y, w, h);
}

const drawImage = (props) => {
  // todo: calculate ration and scale to the nearest in relation to the window size
  const { image, x, y, w, h, ox, oy, ow, oh, cut = false } = props;

  if (!cut) {
    const { image, x, y, w, h } = props;

    context.drawImage(image, x, y, w, h);
  } else {
    context.drawImage(image, ox, oy, ow, oh, x, y, w, h);
  }
}


class Sprite {
  constructor({ 
      name = '',
      position = { x: 0, y: 0 },
      size = { w: 0, h: 0 },
      cutPosition = { x: 0, y: 0 },
      cutSize = { w: 0, h: 0 },
      maxFrames = 1,
      imageSrc = null,
      cut = false,
      alignment = [0, 0] 
    } = {
      name: '',
      cutPosition: { x: 0, y: 0 },
      cutSize: { w: 0, h: 0 },
      size: { w: 0, h: 0 },
      position: { x: 0, y: 0 },
      maxFrames: 1,
      imageSrc: null,
      cut: false,
      alignment: [0, 0]
    }) {
    this.name = name;
    this.image = new Image();
    this.image.src = imageSrc;

    this.cut = cut,
    this.maxFrames = maxFrames;
    this.currentFrame = 0;
    this.scale = 1;
    this.alignment = alignment;

    this.frameSize = {
      w: Math.floor( (this.image.width) / maxFrames),
      h: this.image.height
    }

    this.position = position;
    this.size = {
      w: size.w > 0 ? size.w : this.frameSize.w,
      h: size.h > 0 ? size.h : this.frameSize.h
    }

    this.cutPosition = {
      x: cut ? this.frameSize.w * this.currentFrame : cutPosition.x > 0 ? cutPosition.x : 0,
      y: cut ? 0 : cutPosition.x > 0 ? cutPosition.x : 0
    }
    cutPosition;

    this.cutSize = {
      w: cut ? this.frameSize.w : cutSize.w > 0 ? cutSize.w : this.size.w,
      h: cut ? this.frameSize.h : cutSize.h > 0 ? cutSize.h : this.size.h
    }
  }

  draw = () => {
    drawImage({
      cut: this.cut,
      image: this.image,
      x: this.position.x,
      y: this.position.y,
      w: this.size.w,
      h: this.size.h,
      ox: this.cut ? this.frameSize.w * this.currentFrame : this.cutPosition.x > 0 ? this.cutPosition.x : 0,
      oy: this.cutPosition.y,
      ow: this.cutSize.w,
      oh: this.cutSize.h,
    })
  }

  update = () => {
    this.currentFrame = (this.currentFrame + 1) % this.maxFrames;
    this.draw();
  }
}