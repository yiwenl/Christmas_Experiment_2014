// Microphone.js

(function() {
	Microphone = function() {
		this.audioContext = undefined;
		this.analyser     = undefined;
	}

	var p = Microphone.prototype = new EventDispatcher();


	p.init = function() {
		if(isSafari() ) {
			alert("is safari");
			this.dispatchCustomEvent("onMicroInit", {hasAudio:false});
			return;
		}

		try {
            this.audioContext = new craicAudioContext();
        } catch(e) {
            alert('Web Audio API is not supported in this browser');
            this.dispatchCustomEvent("onMicroInit", {hasAudio:this.audioContext != undefined});
        }

        var that = this;
        try {
            navigator.getMedia({audio:true}, this.onStream.bind(this), function(e) {
            	console.log( "Error Getting media" );
            	that.dispatchCustomEvent("onMicroInit", {hasAudio:this.audioContext != undefined});
            });
        } catch (e) {
            alert('webkitGetUserMedia threw exception :' + e);
            this.dispatchCustomEvent("onMicroInit", {hasAudio:this.audioContext != undefined});
        }	
        
	};


	function isSafari() {
		var ua = navigator.userAgent.toLowerCase(); 
		if (ua.indexOf('safari') != -1) { 
			if (ua.indexOf('chrome') > -1) {
				return false;
			} else {
				return true;
			}
		}

		return false;

	}


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
		this.dispatchCustomEvent("onMicroInit", {hasAudio:this.audioContext != undefined});

		scheduler.addEF(this, this._loop, []);
	};


	p._loop = function() {
		var increase = .0;
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
		this.dispatchCustomEvent("onSound", {increase:increase});
	};
})();