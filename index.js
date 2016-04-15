(function(global) {
    var DrawingBoard = function(element) {
        if(element.tagName.toUpperCase() !== "CANVAS") {
            console.error("DrawingBoard needs a canvas element!");
            return;
        }
        this.element = element;
        this.canvas = document.createElement("canvas");
        this.init();
    };

    DrawingBoard.NORMAL = "normal";
    DrawingBoard.ERASER = "eraser";

    DrawingBoard.prototype.init = function() {
        this.context = this.element.getContext("2d");
        this.shadowContext = this.canvas.getContext("2d");
        this.canvas.width = this.width = this.element.width;
        this.canvas.height = this.height = this.element.height;
        this.background = null;
        this.paths = [];
        this.history = [];

        this.lineWidth = 10;
        this.strokeStyle = "yellow";
        this.mode = DrawingBoard.NORMAL;
        this.touch = !!("ontouchstart" in window);
        this.drawing = false;

        //add events
        this._addEvents();
    };

    DrawingBoard.prototype._addEvents = function() {
        var tapStart = this.touch ? "touchstart":"mousedown",
            tapMove = this.touch ? "touchmove":"mousemove",
            tapEnd = this.touch ? "touchend":"mouseup";

        this.element.addEventListener(tapStart, this._handleTapStart.bind(this));
        this.element.addEventListener(tapMove, this._handleTapMove.bind(this));
        this.element.addEventListener(tapEnd, this._handleTapEnd.bind(this));
    };

    DrawingBoard.prototype._handleTapStart = function(e) {
        this.drawing = true;
        this.paths = [];
        this.lastX = this.touch ? e.targetTouches[0].pageX : e.clientX - this.element.offsetLeft;
        this.lastY = this.touch ? e.targetTouches[0].pageY : e.clientY - this.element.offsetTop;
    };

    DrawingBoard.prototype.setMode = function(mode) {
        this.mode = mode;
    };

    DrawingBoard.prototype._handleTapMove = function(e) {
        if(!this.drawing)
            return false;
        var path = {},
            endX = this.touch ? e.targetTouches[0].pageX : e.clientX - this.element.offsetLeft,
            endY = this.touch ? e.targetTouches[0].pageY : e.clientY - this.element.offsetTop;
        //limit
        if(Math.abs(endX + endY - this.lastX - this.lastY) > 3) {
            path.mode = this.mode;
            path.startX = this.lastX;
            path.startY = this.lastY;
            this.lastX = path.endX = endX;
            this.lastY = path.endY = endY;
            this.paths.push(path);

            this._draw();
        }
    };

    DrawingBoard.prototype._handleTapEnd = function() {
        this.drawing = false;
        this.history.push(this.paths);
    };

    DrawingBoard.prototype.setLineWidth = function(width) {
        this.lineWidth = width;
    };

    DrawingBoard.prototype.setStrokeStyle = function(style) {
        this.strokeStyle = style;
    };

    DrawingBoard.prototype.setBackground = function(url) {
        var tempImage = new Image();
        tempImage.src = url;
        var _this = this;
        tempImage.onload = function() {
            if(tempImage.complete) {
                _this.background = tempImage;
                _this._draw();
            }
        }
    };

    DrawingBoard.prototype._draw = function() {
        //clear
        this.clear();
        //draw background
        this._drawBackground();
        //draw paths
        this._drawPaths();
    };

    DrawingBoard.prototype._drawPaths = function() {
        for(var i = 0, len = this.paths.length; i < len; i++) {
            this.shadowContext.save();

            this.shadowContext.beginPath();
            this.shadowContext.moveTo(this.paths[i].startX, this.paths[i].startY);
            this.shadowContext.lineTo(this.paths[i].endX, this.paths[i].endY);

            this.shadowContext.lineCap = "round";
            this.shadowContext.lineJoin = "round";
            this.shadowContext.lineWidth = this.lineWidth;
            this.shadowContext.strokeStyle = this.strokeStyle;

            if(this.paths[i].mode == "eraser") {
                this.shadowContext.globalCompositeOperation = "destination-out";
            }
            this.shadowContext.closePath();
            this.shadowContext.stroke();
            this.shadowContext.restore();
        }

        this.context.drawImage(this.canvas, 0, 0, this.width, this.height);
    };

    DrawingBoard.prototype._drawBackground = function() {
        if(this.background) {
            //stretch image
            this.context.drawImage(this.background, 0, 0, this.background.naturalWidth, this.background.naturalHeight,
            0, 0, this.width, this.height);
        }
    };

    DrawingBoard.prototype.clear = function() {
        this.context.clearRect(0, 0, this.width, this.height);
    };

    //exports
    if(typeof module !== "undefined" && module.exports)
        module.exports = DrawingBoard;
    else
        global.DrawingBoard = DrawingBoard;
})(window);
