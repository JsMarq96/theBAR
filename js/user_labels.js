
function get_label_texture(user) {

    var user_name_width = user.length * 9 + 12;

    var subcanvas = document.createElement("canvas");
    subcanvas.width = user_name_width;
    subcanvas.height = 30;

    var subctx = subcanvas.getContext("2d");
    subctx.fillStyle = "white";
        
    subctx.font = "20px serif";

    subctx.font = "23px serif";
    subctx.fillStyle = "black";
    subctx.fillText(user, 0.0, 30);

    text = GL.Texture.fromImage(subcanvas, { wrap: gl.CLAMP_TO_EDGE });

    delete subcanvas;
    return text;
}


var UserLabelsController = {
    init: function() {
        this.labels_by_id = {};
    },

    update: function() {
        for(const key in CurrentScene.users_by_id) {
            this.labels_by_id[key].translate(CurrentScene.users_by_id[key].direction);
            //console.log(key, this.labels_by_id[key].position, CurrentScene.users_by_id[key].position);
            //vec3.add(this.labels_by_id[key].position, CurrentScene.users_by_id[key].position, [0,20,0]);
        }
    },

    create_label_for_user: function(user_id, name) {
        var texture_id = ":label" + name + '_' + new Date().getTime();

        var position = [];
        vec3.add(position, CurrentScene.users_by_id[user_id].position, [0,25,0]);

        gl.textures[texture_id] = get_label_texture(name);

        var label = new RD.SceneNode({mesh:"plane",scale:[text.width/5.0,text.height/5.0,1],flags:{two_sided:true}});
        label.texture = texture_id; //assign canvas texture to node
        label.position = [... position];
        label.text_id = texture_id;
        CurrentScene.scene.root.addChild(label);

        this.labels_by_id[user_id] = label;
    }
};