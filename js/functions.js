$(function() {

    // You can use either PIXI.WebGLRenderer or PIXI.CanvasRenderer
    var renderer = new PIXI.autoDetectRenderer($(window).width(), $(window).height());

    //Append the renderer to the DOM
    document.body.appendChild(renderer.view);

    //declare all variables
    var body = document.body;
    var main_layer_zoom_scale = 1;
    var main_layer_zoom_scalemax = 10;
    var main_layer_zoom_scalemin = 1;
    var main_layer_zoom_offset_x = 0;
    var main_layer_zoom_offset_y = 0;

    //Used to check if mouse is down
    var mousedown = false;

    var mainLayer = new PIXI.DisplayObjectContainer();
    var stage = new PIXI.Stage;
    var graphicLayer = new PIXI.DisplayObjectContainer();
    var testGraphic = new PIXI.Graphics();
    var testGraphic2 = new PIXI.Graphics();
    var testGraphic3 = new PIXI.Graphics();
    var testGraphic4 = new PIXI.Graphics();

    //Setup the stage properties
    stage.setBackgroundColor(0xcccccc);

    //Build object styles
    testGraphic.beginFill(0x000000);
    testGraphic.lineStyle(2, 0xFF0000);
    testGraphic.drawRect(0, 0, 10, 10);

    testGraphic4.beginFill(0x000000);
    testGraphic4.lineStyle(2, 0xFF0000);
    testGraphic4.drawRect(100, 0, 10, 10);

    testGraphic2.beginFill(0x000000);
    testGraphic2.lineStyle(2, 0xFF0000);
    testGraphic2.drawRect(100, 100, 10, 10);

    testGraphic2.beginFill(0x000000);
    testGraphic2.lineStyle(2, 0xFF0000);
    testGraphic2.drawRect(0, 100, 10, 10);

    //Build object hierarchy
    graphicLayer.addChild(testGraphic);
    graphicLayer.addChild(testGraphic2);
    graphicLayer.addChild(testGraphic3);
    graphicLayer.addChild(testGraphic4);
    mainLayer.addChild(graphicLayer);
    stage.addChild(mainLayer);

    //Animate via WebAPI
    requestAnimationFrame(animate);

    //Scale mainLayer
    mainLayer.scale.set(1,1);

    /**
     * Animates the stage
     */
    function animate() {
        renderer.render(stage);
        // Recursive animation request, disabled for performance.
        // requestAnimationFrame(animate);
    }



    /**
     *
     *
     *
     *  EVENT LISTENERS
     *
     *
     *
     */
    stage.interactionManager.onMouseDown = function(e){
        //Reset clientX and clientY to be used for relative location base panning
        clientX = -1;
        clientY = -1;
        mousedown = true;
    };

    stage.interactionManager.onMouseUp = function(e){
        mousedown = false;
    };

    stage.interactionManager.onMouseMove = function(e){
        // Check if the mouse button is down to activate panning
        if(mousedown) {

            // If this is the first iteration through then set clientX and clientY to match the inital mouse position
            if(clientX == -1 && clientY == -1) {
                clientX = e.clientX;
                clientY = e.clientY;
            }

            // Run a relative check of the last two mouse positions to detect which direction to pan on x
            if(e.clientX == clientX) {
                xPos = 0;
            } else if(e.clientX < clientX) {
                xPos = -Math.abs(e.clientX - clientX);
            } else if(e.clientX > clientX) {
                xPos = Math.abs(e.clientX - clientX);
            }

            // Run a relative check of the last two mouse positions to detect which direction to pan on y
            if(e.clientY == clientY) {
                yPos = 0;
            } else if(e.clientY < clientY) {
                yPos = -Math.abs(e.clientY - clientY);
            } else if(e.clientY > clientY) {
                yPos = Math.abs(clientY - e.clientY);
            }

            // Set the relative positions for comparison in the next frame
            clientX = e.clientX;
            clientY = e.clientY;

            // Change the main layer zoom offset x and y for use when mouse wheel listeners are fired.
            main_layer_zoom_offset_x = mainLayer.position.x + xPos;
            main_layer_zoom_offset_y = mainLayer.position.y + yPos;

            // Move the main layer based on above calucalations
            mainLayer.position.set(main_layer_zoom_offset_x, main_layer_zoom_offset_y);

            // Animate the stage
            requestAnimationFrame(animate);
        }
    };

    //Attach cross browser mouse wheel listeners
    if (body.addEventListener){
        body.addEventListener( 'mousewheel', zoom, false );     // Chrome/Safari/Opera
        body.addEventListener( 'DOMMouseScroll', zoom, false ); // Firefox
    }else if (body.attachEvent){
        body.attachEvent('onmousewheel',zoom);                  // IE
    }



    /**
     *
     *
     *
     *  METHODS
     *
     *
     *
     */
    

    /**
     * Detect the amount of distance the wheel has traveled and normalize it based on browsers.
     * @param  event
     * @return integer
     */
    function wheelDistance(evt){
      if (!evt) evt = event;
      var w=evt.wheelDelta, d=evt.detail;
      if (d){
        if (w) return w/d/40*d>0?1:-1; // Opera
        else return -d/3;              // Firefox;         TODO: do not /3 for OS X
      } else return w/120;             // IE/Safari/Chrome TODO: /3 for Chrome OS X
    };

    /**
     * Detect the direction that the scroll wheel moved
     * @param event
     * @return integer
     */
    function wheelDirection(evt){
      if (!evt) evt = event;
      return (evt.detail<0) ? 1 : (evt.wheelDelta>0) ? 1 : -1;
    };

    /**
     * Zoom into the DisplayObjectContainer that acts as the stage
     * @param event
     */
    function zoom(evt){

        // Find the direction that was scrolled
        var direction = wheelDirection(evt);

        // Find the normalized distance
        var distance = wheelDistance(evt);

        // Set the old scale to be referenced later
        var old_scale = main_layer_zoom_scale

        // Find the position of the clients mouse
        x = evt.clientX;
        y = evt.clientY;

        // Manipulate the scale based on direction
        main_layer_zoom_scale = old_scale + direction;

        //Check to see that the scale is not outside of the specified bounds
        if (main_layer_zoom_scale > main_layer_zoom_scalemax) main_layer_zoom_scale = main_layer_zoom_scalemax
        else if (main_layer_zoom_scale < main_layer_zoom_scalemin) main_layer_zoom_scale = main_layer_zoom_scalemin

        // This is the magic. I didn't write this, but it is what allows the zoom to work.
        main_layer_zoom_offset_x = (main_layer_zoom_offset_x - x) * (main_layer_zoom_scale / old_scale) + x
        main_layer_zoom_offset_y = (main_layer_zoom_offset_y - y) * (main_layer_zoom_scale / old_scale) + y

        //Set the position and scale of the DisplayObjectContainer
        mainLayer.scale.set(main_layer_zoom_scale, main_layer_zoom_scale);
        mainLayer.position.set(main_layer_zoom_offset_x, main_layer_zoom_offset_y);

        //Animate the stage
        requestAnimationFrame(animate);
        
    }
});