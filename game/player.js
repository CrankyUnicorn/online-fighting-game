loaded = () => {
  console.log('LOADED: ./player.js');
}

class Status {
  constructor() {
    this.key = false;
    this.controller = false;
    this.subscribed = false;
    this.matchId = false;
    this.enemyId = false;
    this.restartRound = false;
  }
}

class Fighter extends Status {
  constructor({ 
    name = '',
    position = { x: 0, y: 0 },
    size = { w: 0, h: 0 },
    isPlayer = false
  } = {
    name: '',
    position: { x: 0, y: 0 },
    size: { w: 0, h: 0 },
    isPlayer: false
  }) {
    super();
    this.name = name;
    this.position = position;
    this.initialSize = size;
    this.poseSize = { w: size.w, h: size.h };
    this.downForce = 0;
    this.jumpForce = 0;
    this.horizontalForce = 0;
    this.pushForce = 0;
    this.isProne = false;
    this.isJumping = false;
    this.isOnAir = true;
    this.isCrouching = false;
    this.pose = 'stand';
    this.mirror = false;
    this.health = 100;
    this.stamina = 100;
    this.hit = { resolved: true, posX: false, posY: false };

    // * data to be exanged with enemy - hits, damage, forces
    this.hitPosition = {
      resolved: true,
      posX: 0,
      posY: 0
    };
    this.damageAmount = {
      resolved: true,
      amount: 0
    };
    this.hitForce = {
      jumpForce: 0,
      downForce: 0,
      horizontalForce: 0
    };

    // * local controller
    this.input = isPlayer ? this.controlOne : () => { };

    // * sprite and animation
    this.sprite = new Sprite({
      name: this.name,
      cut: true,
      cutLayout: { x: 16, y: 7 },
      animationFrames: { start: 8, end: 13 },
      position: { x: 0, y: 0 },
      size: { w: 128, h: 128 },
      alignment: { v: 0.5, h: 0.6 },
      imageSrc: './sprites/character/char_blue.png'
    });

    this.spriteUpdate = this.sprite.update;
  }

  // Colliders
  hitBox = () => {
    return { x: this.position.x, y: this.position.y, w: this.poseSize.w, h: this.poseSize.h, c: '#F00' }
  }

  punchBox = () => {
    const color = '#0F0';
    const boxProps = { c: color }

    if (this.isCrouching) {
      const hitSize = { w: 60, h: 20 };

      boxProps.x = this.position.x;
      boxProps.y = this.position.y;
      boxProps.w = hitSize.w;
      boxProps.h = hitSize.h;

      if (this.mirror) {
        boxProps.x = this.position.x + this.poseSize.w - hitSize.w;
      }
    } else {
      const hitSize = { w: 40, h: 20 };

      boxProps.x = this.position.x;
      boxProps.y = this.position.y + 10;
      boxProps.w = hitSize.w;
      boxProps.h = hitSize.h;

      if (this.mirror) {
        boxProps.x = this.position.x + this.poseSize.w - hitSize.w;
      }
    }

    return boxProps;
  }

  kickBox = () => {
    const color = '#FF0';
    const boxProps = { c: color }

    if (this.isCrouching) {
      const hitSize = { w: 70, h: 20 };

      boxProps.x = this.position.x;
      boxProps.y = this.position.y + 10;
      boxProps.w = hitSize.w;
      boxProps.h = hitSize.h;

      if (this.mirror) {
        boxProps.x = this.position.x + this.poseSize.w - hitSize.w;
      }
    } else {
      const hitSize = { w: 50, h: 30 };

      boxProps.x = this.position.x;
      boxProps.y = this.position.y + 30;
      boxProps.w = hitSize.w;
      boxProps.h = hitSize.h;

      if (this.mirror) {
        boxProps.x = this.position.x + this.poseSize.w - hitSize.w;
      }
    }

    return boxProps;
  }

