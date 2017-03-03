var yomo_webpage_module = {
    player: undefined,
    timerID: undefined,
    last_infos: "",
	last_videoHeight: -1,
	last_volume: -1,
	last_duration: 0,
	last_ytid: "",
	last_title: "",

    getMoviePlayer: function () {
        return document.getElementsByTagName('video')[0];
    },

    run: function () {
        var mPlayer = this.getMoviePlayer();
        if (mPlayer) {
            dump('[YOMO FF extension] got movie player at webpage\n');
            this.player = mPlayer;

            dump("Enabling Timer\n")
            dump('[YOMO FF extension] enabling info timer.\n');
            yomo_webpage_module.enableTimer(true);
			yomo_webpage_module.setEventListener();
        }
    },

    initDurationDetails: function (callBack) {
        try {
            if (callBack) {
                callBack();
            }
        } catch (e) {
            setTimeout(function () {
                yomo_webpage_module.initDurationDetails(callBack);
            }, 500);
        }
    },

    enableTimer: function (enable) {
        var f = function () {
            yomo_webpage_module.startListening(enable);
        };
        yomo_webpage_module.initDurationDetails(f);
    },

    startListening: function (enable) {
        if (enable) {
            yomo_webpage_module.startListener();
        }
    },

    startListener: function () {
        yomo_webpage_module.timerID = setInterval(yomo_webpage_module.collectInfos, 1000);
		setInterval(yomo_webpage_module.getEventInfos, 500);
    },

    collectInfos: function () {
        // get data
        var data = yomo_webpage_module.getContinuousInfos();
		var infos = data[0];
		var timestamp = data[1];
        //dump(infos);	

        // send data to extension
        // only send if new infos
        if (infos != this.last_infos) {
            yomo_webpage_module.sendInfos(infos, timestamp, true);
        }
        this.last_infos = infos;
    },

	sendInfos: function (infos, timestamp, continuousEvent) {
        var yomoElement = document.getElementsByTagName("yomo_data_element");
        if (yomoElement.length < 1) {
            yomoElement = new Array();
            yomoElement[0] = document.createElement("yomo_data_element");
            document.documentElement.appendChild(yomoElement[0]);
            dump('[YOMO FF extension] 2.5 ' + yomoElement + '\n');
        }

		//continous or event info
        yomoElement[0].setAttribute("infos", infos);
		yomoElement[0].setAttribute("timestamp", timestamp);
		if (continuousEvent) {
			var ev = new Event("yomo_continuousInfos_event", {"bubbles":true, "cancelable":false});
			yomoElement[0].dispatchEvent(ev);
		} else {
			var ev = new Event("yomo_eventInfos_event", {"bubbles":true, "cancelable":false});
		    yomoElement[0].dispatchEvent(ev);
		}
	},

    getContinuousInfos: function () {
		var infos = "";
        
        if (yomo_webpage_module.player) {
            var duration = -1;
			var bufferedTime = -1;
			var currentTime = -1;
			var availablePlaybackTime = 0;

			// get current time of the video
			currentTime = yomo_webpage_module.player.currentTime;
			infos += currentTime;

			//get timestamp
			var timestamp = new Date().getTime();

			// get available playback time
			var i = yomo_webpage_module.player.buffered.length;
			availablePlaybackTime = yomo_webpage_module.player.buffered.end(i-1);
			if (currentTime > -1 || (availablePlaybackTime != 'na')) {
				bufferedTime = availablePlaybackTime - currentTime;
				infos += "#" + bufferedTime + "#" + availablePlaybackTime + "\n";
			}
        }
        return [infos, timestamp];
    },

	getEventInfos: function () {
        var infos = "";
		var currentTime = new Date().getTime();

		// video quality
		var videoHeight = yomo_webpage_module.player.videoHeight;
		if(yomo_webpage_module.last_videoHeight != videoHeight){
			yomo_webpage_module.last_videoHeight = videoHeight;
			var videoWidth = yomo_webpage_module.player.videoWidth;
			var infos = "quality:"+ videoHeight + "p" + " (" + videoWidth + "x" + videoHeight + ")\n";
			yomo_webpage_module.sendInfos(infos, currentTime, false);
		}

		// volume
		var volume = yomo_webpage_module.player.volume;
		if(yomo_webpage_module.last_volume != volume){
			yomo_webpage_module.last_volume = volume;
			var infos = "volume:"+ volume + "\n";
			yomo_webpage_module.sendInfos(infos, currentTime, false);
		}

		// duration
		var duration = yomo_webpage_module.player.duration;
		if(yomo_webpage_module.last_duration != duration){
			yomo_webpage_module.last_duration = duration;
			var infos = "duration:"+ duration + "\n";
			yomo_webpage_module.sendInfos(infos, currentTime, false);
		}

		// youtube id
		var ytid = yomo_webpage_module.getYouTubeID();
		if(yomo_webpage_module.last_ytid != ytid){
			yomo_webpage_module.last_ytid = ytid;
			var infos = "ytid:"+ ytid + "\n";
			yomo_webpage_module.sendInfos(infos, currentTime, false);
		}

		// title
		var title = yomo_webpage_module.getTitle();
		if(yomo_webpage_module.last_title != title){
			yomo_webpage_module.last_title = title;
			var infos = "title:'"+ title + "'\n";
			yomo_webpage_module.sendInfos(infos, currentTime, false);
		}        
    },

	getYouTubeID: function () {
		var video_id = window.location.search.split('v=')[1];
		var ampersandPosition = video_id.indexOf('&');
		if(ampersandPosition != -1) {
		  video_id = video_id.substring(0, ampersandPosition);
		}
		return video_id;
	},

	getTitle: function () {
		if (document.getElementById("eow-title")) {
                return document.getElementById("eow-title").getAttribute("title");
        } else {
            // new page layout
            if (document.getElementById("watch-headline-title")) {
                return document.getElementById("watch-headline-title").getElementsByTagName("span")[0].getAttribute("title");
            } else {
                return "undefined";
            }
        }
	},

	setEventListener: function () {

		/////player state events
		//loadstart
		yomo_webpage_module.player.addEventListener("loadstart", function() 
		{
		  var event = 'loadstart';
		  var infos = event + "\n";
		  yomo_webpage_module.sendInfos(infos);
		});

		// canplay
		yomo_webpage_module.player.addEventListener("canplay", function() 
		{
		  var event = 'canplay';
		  var infos = event + "\n";
		  yomo_webpage_module.sendInfos(infos);
		});

		// playing
		yomo_webpage_module.player.addEventListener("playing", function() 
		{
		  var event = 'playing';
		  var infos = event + "\n";
		  yomo_webpage_module.sendInfos(infos);
		});

		// play
		yomo_webpage_module.player.addEventListener("play", function() 
		{
		  var event = 'play';
		  var infos = event + "\n";
		  yomo_webpage_module.sendInfos(infos);
		});

		// pause
		yomo_webpage_module.player.addEventListener("pause", function() 
		{
		  var event = 'pause';
		  var infos = event + "\n";
		  yomo_webpage_module.sendInfos(infos);
		});

		// ended
		yomo_webpage_module.player.addEventListener("ended", function()
		{
		  var event = 'ended';
		  var infos = event + "\n";
		  yomo_webpage_module.sendInfos(infos);
		});

		// stalled
		yomo_webpage_module.player.addEventListener("stalled", function() 
		{
		  var event = 'stalled';
		  var infos = event + "\n";
		  yomo_webpage_module.sendInfos(infos);
		});

		// waiting
		yomo_webpage_module.player.addEventListener("waiting", function() 
		{
		  var event = 'waiting';
		  var infos = event + "\n";
		  yomo_webpage_module.sendInfos(infos);
		});

		// abort
		yomo_webpage_module.player.addEventListener("abort", function() 
		{
		  var event = 'abort';
		  var infos = event + "\n";
		  yomo_webpage_module.sendInfos(infos);
		});

		// emptied
		yomo_webpage_module.player.addEventListener("emptied", function() 
		{
		  var event = 'emptied';
		  var infos = event + "\n";
		  yomo_webpage_module.sendInfos(infos);
		});

		// error
		yomo_webpage_module.player.addEventListener("error", function() 
		{
		  var event = 'error';
		  var infos = event + "\n";
		  yomo_webpage_module.sendInfos(infos);
		});

		// suspend
		yomo_webpage_module.player.addEventListener("suspend", function() 
		{
		  var event = 'suspend';
		  var infos = event + "\n";
		  yomo_webpage_module.sendInfos(infos);
		});
	},

};


////////////////////////////////////////////////////////

yomo_webpage_module.run();
dump('[YOMO FF extension] webpage module activated.\n');


