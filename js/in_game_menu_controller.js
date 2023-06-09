
var InGameMenuController = {
    init: function(scene){
        this.scene = scene;

        // Get in table
        this.get_in_table = {
            table_2: [101, 40 ,-27],
            table_3: [176, 40 ,-27]
        };

        this.sit_to_table = null;
        this.jukebox_music = null;

        gl.textures["e_to_sit"] = GL.Texture.fromURL("data/e_to_sit.png", { minFilter: gl.LINEAR_MIPMAP_LINEAR, magFilter: gl.LINEAR });
        this.tex_e_to_sit = "e_to_sit";
        gl.textures["e_to_music"] = GL.Texture.fromURL("data/e_to_music.png", { minFilter: gl.LINEAR_MIPMAP_LINEAR, magFilter: gl.LINEAR });
    },
    show_sit_to_table: function (table) {
        if (this.sit_to_table != null) {
            this.scene.root.removeChild(this.sit_to_table);
        }
        this.sit_to_table = new RD.SceneNode({mesh:"plane",scale:[40,30,1],flags:{two_sided:true}});
        this.sit_to_table.texture = this.tex_e_to_sit;
        this.sit_to_table.position = [... this.get_in_table[table]];
        this.scene.root.addChild(this.sit_to_table);
    }, 
    show_jukebox_music: function () {
        if (this.jukebox_music != null) {
            this.scene.root.removeChild(this.jukebox_music);
        }
        this.jukebox_music = new RD.SceneNode({mesh:"plane",scale:[40,30,1],flags:{two_sided:true}});
        this.jukebox_music.texture = "e_to_music";
        this.jukebox_music.position = [27, 30, -56];
        this.scene.root.addChild(this.jukebox_music);
    },
    hide_sit_to_table: function(table) {
        if (this.sit_to_table != null) {
            this.scene.root.removeChild(this.sit_to_table);
            this.sit_to_table = null;
        }
    },
    hide_all_menus: function() {
        if (this.sit_to_table != null) {
            this.scene.root.removeChild(this.sit_to_table);
            this.sit_to_table = null;
        }
        if (this.jukebox_music != null) {
            this.scene.root.removeChild(this.jukebox_music);
            this.jukebox_music = null;
        }
    }
};