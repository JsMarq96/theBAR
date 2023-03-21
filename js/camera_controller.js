
var CameraController = {
    init: function(starting_pos, character_pos) {
        //create camera
        this.camera = new RD.Camera();
        this.camera.perspective( 60, gl.canvas.width / gl.canvas.height, 0.1, 1000 );
        this.camera.lookAt( starting_pos, character_pos, [0,1,0] );
        this.perfect_pos = [...starting_pos];
        this.character_position = [...character_pos];
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
        vec3.lerp(new_cam_pos, this.camera.position, this.perfect_pos, 0.15);

        this.camera.lookAt( new_cam_pos, this.character_position, [0,1,0] );
    }
};