loaded = () => {
  console.log('LOADED: ./draw.js');
}

// * Setup Canvas
const canvas = document.getElementById('mainCanvas');
const context = canvas.getContext('2d');

context.mozImageSmoothingEnabled = false;
context.webkitImageSmoothingEnabled = false;
context.msImageSmoothingEnabled = false;
context.imageSmoothingEnabled = false;

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
  // todo: calculate ratios
  const { image, x, y, w, h, ox, oy, ow, oh, cut = false  } = props;
 
  if (!cut) {
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
      imageSrc = null,
      cut = false,
      cutLayout = { x: 1, y: 1 },
      animationFrames = { start: 0, end: 0 },
      alignment = { v: 1.0, h: 1.0 },
    } = {
      name: '',
      size: { w: 0, h: 0 },
      cutPosition: { x: 0, y: 0 },
      cutSize: { w: 0, h: 0 },
      position: { x: 0, y: 0 },
      imageSrc: null,
      cut: false,
      cutLayout: { x: 1, y: 1 },
      animationFrames: { start: 0, end: 0 },
      alignment: { v: 1.0, h: 1.0 },
    }) {
    this.name = name;
    this.image = new Image();
    this.image.src = imageSrc;
    
    this.mirror = false;
    this.cut = cut,
    this.cutLayout = cutLayout,
    this.animationFrames = animationFrames;
    this.currentFrame = 0;
    this.alignment = alignment;

    this.frameSize = {
      w: Math.floor((this.image.width) / this.cutLayout.x),
      h: Math.floor((this.image.height) / this.cutLayout.y) 
    }

    this.size = {
      w: size.w > 0 ? size.w : this.frameSize.w,
      h: size.h > 0 ? size.h : this.frameSize.h
    }
    this.position = {
      x: position.x - this.size.w + Math.floor(this.alignment.h * this.size.w),
      y: position.y - this.size.h + Math.floor(this.alignment.v * this.size.h)
    }

    this.cutPosition = {
      x: cut ? (this.currentFrame % cutLayout.x) * this.frameSize.w : cutPosition.x > 0 ? cutPosition.x : 0,
      y: cut ? Math.floor(this.currentFrame / cutLayout.x) * this.frameSize.h : cutPosition.x > 0 ? cutPosition.x : 0
    }

    this.cutSize = {
      w: cut ? this.frameSize.w : cutSize.w > 0 ? cutSize.w : this.size.w,
      h: cut ? this.frameSize.h : cutSize.h > 0 ? cutSize.h : this.size.h
    }
  }

  draw = () => {
    drawImage({
      cut: this.cut,
      image: this.image,
      mirror: this.mirror,
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

  update = (props = {}) => {
    this.position = props?.position ? props.position : this.position; 
    this.position = {
      x: this.position.x - this.size.w + Math.floor(this.alignment.h * this.size.w),
      y: this.position.y - this.size.h + Math.floor(this.alignment.v * this.size.h)
    }
    this.mirror = props.mirror !== null ? props.mirror : this.mirror;
    if (this.mirror) {
      this.currentFrame = this.currentFrame === this.animationFrames.start - (this.animationFrames.end - this.animationFrames.start) 
        ? this.animationFrames.start - 1 : this.currentFrame - 1;
    } else {
      this.currentFrame = this.currentFrame === this.animationFrames.end 
        ? this.animationFrames.start : this.currentFrame + 1;
    }
    this.draw();
  }
}
