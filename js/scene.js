var scene = null;
var renderer = null;

var animations = {};
var animation = null;

var walkarea = null;

var socket = null;

const FREE_ROAM = 0;
const SEATED = 1;


function get_rotation_angle(pos, pos_towards) {
    var position = [];
    vec3.sub(position, pos_towards, pos);

    return Math.atan2(position[2], position[0]);
}

var CurrentScene = {
    init: function() {
        this.free_roaming_users = [];
        this.seated_users = [];

        this.users_by_id = {};

        this.current_user_id = 3;

        ServerCommunication.init();

        // Seated positions
        this.seated_positions = {
            'table_1': { 0 : [], 1 : [], 2: [], 3 : [], 4 : [], 5 : [], 6 : [] },
            'table_2': { 0 : [], 1 : [], 2: [], 3 : [], 4 : [], 5 : [], 6 : [] },
            'table_3': { 0 : [], 1 : [], 2: [], 3 : [], 4 : [], 5 : [], 6 : [] },
        };

        this.seated_orientations = {
            'table_1': { 0 : 0.0, 1 : 0.0, 2: 0.0, 3 : 0.0, 4 : 0.0, 5 : 0.0, 6 : 0.0 },
            'table_2': { 0 : 0.0, 1 : 0.0, 2: 0.0, 3 : 0.0, 4 : 0.0, 5 : 0.0, 6 : 0.0 },
            'table_3': { 0 : 0.0, 1 : 0.0, 2: 0.0, 3 : 0.0, 4 : 0.0, 5 : 0.0, 6 : 0.0 },
        };

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

            // Update the positions of all characters
            for(const user_id in CurrentScene.users_by_id) {
                if (CurrentScene.users_by_id[user_id].mode == SEATED) {
                    continue;
                }
                var user_direction = CurrentScene.users_by_id[user_id].direction;

                if (Math.sqrt(user_direction[0]*user_direction[0] + user_direction[1]*user_direction[1] + user_direction[2]*user_direction[2]) <= 0.0) {
                    continue;
                }

                var facing_point = [];
                vec3.add(facing_point, CurrentScene.users_by_id[user_id].position, user_direction);

                CurrentScene.users_by_id[user_id].rotation_angle = Math.lerp(CurrentScene.users_by_id[user_id], get_rotation_angle(CurrentScene.character.position, facing_point), 0.25);

                //CurrentScene.users_by_id[user_id].rotate(CurrentScene.users_by_id[user_id].rotation_angle, [0,1,0], true);
                CurrentScene.users_by_id[user_id].translate(CurrentScene.users_by_id[user_id].direction);
                
                CurrentScene.users_by_id[user_id].position = CurrentScene.walkarea.adjustPosition( CurrentScene.users_by_id[user_id].position );
            }
    
            // CONTROL OF THE CURRENT USER
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
                //CurrentScene.dialoge_controller.add_message("Juan", "Hwoeooo que tal jejeje", [0,5, 0]);
            }

            var is_character_movement_equal = true;
            var is_moving = Math.sqrt(move_local[0]*move_local[0] + move_local[1]*move_local[1] + move_local[2]*move_local[2]) > 0.0;

            if (Object.keys(CurrentScene.users_by_id).length > 0) {
                for(var i = 0; i < 3; i++) {
                    is_character_movement_equal = CurrentScene.users_by_id[CurrentScene.current_user_id].direction[i] == move_local[i];
                    if (!is_character_movement_equal) {
                        break;
                    }
                }
    
                if (!is_character_movement_equal) {
                    if (is_moving) {
                        ServerCommunication.send_start_moving_character(CurrentScene.users_by_id[CurrentScene.current_user_id].position, CurrentScene.users_by_id[CurrentScene.current_user_id].direction);
                    } else {
                        ServerCommunication.send_stop_moving_characte(CurrentScene.users_by_id[CurrentScene.current_user_id].position);
                    }
    
                }
    
                CurrentScene.users_by_id[CurrentScene.current_user_id].direction = [... move_local]; 
    
                if (is_moving) {
                    CurrentScene.camera_controller.update_character(CurrentScene.users_by_id[CurrentScene.current_user_id].position);
                }
            }

            
            CurrentScene.camera_controller.update_camera();
        }
    
        //capture mouse events
        context.captureMouse(true);
        context.captureKeys();
    
        //launch loop
        context.animate();
    
    },

    // WEB BASED EVENTS
    add_free_roaming_user: function(user_id, style, position, direction) {
        console.log(user_id);
        var new_character = new RD.SceneNode({scaling:5.0,position:[0,-.01,0]});
        new_character.loadGLTF("data/box.glb");
        new_character.inital_rotation = [... new_character.rotation];
        new_character.rotation_angle = 1.5707963267948966;
        new_character.position = [... position];
        new_character.direction = [... direction];
        new_character.mode = FREE_ROAM;
        this.scene.root.addChild( new_character );

        CurrentScene.users_by_id[user_id] = new_character;
    },
    add_seated_user: function(user_id, style, table_id, seat_id) {
        var new_character = new RD.SceneNode({scaling:5.0,position:[0,-.01,0]});
        new_character.loadGLTF("data/box.glb");
        new_character.inital_rotation = [... new_character.rotation];
        new_character.rotation_angle = 1.5707963267948966;
        new_character.position = [... this.seated_positions[table_id][seat_id]];
        new_character.direction = [0,0,0];
        new_character.mode = SEATED;
        new_character.rotation_angle = this.seated_orientations[table_id][seat_id];
        this.scene.root.addChild( new_character );

        CurrentScene.users_by_id[user_id] = new_character;
    },
    start_moving_user: function(user_id, start_pos, direction) {
        CurrentScene.users_by_id[user_id].direction = [... direction];
        CurrentScene.users_by_id[user_id].position = [... start_pos];
    },
    end_moving_user: function(user_id, end_pos) {
        CurrentScene.users_by_id[user_id].direction = [0,0,0];
        CurrentScene.users_by_id[user_id].position = [... end_pos];
    },
    user_join_table: function(user_id, table_id, seat_id) {
        CurrentScene.users_by_id[user_id].position = [... this.seated_positions[table_id][seat_id]];
        CurrentScene.users_by_id[user_id].rotation_angle = this.seated_orientations[table_id][seat_id];
        CurrentScene.users_by_id[user_id].mode = SEATED;
    },
    user_exit_table: function(user_id, position) {
        CurrentScene.users_by_id[user_id].position = [... position];
        CurrentScene.users_by_id[user_id].rotation_angle = 1.5707963267948966;
        CurrentScene.users_by_id[user_id].mode = FREE_ROAM;
    }
};