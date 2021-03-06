class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Object {
    constructor(positionX, positionY, width, heigth) {
        this.position = new Point(positionX, positionY);
        this.width = width;
        this.heigth = heigth
    }
}

class Lighting {
    constructor(x1, y1, x2, y2) {
        this.point1 = new Point(x1, y1)
        this.point2 = new Point(x2, y2)
    }
}

class Obstacles extends Object { }

class Player extends Object {
    constructor(positionX, positionY, width, heigth, idleImage, runImage) {
        super(positionX, positionY, width, heigth)
        this.idleImage = idleImage
        this.runImage = runImage
        this.initialPosition = new Point(positionX,positionY)
        this.jump = false
        this.fall = false
    }

    setJumpHeigth(jumpHeigth){
        this.jumpHeigth = jumpHeigth
        return this
    }

    setInitialPosition(){
        this.x = this.initialPosition.x
        this.y = this.initialPosition.y
        this.jump = false
        this.fall = false
    }

    performJump() {
        if (this.jump) {
            if (this.position.y != this.initialPosition.y - this.jumpHeigth) this.position.y -= this.jumpHeigth/15
            else { this.fall = true; this.jump = false }
        }
        else if (this.fall) {
            if (this.position.y != this.initialPosition.y) this.position.y += this.jumpHeigth/15
            else this.fall = false
        }
    }

    isInJumping(){
        return this.jump || this.fall
    }
}

class Background extends Object {
    constructor(positionX, positionY, width, heigth, image) {
        super(positionX, positionY, width, heigth)
        this.image = image
    }
}

var gameOverAudios = [new Audio("game/relax_time.ogg"), new Audio("game/you're_so_fast.ogg"), new Audio("game/razminka.mp3")]
var gameOverImage = new Image()
gameOverImage.src = "game/game_over.png"
var obstacles = []
const floor = 300

var speed = 7
var spawnTime = 1000;
var game = false;
var isGameStarted = false
var score = 0
var mainThemeAudios = [new Audio("game/mainTheme1.mp3"), new Audio("game/mainTheme2.mp3")]
var timer, sound, time, currentMainTheme;
var canvas = document.getElementById("canvas")
var canvasContext = canvas.getContext("2d")
var gameOverObject
var gameOverSoundIsEnded = true
let player = preparePlayer()
document.addEventListener('DOMContentLoaded', function () {
    var [background1, background2] = createBackgrounds()
    var dino = new Image()
    dino.src = "game/dino.png"
    time = performance.now()
    canvas.heigth = 400
    var center = new Point(document.documentElement.clientHe / 2, canvas.heigth / 2)
    gameOverObject = new Object(center.x - (canvas.width / 4) / 2, center.y - (canvas.heigth / 2.5) / 2, canvas.width / 4, canvas.heigth / 2.5)


    function draw() {
        if (!isGameStarted) {
            drawMainEntities(canvasContext, background1, background2)
        }
        if (game) {
            if (performance.now() - time > spawnTime) {
                obstacles.push(new Obstacles(canvas.width - 70, canvas.heigth - 150, 70, 80))
                time = performance.now()
            }
            drawMainEntities(canvasContext, background1, background2)
            moveBackground(background1, background2)
            player.performJump()
            // drawLight()
            obstacles.forEach((item, index) => {
                canvasContext.drawImage(dino, item.position.x, item.position.y, item.width, item.heigth)
                checkCollision(item)
                item.position.x -= speed
                if (item.position.x < -item.width / 2) {
                    obstacles.splice(index, 1)
                    score++
                }

            }
            )
            canvasContext.fillStyle = "#000";
            canvasContext.font = '18px serif';
            canvasContext.fillText("Score: " + score, 10, 20);
        }
        requestAnimationFrame(draw)
    }
    draw()
}, false);

document.body.onkeydown = function (e) {
    if (e.keyCode == 32 && !player.isInJumping()) {
        player.jump = true
    }
    if (!game && e.keyCode == 32 && gameOverSoundIsEnded) {
        startGame()
    }
}

document.body.onmousedown = function (e) {
    if (e.button == 0 && !player.isInJumping()) {
        player.jump = true
    }
    if (!game && e.button == 0 && gameOverSoundIsEnded) {
        startGame()
    }
}

function checkCollision(obstacle) {
    if (obstacle.position.y > player.position.y && obstacle.position.y < player.position.y + player.heigth - 15
        && obstacle.position.x > player.position.x+15 && obstacle.position.x < player.position.x + player.width-15) {
        gameOver()
    }
}

function gameOver() {
    score = 0
    obstacles.splice(0)
    let gameOverSound = gameOverAudios[Math.floor(Math.random() * gameOverAudios.length)]
    gameOverSound.play()
    gameOverSoundIsEnded = false
    game = false
    canvasContext.drawImage(gameOverImage, gameOverObject.position.x, gameOverObject.position.y, gameOverObject.width, gameOverObject.heigth)
    gameOverSound.addEventListener("ended", function () {
        gameOverSoundIsEnded = true
        currentMainTheme.pause()
    });
}

function startGame() {
    currentMainTheme = mainThemeAudios[Math.floor(Math.random() * mainThemeAudios.length)]
    currentMainTheme.volume = 0.4
    currentMainTheme.play()
    game = true
    isGameStarted = true
    player.setInitialPosition()
}

function createBackgrounds() {
    let backgroudImage = new Image()
    backgroudImage.src = "game/back.jpg"
    let background1 = new Background(0, 0, canvas.width, canvas.heigth, backgroudImage)
    let background2 = new Background(canvas.width, 0, canvas.width, canvas.heigth, backgroudImage)
    return [background1, background2]
}

function moveBackground(background1, background2) {
    background1.position.x -= 5
    background2.position.x -= 5
    if (background1.position.x <= -canvas.width) background1.position.x = canvas.width //+ (background1.positionX + canvas.width)
    if (background2.position.x <= -canvas.width) background2.position.x = canvas.width //+ (background2.positionX + canvas.width)
}

function drawMainEntities(canvasContext, background1, background2) {
    canvasContext.drawImage(background1.image, background1.position.x, background1.position.y, background1.width, canvas.heigth)
    canvasContext.drawImage(background2.image, background2.position.x, background2.position.y, background2.width, canvas.heigth)
    canvasContext.drawImage(player.isInJumping() ? player.runImage : player.idleImage, player.position.x, player.position.y, player.width, player.heigth)
}



function drawLight(canvasContext) {
    canvasContext.beginPath()
    canvasContext.moveTo(canvas.width * Math.random())
    canvas.lineTo(75, 75)
}

function preparePlayer() {
    let idleImage = new Image()
    let rushImage = new Image()
    idleImage.src = "game/main_character.png"
    rushImage.src = "game/rush.png"
    return new Player(80, floor - 85, 100, 120, idleImage, rushImage).setJumpHeigth(165)
}
