//board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//miku
let mikuWidth = 54; //width/height ratio = 408/228 = 17/12
let mikuHeight = 44;
let mikuX = boardWidth/8;
let mikuY = boardHeight/2;
let mikuImg;

let miku = {
    x : mikuX,
    y : mikuY,
    width : mikuWidth,
    height : mikuHeight
}

//pipes
let pipeArray = [];
let pipeWidth = 64; //width/height ratio = 384/3072 = 1/8
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//physics
let velocityX = -2; //pipes moving left speed
let velocityY = 0; //miku jump speed
let gravity = 0.4;

let gameOver = false;
let score = 0;
let gameStarted = false;
let countdown = 3;
let setPipeInterval = null;

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //used for drawing on the board

    //load images
    mikuImg = new Image();
    mikuImg.src = "assets/miku.png";

    topPipeImg = new Image();
    topPipeImg.src = "assets/top.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "assets/bottom.png";

    startCountdown();
}

function startCountdown() {
    gameStarted = false;
    countdown = 3;

    if (setPipeInterval) {
        clearInterval(setPipeInterval);
    }

    let countdownInterval = setInterval(() => {
        context.clearRect(0, 0, board.width, board.height);
        context.fillStyle = "white";
        context.font = "50px sans-serif";
        context.fillText(countdown > 0 ? countdown : "Go!", boardWidth / 2 - 30, boardHeight / 2);

        if (countdown === 0) {
            clearInterval(countdownInterval);

            // reset miku
            miku.y = mikuY;
            miku.x = mikuX;
            gameStarted = true;
            gameOver = false;
            pipeArray = [];
            score = 0;

            requestAnimationFrame(update);
            setPipeInterval = setInterval(placePipes, 1500);
            document.addEventListener("keydown", moveMiku);
        }
        countdown--;
    }, 1000);
}

function update() {

    if (gameOver == true) {
        startCountdown()
        return;
    }

    

    if (!gameStarted || gameOver) {
        return;
    }
    requestAnimationFrame(update);
    context.clearRect(0, 0, board.width, board.height);

    //miku
    velocityY += gravity;
    // miku.y += velocityY;
    miku.y = Math.max(miku.y + velocityY, 0); //apply gravity to current miku.y, limit the miku.y to top of the canvas
    context.drawImage(mikuImg, miku.x, miku.y, miku.width, miku.height);

    if (miku.y > board.height) {
        gameOver = true;
    }

    //pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && miku.x > pipe.x + pipe.width) {
            score += 0.5; //0.5 because there are 2 pipes! so 0.5*2 = 1, 1 for each set of pipes
            pipe.passed = true;
        }

        if (detectCollision(miku, pipe)) {
            gameOver = true;
        }
    }

    //clear pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); //removes first element from the array
    }

    //score
    context.fillStyle = "white";
    context.font="40px sans-serif";
    context.fillText(score, 5, 45);

    if (gameOver) {
        context.fillText("GAME OVER", 5, 90);
    }
}

function placePipes() {
    if (gameOver) {
        return;
    }

    //(0-1) * pipeHeight/2.
    // 0 -> -128 (pipeHeight/4)
    // 1 -> -128 - 256 (pipeHeight/4 - pipeHeight/2) = -3/4 pipeHeight
    let randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2);
    let openingSpace = board.height/4;

    let topPipe = {
        img : topPipeImg,
        x : pipeX,
        y : randomPipeY,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(topPipe);

    let bottomPipe = {
        img : bottomPipeImg,
        x : pipeX,
        y : randomPipeY + pipeHeight + openingSpace,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(bottomPipe);
}

function moveMiku(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        if (!gameStarted) return;

        //jump
        velocityY = -6;

        //reset game
        if (gameOver) {
            miku.y = mikuY;
            pipeArray = [];
            score = 0;
            gameOver = false;
            gameStarted = false;
            countdown = 3;
            startCountdown();
        }
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}