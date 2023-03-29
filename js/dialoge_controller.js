
function draw_rounded_square(ctx, x,y, width, height, rad, color) {
    // from http://jsfiddle.net/robhawkes/gHCJt/
    // Set faux rounded corners
    ctx.lineJoin = "round";
    ctx.strokeStyle = color;
    ctx.lineWidth = rad;
    ctx.fillStyle = color;

    // Change origin and dimensions to match true size (a stroke makes the shape a bit larger)
    ctx.strokeRect(x+(rad/2), y+(rad/2), width-rad, height-rad);
    ctx.fillRect(x+(rad/2), y+(rad/2), width-rad, height-rad);
}

function get_message_texture(user, txt) {
    var text_lines = txt.match(/.{1,19}/g);
    var line_size = Math.min(txt.length, 15);

    var user_name_width = user.length * 9 + 12;

    var subcanvas = document.createElement("canvas");
    subcanvas.width = line_size * 11 + 26;
    subcanvas.height = text_lines.length * 20 + 10 + 8 + 18;

    var subctx = subcanvas.getContext("2d");
    subctx.fillStyle = "white";
        
    subctx.font = "20px serif";
    draw_rounded_square(subctx, 
                        7, 14, 
                        subcanvas.width-2 - 5, subcanvas.height - 24, 
                        10, 
                        "black");
    draw_rounded_square(subctx,
                        9.5, 12.5+4, 
                        subcanvas.width-7-5, subcanvas.height-5 - 24, 
                         10, 
                         "white");
        
    subctx.fillStyle = "black";
    subctx.font = "20px serif";

    console.log(text_lines);
    for(var i = 0; i < text_lines.length; i++) {
        console.log(text_lines[i]);
        subctx.fillText(text_lines[i], 13, (i+1) * 20 + 2 + 4 + 10);
    }

    subctx.font = "15px serif";
    draw_rounded_square(subctx, 
                        0,0, 
                        user_name_width, 19, 
                        13,
                        "black");
    draw_rounded_square(subctx, 
                       2.5, 1.2, 
                        user_name_width - 4, 16, 
                        10, 
                       "white");

    subctx.font = "15px serif";
    subctx.fillStyle = "black";
    subctx.fillText(user, 8.0, 13.250);

    text = GL.Texture.fromImage(subcanvas, { wrap: gl.CLAMP_TO_EDGE });

    delete subcanvas;
    return text;
}

var DialogeController = {
    init: function(scene) {
        this.in_scene_messages = [];
        this.scene = scene;

        this.message_pos = {
            'table_2': { 0 : [79, 50, -90], 
                         1 : [119,  50, -90], 
                         2:  [85,  50, -80], 
                         3 : [122,  50, -80],
                        },
            'table_3': { 0 : [155,  50, -90], 
                            1 : [198,  50, -90], 
                            2:  [163,  50, -80], 
                            3 : [193,  50, -80],
                        },
        };

        return this;
    },
    add_message: function(from, message, table_id, seat_id) {
        var texture_id = ":canvas" + from + '_' + new Date().getTime();

        gl.textures[texture_id] = get_message_texture(from, message);

        var panel = new RD.SceneNode({mesh:"plane",scale:[text.width/5.0,text.height/5.0,1],flags:{two_sided:true}});
        panel.texture = texture_id; //assign canvas texture to node
        panel.position = [... this.message_pos[table_id][seat_id]];
        panel.text_id = texture_id;
        this.scene.root.addChild(panel);

        if (this.in_scene_messages.length > 0) { 
            if (this.in_scene_messages.length > 6) {
                var to_delete = this.in_scene_messages.shift();
    
                // TODO clean texture
                delete gl.textures[to_delete.text_id];
    
                this.scene.root.removeChild(to_delete);
                delete to_delete;
            }

            // move upwards all the messages
            for(var i = 0; i < this.in_scene_messages.length; i++) {
                console.log(this.in_scene_messages[i].position);
                var temp_pos = [0, (text.height/5.0), 0];//(text.height/5.0) + 20.0;
                this.in_scene_messages[i].translate(temp_pos);
            }
        }

        this.in_scene_messages.push(panel);
    },
    remove_all_messages: function() {
        while(this.in_scene_messages.length > 0) {
            var to_delete = this.in_scene_messages.shift();

            this.scene.root.removeChild(to_delete);

            delete gl.textures[to_delete.text_id];

            delete to_delete;
        }
    }
};