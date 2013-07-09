$(document).ready(function(){
	
	// read data from json
	var data = $.ajax({type:'GET',
			url:'pepsi.json',
			async: false
			});
	data = JSON.parse(data.responseText);

	/*--------------------------
     fetch instagram+twitter+facebook data
    --------------------------*/
    var data_dynamic = $.ajax({type:'GET',
			url:'data.json',
			async: false
			});
	data_dynamic = JSON.parse(data_dynamic.responseText);



	App = {
		paper : new Raphael('player-screen', $('#player').width(), this.youtube ? $('#player').height()-35 : $('#player').height()), // Paper for raphael elements
		player : new Player('myAudio', 'play-pause', 'playButton', 'pauseButton', 'player-volume', 'player-fullscreen', 'progress-cursor', 'progress-bar', data.frameDuration),

		width : $('#player-screen').width(),
		height : $('#player-screen').height(),
		
		fullscreen : 0,
		frameDuration : data.frameDuration,

		Layers: [],
		instagram: data_dynamic.instagram,
		twitter: data_dynamic.twitter,
		facebook: data_dynamic.facebook,

		months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
		fonts:{}
	}

	App.paper.canvas.className.baseVal="raphaelPaper"; // give this el a class
	// Define width and height of loaded afx video
	App.paper.svgWidth = data.width;
	App.paper.svgHeight = data.height;
	App.globalTransform = "S"+App.width/App.paper.svgWidth+", "+App.height/App.paper.svgHeight+", 0, 0"; // scale from afx screen to fit player
	App.globalTransform_fs = "S"+screen.width/App.paper.svgWidth+", "+(screen.width*9/16)/App.paper.svgHeight+", 0, 0"; // transform for full screen mode

	var clip = document.createElement('mask');
	clip.setAttribute('id', "masking");
	var path = document.createElement('path');
	// path.setAttribute('d', "M724,-56C724,-56,50,-56,50,-56C50,-56,50,598,50,598C50,598,724,598,724,598C724,598,724,-56,724,-56Z" );
	path.setAttribute('d', "M0,0 L0,300 L300,300 L300,0 Z" );
	clip.appendChild(path);
	App.paper.defs.appendChild(clip);

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