
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
            "The Heaven of my Hell": 36.963313,
            "Devil Trigger (TDNR)": 127.921708,
            "Life Goes On": 152.085,
            "The Dante Dance": 33.792,
            "Layer Cake": 267.44175,
            "Beneath the Mask": 279.222938
        };

        this.tracks_length = [
            36.963313,
            127.921708,
            152.085,
            47.177208,
            267.44175,
            279.222938
        ];

        this.current_index = 0;
        this.starting_index = 0;
        this.starting_date = null;

        this.audio_player = new Audio();
        this.audio_player.addEventListener("ended", () => {
            this.current_index = (this.current_index + 1) %this.tracks_length.length;
            this.audio_player.src = this.tracks_name_dir[this.playlist[this.current_index]];
            this.audio_player.load();
            this.audio_player.addEventListener("loadeddata", () => {
                this.audio_player.currentTime = 0;
                this.audio_player.volume = 0.25;
                this.audio_player.play();
            });
        });
    },

    get_song_given_start_difference: function(difference_in_seconds){
        var diff = difference_in_seconds;
        var i = 0;
        while(true) {
            if (this.tracks_length[i] > diff) {
                break;
            }
            diff -= this.tracks_length[i];
            i = (i + 1) % this.tracks_length.length;
        }

        return [i, diff];
    },
    get_song_given_start_difference_with_ref: function(start_index, difference_in_seconds){
        var diff = difference_in_seconds;
        var i = start_index;
        while(true) {
            if (this.tracks_length[i] > diff) {
                break;
            }
            diff -= this.tracks_length[i];
            i = (i + 1) % (this.tracks_length.length);
            console.log(diff);
        }

        return [i, diff];
    },
    play: function(index, start) {
        this.audio_player.src = this.tracks_name_dir[this.playlist[index]];
        this.audio_player.load();
        this.current_index = index;
        this.audio_player.addEventListener("loadeddata", () => {
            this.audio_player.currentTime = start;
            this.audio_player.volume = 0.25;
            this.audio_player.play();
        });
    },
    play_with_begin: function(start_time) {
        const diff_seconds = Math.abs((new Date()).getTime() - start_time.getTime()) / 1000.0;
        const start_point = this.get_song_given_start_difference(diff_seconds);
        this.play(start_point[0], start_point[1]);
    },
    play_with_reference: function(start_time, start_index) {
        const diff_seconds = Math.abs((new Date()).getTime() - start_time.getTime()) / 1000.0;
        const start_point = this.get_song_given_start_difference_with_ref(start_index, diff_seconds);
        this.play(start_point[0], start_point[1]);
    }
};