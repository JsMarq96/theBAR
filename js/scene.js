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

        CharacterController.init();

        OverlayMenusController.init();

        this.mode = FREE_ROAM;

        // Seated positions
        this.seated_positions = {
            'table_1': { 0 : [77, 20, -83], 
                         1 : [127, 20, -84], 
                         2:  [76, 20, -57], 
                         3 : [127, 4, -57], 
                        },
            'table_2': { 0 : [77, 15, -83], 
                         1 : [125, 15, -83], 
                         2:  [77, 15, -43], 
                         3 : [125, 15, -41],  
                         },
            'table_3': { 0 : [155, 20, -85], 1 : [200, 20, -85], 2: [153, 20, -46], 3 : [200, 20, -46] },
        };

        this.seated_orientations = {
            'table_1': { 0 : 0.0, 1 : 0.0, 2: 0.0, 3 : 0.0 },
            'table_2': { 0 : 0.0, 1 : 0.0, 2: 0.0, 3 : 0.0 },
            'table_3': { 0 : 0.0, 1 : 0.0, 2: 0.0, 3 : 0.0 },
        };
        
        this.table_camera = {
            'table_1':{ pos: [], look_at: [] },
            'table_2':{ pos: [101, 30, 21], look_at: [101, 40, -78] },
            'table_3':{ pos: [176, 6, 21], lool_at: [176, 7, -84] }
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
        this.walkarea.addRect([-110,0,-30],40,50); // 35, 0 ,8

        InGameMenuController.init(this.scene);
    
        //load a GLTF for the room
        var room = new RD.SceneNode({scaling:40,position:[0,-.01,0]});
        room.loadGLTF("data/room.glb");
        room.shader = "phong";
        this.scene.root.addChild( room );

        console.log("shader", gl.shaders);
    
        this.character = new RD.SceneNode({scaling:5.0,position:[0,-.01,0]});
        this.character.loadGLTF("data/box.glb");
        this.character.inital_rotation = [... this.character.rotation];
        this.character.rotation_angle = 1.5707963267948966;
        this.scene.root.addChild( this.character );

        
        this.camera_controller = CameraController.init([0, 40, 100], this.character.position);
        this.dialoge_controller = DialogeController.init(this.scene);

        //DialogeController.add_message("Tasdad", "Lmao", 'table_2', 0);
        //DialogeController.add_message("T", "Lmaof esf effefefs sfsefsf", 'table_2', 0);
    
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

                if (Math.sqrt(user_direction[0]*user_direction[0] + user_direction[2]*user_direction[2]) <= 0.0) {
                    continue;
                }

                var facing_point = [];
                vec3.add(facing_point, CurrentScene.users_by_id[user_id].position, user_direction);

                CurrentScene.users_by_id[user_id].rotation_angle = Math.lerp(CurrentScene.users_by_id[user_id], get_rotation_angle(CurrentScene.character.position, facing_point), 0.25);

                CurrentScene.users_by_id[user_id].translate(CurrentScene.users_by_id[user_id].direction);
            }
    
            // CONTROL OF THE CURRENT USER
            //control with keys
            
            CharacterController.player_update();

            CurrentScene.update_misc();

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
        console.log(CurrentScene.users_by_id[user_id], user_id);
        CurrentScene.users_by_id[user_id].position = [... end_pos];
    },
    user_join_table: function(user_id, table_id, seat_id) {
        CurrentScene.users_by_id[user_id].position = [... this.seated_positions[table_id][seat_id]];
        CurrentScene.users_by_id[user_id].rotation_angle = this.seated_orientations[table_id][seat_id];
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
        CurrentScene.users_by_id[user_id].rotation_angle = 1.5707963267948966;
        CurrentScene.users_by_id[user_id].position = [... this.seated_positions[table_id][seat_id]];
        CurrentScene.users_by_id[user_id].direction = [0,0,0];
        CurrentScene.users_by_id[user_id].mode = SEATED;
        CurrentScene.users_by_id[user_id].table = table_id;
        CurrentScene.users_by_id[user_id].seat = seat_id;
    },
    free_roam_user: function(user_id, position) {
        CurrentScene.users_by_id[user_id].rotation_angle = 1.5707963267948966;
        CurrentScene.users_by_id[user_id].position = [... position];
        CurrentScene.users_by_id[user_id].direction = [0,0,0];
        CurrentScene.users_by_id[user_id].mode = FREE_ROAM;
        CurrentScene.users_by_id[user_id].table = null;
        CurrentScene.users_by_id[user_id].seat = null;
    }
};