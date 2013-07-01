function Player(meidaId, playToggleId, playButtonId, pauseButtonId, volumeButtonId, fullscreenButtonId, cursorId, progressBarId, frameDuration){
	this.ended = false;
	this.progressWidth = $('#'+progressBarId).width();
	var self = this;
	this.frameDuration = frameDuration;

	// Initialize player and return Popcorn variable
	this.popcorn = Popcorn( "#"+meidaId);
	var self = this;
	// BIND EVENTS

	//// Detect when video has ended
	this.popcorn.on('ended', function(){
    	self.ended = true;
    });
    //// Draggable timebar
    $('#'+cursorId).click(function(e){
    	e.preventDefault(); e.stopPropagation();
    }).draggable({
        "scroll":false,
        containment: "parent",
        axis: 'x',
        start: function(){
        },
        drag: function(event, ui){
            var newtime=ui.position.left*self.popcorn.duration()/self.progressWidth;
            self.popcorn.currentTime(newtime);
        }
    });
    //// Click progress bar - go to that point of the video
    $('#'+progressBarId).mousedown(function(e){
    	if(e.target.id!=cursorId){
			e.preventDefault(); e.stopPropagation();
			self.popcorn.currentTime(self.popcorn.duration() * e.offsetX / self.progressWidth);
			self.update();
			self.onBar = true;
			self.mouseStartOffset = e.offsetX;
			self.mouseStartPos = e.clientX;
		}
    }).mousemove(function(e){
    	if(self.onBar){
			self.popcorn.currentTime(self.popcorn.duration() * (self.mouseStartOffset+e.clientX - self.mouseStartPos) / self.progressWidth);
			self.update();
		}
    }).mouseup(function(e){
    	self.onBar = false;
    });

 //    //// animations on playback
    this.popcorn.on('playing', function(){
		self.ended = false;
		// //check if need to start any animations
		// app.interval = setInterval(function(){
		// 	async.map(app.screensCollection, function(screen, callback){
		//     	screen.animate();
		// 		callback(null);
		// 	}, function(err){
		// 	});
		// },app.frameRate);
	});
	this.popcorn.on('seeked', function(){
		self.ended = false;
		//check if need to start any animations
		// // app.interval = setInterval(function(){
		// 	async.map(app.screensCollection, function(screen, callback){
		//     	screen.animate();
		// 		callback(null);
		// 	}, function(err){
		// 	});
		// // },50);
	});
	//// stop animations on Pause
	this.popcorn.on('pause', function(){
		//pause all animations
		// clearInterval(app.interval);
		// display play button
		$('#'+playButtonId).show();
	    $('#'+pauseButtonId).hide();
	});
	//// on PLay
	this.popcorn.on('play', function(){
		// display pause button
		$('#'+playButtonId).hide();
	    $('#'+pauseButtonId).show();
	    self.updateBar=setInterval(function(){self.update();}, 100);
	});

	//// PlayOrPause
	$('#'+playToggleId).click(function(e){
		e.preventDefault(); e.stopPropagation();
		self.PlayOrPause();
	});
	//// ToggleVolue
	
	this.PlayOrPause = function(){
	    if(!this.popcorn.paused() && !this.ended){
	        this.popcorn.pause();
	        this.paused = true;
	        $('#'+playButtonId).show();
	        $('#'+pauseButtonId).hide();
	        window.clearInterval(this.updateBar);
	    } else{
	        this.popcorn.play();
	        this.paused = false;
	        $('#'+playButtonId).hide();
	        $('#'+pauseButtonId).show();
	        this.updateBar=setInterval(function(){self.update();}, 100);
	    }
	    // this.onBar = false;
	}

	this.update = function(){
	    if(!this.ended){
	        var left = 100*this.popcorn.currentTime()/this.popcorn.duration();
	        $('#'+cursorId).css('left', left+'%');
	        $('#player-timecode').html(this.formatTime(this.popcorn.currentTime()));
	    } else{
	        $('#'+cursorId).css('left', '0px');
	        $('#'+playButtonId).show();
	        $('#'+pauseButtonId).hide();
	        window.clearInterval(this.updateBar);
	    }
	}

	this.formatTime = function(seconds) {
	    var seconds = Math.round(seconds);
	    var minutes = Math.floor(seconds / 60);
	    seconds = Math.floor(seconds % 60);
	    minutes = (minutes >= 10) ? minutes : "0" + minutes;
	    seconds = (seconds >= 10) ? seconds : "0" + seconds;
	    return minutes + ":" + seconds;
	}

	/*---------------------------
		KEYBOARD CONTROLS
	---------------------------*/
	$(document).keyup(function(e){
		e.preventDefault(); e.stopPropagation();
		switch (e.which){
			case 37: // left arrow key
				clearInterval(self.leftKeyHold);
				if(self.shiftPressed){
					self.popcorn.currentTime(self.popcorn.currentTime() - 1);
				}else{
					self.popcorn.currentTime(self.popcorn.currentTime() - self.frameDuration/1000);
				}
				break;
			case 39: // right arrow key
				clearInterval(self.rightKeyHold);
				if(self.shiftPressed){
					self.popcorn.currentTime(self.popcorn.currentTime() + 1);
				}else{
					self.popcorn.currentTime(self.popcorn.currentTime() + self.frameDuration/1000);
				}

				break;
			case 16: // shift key
				self.shiftPressed = false;
				break;
			case 27: // escape key
				// // resize all raphael elements
		  //       self.elementsCollection.each(function(element){
				// 	if(element.get('afx')){
				// 		element.view.raphael.transform("s"+$('#player').width()/element.get('raphaelWidth')+", "+$('#player').height()/element.get('raphaelHeight')+", 0, 0");
				// 	}
				// });
				break;
			case 32: // space bar
				self.PlayOrPause(e);
				break;
		}
	}).keydown(function(e){
		e.preventDefault(); e.stopPropagation();
		switch (e.which){
			case 37: // left arrow key
				clearInterval(self.leftKeyHold);
				// start advancing keyframes
				self.leftKeyHold = setInterval(function(){
					self.popcorn.currentTime(self.popcorn.currentTime() - 0.05);
				},50);
				break;
			case 39: // right arrow key
				clearInterval(self.rightKeyHold);
				// start advancing keyframes
				self.rightKeyHold = setInterval(function(){
					self.popcorn.currentTime(self.popcorn.currentTime() + 0.05);
				},50);
				break;
			case 16: // shift key
				self.shiftPressed = true;
				break;
		}
	});
}

$(document).ready(function(){
	RaphaelToScale(playButtonSVG,0);
	RaphaelToScale(pauseButtonSVG,0);
	RaphaelToScale(volumeSVG,0);
	RaphaelToScale(fullscreenSVG,0);
})