'use strict';

let typeNumber = 0;
let errorCorrectionLevel = 'H';
let qr = qrcode(typeNumber, errorCorrectionLevel);
qr.addData('WIFI:S:thetownhouse;T:WPA;P:faradaythec4tLOL!;;');
//	qr.addData('0123456789012345678789');
qr.make();
document.getElementById('scannable_qr').innerHTML = qr.createImgTag(10);

let console_data = {
	error_correction: 'H',
	bit_array: ''
};
const module_count = qr.getModuleCount();
for(let i=0; i<module_count; i++){
	for(let j=0; j<module_count; j++){
		console_data.bit_array += qr.isDark(i,j) ? '1' : '0';
		console_data.bit_array += ',';
	}
}
console_data.bit_array = console_data.bit_array.slice(0, console_data.bit_array.length - 1)
console.log(console_data);

// Calculate some data
document.getElementById("baseplate_size").innerText = `${module_count}x${module_count}`;
let black_count = 0;
for(let i=0; i<module_count; i++){
	for(let j=0; j<module_count; j++){
		black_count += qr.isDark(i,j) ? 1 : 0;
	}
}
document.getElementById("black_bricks").innerText = `${black_count}`;
document.getElementById("white_bricks").innerText = `${(module_count*module_count)-black_count}`;



// Constants for dimensions
const pixel_size = 10;
const pixel_spacing = 2;
const border = 25;

const divider_width = 2;
const divider_margin = 5;

// Generate grid
let lines = [];
lines.push(3);
lines.push(7);
lines.push(module_count-3);
lines.push(module_count-7);
lines.push(module_count-7-3);
let number_four_blocks = (module_count-7-7-3)/4;
if(number_four_blocks > 1){
	for(let i=0; i<(number_four_blocks-1); i++){
		lines.push(7+(4*(i+1)));
	}
}
lines.sort((a,b) => {return a-b;});

// Get canvas object
let canvas = document.createElement("canvas");
let ctx = canvas.getContext("2d");

// Calculate total size
const qr_size = module_count*(pixel_size+pixel_spacing) + (border*2) + (lines.length*((divider_margin*2)+divider_width));

// set desired size of transparent image
canvas.width 	= qr_size;
canvas.height 	= qr_size;

// Fill background
ctx.fillStyle = "rgb(128,128,128)";
ctx.fillRect(0, 0, qr_size, qr_size);

// Draw grid lines
for(let index of lines){

	// Defaults for all lines
	let x = indexToX(index) - divider_margin - divider_width;
	let length = qr_size-border;
	let start = (border/2);
	let colour = "rgb(180,180,180)";

	// Shorten first and last lines to not penetrate the corners
	if((index < 7)){
		let diff = border + 7*(pixel_size+pixel_spacing) + divider_margin;
		length -= diff*2;
		start += diff;
	}else if(index > (module_count-7)){
		let diff = border + 7*(pixel_size+pixel_spacing) + divider_margin;
		length -= diff;
		start += diff;
	}

	// Draw lines x2 (diagonal symmetry)
	ctx.fillStyle = colour;
	ctx.fillRect(x, start, divider_width, length);
	ctx.fillRect(start, x, length, divider_width);
}

// Draw all pixels except for the three reference squares
// We treat the reference squares differently in order to account for the splitter line beneath them
for(let i=0; i<module_count; i++){
	for(let j=0; j<module_count; j++){

		let x = indexToX(j);
		let y = indexToX(i);
		let colour = "#FFFFFF";

		if(qr.isDark(i,j)){
			// Black
			colour = "#000000";
		}

		if(!is_corner_marker(i,j)){
			draw_brick(x, y, pixel_size, colour);
		}
	}
}

// Finally draw the corner markers, with slightly stretched spacing
for(let i=0; i<module_count; i++){
	for(let j=0; j<module_count; j++){
		if(is_corner_marker(i,j)){

			let colour = "#FFFFFF";
			if(qr.isDark(i,j)){
				// Black
				colour = "#000000";
			}

			let smear = ((divider_margin*2)+divider_width)/6;

			let x = indexToX(module_count-7) + ( (j-(module_count-7)) *(pixel_size+pixel_spacing+smear));
			let y = indexToX(module_count-7) + ( (i-(module_count-7)) *(pixel_size+pixel_spacing+smear));

			if(j < 7){
				x = indexToX(0) + (j*(pixel_size+pixel_spacing+smear));
			}
			if(i < 7){
				y = indexToX(0) + (i*(pixel_size+pixel_spacing+smear));
			}

			draw_brick(x, y, pixel_size, colour);
		}
	}
}


// extract as new image (data-uri)
let img_data = canvas.toDataURL();
document.getElementById("test_img").src = img_data;

// Convert a pixel index to the x-co-ordinate
function indexToX(index, adjust = true){
	let x = border + (index*(pixel_size+pixel_spacing));
	if(adjust){
		for(let l of lines){
			if(index >= l){
				x += divider_width + (divider_margin*2);
			}
		}
	}
	return x;
}

// Check if a co-ordinate is part of the 3 corner markers
function is_corner_marker(i, j){
	if( ((i<7)&&(j<7)) || ((i<7)&&(j>=(module_count-7))) || ((i>=(module_count-7))&&(j<7)) ){
		return true;
	}
	return false;
}

// Draw a pixel
function draw_brick(x, y, width, colour){
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