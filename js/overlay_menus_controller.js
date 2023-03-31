
var OverlayMenusController = {
    init: function(){
        this.message_box_on = false;
        this.jukebox_on = false;
    },
    show_login_menu: function() {
        var login_container = document.createElement('div');
        login_container.id = "login_menu";

        this.name_input = document.createElement('input');
        this.name_input.id = "username_input";
        this.name_input.type = 'text';
        this.name_input.placeholder="Username";

        this.passw_input = document.createElement('input');
        this.passw_input.id = "passwd_input";
        this.passw_input.type = 'text';
        this.passw_input.placeholder="Password";

        var button = document.createElement('button');
        button.id = "login_button";
        button.innerHTML = "  Login"
        button.onclick = function(e) {
            ServerCommunication.send_log_in(OverlayMenusController.name_input.value, OverlayMenusController.passw_input.value);
        };

        var button_reg = document.createElement('button');
        button_reg.id = "register_button";
        button_reg.innerHTML = "  Register"
        button_reg.onclick = function(e) {
            console.log("Reg");
            ServerCommunication.send_register(OverlayMenusController.name_input.value, OverlayMenusController.passw_input.value);
        };

        login_container.appendChild(this.name_input);
        login_container.appendChild(this.passw_input);
        login_container.appendChild(button);
        login_container.appendChild(button_reg);

        document.body.appendChild(login_container);


        var user_guide = document.createElement('div');
        user_guide.id = "user_guide";
        user_guide.innerHTML = "<ul><li> Move with WASD or the arrow keys </li> <li>Press E to interact when prompted </li> <li>Press Escape to exit chat mode</li></ul>";
        document.body.appendChild(user_guide);
        
    },

    show_send_message_menu: function() {
        if (!this.message_box_on) {
            this.message_box_on = true;
            this.message_box = document.createElement('div');
            this.message_box.id = "message_box";


            var message_input = document.createElement('input');
            message_input.type = 'text';
            message_input.id = "message_input";
            //message_input.style.position = 'fixed';
            //message_input.style.left = '50px';
            //message_input.style.bottom = '30px';

            var send_button = document.createElement('button');
            send_button.id = "send_button";
            send_button.innerHTML = "Send";

            /*message_input.addEventListener("focusout", (event) => {
                message_box.remove();
            });

            message_input.addEventListener('click', function(e){   
                if (!message_input.contains(e.target)){
                    message_box.remove();
                }
            });*/

            message_input.addEventListener("keydown", function(e) {
                if (e.code === "Escape" && CurrentScene.mode == SEATED) {
                    console.log("fef", OverlayMenusController);
                    //OverlayMenusController.message_box.parentNode.removeChild(OverlayMenusController.message_box);
                    ServerCommunication.move_out_of_table();
                } else if (e.code === "Enter") {
                    // Send message
                    ServerCommunication.send_message(message_input.value);
                    message_input.value = "";
                }
            });


            this.message_box.append(message_input);
            this.message_box.append(send_button);
            document.body.append(this.message_box);
            message_input.focus();
        }
    },

    show_jukebox_menu: function() {
        if (!this.jukebox_on) {
            this.jukebox_box = document.createElement('div');
            this.jukebox_box.id = "jukebox_menu";

            var close_button = document.createElement("button");
            close_button.id = "music_close_button";
            close_button.innerHTML = "Close"
            close_button.addEventListener("click", function(e) {
                OverlayMenusController.jukebox_box.remove();
                OverlayMenusController.jukebox_on = false;
            });

            this.jukebox_box.append(close_button);

            var label = document.createElement('p');
            label.innerHTML = "Jukebox: Select a new song";
            label.id = "label_jukebox";
            this.jukebox_box.append(label);

            for(var i = 0; i < MusicController.playlist.length; i++) {
                var button = document.createElement("button");
                button.classList.add("music_button");
                if (i == MusicController.current_index) {
                    button.classList.add("selected_button");
                    this.selected_jukebox_button = button;
                }
                button.innerHTML = MusicController.playlist[i];
                button.index = i;
                button.addEventListener("click", function(e){
                    ServerCommunication.send_new_song(e.target.index);
                });

                this.jukebox_box.append(button);
            }


            document.body.append(this.jukebox_box);
            this.jukebox_on = true;
        }
    }
};