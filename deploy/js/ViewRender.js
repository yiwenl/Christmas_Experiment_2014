// ViewRender.js

(function() {
	ViewRender = function(particles) {
		this.particles = particles;
		View.call(this, "assets/shaders/map.vert", "assets/shaders/map.frag");
	}

	var p = ViewRender.prototype = new View();
	var s = View.prototype;


	p._init = function() {
		var positions = [];
		var coords = [];
		var indices = [];
		var extra = [];
		var colors = [];

		for(var i=0; i<this.particles.length; i++) {
			positions.push([0, 0, 0]);
			var p = this.particles[i];

			// var tx = i % numParticles;
			// var ty = Math.floor(i/numParticles);
			// var ux = tx / numParticles;
			// var uy = ty / numParticles;

			coords.push([p.u*.5, p.v*.5]);
			indices.push(i);
			extra.push([p.fixed ? 0.0 : 1.0, Math.random() * .9 + .1, 0])
			colors.push([p.r, p.g, p.b, p.a]);
		}

		this.mesh = new Mesh(positions.length, indices.length, GL.gl.POINTS);
		this.mesh.bufferVertex(positions);
		this.mesh.bufferTexCoords(coords);
		this.mesh.bufferIndices(indices);
		this.mesh.bufferData(colors, "aVertexColor", 4);
		// this.mesh.bufferData(extra, "aExtra", 3);
	};


	p.render = function(texturePos) {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		texturePos.bind(0);
		GL.draw(this.mesh);
	};
})();