// ViewCard.js

(function() {
	ViewCard = function() {
		this.alpha = 1;
		this.x = 0;
		this.y = 0;
		this.z = 0;
		View.call(this, "assets/shaders/general.vert", "assets/shaders/general.frag");
	}

	var p = ViewCard.prototype = new View();
	var s = View.prototype;


	p._init = function() {
		var positions = [];
		var coords = [];
		var indices = [0, 1, 3, 1, 2, 3];

		var size = 126;
		var ratio = 1024/896;
		var y = -90;
		var xOffset = 15;

		positions.push([-size+xOffset,	y,   size/ratio]);
		positions.push([ size+xOffset,	y,   size/ratio]);
		positions.push([ size+xOffset,	y,  -size/ratio]);
		positions.push([-size+xOffset,	y,  -size/ratio]);

		coords.push([1, 1]);
		coords.push([0, 1]);
		coords.push([0, 0]);
		coords.push([1, 0]);

		this.mesh = new Mesh(positions.length, indices.length, GL.gl.TRIANGLES);
		this.mesh.bufferVertex(positions);
		this.mesh.bufferTexCoords(coords);
		this.mesh.bufferIndices(indices);
	};


	p.render = function(texture) {
		if(!this.shader.isReady() ) return;
		this.shader.bind();
		this.shader.uniform("position", "uniform3fv", [this.x, this.y, this.z]);
		this.shader.uniform("texture", "uniform1i", 0);
		this.shader.uniform("alpha", "uniform1f", this.alpha);
		texture.bind(0);
		GL.draw(this.mesh);
	};


	p.intro = function() {
		if(this.tweenPos) TWEEN.remove(this.tweenPos);
		this.x = 200;
		this.y = -500;
		this.z = 500;
		this.alpha = 0;
		this.tweenPos = new TWEEN.Tween(this).to({"x":0, "y":0, "z":0, "alpha":1}, params.openingDuration).easing(TWEEN.Easing.Sinusoidal.Out).start();
	};



	p.outro = function() {
		if(this.tweenPos) TWEEN.remove(this.tweenPos);
		this.tweenPos = new TWEEN.Tween(this).to({"x":-500, "y":-500, "z":1000, "alpha":0}, params.closingDuration).easing(TWEEN.Easing.Sinusoidal.In).start();
	};

})();