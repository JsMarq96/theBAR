var scene = null;
var renderer = null;
var camera = null;
var character = null;

var animations = {};
var animation = null;

var walkarea = null;

function draw_rounded_square(ctx, x,y, width, height, rad, color) {
    // from http://jsfiddle.net/robhawkes/gHCJt/
    // Set faux rounded corners
    ctx.lineJoin = "round";
    ctx.strokeStyle = color;
    ctx.lineWidth = rad;
    ctx.fillStyle = color;

    // Change origin and dimensions to match true size (a stroke makes the shape a bit larger)
    ctx.strokeRect(x+(rad/2), y+(rad/2), width-rad, height-rad);
    ctx.fillRect(x+(rad/2), y+(rad/2), width-rad, height-rad);
}

var CurrentScene = {
    draw_text: function(txt, user) {
        var text_lines = txt.match(/.{1,19}/g);
        var line_size = Math.min(txt.length, 15);

        var user_name_width = user.length * 12 + 4;

        var subcanvas = document.createElement("canvas");
        subcanvas.width = line_size * 13 + 5;
        subcanvas.height = text_lines.length * 20 + 10 + 8 + 13;

        var subctx = subcanvas.getContext("2d");
        subctx.fillStyle = "white";
        
        subctx.font = "20px serif";
        draw_rounded_square(subctx, 
                            7, 14, 
                            subcanvas.width-2 - 5, subcanvas.height - 24, 
                            10, 
                            "black");
        draw_rounded_square(subctx,
                             9.5, 12.5+4, 
                             subcanvas.width-7-5, subcanvas.height-5 - 24, 
                             10, 
                             "white");
        
        subctx.fillStyle = "black";
        subctx.font = "20px serif";

        console.log(text_lines);
        for(var i = 0; i < text_lines.length; i++) {
            console.log(text_lines[i]);
            subctx.fillText(text_lines[i], 13, (i+1) * 20 + 2 + 4 + 10);
        }

        subctx.font = "15px serif";
        draw_rounded_square(subctx, 
                            0,0, 
                            user_name_width, 19, 
                            13,
                            "black");
        draw_rounded_square(subctx, 
                            2.5, 1.2, 
                            user_name_width - 4, 16, 
                            10, 
                        "white");

        subctx.font = "15px serif";
        subctx.fillStyle = "black";
        subctx.fillText(user, 8.0, 13.250);

        text = GL.Texture.fromImage(subcanvas, { wrap: gl.CLAMP_TO_EDGE });

        delete subcanvas;
        return text;
    },
    init: function() {
        //create the rendering context
        var context = GL.create({width: window.innerWidth, height:window.innerHeight});
    
        //setup renderer
        this.renderer = new RD.Renderer(context);
        this.renderer.setDataFolder("data");
        this.renderer.autoload_assets = true;
    
        //attach canvas to DOM
        document.body.appendChild(this.renderer.canvas);
    
        //create a scene
        this.scene = new RD.Scene();
    
        //create camera
        this.camera = new RD.Camera();
        this.camera.perspective( 60, gl.canvas.width / gl.canvas.height, 0.1, 1000 );
        this.camera.lookAt( [0,40,100],[0,20,0],[0,1,0] );
    
        this.walkarea = new WalkArea();
        this.walkarea.addRect([-50,0,-30],80,50);
        this.walkarea.addRect([-90,0,-10],80,20);
        this.walkarea.addRect([-110,0,-30],40,50);
    
        //load a GLTF for the room
        var room = new RD.SceneNode({scaling:40,position:[0,-.01,0]});
        room.loadGLTF("data/room.gltf");
        this.scene.root.addChild( room );
    
        this.character = new RD.SceneNode({scaling:5.0,position:[0,-.01,0]});
        this.character.loadGLTF("data/box.glb");
        this.character.inital_rotation = [... this.character.rotation];
        this.scene.root.addChild( this.character );

        var text = CurrentScene.draw_text("Hellooo que tal estas tron lmao", "Juan");
        gl.textures[":canvas"] = text;
        console.log(text);

        var panel = new RD.SceneNode({mesh:"plane",scale:[text.width/4.0,text.height/4.0,1],flags:{two_sided:true}});
        panel.texture = ":canvas"; //assign canvas texture to node
        panel.position = [0,50, 0];
        this.scene.root.addChild(panel);


        // main loop ***********************
    
        //main draw function
        context.ondraw = function(){
            gl.canvas.width = document.body.offsetWidth;
            gl.canvas.height = document.body.offsetHeight;
            gl.viewport(0,0,gl.canvas.width,gl.canvas.height);
    
            
            //camera.perspective( 60, gl.canvas.width / gl.canvas.height, 0.1, 1000 );
            //camera.lookAt( camera.position, girlpos, [0,1,0] );
    
            //clear
            CurrentScene.renderer.clear([0.1,0.1,0.1,1]);
            //render scene
            CurrentScene.renderer.render(CurrentScene.scene, CurrentScene.camera, null, 0b11 );
    
            var vertices = CurrentScene.walkarea.getVertices();
            //CurrentScene.renderer.renderPoints( vertices, null, camera, null,null,null,gl.LINES );
    
            //gizmo.setTargets([monkey]);
            //renderer.render( scene, camera, [gizmo] ); //render gizmo on top
        }   
        
        context.onupdate = function(dt) {
            //not necessary but just in case...
            CurrentScene.scene.update(dt);
    
            var t = getTime();
            var time_factor = 1;
    
            //control with keys
            var move_local = [0,0,0];
            if (gl.keys["UP"] || gl.keys["W"]) {
                //CurrentScene.character.moveLocal([0,0,-1]);
                move_local[2] = -1;
            }
            if (gl.keys["DOWN"] || gl.keys["S"]) {
                //CurrentScene.character.moveLocal([0,0,1]);
                move_local[2] = 1;
            }
            if (gl.keys["LEFT"] || gl.keys["A"]) {
                //CurrentScene.character.moveLocal([-1,0,0]);
                move_local[0] = -1;
            }
            if (gl.keys["RIGHT"] || gl.keys["D"]) {
                //CurrentScene.character.moveLocal([1,0,0]);
                move_local[0] = 1;
            }
            
            if (Math.sqrt(move_local[0]*move_local[0] + move_local[1]*move_local[1] + move_local[2]*move_local[2]) > 0.0) {
                //var angle = 90.0 * dt * Math.sin(t *0.00020) * DEG2RAD;
                //var angle = 90.mod(x,1.0) - 0.5;
                //CurrentScene.character.rotate(angle, [0,0,-1]);
                var rotation = [... CurrentScene.character.rotation];

                //CurrentScene.character.rotation = [... CurrentScene.character.inital_rotation];

                CurrentScene.character.moveLocal(move_local);

                //CurrentScene.character.rotation = [... rotation];
                //console.log(angle, CurrentScene.character.position);
            } else {
                CurrentScene.character.rotation = [... CurrentScene.character.inital_rotation];
            }
            

            //var pos = girl_pivot.position;
            CurrentScene.character.position = CurrentScene.walkarea.adjustPosition( CurrentScene.character.position );
            //girl_pivot.position = nearest_pos;
    
            //move bones in the skeleton based on animation
            //anim.assignTime( t * 0.001 * time_factor );
        }
    
        //capture mouse events
        context.captureMouse(true);
        context.captureKeys();
    
        //launch loop
        context.animate();
    
    }
};