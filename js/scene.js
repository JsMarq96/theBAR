var scene = null;
var renderer = null;

var animations = {};
var animation = null;

var walkarea = null;

var socket = null;

const FREE_ROAM = 0;
const SEATED = 1;


var start_table_2 = [137, 0, -1];
var start_table_3 = [204, 0, -1];
var table_size_area = [65,0, 24];

var jukebox_area_origin = [54, 0, -35];
var jukebox_area_size = [42, 0, 11];


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

        this.user_name_by_id = {};

        this.current_user_id = 3;

        ServerCommunication.init();

        CharacterController.init();

        OverlayMenusController.init();

        UserLabelsController.init();

        MusicController.init();

        this.mode = FREE_ROAM;

        // Seated positions
        this.seated_positions = {
            'table_2': { 0 : [77, 10, -83], 
                         1 : [125, 10, -83], 
                         2:  [77, 10, -43], 
                         3 : [125, 10, -41],  
                         },
            'table_3': { 0 : [155, 10, -85], 1 : [200, 10, -85], 2: [153, 10, -46], 3 : [200, 10, -46] },
        };

        this.seated_orientations = {
            0 : [-1, 0, 0], 
            1 : [1, 0, 0], 
            2:  [-1, 0, 0], 
            3 : [1, 0, 0], 
               
        };
        
        this.table_camera = {
            'table_1':{ pos: [], look_at: [] },
            'table_2':{ pos: [101, 30, 21], look_at: [101, 40, -78] },
            'table_3':{ pos: [176, 30, 21], look_at: [176, 40, -84] }
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
        this.walkarea.addRect([-5,0,-19],215,104);
        this.walkarea.addRect([-6,0,-47],81,35);

        InGameMenuController.init(this.scene);
    
        //load a GLTF for the room
        var room = new RD.SceneNode({scaling:40,position:[0,-.01,0]});
        room.loadGLTF("data/room.glb");
        this.scene.root.addChild( room );
        
        this.camera_controller = CameraController.init([-29, 30, 12], [66, 0, -67]);
        this.dialoge_controller = DialogeController.init(this.scene);
    
        OverlayMenusController.show_login_menu();

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
        }   
        
        context.onupdate = function(dt) {
            //not necessary but just in case...
            CurrentScene.scene.update(dt);
    
            var t = getTime();

            // Update the positions of all characters
            for(const user_id in CurrentScene.users_by_id) {
                if (CurrentScene.users_by_id[user_id].mode == SEATED) {
                    continue;
                }
                var user_direction = CurrentScene.users_by_id[user_id].direction;

                if (Math.sqrt(user_direction[0]*user_direction[0] + user_direction[2]*user_direction[2]) <= 0.0) {
                    // Back to ground level
                    if (CurrentScene.users_by_id[user_id].position[1] > 0) {
                        CurrentScene.users_by_id[user_id].position[1] = 0.0;
                        //CurrentScene.users_by_id[user_id].translate([0, -CurrentScene.users_by_id[user_id].position[1], 0]);
                    }
                    continue;
                }

                var facing_point = [];
                vec3.add(facing_point, CurrentScene.users_by_id[user_id].position, user_direction);

                CurrentScene.users_by_id[user_id].orientTo(facing_point,true,[0,1,0],false,true);

                CurrentScene.users_by_id[user_id].rotation_angle = Math.lerp(CurrentScene.users_by_id[user_id], get_rotation_angle(CurrentScene.users_by_id[user_id].position, facing_point), 0.25);

                CurrentScene.users_by_id[user_id].translate(CurrentScene.users_by_id[user_id].direction);
                //var nearest_pos = CurrentScene.walkarea.adjustPosition( CurrentScene.users_by_id[user_id].position );
                //CurrentScene.users_by_id[user_id].position = nearest_pos;
                CurrentScene.users_by_id[user_id].translate([0, (0.0 + Math.sin((t - CurrentScene.users_by_id[user_id].start_mov_time)/70.0))/2.0, 0]);
            }
    
            // CONTROL OF THE CURRENT USER
            //control with keys
            
            CharacterController.player_update();

            CurrentScene.update_misc();

            UserLabelsController.update();

            CurrentScene.camera_controller.update_camera();
        }
    
        //capture mouse events
        context.captureMouse(true);
        context.captureKeys();
    
        //launch loop
        context.animate();
    },

    update_misc: function() {
        if (this.mode == SEATED) {
            if (CurrentScene.camera_controller.is_camera_at(this.table_camera[this.curr_table].pos)) {
                OverlayMenusController.show_send_message_menu();
            }
        }
    },


    // Only called if the currentclient is going to sit
    change_to_seated_mode: function(table_id, seat_id) {
        InGameMenuController.hide_all_menus();
        this.mode = SEATED;
        this.curr_table = table_id;
        this.curr_seat = seat_id;
        console.log(table_id, seat_id, this.table_camera[table_id]);
        CurrentScene.camera_controller.look_at_point(this.table_camera[table_id].look_at, this.table_camera[table_id].pos);
    },

    change_to_free_roam_mode: function() {
        this.mode = FREE_ROAM;
        this.curr_table = null;
        this.curr_seat = null;
        CurrentScene.camera_controller.switch_camera_mode();
        document.getElementById("message_box").remove();
        OverlayMenusController.message_box_on = false;

        DialogeController.remove_all_messages();
    },

    // WEB BASED EVENTS
    add_free_roaming_user: function(user_id, name, style, position, direction) {
        console.log(user_id);
        this.user_name_by_id[user_id] = name;
        var new_character = new RD.SceneNode({scaling:5.0,position:[0,-.01,0]});
        new_character.loadGLTF("data/char_white.glb");
        new_character.inital_rotation = [... new_character.rotation];
        new_character.rotation_angle = 1.5707963267948966;
        new_character.position = [... position];
        new_character.direction = [... direction];
        new_character.mode = FREE_ROAM;
        this.scene.root.addChild( new_character );

        CurrentScene.users_by_id[user_id] = new_character;

        UserLabelsController.create_label_for_user(user_id, name);
    },
    add_seated_user: function(user_id, name, style, table_id, seat_id) {
        this.user_name_by_id[user_id] = name;
        var new_character = new RD.SceneNode({scaling:5.0,position:[0,-.01,0]});
        new_character.loadGLTF("data/char_white.glb");
        new_character.inital_rotation = [... new_character.rotation];
        new_character.rotation_angle = 1.5707963267948966;
        new_character.position = [... this.seated_positions[table_id][seat_id]];
        new_character.direction = [0,0,0];
        new_character.mode = SEATED;
        new_character.table = table_id;
        new_character.seat = seat_id;

        var facing = [];
        vec3.add(facing, new_character.position, this.seated_orientations[seat_id]);
        new_character.orientTo(facing,true,[0,1,0],false,true);

        //new_character.rotation_angle = this.seated_orientations[table_id][seat_id];
        this.scene.root.addChild( new_character );

        CurrentScene.users_by_id[user_id] = new_character;
        UserLabelsController.create_label_for_user(user_id, name);
    },
    start_moving_user: function(user_id, start_pos, direction) {
        CurrentScene.users_by_id[user_id].direction = [... direction];
        CurrentScene.users_by_id[user_id].position = [... start_pos];
        CurrentScene.users_by_id[user_id].start_mov_time = getTime();
    },
    end_moving_user: function(user_id, end_pos) {
        CurrentScene.users_by_id[user_id].direction = [0,0,0];
        CurrentScene.users_by_id[user_id].position = [... end_pos];
    },
    user_join_table: function(user_id, table_id, seat_id) {
        CurrentScene.users_by_id[user_id].position = [... this.seated_positions[table_id][seat_id]];
        var facing = [];
        vec3.add(facing, CurrentScene.users_by_id[user_id].position, this.seated_orientations[seat_id]);
        CurrentScene.users_by_id[user_id].orientTo(facing,true,[0,1,0],false,true);
        CurrentScene.users_by_id[user_id].mode = SEATED;
        CurrentScene.users_by_id[user_id].table = table_id;
        CurrentScene.users_by_id[user_id].seat = seat_id;
    },
    user_exit_table: function(user_id, position) {
        CurrentScene.users_by_id[user_id].position = [... position];
        CurrentScene.users_by_id[user_id].rotation_angle = 1.5707963267948966;
        CurrentScene.users_by_id[user_id].mode = FREE_ROAM;
        CurrentScene.users_by_id[user_id].table = null;
        CurrentScene.users_by_id[user_id].seat = null;
    },
    seat_user: function(user_id, table_id, seat_id) {
        CurrentScene.users_by_id[user_id].position = [... this.seated_positions[table_id][seat_id]];
        var facing = [];
        vec3.add(facing, CurrentScene.users_by_id[user_id].position, this.seated_orientations[seat_id]);
        CurrentScene.users_by_id[user_id].orientTo(facing,true,[0,1,0],false,true);

        CurrentScene.users_by_id[user_id].direction = [0,0,0];
        CurrentScene.users_by_id[user_id].mode = SEATED;
        CurrentScene.users_by_id[user_id].table = table_id;
        CurrentScene.users_by_id[user_id].seat = seat_id;
    },
    free_roam_user: function(user_id, position) {
        CurrentScene.users_by_id[user_id].position = [... position];
        CurrentScene.users_by_id[user_id].direction = [0,0,0];
        CurrentScene.users_by_id[user_id].mode = FREE_ROAM;
        CurrentScene.users_by_id[user_id].table = null;
        CurrentScene.users_by_id[user_id].seat = null;

        var facing = [];
        vec3.add(facing, CurrentScene.users_by_id[user_id].position, [0,0,1]);
        CurrentScene.users_by_id[user_id].orientTo(facing,true,[0,1,0],false,true);
    },

    remove_user: function(user_id) {
        this.scene.root.removeChild( CurrentScene.users_by_id[user_id] );
        delete CurrentScene.users_by_id[user_id];
    }
};