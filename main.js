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
        //canvas.addEventListener('mousemove', this.mouseMove);
        //canvas.addEventListener('touchmove', this.mouseMove)
        canvas.addEventListener('mouseup', this.mouseUp);
        //canvas.addEventListener('DOMMouseScroll', this.handleScroll);
        //canvas.addEventListener('mousewheel', this.handleScroll);
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw squids
    squid_loop();
    // Put your redraw functions here
    requestAnimationFrame(redraw);
}

document.addEventListener("DOMContentLoaded", dcl => {
    // Initiate the canvas and all listeners for clicks, pan, and zoom
    canvasState.init();
    requestAnimationFrame(redraw);


         

    for(var i = 0; i < 20; i++) {
        for(var k = 0; k < 20; k++) {
            let s = new Squid();
				s.startXY = [i*64, k*64];
                s.src("https://unsplash.it/200/200")
                .setXY(i * 64, k * 64)
                .setWidth(64)
                .setHeight(64)
				.brain(function() {
					s.x += 1 * Math.random();
					s.y += 1 * Math.random();
					s.x -= 1 * Math.random();
					s.y -= 1 * Math.random();
				})
                .live();
        }
    }

    var s = new Squid();
        s.src("images/earth.png")
         .setXY(0,0)
         .setWidth(64)
         .setHeight(64)
         .live();

    document.addEventListener("keydown", kd => {
        let code = kd.keyCode;
        console.log(code);
        switch(code) {
            case 37: // go left
            case 72:
            case 65:
                s.setX(s.x - 64);
                break;
            case 38: // go up
            case 75:
            case 87:
                s.setY(s.y - 64);
                break;
            case 39: // go right
            case 76:
            case 68:
                s.setX(s.x + 64);
                break;
            case 40: // go down
            case 74:
            case 83:
                s.setY(s.y + 64);
                break;
        }
    });

    // Start playing first song after user has interacted once with the page
    let p = setInterval(function() {
        if(!sound.clicked) return;
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
