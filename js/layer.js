function Layer(layer, paper){
/*-------------------------------------------------------------
	element - Object containing element attributes
	paper - Raphael paper object on which to draw the element
-------------------------------------------------------------*/	

	this.render = function(){
	/*------------------------
		Draw Raphael Elements!
	------------------------*/
		// (1) Create raphael set of elements - reverse order to mimic order in After effects
		this.shapes = paper.set(); // set containing all the shapes in this layer

		
		// if layer has a mask - init mask
		if(layer.mask && layer.mask.length>0){
			this.maskPath = this.pathToString(layer.mask[0].path);
			// console.log(this.maskPath);
			// this.mask = new Mask(layer);
			// this.shapes.push(this.mask);
			// this.shapes.push(this.mask);
		}

		switch (layer.name.split('_')[0]){
			case "Tweet":
				var idx = parseInt(layer.name.split('_')[1])-1;
				switch(layer.name.split('_')[2]){
					case "Picture":
						var el =layer.contents[0];
						el.type='image';
						el.src = App.twitter[idx]['user_image'];
						el.y = el.y - 10;
						break;
					case "Date":
						var date = new Date(App.twitter[idx]['date']);
						layer.contents[0].text = date.getDate() + ' ' +App.months[date.getMonth()+1]; 
						break;
					case "Tweet":
						layer.contents[0].text = App.twitter[idx]['text'];
						break;
					case "Handle":
						layer.contents[0].text = App.twitter[idx]['screen_name'];
						break;
					case "Name":
						layer.contents[0].text = App.twitter[idx]['user_name'];
						break;
				}
				break;
			case "Facebook":
				var idx = parseInt(layer.name.split('_')[2])-1;
				switch(layer.name.split('_')[1]){
					case "Icon":
						layer.contents[0].src = unescape(App.facebook.picture);
						break;
					case "Status":
						layer.contents[0].text = App.facebook.data[idx].message;
						break;
					case "Photo":
						layer.contents[0].src = unescape(App.facebook.data[idx].picture);
						break;
				}
				break;
		}

		for (var e=layer.contents.length-1; e>=0; e--){

			var el = layer.contents[e]; // info for this element
			
			// pull out the initial keyframes for each attribute
			var attr = {};
			// if no transform -> set default transform
			if(!attr['transform']){
				attr['transform'] = [1,1,0,0,0,0,0,0,0];
			}
			// if this is an image -> replace src
			if(el['type'] == 'image' && layer['name'].split('_')[0]=="InstagramPhoto"){
				var idx = parseFloat(el['name'].split('_')[1]);
				el['src'] = App.instagram[idx]['href'];
			}
			if(layer.mask && layer.mask.length>0){
				el['clip-rect'] = this.maskPath;
			}
			if(el['type']=='text' && layer['name'].split('_')[0]=="InstagramText"){
				var idx = parseFloat(layer['name'].split('_')[1]);
				el['text'] = App.instagram[idx]['caption'].toUpperCase();
			}else if(el['type']=='text' && layer['name'].split('_')[0]=="InstagramUser"){
				var idx = parseFloat(layer['name'].split('_')[1]);
				el['text'] = 'USER'+App.instagram[idx]['user_id'];
			}
			
			var varyingAttrs = []; // will contain an array of all varying attributes
			for (key in el){
				if(typeof el[key] == 'object' && Object.prototype.toString.call(el[key][0])=="[object Object]"){
					if(key=='transform'){
						attr[key] = this.transformToString(el[key][0].val);
					}else if(key=='path'){
						attr[key] = this.pathToString(el[key][0].val);
					}else if(key=='fill'|| key=='stroke'){
						attr[key] = this.fillToString(el[key][0].val);
					}else if(key=='text'){
						attr[key] = el[key][0].val.replace(/%n%/g, '\n');
					}else{
						attr[key] = el[key][0].val;
					}

					// attr[key] = el[key][0].val;
					varyingAttrs.push(key);
				}else{
					if(key=='transform'){
						attr[key] = this.transformToString(el[key]);
					}else if(key=='path'){
						attr[key] = this.pathToString(el[key]);
					}else if(key=='fill'||key=='stroke'){
						attr[key] = this.fillToString(el[key]);
					}else if(key=='text'){
						attr[key] = el[key].replace(/%n%/g, '\n');
					}else{
						attr[key] = el[key];
					}
				}
			}

			var shape = paper.add([attr]).attr(attr); // force attr again, to set correct center for rectangles

			// shape is a local variable representing this shape. It will store somevariables specific to this shape
			shape = shape[0];

			// if(el['type']=='text' && layer['name'].split('_')[0]=="InstagramText"){
			// 	shape.fitText(400);
			// }
			
			// (h2) define transforms and variables for each - will be used when animating hover layers. use LAST keyframes for this
			shape.myStrokeWidth = (typeof el['stroke-width'] =='object') ? el['stroke-width'][ el['stroke-width'].length-1].val : el['stroke-width'];
			shape.myTransform = (typeof el['transform'] =='object') ? el['transform'][ el['transform'].length-1].val : el['transform'];
			shape.idx = e;
			$(shape.node).css({'display':'none'});
			// array of attrs
			shape.myVaryingAttrs = varyingAttrs;
			// shape.fullAttr = hoverObj.el[e];
			shape.initAttrs = attr;

			if(el.type=='text'){
				// fit into bbox
				shape.bbox = {
					width:el.bbox.width*App.width/App.paper.svgWidth,
					height:el.bbox.height*App.height/App.paper.svgHeight
				}
				shape.numLines =$('tspan', shape.node).length;

				textWrap(shape); // wrap text into bbox

				$('tspan', shape.node).attr('dy', attr['font-size']*1.12); // line height = 112% of text height
				$($('tspan', shape.node)[0]).attr('dy', 0);

				// download google font, if not already downloaded
				if(el['font-family']){
					var fontname = (el['font-family']).replace(/ /g, '+') + ':' + el['font-weight'] + el['font-style'];
					if(!App.fonts[fontname]){
						var wf = document.createElement('link');
				        wf.href = ('https:' == document.location.protocol ? 'https' : 'http') +
				            '://fonts.googleapis.com/css?family=' + fontname;
				        wf.type = 'rel/stylesheet';
				        wf.async = 'true';
				        var s = document.getElementsByTagName('link')[0];
				        s.parentNode.insertBefore(wf, s);

				        App.fonts[fontname] = true;
				    }
				}

			}

			// set initial transform
			var scale_transform = App.fullscreen ? App.globalTransform_fs : App.globalTransform;
			var yTranslate= App.fullscreen ? 'T0,'+(screen.height - (screen.width*9/16))/2 : ''; // mantain a 16:9 ration of width:height
			var layer_tf = (typeof this.layer.transform == 'object') ? this.layer.transform[0].val : this.layer.transform;
			shape.attr({'transform': "..."+layer_tf+scale_transform+yTranslate});

			// add this shape to the set
			this.shapes.push(shape);


		}
		
		// (h4) scale to fit screen
		// this.shapes.transform("..."+this.transform_layer+App.globalTransform); // scale to fit player

		// // (h5) reset stroke widths - there is a bug in Raphael that scales stroke width in the opposite direction. If scale by 1/3, stroke scales by 3 :(
		// this.shapes.forEach(function(el){
		// 	// if(e.type!='text'){
		// 		el.attr({'stroke-width':el.myStrokeWidth*App.width/App.paper.svgWidth});
		// 	// }
		// });

	},
	this.intrapolateAttribute = function(frames,t){
		var kf = Math.floor(t/App.frameDuration);
		// frames is an array of objects{kf, val}
		// find the closest keyframe to t
		if(kf<=frames[0].kf){ // beofre first frame
			return frames[0].val;
		}else if(kf >= frames[frames.length-1].kf){ // after last frame
			return frames[frames.length-1].val;
		}else{ // find frame position
			var idxA = 0;
			for(var i = 0; i<frames.length; i++){
				if((frames[i].kf-kf)>0){
					idxA = i;
					break;
				}
			}
			idxA = idxA-1;

			var fraction = (kf-frames[idxA].kf)/(frames[idxA+1].kf - frames[idxA].kf);
			return parseFloat(frames[idxA].val) + fraction*( parseFloat(frames[idxA+1].val) - parseFloat(frames[idxA].val) );
		}


		
	}
	this.intrapolateTransform = function(frames, t,App){
		var kf = Math.floor(t/App.frameDuration);

		// frames is an array of objects{kf, val}
		// find the closest keyframe to t
		if(kf<=frames[0].kf){ // beofre first frame
			return this.transformToString(frames[0].val);
		}else if(kf >= frames[frames.length-1].kf){ // after last frame
			return this.transformToString(frames[frames.length-1].val);
		}else{ // find frame position

			var idx = 0;
			for(var i = 0; i<frames.length; i++){
				if((frames[i].kf-kf)>0){
					idx = i;
					break;
				}
			}
			idx = idx-1;

			var fraction = (kf-frames[idx].kf)/(frames[idx+1].kf - frames[idx].kf);
			var transform = intrapolateArrays( frames[idx].val, frames[idx+1].val, fraction );
			return this.transformToString(transform);
		}
		
	},
	this.intrapolatePath = function(frames, t, App){
		var kf = Math.floor(t/App.frameDuration);

		// frames is an array of objects{kf, val}
		// find the closest keyframe to t
		if(kf<=frames[0].kf){ // beofre first frame
			return this.pathToString(frames[0].val);
		}else if(kf >= frames[frames.length-1].kf){ // after last frame
			return this.pathToString(frames[frames.length-1].val);
		}else{ // find frame position

			var idx = 0;
			for(var i = 0; i<frames.length; i++){
				if((frames[i].kf-kf)>0){
					idx = i;
					break;
				}
			}
			idx = idx-1;

			var fraction = (kf-frames[idx].kf)/(frames[idx+1].kf - frames[idx].kf);
			var path = intrapolateArrays( frames[idx].val, frames[idx+1].val, fraction );
			return this.pathToString(path);
		}
	},
	this.intrapolateFill = function(frames, t){
		var kf = Math.floor(t/App.frameDuration);

		// frames is an array of objects{kf, val}
		// find the closest keyframe to t
		if(kf<=frames[0].kf){ // beofre first frame
			return this.fillToString(frames[0].val);
		}else if(kf >= frames[frames.length-1].kf){ // after last frame
			return this.fillToString(frames[frames.length-1].val);
		}else{ // find frame position

			var idx = 0;
			for(var i = 0; i<frames.length; i++){
				if((frames[i].kf-kf)>0){
					idx = i;
					break;
				}
			}
			idx = idx-1;

			var fraction = (kf-frames[idx].kf)/(frames[idx+1].kf - frames[idx].kf);
			var path = intrapolateArrays( frames[idx].val, frames[idx+1].val, fraction );
			return this.fillToString(path);
		}
	}
	/*---------------------------------------------- 
		transformToString: transform is a 1D array [scalex, scaley, anchorx, anchory, degre, anchorx, anchory, positionx, positoiny]
	--------------------------------------------- */
	this.transformToString = function(transform){
		var str = 'S'+transform.slice(0,4).join(',')+'R'+transform.slice(4,7).join(',')+'T'+transform.slice(7,9).join(',');
		// transform.splice(0,0,'S');
		// transform.splice(5,0,'R');
		// transform.splice(9,0,'T');
		return str;
	},

	/*---------------------------------------------- 
		pathToString: path is a 2D array of vertices
	--------------------------------------------- */
	this.pathToString = function(path){
		var str = path.slice();
		// str = 'M' + str.join('C') + 'Z';
		str = str.join('C') + 'Z';
		return str.replace(',', '');
		// return str;
	},
	/*---------------------------------------------- 
		fillToString: fill is a 1D array of [r,g,b,a] values
	--------------------------------------------- */
	this.fillToString = function(fill){
		if(Object.prototype.toString.call(fill) == "[object Array]"){
			var clone = fill.slice();
			return 'rgb('+clone.splice(0,3).multArray(255).join(',')+')';
		}else{
			return '';
		}
	},
	this.setAttributes = function(t, App){
	/*-------------------------------
		setAttributes: set layer attributes at time t - used for animating the element
	-------------------------------*/
		var kf = t/App.frameDuration;
		var self = this;

		if(t<this.layer.inPoint || t>this.layer.outPoint){
			// hide the layer
			this.shapes.forEach(function(shape){
			    $(shape.node).css({display: 'none'});
			});
		}else{

			var scale_transform = App.fullscreen ? App.globalTransform_fs : App.globalTransform;
			var yTranslate= App.fullscreen ? 'T0,'+(screen.height - (screen.width*9/16))/2 : ''; // mantain a 16:9 ration of width:height
			var layer_tf = (typeof this.layer.transform == 'object') ? this.intrapolateTransform(this.layer.transform,t,App) : this.layer.transform;

			this.shapes.forEach(function(shape){

			    shape.attr(shape.initAttrs)
			    // animate all changing attributes
			    async.each(shape.myVaryingAttrs, function(attr, callback){ // !!!!!!!!!!!!!!

					var value = attr=='transform' ? self.intrapolateTransform(self.layer.contents[shape.idx][attr],t,App) : 
											(attr=='path' ? self.intrapolatePath(self.layer.contents[shape.idx][attr],t,App) : 
											(attr=='fill' || attr=='stroke' ? self.intrapolateFill(self.layer.contents[shape.idx][attr],t) : self.intrapolateAttribute(self.layer.contents[shape.idx][attr],t) ));

					
					shape.attr( attr , value);
					
					callback(null);
				}, function(err){
					// add additional transforms
					var strokeWidth = shape.attr('stroke-width');
				    shape.attr({'transform': "..."+layer_tf+scale_transform+yTranslate});
				    $(shape.node).css({'stroke-width': strokeWidth }); // force stroke width. Raphael js has a bug -> stroke width resets during scale
				   	
				    if(shape.clip) shape.clip.setAttribute('transform', '');

				   	// adjust text
				    if(self.layer.type=='text'){

						// if(self.layer['name'].split('_')[0]=="InstagramText"){
						// 	shape.fitText(400);
						// }else{
							textWrap(shape);
						// }
						$('tspan', shape.node).attr('dy', shape.attr('font-size')*1.12); // line height = 112% of text height
						$($('tspan', shape.node)[0]).attr('dy', 0);

					}

				    // make shape visible
				    $(shape.node).css({display: 'block'});
				});
			});
		}
	}

	this.layer = layer;
	this.layer.transform = (typeof this.layer.transform == 'object' && typeof this.layer.transform[0] == 'object') ? this.layer.transform : this.transformToString(this.layer.transform);
	this.render();
}