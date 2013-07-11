/*---------------------------------
	RaphaelToScale
---------------------------------*/
function RaphaelToScale(svg, position){
	var el = document.getElementById(svg[0]);
	// el.innerHTML = ''; //clear element
	var width = $(el).css('width');
	var height = $(el).css('height');
	var scaleX = parseFloat($(el).css('width'))/svg[1];
	var scaleY = parseFloat($(el).css('height'))/svg[2];
	var newHeight = svg[2]*scaleX;
	var paper = Raphael(svg[0], width, newHeight);
	// paper.canvas.className.baseVal="raphaelPaper"; // give this svg an id
	
	var paths = svg.slice(3, svg.length);
	paper.add(paths).transform("S"+scaleX+","+scaleX+",0,0");
	if(position){
		el.style.top = ($(el.parentNode).height() - newHeight)/2;
		el.style.height = newHeight+'px';
	}

	var out = {paper:paper, scale:scaleX};
	return out;
}

/*---------------------------------
	addArray Prototype - add two arrays
---------------------------------*/
Array.prototype.addArray=function(A, mult){
	var sum = [];
	var twoD = this[0].length ? 1:0;
	for (var i=0;i<this.length;i++){
		if(twoD){
			sum[i] = [];
			for (var j=0;j<this[i].length;j++){
				sum[i][j]=(typeof this[i][j] == 'string') ? this[i][j] : Math.round(this[i][j] + mult*A[i][j]);
			}
		}else{
			sum[i]=(typeof this[i] == 'string') ? this[i] :  this[i] + mult*A[i];
		}
	}
	return sum;
}
/*---------------------------------
	multArray Prototype - multiply array by a factor
---------------------------------*/
Array.prototype.multArray=function(n){
	var mult = [];
	var twoD = this[0].length ? 1:0;
	for (i=0;i<this.length;i++){
		if(twoD){
			mult[i] = [];
			for (var j=0;j<this[i].length;j++){
				mult[i][j]=(typeof this[i][j] == 'string') ? this[i][j] : Math.round(n*this[i][j]);
			}
		}else{
			mult[i]=(typeof this[i] == 'string') ? this[i] : n*this[i];
		}
	}
	return mult;
}

/*---------------------------------
	intrapolateArray
---------------------------------*/
function intrapolateArrays(A1, A2, fraction){
	var diff = A2.addArray(A1,-1);
	var fract = diff.multArray(fraction);
	return A1.addArray(fract,1)
}

function textWrap(t) {
    var content = t.attr("text");
    // var abc = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    t.attr({
      'text-anchor' : 'start',
      "text" : abc
    });
    var letterWidth = t.getBBox().width / abc.length;
    var letterHeight = t.getBBox().height;
    t.attr({
        "text" : content
    });

    // instagram text:
    if(content.length>5 && content.indexOf(' ')==-1){
    	content = content.replace(/#/g, ' #');
    }
    var words = content.split(" ");

    var s = [words[0]];
    var x = words[0].length*letterWidth;
    y=letterHeight > t.bbox.height ? t.bbox.height: letterHeight;
    // y = 1;

    var height = Math.ceil(t.bbox.height/letterHeight)*letterHeight;

    for ( var i = 1; i < words.length; i++) {

        var l = words[i].length;
        if (x + (l * letterWidth) > t.bbox.width) {
        	// check height
        	if(y+letterHeight > height){
        		s.push('...');
        		break;
        	}else{
	            s.push("\n");
	            x = 0;
	            y += letterHeight;
	        }
        }
        x += l * letterWidth;
        s.push(words[i] + " ");
    }
    t.attr({
        "text" : s.join("")
    });
}