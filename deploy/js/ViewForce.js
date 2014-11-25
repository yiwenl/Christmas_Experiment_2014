// ViewForce.js

(function() {
	ViewForce = function() {
		this.audioContext = undefined;
		this.count        = Math.random() * 0xFFFF;
		this.revealOffset = .2;
		this.times        = undefined;
		this.analyser     = undefined;
		View.call(this, "assets/shaders/copy.vert", "assets/shaders/cal2.frag");

	}

	var p = ViewForce.prototype = new View();
	var s = View.prototype;

	p._init = function() {
		var positions = [];
		var coords = [];
		var indices = [0, 1, 2, 0, 2, 3];

		positions.push([-1,	-1,  0]);
		positions.push([ 1,	-1,  0]);
		positions.push([ 1,	 1,  0]);
		positions.push([-1,	 1,  0]);

		coords.push([0, 0]);
		coords.push([1, 0]);
		coords.push([1, 1]);
		coords.push([0, 1]);

		this.mesh = new Mesh(positions.length, indices.length, GL.gl.TRIANGLES);
		this.mesh.bufferVertex(positions);
		this.mesh.bufferTexCoords(coords);
		this.mesh.bufferIndices(indices);

        // this.initAudio();
	};


	p.initAudio = function() {
		try {
            this.audioContext = new craicAudioContext();
        } catch(e) {
            alert('Web Audio API is not supported in this browser');
        }

        var that = this;
        try {
            navigator.getMedia({audio:true}, this.onStream.bind(this), function(e) {
            	console.log( "Error Getting media" );
            });
        } catch (e) {
            alert('webkitGetUserMedia threw exception :' + e);
        }		
	};

	p.onStream = function(stream) {
		var input = this.audioContext.createMediaStreamSource(stream);
		var filter = this.audioContext.createBiquadFilter();
		filter.frequency.value = 60.0;
		filter.type = filter.NOTCH;
		filter.Q = 10.0;

		this.analyser = this.audioContext.createAnalyser();

		// Connect graph.
		input.connect(filter);
		filter.connect(this.analyser);

		// Setup a timer to visualize some stuff.
		console.log( this.analyser, this.analyser.frequencyBinCount );
	};


	p.reset = function() {
		this.revealOffset = .2;
	};


	p.render = function(texture) {
		if(!this.shader.isReady() ) return;
		var increase = .0;
		if(this.audioContext != undefined && this.analyser != undefined) {
			this.times = new Uint8Array(this.analyser.frequencyBinCount);
  			this.analyser.getByteTimeDomainData(this.times);
  			var total = 0;
  			var threshold = .515;
  			var max = .5;
  			for(var i=0; i<this.times.length; i++) {
  				var f = this.times[i]/256;
  				total += this.times[i]/256;
  				if(f>max ) max = f;
  			}

  			max -= threshold;
  			if(max<0) max = 0;
  			increase = max * .25;
  			params.targetAccOffset = .003 + max * .7;
		}



		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		this.shader.uniform("time", "uniform1f", this.count++ * .001);

		// console.log( params.velOffset, params.accOffset, params.posOffset );

		this.shader.uniform("velOffset", "uniform1f", params.velOffset);
		this.shader.uniform("accOffset", "uniform1f", params.accOffset);
		this.shader.uniform("posOffset", "uniform1f", params.posOffset);
		this.shader.uniform("revealOffset", "uniform1f", this.revealOffset);
		this.revealOffset += increase*.5;
		this.revealOffset += .001;

		// console.log( this.revealOffset );
		texture.bind(0);
		GL.draw(this.mesh);

		if(this.revealOffset > 3) {
			//	Complete
		}
	};

})();