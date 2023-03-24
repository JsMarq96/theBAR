
var MenusController = {
    init: function(){
    },
    show_login_menu: function() {
        var login_container = document.createElement('div');
        login_container.id = "login_menu";
        login_container.style.position = 'fixed';
        login_container.style.left = '2px';
        login_container.style.top = '2px';
        login_container.style.width = '100px';
        login_container.style.height = '100%';
        login_container.style.backgroundColor = "white";

        var name_input = document.createElement('input');
        name_input.type = 'text';
        name_input.style.position = 'fixed';
        name_input.style.left = '5px';
        name_input.style.top = '5px';
        login_container.style.width = '100%';

        var passw_input = document.createElement('input');
        passw_input.type = 'text';
        passw_input.style.position = 'fixed';
        passw_input.style.left = '5px';
        passw_input.style.top = '25px';
        login_container.style.width = '100%';

        var button = document.createElement('button');
        button.style.position = 'fixed';
        button.style.left = '5px';
        button.style.top = '35px';
        button.onclick = function(e) {
            ServerCommunication.send_log_in(name_input.value, passw_input.value);
        };

        login_container.appendChild(name_input);
        login_container.appendChild(passw_input);
        login_container.appendChild(button);

        document.body.appendChild(login_container);
    }
};