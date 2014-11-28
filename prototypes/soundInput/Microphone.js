// Microphone.js

(function() {
	Microphone = function() {
		this.audioContext = undefined;
		this.analyser     = undefined;
		this.debugField = document.body.querySelector(".debug");
		this.veryMax = 0;
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



		var mediaStreamSource = this.audioContext.createMediaStreamSource(stream);

	    // Create a new volume meter and connect it.
		this.meter = createAudioMeter(this.audioContext);
		mediaStreamSource.connect(this.meter);
	};


	p._loop = function() {

		// console.log( this.meter.checkClipping(), this.meter.volume );

		var increase = .0;
		this.times = new Uint8Array(this.analyser.frequencyBinCount);
		this.analyser.getByteTimeDomainData(this.times);
		var total = 0;
		var threshold = .515;
		var max = .5;
		var prec = 10000;


		for(var i=0; i<this.times.length; i++) {
			var f = Math.floor(this.times[i]/256*prec)/prec;
			if(Math.random() > .9) {
				// console.log( f );
				this.debugField.innerHTML = f+ "<br/>" + max + "<br/>" + this.veryMax;
			}
			total += this.times[i]/256;
			if(f>max ) max = f;
			if(f > this.veryMax) {
				this.veryMax = f;
			}
		}

		max -= threshold;
		if(max<0) max = 0;
		increase = max * .25;

		// console.log( "max : ", max );

		// params.targetAccOffset = .003 + max * .7;
		this.dispatchCustomEvent("onSound", {increase:increase});
	};

function createAudioMeter(audioContext,clipLevel,averaging,clipLag) {
	var processor = audioContext.createScriptProcessor(512);
	processor.onaudioprocess = volumeAudioProcess;
	processor.clipping = false;
	processor.lastClip = 0;
	processor.volume = 0;
	processor.clipLevel = clipLevel || 0.98;
	processor.averaging = averaging || 0.95;
	processor.clipLag = clipLag || 750;

	// this will have no effect, since we don't copy the input to the output,
	// but works around a current Chrome bug.
	processor.connect(audioContext.destination);

	processor.checkClipping =
		function(){
			if (!this.clipping)
				return false;
			if ((this.lastClip + this.clipLag) < window.performance.now())
				this.clipping = false;
			return this.clipping;
		};

	processor.shutdown =
		function(){
			this.disconnect();
			this.onaudioprocess = null;
		};

	return processor;
}

function volumeAudioProcess( event ) {
	var buf = event.inputBuffer.getChannelData(0);
    var bufLength = buf.length;
	var sum = 0;
    var x;

	// Do a root-mean-square on the samples: sum up the squares...
    for (var i=0; i<bufLength; i++) {
    	x = buf[i];
    	if (Math.abs(x)>=this.clipLevel) {
    		this.clipping = true;
    		this.lastClip = window.performance.now();
    	}
    	sum += x * x;
    }

    // ... then take the square root of the sum.
    var rms =  Math.sqrt(sum / bufLength);

    // Now smooth this out with the averaging factor applied
    // to the previous sample - take the max here because we
    // want "fast attack, slow release."
    this.volume = Math.max(rms, this.volume*this.averaging);
}
})();