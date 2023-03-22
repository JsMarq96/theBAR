var scene = null;
var renderer = null;

var animations = {};
var animation = null;

var walkarea = null;

var socket = null;




function get_rotation_angle(pos, pos_towards) {
    var position = [];
    vec3.sub(position, pos_towards, pos);

    return Math.atan2(position[2], position[0]);
}

var CurrentScene = {
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
        this.character.rotation_angle = 1.5707963267948966;
        this.scene.root.addChild( this.character );

        
        this.camera_controller = CameraController.init([0, 40, 100], this.character.position);
        this.dialoge_controller = DialogeController.init(this.scene);

        // main loop ***********************
    
        //main draw function
        context.ondraw = function(){
            gl.canvas.width = document.body.offsetWidth;
            gl.canvas.height = document.body.offsetHeight;
            gl.viewport(0,0,gl.canvas.width,gl.canvas.height);
    
        
    
            //clear
            CurrentScene.renderer.clear([0.1,0.1,0.1,1]);
            //render scene
            CurrentScene.renderer.render(CurrentScene.scene, CurrentScene.camera_controller.camera, null, 0b11 );
    
            var vertices = CurrentScene.walkarea.getVertices();
        }   
        
        context.onupdate = function(dt) {
            //not necessary but just in case...
            CurrentScene.scene.update(dt);
    
            var t = getTime();
            var time_factor = 1;
    
            //control with keys
            var move_local = [0,0,0];
            if (gl.keys["UP"] || gl.keys["W"]) {
                move_local[2] = -1;
            }
            if (gl.keys["DOWN"] || gl.keys["S"]) {
                move_local[2] = 1;
            }
            if (gl.keys["LEFT"] || gl.keys["A"]) {
                move_local[0] = -1;
            }
            if (gl.keys["RIGHT"] || gl.keys["D"]) {
                move_local[0] = 1;
            }

            if (gl.keys["E"]) {
                //CurrentScene.camera_controller.look_at_point([0,0,0], [20, 20, 20]);
                CurrentScene.dialoge_controller.add_message("Juan", "Hwoeooo que tal jejeje", [0,5, 0]);
            }

            var has_moved = Math.sqrt(move_local[0]*move_local[0] + move_local[1]*move_local[1] + move_local[2]*move_local[2]) > 0.0;
            
            var prev_char_pos = [... CurrentScene.character.position];
            if (has_moved) {
                var rotation = [... CurrentScene.character.rotation];

                var facing_point = [];
                vec3.add(facing_point, CurrentScene.character.position, move_local);

                console.log();
                //CurrentScene.character.rotation = [... CurrentScene.character.inital_rotation];

                CurrentScene.character.rotation_angle = Math.lerp(CurrentScene.character.rotation_angle, get_rotation_angle(CurrentScene.character.position, facing_point), 0.25);

                CurrentScene.character.rotate(CurrentScene.character.rotation_angle, [0,1,0], true);
                CurrentScene.character.translate(move_local);

                //CurrentScene.character.rotation = [... rotation];
                //console.log(angle, CurrentScene.character.position);
            } else {
                //CurrentScene.character.rotation = [... CurrentScene.character.inital_rotation];
            }
            
            CurrentScene.character.position = CurrentScene.walkarea.adjustPosition( CurrentScene.character.position );

            if (has_moved) {
                CurrentScene.camera_controller.update_character(CurrentScene.character.position);
            }
            
            CurrentScene.camera_controller.update_camera();
        }
    
        //capture mouse events
        context.captureMouse(true);
        context.captureKeys();
    
        //launch loop
        context.animate();
    
    },
    add_free_roaming_user: function(user_id, style, position, direction) {},
    add_seated_user: function(user_id, style, table_id, seat_id) {},
    start_moving_user: function(user_id, start_pos, direction) {},
    end_moving_user: function(user_id, end_pos) {},
    user_join_table: function(user_id, table_id, seat_id) {},
    user_exit_table: function(user_id, position) {}
};