  calculateCollition = (attackBox, targetBox) => {
    if (
      (attackBox.x > targetBox.x && attackBox.x < targetBox.x + targetBox.w)
      || (attackBox.x + attackBox.w > targetBox.x && attackBox.x + attackBox.w < targetBox.x + targetBox.w)
      || (attackBox.x < targetBox.x && attackBox.x + attackBox.w > targetBox.x + targetBox.w)) {
      if (
        (attackBox.y > targetBox.y && attackBox.y < targetBox.y + targetBox.h)
        || (attackBox.y + attackBox.h > targetBox.y && attackBox.y + attackBox.h < targetBox.y + targetBox.h)
        || (attackBox.y < targetBox.y && attackBox.y + attackBox.h > targetBox.y + targetBox.h)) {

        return true;
      }
    }

    return false;
  }

  checkCollitions = (target) => {
    let hit = false;
    switch (this.pose) {
      case 'kick':
        hit = this.calculateCollition(this.kickBox(), target.hitBox());
        // todo: set position of hit effect
        this.hitPosition = {
          resolved: !hit,
          posX: 0,
          posY: 0
        };
        this.damageAmount = {
          resolved: !hit,
          amount: hit ? this.damageAmount.amount + 10 : 0
        };
        this.hitForce = {
          jumpForce: hit ? 5 : 0,
          downForce: hit ? 0 : 0,
          horizontalForce: hit ? !this.mirror ? 10 : -10 : 0
        };
        break;
      case 'punch':
        hit = this.calculateCollition(this.punchBox(), target.hitBox());
        // todo: set position of hit effect
        this.hitPosition = {
          resolved: !hit,
          posX: 0,
          posY: 0
        };
        this.damageAmount = {
          resolved: !hit,
          amount: hit ? this.damageAmount.amount + 8 : 0
        };
        this.hitForce = {
          jumpForce: hit ? 5 : 0,
          downForce: hit ? 0 : 0,
          horizontalForce: hit ? !this.mirror ? 10 : -10 : 0
        };
        break;
      default:
        break;
    }
  }

  draw = () => {
    switch (this.pose) {
      case 'stand':
        if (!this.isJumping) {
          this.poseSize.w = this.initialSize.w;
          this.poseSize.h = this.initialSize.h;
        }
        drawRect(this.hitBox());
        this.spriteUpdate(this);
        break;
      // jump start
      case 'jump':
      case 'crouch':
        drawRect(this.hitBox());
        this.poseSize.w = Math.ceil(this.initialSize.w * 2);
        this.poseSize.h = Math.ceil(this.initialSize.h / 2);
        // on crouch strart from bottom
        this.position.y += Math.ceil(this.initialSize.h / 2);
        break;
      case 'kick':
        drawRect(this.kickBox());
        drawRect(this.hitBox());
        break;
      case 'punch':
        drawRect(this.punchBox());
        drawRect(this.hitBox());
        break;
      default:
        break;
    }
  }


  controlOne = () => {
    if (keysDown.length > 0) {
      keysDown.forEach(element => {
        Object.entries(keysPressed).forEach(([key, value]) => {
          if (key === element) {
            if (!keysPressed[key].pressed) {
              keysPressed[key].solved = false;
            }
            keysPressed[key].pressed = true;
            return;
          }
        })
      });
    }

    if (keysUp.length > 0) {
      keysUp.forEach(element => {
        Object.entries(keysPressed).forEach(([key, value]) => {
          if (key === element) {
            keysPressed[key].pressed = false;
            return;
          }
        })
      });
    }

    Object.entries(keysPressed).forEach(([key, value]) => {

      switch (key) {
        case 'r':
          if (!keysPressed[key].solved) {
            this.actions('rotate');
            keysPressed[key].solved = true;
          }
          break;
        case 'w':
          if (!keysPressed[key].solved) {
            this.actions('jump');
            keysPressed[key].solved = true;
          }
          break;
        case 's':
          if (keysPressed[key].pressed) {
            this.actions('crouch');
          } else {
            this.actions('stand');
          }
          break;
        case 'a':
          if (keysPressed[key].pressed) {
            this.actions('goLeft');
          } else {
            this.actions('haltLeft');
          }
          break;
        case 'd':
          if (keysPressed[key].pressed) {
            this.actions('goRight');
          } else {
            this.actions('haltRight');
          }
          break;
        case 'j':
          if (!keysPressed[key].solved) {
            this.actions('kick');
            keysPressed[key].solved = true;
          }
          break;
        case 'k':
          if (!keysPressed[key].solved) {
            this.actions('punch');
            keysPressed[key].solved = true;
          }
          break;
        case 'l':
          if (!keysPressed[key].solved) {
            //this.actions('action');
            keysPressed[key].solved = true;
          }
          break;
        case 'i':
          if (!keysPressed[key].solved) {
            //this.actions('action');
            keysPressed[key].solved = true;
          }
          break;
        default:
          break;
      }
    });

    keysDown = [];
    keysUp = [];
  }


