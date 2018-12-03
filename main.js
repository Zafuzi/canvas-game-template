var canvas, ctx;

var canvasState = {
    lastX: 0,
    lastY: 0,
    dragStart: null,
    dragged: false,
    scaleFactor: 1.025,
    init: function () {
        canvas = document.getElementById('canvas');
        ctx = canvas.getContext('2d');
        utils.trackTransforms(ctx);
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        this.lastX = canvas.width / 2;
        this.lastY = canvas.height / 2;

        canvas.addEventListener('mousedown', this.mouseDown);
        canvas.addEventListener('touchstart', this.mouseDown)
        canvas.addEventListener('mousemove', this.mouseMove);
        canvas.addEventListener('touchmove', this.mouseMove)
        canvas.addEventListener('mouseup', this.mouseUp);
        canvas.addEventListener('DOMMouseScroll', this.handleScroll);
        canvas.addEventListener('mousewheel', this.handleScroll);
    },
    mouseDown: function (evt) {
        document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
        if(evt.type == "touchstart"){
            canvasState.lastX = evt.touches[0].pageX - canvas.offsetLeft;
            canvasState.lastY = evt.touches[0].pageY - canvas.offsetTop;
        } else {
            canvasState.lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
            canvasState.lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
        }
        canvasState.dragStart = ctx.transformedPoint(canvasState.lastX, canvasState.lastY);
        canvasState.dragged = false;
        canvasState.handleMouseCollision();
    },
    mouseMove: function (evt) {
        if(evt.type == "touchmove"){
            canvasState.lastX = evt.touches[0].offsetX || (evt.touches[0].pageX - canvas.offsetLeft);
            canvasState.lastY = evt.touches[0].offsetY || (evt.touches[0].pageY - canvas.offsetTop);
        } else {
            canvasState.lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
            canvasState.lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
        }
        
        canvasState.dragged = true;
        if (canvasState.dragStart) {
            var pt = ctx.transformedPoint(canvasState.lastX, canvasState.lastY);
            ctx.translate(pt.x - canvasState.dragStart.x, pt.y - canvasState.dragStart.y);
        }
    },
    mouseUp: function (evt) {
        canvasState.dragStart = null;
        // if (!canvasState.dragged) canvasState.zoom(evt.shiftKey ? -10 : 10);
    },
    handleScroll: function (evt) {
        var delta = evt.wheelDelta ? evt.wheelDelta / 40 : evt.detail ? -evt.detail : 0;
        if (delta) canvasState.zoom(delta);
        return evt.preventDefault() && false;
    },
    handleMouseCollision: function () {
        var X = this.dragStart.x;
        var Y = this.dragStart.y;
        // Send X,Y to a function to deal with the click / check for object under the click
    },
    zoom: function (clicks) {
        var pt = ctx.transformedPoint(canvas.width / 2, canvas.height / 2);
        ctx.translate(pt.x, pt.y);
        var factor = Math.pow(canvasState.scaleFactor, clicks);
        ctx.scale(factor, factor);
        ctx.translate(-pt.x, -pt.y);
    }
}

// Update Length and current song to reflect amount of songs you want to loop through
var sound = {
    clicked: false,
    length: 0,
    current_song: utils.getRandomInt(0, 0),
    main: null
}

// Let's you play songs in a loop
// Starts at 0.mp3 and will loop until song.length and then repeat 0.mp3
function playMusic(){
    let prefix = "music_"
    sound.main = new Audio('./music/' + prefix + sound.current_song + '.mp3');
    sound.main.play();
    sound.main.addEventListener('ended', function(){
        sound.current_song += 1;
        if(sound.current_song > sound.length) sound.current_song = 0;
        playMusic();
    })
}

function redraw() {
    // Clear the entire canvas
    var p1 = ctx.transformedPoint(0, 0);
    var p2 = ctx.transformedPoint(canvas.width, canvas.height);
    ctx.clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    // Put your redraw functions here
    writeAbout();
    drawGrid();
    drawEarth();
    requestAnimationFrame(redraw);
}

let img = new Image;
    img.src = "./images/earth.png";
var rot = 0;
function drawEarth() {
    rot += .1;
    let obj = 
    rotateImg(img, canvas.width/2 - 256/2, canvas.height/2 - 256/2, 256, 256, rot);
}

function rotateImg(img,x,y,width,height,deg){

    //Convert degrees to radian 
    var rad = deg * Math.PI / 180;

    //Set the origin to the center of the image
    ctx.translate(x + width / 2, y + height / 2);

    //Rotate the canvas around the origin
    ctx.rotate(rad);
    //draw the object
    ctx.drawImage(img, width / 2 * (-1),height / 2 * (-1),width,height);

    //reset the canvas  
    ctx.rotate(rad * ( -1 ) );
    ctx.translate((x + width / 2) * (-1), (y + height / 2) * (-1));
}

function writeAbout() {
    ctx.font = "72px sans-serif";
    ctx.fillStyle = "#eee";
    let text = "Canvas Game Template";
    let text_width = ctx.measureText(text).width;
    let approx_text_height = ctx.measureText("M").width;
    ctx.fillText(text, canvas.width/2 - text_width/2, 60);
}

function drawGrid () {
    let grid_size = 24;
    let cell_size = 45;
    for(let i = 0; i < grid_size; i++) {
        for(let k = 0; k < grid_size; k++) {
            ctx.beginPath();
            ctx.rect(k*cell_size + canvas.width/2 - (grid_size*cell_size)/2, i*cell_size + canvas.height/2 - (grid_size * cell_size)/2, cell_size, cell_size);
            ctx.strokeStyle = "#eee";
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.closePath();
        }
    }
    ctx.beginPath();
    ctx.arc(canvas.width/2, canvas.height/2, 10, 0, 2*Math.PI);
    ctx.fillStyle = "#777";
    ctx.fill();
    ctx.closePath();
}


document.addEventListener("DOMContentLoaded", dcl => {
    // Initiate the canvas and all listeners for clicks, pan, and zoom
    canvasState.init();
    requestAnimationFrame(redraw);

    // Start playing first song after user has interacted once with the page
    let p = setInterval(function() {
        if(!sound.clicked) return;
        playMusic();
        clearInterval(p);
    }, 100);
})

// Resize the canvas so it always fits the size of the window
window.addEventListener("resize", wr => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
})

document.addEventListener('click', function() {
    sound.clicked = true; // Makes sure that user has interacted with page at least once
})
