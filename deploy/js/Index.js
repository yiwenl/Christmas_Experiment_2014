// Index.js
function shuffle(o){ //v1.0
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

(function() {
	var random = function(min, max) { return min + Math.random() * ( max - min); }	
	var getRandomElement = function(ary) {	return ary[Math.floor(Math.random() * ary.length)]; }

	Main = function() {
		this._init();
	}

	var p = Main.prototype;

	p._init = function() {
		this._canvas 			= document.createElement("canvas");
		document.body.appendChild(this._canvas);
		this._canvas.width 		= window.innerWidth;
		this._canvas.height 	= window.innerHeight;
		this._imageDatas 		= [];

		GL.init(this._canvas);

		this.start();
		this.parseImages();
		this.scene = new SceneSand();
	};


	p.parseImages = function() {
		console.debug( "Parse Image" );

		var imgGold     = images["gold"];
		var cvsGold     = document.createElement("canvas");
		cvsGold.width   = imgGold.width;
		cvsGold.height  = imgGold.height;
		var ctxGold     = cvsGold.getContext("2d");
		ctxGold.drawImage(imgGold, 0, 0);
		var imgGoldData = ctxGold.getImageData(0, 0, imgGold.width, imgGold.height);
		this.pixelsGold  = imgGoldData.data;
		
		// this.getImageData(images["image0"]);

		var i=0;
		while(images["image"+i] != undefined) {
			scheduler.defer(this, this.getImageData, [images["image"+i]]);
			i++;
		}
		scheduler.defer(this, this._onImageDataParsed, []);

	};


	p.getImageData = function(img) {
		console.debug( "Get Image Data : ", img );
		var threshold   = 220;

		// var img         = images["image0"];
		var canvas      = document.createElement("canvas");
		canvas.width    = img.width;
		canvas.height   = img.height;
		var ctx         = canvas.getContext("2d");
		ctx.drawImage(img, 0, 0);
		var imgData     = ctx.getImageData(0, 0, img.width, img.height);
		var pixels      = imgData.data;
		var particles 	= [];
		var pixelsGold  = this.pixelsGold;

		for(var i=0; i<pixels.length; i+= 4) {
			var r     = pixels[i];
			var index = i/4;
			var fixed = r < threshold;

			var tx    = index % 512 - 256;
			var ty    = Math.floor(index/512) - 256;
			var tmp   = index * 4;

			var p = {
				x:tx,
				y:ty,
				u:tx/512+.5,
				v:1.0-(ty/512+.5),

				r:pixelsGold[i]/255,
				g:pixelsGold[i+1]/255,
				b:pixelsGold[i+2]/255,
				a:1,
				fixed: pixels[tmp] < threshold
			};

			particles.push(p);
		}

		this.particles = particles;
		this._imageDatas.push(particles);
	};


	p._onImageDataParsed = function() {
		console.debug( "All Image Data Parsed" );	
		// this.scene.setImagesData(getRandomElement(this._imageDatas));
		scheduler.delay(this, this.playNextImage, [], 2000);

	};	


	p.playNextImage = function() {
		this.scene.setImagesData(getRandomElement(this._imageDatas));
	};



	p.start = function() {
		scheduler.addEF(this, this.render, []);
	};

	p.render = function() {
		this.scene.loop();
		TWEEN.update();
	};	
	
})();