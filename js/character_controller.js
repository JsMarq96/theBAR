
var CharacterController = {

    init: function() {
        this.can_interact = true;
    },

    player_update: function () {
        if (Object.keys(CurrentScene.users_by_id).length == 0) {
            return;
        }

        if (CurrentScene.users_by_id[CurrentScene.current_user_id].mode == FREE_ROAM) {
            this.free_roaming_update();
        } else if (CurrentScene.users_by_id[CurrentScene.current_user_id].mode == SEATED) {
            this.seated_update();
        }
    },

    free_roaming_update: function() {
        var move_local = [0, 0, 0];
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

        if (gl.keys["E"] && this.can_interact) {
            if (this.table_to_sit != null) {
                ServerCommunication.try_to_sit_at_table(this.table_to_sit);
                this.can_interact = false;
            }
        }

        var is_character_movement_equal = true;
        var is_moving = Math.sqrt(move_local[0] * move_local[0] + move_local[2] * move_local[2]) > 0.0;

        // Check if you are in a interactability area
        this.table_to_sit = null;
        if (AABB_collision(CurrentScene.users_by_id[CurrentScene.current_user_id].position,
                           start_table_2,
                           table_size_area)) {
            this.table_to_sit = 'table_2';
        } else if (AABB_collision(CurrentScene.users_by_id[CurrentScene.current_user_id].position,
                                  start_table_3,
                                  table_size_area)) {
            this.table_to_sit = 'table_3';
        }

        if (this.table_to_sit != null) {
            InGameMenuController.show_sit_to_table(this.table_to_sit);
        } else {
            InGameMenuController.hide_sit_to_table();
        }

        for (var i = 0; i < 3; i++) {
            is_character_movement_equal = CurrentScene.users_by_id[CurrentScene.current_user_id].direction[i] == move_local[i];
            if (!is_character_movement_equal) {
                break;
            }
        }

        if (!is_character_movement_equal) {
            if (is_moving) {
                ServerCommunication.send_start_moving_character(CurrentScene.users_by_id[CurrentScene.current_user_id].position, move_local);
            } else {
                ServerCommunication.send_stop_moving_characte(CurrentScene.users_by_id[CurrentScene.current_user_id].position);
            }
        }

        // Follow the camera
        if (is_moving) {
            CurrentScene.camera_controller.update_character(CurrentScene.users_by_id[CurrentScene.current_user_id].position);
        }
        //console.log("pos", CurrentScene.users_by_id[CurrentScene.current_user_id].position);
    },
    seated_update: function () {
        
    }
};