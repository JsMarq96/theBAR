
var ServerCommunication = {
  send_log_in: function (name, pass) {
    var key = (name + '_' + pass);
    var login_request = {'type':'login', 'name': name, 'data': key, 'style':1};
    socket.send(JSON.stringify(login_request));
    console.log("Send login", login_request);
  },
  
  send_register: function () {
    var key = md5(name_input.value + '_' + pass_input.value);
    var register_request = {'type':'register', 'data': key};
    socket.send(JSON.stringify(register_request));
    console.log("Send register");
  },
  
  send_start_moving_character: function (position, direction) {
    socket.send(JSON.stringify({'type':'start_moving','start_pos': position, 'direction':direction}));
  },
  
  send_stop_moving_characte: function (position) {
    socket.send(JSON.stringify({'type':'stop_moving','end_pos': position}));
  },
  
  init: function() {
    // Config serverside socket
    socket = new WebSocket('ws://localhost:9035/messages');
  
    socket.addEventListener('open', (event) => {
      CurrentScene.socket = socket;
    
      //init_menu();
      //ServerCommunication.send_log_in('test', 'test');
    });
  
    socket.addEventListener('message', (event) => {
      console.log(event.data);
      var msg_obj = JSON.parse(event.data);
    
      if (msg_obj.type.localeCompare("logged_in") == 0) {
        // TODO
        CurrentScene.current_user_id = msg_obj.id;
        
        document.getElementById("login_menu").remove();
  
        // Add in table users
        for(const table in msg_obj.room_state.tables) {
          for(const seat in msg_obj.room_state.tables[table].seats) {
            var user = msg_obj.room_state.tables[table].seats[seat];
            CurrentScene.add_seated_user(parseInt(user.id), user.style, table, seat);
          }
        }
  
        // Add free roaming users
        for(const i in msg_obj.room_state.free_roaming_users) {
          const user = msg_obj.room_state.free_roaming_users[i];
          console.log(user);
          CurrentScene.add_free_roaming_user(parseInt(user.id), user.style, user.position, user.direction);
        }
  
      } else if (msg_obj.type.localeCompare("start_moving") == 0) {
        // TODO
        CurrentScene.start_moving_user(msg_obj.user_id, msg_obj.start_pos, msg_obj.direction);
      } else if (msg_obj.type.localeCompare("stop_moving") == 0) {
        // TODO
        CurrentScene.end_moving_user(msg_obj.user_id, msg_obj.end_pos);
      } else if (msg_obj.type.localeCompare("new_character") == 0) {
        // TODO
        CurrentScene.add_free_roaming_user(msg_obj.user.id, msg_obj.user.style, msg_obj.user.position, [0,0,0]);
      } else if (msg_obj.type.localeCompare("user_disconnect") == 0) {
        // TODO
      } else if (msg_obj.type.localeCompare("login_error") == 0) {
        // TODO
    
        alert(msg_obj.msg);
      } else if (msg_obj.type.localeCompare("register_error") == 0) {
        // TODO
    
        alert("Error registering in: the user is already in the system");
      } else if (msg_obj.type.localeCompare("registered_in") == 0) {
        // TODO
    
        alert("User registered correctly!");
      }
      });
  }
};