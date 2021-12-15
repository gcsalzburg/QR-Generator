'use strict';

class LegoQR{

	qrData = {
		typeNumber: 0,
		errorCorrectionLevel: 'Q'
	}

	// Constants for dimensions
	_instructions = {
		pixel_size : 10,
		pixel_spacing : 2,
		border : 25,

		divider_width : 2,
		divider_margin : 5
	}
	
	constructor() {	}

	generate(network_name, password, network_type){
		this.qrData.wifiString = `WIFI:S:${network_name};T:${network_type};P:${password};;`;

		this.qr = qrcode(this.qrData.typeNumber, this.qrData.errorCorrectionLevel);
		this.qr.addData(this.qrData.wifiString);
		this.qr.make();
		this.qrData.width = this.qr.getModuleCount();
		
		// Calculate pieces used
		let black_count = 0;
		for(let i=0; i<this.qrData.width; i++){
			for(let j=0; j<this.qrData.width; j++){
				black_count += this.qr.isDark(i,j) ? 1 : 0;
			}
		}
		this.qrData.black = black_count;
		this.qrData.white = (this.qrData.width*this.qrData.width)-black_count;
	}

	create_img_tag(container_div){
		container_div.innerHTML = this.qr.createImgTag(10);
	}

	debug(){
		const console_data = {
			string: this.qrData.wifiString,
			errorCorrection: this.qrData.errorCorrectionLevel,
			black: this.qrData.black,
			white: this.qrData.white,
			bitArray: ''
		};

		for(let i=0; i<this.qrData.width; i++){
			for(let j=0; j<this.qrData.width; j++){
				console_data.bitArray += this.qr.isDark(i,j) ? '1' : '0';
				console_data.bitArray += ',';
			}
		}
		console_data.bitArray = console_data.bitArray.slice(0, console_data.bitArray.length - 1)
		console.log(console_data);
	}

	render_instructions(){
		
		// For convenience
		const _i = this._instructions;

		// Generate list of indexes for the dividing lines
		_i.lines = [3, 7, (this.qrData.width-7-3), (this.qrData.width-7), (this.qrData.width-3)];
		const number_four_blocks = (this.qrData.width-7-7-3)/4;
		if(number_four_blocks > 1){
			for(let i=0; i<(number_four_blocks-1); i++){
				_i.lines.push(7+(4*(i+1)));
			}
		}
		_i.lines.sort((a,b) => {return a-b;});

		// Calculate total size of QR code
		_i.qr_size = this.qrData.width*(_i.pixel_size+_i.pixel_spacing) + (_i.border*2) + (_i.lines.length*((_i.divider_margin*2)+_i.divider_width));

		// Now begin rendering out below...

		// Create a canvas and fill background
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		canvas.width 	= _i.qr_size;
		canvas.height 	= _i.qr_size;
		ctx.fillStyle = "rgb(128,128,128)";
		ctx.fillRect(0, 0, _i.qr_size, _i.qr_size);

		// Draw grid lines
		for(let index of _i.lines){

			// Defaults settings for all lines
			let x = this._indexToX(index) - _i.divider_margin - _i.divider_width;
			let length = _i.qr_size-_i.border;
			let start = (_i.border/2);
			let colour = "rgb(180,180,180)";

			// Shorten first and last lines to not penetrate the corners
			if( (index < 7) || (index > (this.qrData.width-7))){
				let diff = _i.border + 7*(_i.pixel_size+_i.pixel_spacing) + _i.divider_margin;
				length -= diff;
				start += diff;
				if(index < 7){
					// Subtract again for the first lines, they are shortest
					length -= diff;
				}
			}

			// Draw lines x2 (diagonal symmetry)
			ctx.fillStyle = colour;
			ctx.fillRect(x, start, _i.divider_width, length);
			ctx.fillRect(start, x, length, _i.divider_width);
		}

		// Draw all pixels
		const smear = ((_i.divider_margin*2)+_i.divider_width)/6;
		const cornerPixelWidth = _i.pixel_size+_i.pixel_spacing+smear;
		for(let i=0; i<this.qrData.width; i++){
			for(let j=0; j<this.qrData.width; j++){

				if(this._isCornerMarker(i,j)){
					// We draw the corner markers, with slightly stretched spacing
					// to account for the splitter lines beneath them

					let x = this._indexToX(this.qrData.width-7) + ( (j-(this.qrData.width-7)) *(cornerPixelWidth));
					let y = this._indexToX(this.qrData.width-7) + ( (i-(this.qrData.width-7)) *(cornerPixelWidth));
					if(j < 7){
						x = this._indexToX(0) + (j*cornerPixelWidth);
					}
					if(i < 7){
						y = this._indexToX(0) + (i*cornerPixelWidth);
					}
					this._drawBrick(ctx, x, y, _i.pixel_size, (this.qr.isDark(i,j) ? "#000000" : "#FFFFFF"));
				}else{
					// Just a normal square
					// So lets colour it in!
					this._drawBrick(ctx, this._indexToX(j), this._indexToX(i), _i.pixel_size, (this.qr.isDark(i,j) ? "#000000" : "#FFFFFF"));
				}
			}
		}

		// Return the image data-uri
		return canvas.toDataURL();
	}

	//
	// Helper functions
	//

	// Convert a pixel index to the x-co-ordinate
	_indexToX(index){
		const _i = this._instructions;

		let x = _i.border + (index*(_i.pixel_size+_i.pixel_spacing));
		for(let l of _i.lines){
			if(index >= l){
				x += _i.divider_width + (_i.divider_margin*2);
			}
		}
		return x;
	}

	// Check if a co-ordinate is part of the 3 corner markers
	_isCornerMarker(i, j){
		return ( ((i<7)&&(j<7)) || ((i<7)&&(j>=(this.qrData.width-7))) || ((i>=(this.qrData.width-7))&&(j<7)) );
	}

	// Draw a pixel
	_drawBrick(ctx, x, y, width, colour){
		ctx.beginPath();
		ctx.fillStyle = colour;
		ctx.lineWidth = "1";
		ctx.strokeStyle = "black";
		ctx.rect(x, y, width, width);
		ctx.save();
		ctx.clip();
		ctx.lineWidth *= 2;
		ctx.fill();
	//	ctx.stroke();
		ctx.restore();
	}
}
