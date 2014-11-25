// ViewCard.js

(function() {
	ViewCard = function() {
		View.call(this, "assets/shaders/copy.vert", "assets/shaders/copy.frag");
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
		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);
		GL.draw(this.mesh);
	};

})();