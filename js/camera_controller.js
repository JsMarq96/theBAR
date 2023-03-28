
var CameraController = {
    init: function(starting_pos, character_pos) {
        //create camera
        this.camera = new RD.Camera();
        this.camera.perspective( 60, gl.canvas.width / gl.canvas.height, 0.1, 1000 );
        this.camera.lookAt( starting_pos, character_pos, [0,1,0] );
        this.perfect_pos = [...starting_pos];
        this.character_position = [...character_pos];
        this.current_focus = [...character_pos];
        
        this.look_point = [0,0,0];
        this.look_from = [0,0,0];

        this.follow_character = true;

        return this;
    },
    update_character: function(new_character_pos) {
        // Get teh diference in position
        var character_delta_movement = [];
        vec3.sub(character_delta_movement, new_character_pos, this.character_position);

        vec3.add(this.perfect_pos, this.perfect_pos, character_delta_movement);
        vec3.add(this.character_position, this.character_position, character_delta_movement);
    },
    update_camera: function() {
        var new_cam_pos = [0,0,0];
        if (this.follow_character) {
            vec3.lerp(new_cam_pos, this.camera.position, this.perfect_pos, 0.15);
            vec3.lerp(this.current_focus, this.current_focus, this.character_position, 0.15);
        } else {
            vec3.lerp(new_cam_pos, this.camera.position, this.look_from, 0.15);
            vec3.lerp(this.current_focus, this.current_focus, this.look_point, 0.15);
        }

        this.camera.lookAt( new_cam_pos, this.current_focus, [0,1,0] );
    },
    look_at_point: function(look_point, look_from) {
        this.follow_character = false;
        this.look_point = [... look_point];
        this.look_from = [... look_from];
    },
    look_at_character: function() {
        this.follow_character = true;
    },
    switch_camera_mode: function() {
        this.follow_character = !this.follow_character;
    },
    is_camera_at: function(pos) {
        var diff = [];
        vec3.sub(diff, pos, this.camera.position);

        return vec3.length(diff) < 1.0;
    }
};