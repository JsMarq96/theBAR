

function send_log_in(name, pass) {
  var key = md5(name + '_' + pass);
  var login_request = {'type':'login', 'name': name, 'data': key, 'style':1};
  socket.send(JSON.stringify(login_request));
  console.log("Send login", login_request);
}

function send_register() {
  var key = md5(name_input.value + '_' + pass_input.value);
  var register_request = {'type':'register', 'data': key};
  socket.send(JSON.stringify(register_request));
  console.log("Send register");
}

function send_start_moving_character(position, direction) {
  socket.send(JSON.stringify({'type':'start_moving','start_pos': position, 'direction':direction}));
}

function send_stop_moving_character(position) {
  socket.send(JSON.stringify({'type':'stop_moving','end_pos': position}));
}

function InitServerComs() {
  // Config serverside socket
  socket = new WebSocket('ws://localhost:9035/messages');

  socket.addEventListener('open', (event) => {
    CurrentScene.socket = socket;
  
    //init_menu();
    send_log_in('test', 'test');
  });

  socket.addEventListener('message', (event) => {
    console.log(event.data);
    var msg_obj = JSON.parse(event.data);
  
    if (msg_obj.type.localeCompare("logged_in") == 0) {
      // TODO
      CurrentScene.user_id = msg_obj.id;

      // Add in table users
      for(const table in msg_obj.tables) {
        for(const seat in msg_obj.tables[table].seats) {
          var user = msg_obj.tables[table].seats[seat];
          CurrentScene.add_seated_user(user.id, user.style, table, seat);
        }
      }

      // Add free roaming users
      for(const user in msg_obj.free_roaming_users) {
        CurrentScene.add_free_roaming_user(user.id, user.style, user.position, user.direction);
      }

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