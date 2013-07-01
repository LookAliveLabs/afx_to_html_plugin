$(document).ready(function(){
	
	// read data from json
	var data = $.ajax({type:'GET',
			url:'pepsi.json',
			async: false
			});
	data = JSON.parse(data.responseText);

	App = {
		paper : new Raphael('player-screen', $('#player').width(), this.youtube ? $('#player').height()-35 : $('#player').height()), // Paper for raphael elements
		player : new Player('myAudio', 'play-pause', 'playButton', 'pauseButton', 'player-volume', 'player-fullscreen', 'progress-cursor', 'progress-bar', data.frameDuration),

		width : $('#player-screen').width(),
		height : $('#player-screen').height(),
		
		fullscreen : 0,
		frameDuration : data.frameDuration,

		Layers: []
	}
	App.paper.canvas.className.baseVal="raphaelPaper"; // give this el a class
	// Define width and height of loaded afx video
	App.paper.svgWidth = data.width;
	App.paper.svgHeight = data.height;
	App.globalTransform = "S"+App.width/App.paper.svgWidth+", "+App.height/App.paper.svgHeight+", 0, 0"; // scale from afx screen to fit player
	App.globalTransform_fs = "S"+screen.width/App.paper.svgWidth+", "+(screen.width*9/16)/App.paper.svgHeight+", 0, 0"; // transform for full screen mode

	// setup raphael custom Attributes for rectangles - centerX and centerY - allows us to define rectangle location using center point, not top left corner.
	// Its easier to read center+width+height from after effects
    App.paper.customAttributes.centerX = function (num) {
		var width = this.attr('width');
		return {x: num - width/2};
    };
    App.paper.customAttributes.centerY = function (num) {
		var height = this.attr('height');
		return {y: num - height/2};
    };

    // Draw Shapes!
    async.map(data.layers, function(layer, callback){
    	var l = new Layer(layer, App.paper);
    	App.Layers.push(l);
		callback(null);
	}, function(err){
		
		// animations on playback
	    App.player.popcorn.on('playing', function(){
			//check if need to start any animations
			App.interval = setInterval(function(){
				async.map(App.Layers, function(layer, callback){
			    	layer.setAttributes(App.player.popcorn.currentTime(), App);
					callback(null);
				}, function(err){
				});
			},App.frameDuration);
		});

		App.player.popcorn.on('seeked', function(){
			self.ended = false;
			// check if need to start any animations
			async.map(App.Layers, function(layer, callback){
		    	layer.setAttributes(App.player.popcorn.currentTime(), App);
				callback(null);
			}, function(err){
			});
		});
		//stop animations on Pause
		App.player.popcorn.on('pause', function(){
			//pause all animations
			clearInterval(App.interval);
		});

	});

	

    

})