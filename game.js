const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 400,
  backgroundColor: "#87CEEB",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 1000 },
      debug: false
    }
  },
  scene: {
    preload,
    create,
    update
  }
};

let player, cursors, obstacles, scoreText, score = 0;
let gameOver = false;
let jumpSound, hitSound, restartText;

const game = new Phaser.Game(config);

function preload() {
  this.load.image("sky", "https://labs.phaser.io/assets/skies/sky4.png");
  this.load.image("ground", "https://labs.phaser.io/assets/sprites/platform.png");
  this.load.spritesheet("player", "https://labs.phaser.io/assets/sprites/dude.png", {
    frameWidth: 32,
    frameHeight: 48
  });
  this.load.image("obstacle", "https://labs.phaser.io/assets/sprites/crate.png");

  this.load.audio("jump", "https://labs.phaser.io/assets/audio/SoundEffects/jump.wav");
  this.load.audio("hit", "https://labs.phaser.io/assets/audio/SoundEffects/hit.mp3");
}

function create() {
  this.add.image(400, 200, "sky");

  const ground = this.physics.add.staticGroup();
  ground.create(400, 390, "ground").setScale(2).refreshBody();

  player = this.physics.add.sprite(100, 300, "player");
  player.setCollideWorldBounds(true);

  this.anims.create({
    key: "run",
    frames: this.anims.generateFrameNumbers("player", { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: "idle",
    frames: [{ key: "player", frame: 4 }],
    frameRate: 10
  });

  player.play("run");

  cursors = this.input.keyboard.createCursorKeys();
  jumpSound = this.sound.add("jump");
  hitSound = this.sound.add("hit");

  obstacles = this.physics.add.group();

  this.physics.add.collider(player, ground);
  this.physics.add.collider(obstacles, ground);
  this.physics.add.overlap(player, obstacles, hitObstacle, null, this);

  score = 0;
  scoreText = this.add.text(16, 16, "Score: 0", { fontSize: "24px", fill: "#000" });

  this.time.addEvent({
    delay: 1500,
    callback: () => {
      if (!gameOver) {
        const obstacle = obstacles.create(800, 340, "obstacle");
        obstacle.setVelocityX(-200);
        obstacle.setImmovable(true);
      }
    },
    loop: true
  });

  restartText = this.add.text(400, 200, "Game Over\nPress R to Restart", {
    fontSize: "32px",
    fill: "#ff0000",
    align: "center"
  }).setOrigin(0.5).setVisible(false);

  this.input.keyboard.on("keydown-R", () => {
    if (gameOver) {
      this.scene.restart();
      gameOver = false;
      score = 0;
    }
  });
}

function update() {
  if (gameOver) return;

  if ((cursors.space.isDown || cursors.up.isDown) && player.body.touching.down) {
    player.setVelocityY(-500);
    jumpSound.play();
  }

  if (player.body.velocity.y !== 0) {
    player.play("idle", true);
  } else {
    player.play("run", true);
  }

  score += 1;
  scoreText.setText("Score: " + Math.floor(score / 10));
}

function hitObstacle(player, obstacle) {
  this.physics.pause();
  player.setTint(0xff0000);
  player.play("idle");
  hitSound.play();
  gameOver = true;

  scoreText.setText("Game Over! Score: " + Math.floor(score / 10));
  restartText.setVisible(true);
    }
