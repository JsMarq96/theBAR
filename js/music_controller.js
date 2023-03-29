


var MusicController = {
    init: function() {

        this.playlist = [ 
            "The Heaven of my Hell",
            "Devil Trigger (TDNR)",
            "Life Goes On",
            "The Dante Dance",
            "Layer Cake",
            "Beneath the Mask"
        ];
        this.tracks_name_dir = {
            "The Heaven of my Hell": "music/TheHeavenOfMyHell.mp3",
            "Devil Trigger (TDNR)": "music/DevilTrigger-TropicalDevilNightRemix.mp3",
            "Life Goes On": "music/LifeGoesOn.mp3",
            "The Dante Dance": "music/DanteDanceMusic.mp3",
            "Layer Cake": "music/LayerCake.mp3",
            "Beneath the Mask": "music/BeneathTheMask.mp3"
        };

        this.tracks_name_length = {
            "The Heaven of my Hell": 0,
            "Devil Trigger (TDNR)": 0,
            "Life Goes On": 0,
            "The Dante Dance": 0,
            "Layer Cake": 0,
            "Beneath the Mask": 0
        };

        this.current_index = 0;
    },

    get_song_given_start_difference: function(difference_in_seconds){
        var diff = difference_in_seconds;
        var i = 0;
        while(true) {
            if (this.tracks_name_length[i] > diff) {
                break;
            }
            diff -= this.tracks_name_length[i];
            i = (i + 1) %this.tracks_name_length.length;
        }

        return [i, diff];
    }
};