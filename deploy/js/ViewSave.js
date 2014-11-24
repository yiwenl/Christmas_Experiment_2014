// ViewSave.js

(function() {
	ViewSave = function(particles) {
		this.particles = particles;
		View.call(this, "assets/shaders/save.vert", "assets/shaders/save.frag");
	}

	var p = ViewSave.prototype = new View();
	var s = View.prototype;


	p._init = function() {
		var positions    = [];
		var colors       = [];
		var coords       = [];
		var indices      = [];
		var size         = 2;
		var index        = 0;
		var noiseOffset  = 10.0;
		var noiseSeed    = Math.random() * 0xFFFF;
		var numParticles = params.numParticles;
		var center       = {x:Math.random(), y:Math.random()};

		for(var i=0; i<this.particles.length; i++) {
			var p = this.particles[i];
			var dist = getDistance(center.x, center.y, p.u, p.v);
			var noise = Perlin.noise(p.u*noiseOffset, p.v*noiseOffset, noiseSeed) * .5 + dist;

			// positions.push([ (p.u-.5)*2.0, (p.v-.5)*2.0, 0]);
			positions.push([ p.u-1.0, p.v-1.0, 0]);
			coords.push([0, 0]);
			indices.push(index);
			// var yOffset = p.fixed ? 0.0 : (1.0-noise)*.02;
			var yOffset = (1.0-noise)*.03;
			yOffset = 0;
			colors.push([p.u, 0.05 + yOffset, p.v]);

			positions.push([ p.u-1.0, p.v, 0]);
			coords.push([0, 0]);
			indices.push(index);

			// var noise = Perlin.noise(p.u*noiseOffset, p.v*noiseOffset, noiseSeed);
			
			// colors.push([p.fixed ? 0.0 : .1+Math.random()*.9, Math.random()*.95+.5, dist*2.0]);
			colors.push([p.fixed ? 0.0 : .3+Math.random()*.7, Math.random()*.95+.5, noise]);

			index++;
		}


		this.mesh = new Mesh(positions.length, indices.length, GL.gl.POINTS);
		this.mesh.bufferVertex(positions);
		this.mesh.bufferTexCoords(coords);
		this.mesh.bufferIndices(indices);
		this.mesh.bufferData(colors, "aVertexColor", 3);


		function getDistance(x0, y0, x1, y1) {
			return Math.sqrt( (x0-x1) * (x0-x1) + (y0-y1) * (y0-y1) );
		}
	};


	p.render = function() {
		this.shader.bind();
		GL.draw(this.mesh);
	};
})();