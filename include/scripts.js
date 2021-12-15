'use strict';

// When page loads
document.addEventListener("DOMContentLoaded", () => {

	document.getElementById("network_name").addEventListener("input",(e) => {
		generate_qr();
	});
	document.getElementById("network_password").addEventListener("input",(e) => {
		generate_qr();
	});
	document.getElementById("network_type").addEventListener("input",(e) => {
		generate_qr();
	});

	// Create QR code
	let myQR = new LegoQR();
	generate_qr();

	// Master generator
	function	generate_qr(){
		myQR.generate(
			document.getElementById("network_name").innerText,
			document.getElementById("network_password").innerText,
			document.getElementById("network_type").innerText);
		myQR.debug();
		document.getElementById("baseplate_size").innerText = `${myQR.qrData.width}x${myQR.qrData.width}`;
		document.getElementById("black_bricks").innerText = `${myQR.qrData.black}`;
		document.getElementById("white_bricks").innerText = `${myQR.qrData.white}`;
		
		myQR.create_img_tag(document.getElementById('scannable_qr'));
		document.getElementById("test_img").src = myQR.render_instructions();
	}
});