  jump = () => {
    this.jumpForce += 20;
    this.isOnAir = true;
    this.isJumping = true;
  }

  crouch = () => {
    if (!this.isCrouching) {
      this.isCrouching = true;
    }
    this.pose = 'crouch';
  }

  stand = () => {
    this.isCrouching = false;
    this.pose = 'stand';
  }

  goRight = () => {
    if (this.isCrouching) {
      this.horizontalForce += 1;
    } else if (this.isJumping) {
      this.horizontalForce += 1;
    } else {
      this.horizontalForce += 2;
    }
  }

  goLeft = () => {
    if (this.isCrouching) {
      this.horizontalForce += -1;
    } else if (this.isJumping) {
      this.horizontalForce += -1;
    } else {
      this.horizontalForce += -2;
    }
  }

  haltRight = (characterMass = 2) => {
    if (this.horizontalForce > 0) {
      this.horizontalForce = this.horizontalForce > characterMass
      ? 0 : this.horizontalForce - characterMass;
    }
  }

  haltLeft = (characterMass = 2) => {
    if (this.horizontalForce < 0) {
      this.horizontalForce = this.horizontalForce < -characterMass
      ? 0 : this.horizontalForce + characterMass;
    }
  }

  kick = () => {
    if (!this.isProne) {
      this.pose = 'kick';
    }
  }

  punch = () => {
    if (!this.isProne) {
      this.pose = 'punch';
    }
  }

  actions = (action) => {
    switch (action) {
      case 'rotate':
        this.rotate();
        break;
      case 'jump':
        this.jump();
        break;
      case 'crouch':
        this.crouch();
        break;
      case 'stand':
        this.stand();
        break;
      case 'goRight':
        this.goRight();
        break;
      case 'goLeft':
        this.goLeft();
        break;
      case 'haltRight':
        this.haltRight();
        break;
      case 'haltLeft':
        this.haltLeft();
        break;
      case 'kick':
        this.kick();
        break;
      case 'punch':
        this.punch();
        break;
      default:
        break;
    }
  }

  // Forces
  calculateHorizontalForce = () => {
    const nextHorizontalPosition = this.position.x + this.horizontalForce;
    if (nextHorizontalPosition < 0) {
      this.position.x = 0;
    } else if (nextHorizontalPosition > canvas.width - this.poseSize.w) {
      this.position.x = canvas.width - this.poseSize.w;
    } else {
      this.position.x += this.horizontalForce;
    }
  }

  calculatePushForce = () => {
    /*  if (this.pushForce > 0) {
       this.position.x -= this.pushForce--;
     } else if (this.pushForce < 0) {
       this.position.x += this.pushForce++;
     } */
  }

  calculateUpForce = () => {
    if (this.jumpForce > 0) {
      this.position.y -= this.jumpForce--;
    }
  }

  calculateDownForce = () => {
    if (this.position.y < canvas.height - this.poseSize.h) {
      this.position.y += this.downForce++;
    } else {
      // landing on the floor
      this.position.y = canvas.height - this.poseSize.h;
      this.downForce = 0;

      if (!this.isProne) {
        this.jumpForce = 0
      } else {
        // bounce floor force on prone
      }

      this.isOnAir = false
      this.isJumping = false
    }
  }

  forces = () => {
    this.calculateHorizontalForce();
    this.calculatePushForce();
    this.calculateUpForce();
    this.calculateDownForce();
  }

  // Facing
  faceTarget = (target) => {
    if (!this.isOnAir && !this.isProne) {
      if (this.position.x > target.position.x) {
        this.mirror = true;
      } else if (this.position.x < target.position.x) {
        this.mirror = false;
      }
    }
  }

  update = (target) => {
    this.input();

    if (target) {

      this.faceTarget(target);
      this.forces();
      this.draw();

      this.checkCollitions(target);
    }
  }
}