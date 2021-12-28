'use strict';

// When page loads
document.addEventListener("DOMContentLoaded", () => {

	// Toggle the paper size
	document.getElementById("paper_size").addEventListener("change",(e) => {
		const sheets = document.getElementById("sheets");
		sheets.classList.remove("a4");
		sheets.classList.remove("letter");
		sheets.classList.add(e.target.value);
	});

	document.getElementById("network_name").addEventListener("input",(e) => {
		generate_qr();
	});
	document.getElementById("network_password").addEventListener("input",(e) => {
		generate_qr();
	});
	document.getElementById("network_type").addEventListener("click",(e) => {
		const subs = {
			"WEP" : "WPA",
			"WPA" : "WPA2-EAP",
			"WPA2-EAP" : "nopass",
			"nopass" : "WEP"
		};
		e.target.innerText = subs[e.target.innerText];
		generate_qr();
	});
	document.getElementById("network_hidden").addEventListener("click",(e) => {
		const subs = {
			"No" : "Yes",
			"Yes" : "No"
		};
		e.target.innerText = subs[e.target.innerText];
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
			document.getElementById("network_type").innerText,
			document.getElementById("network_hidden").innerText);
		myQR.debug();
		document.getElementById("baseplate_size").innerText = `${myQR.qrData.width}x${myQR.qrData.width}`;
		document.getElementById("black_bricks").innerText = `${myQR.qrData.black}`;
		document.getElementById("white_bricks").innerText = `${myQR.qrData.white}`;

		// Update links
		document.getElementById("white_brick_link").href = `https://www.bricklink.com/v2/catalog/catalogitem.page?P=3024#T=S&C=1&O={%22color%22:1,%22minqty%22:%22${myQR.qrData.white}%22,%22iconly%22:1}`;
		document.getElementById("black_brick_link").href = `https://www.bricklink.com/v2/catalog/catalogitem.page?P=3024#T=S&C=11&O={%22color%22:1,%22minqty%22:%22${myQR.qrData.black}%22,%22iconly%22:1}`;
		const link_baseplate = `https://www.bricklink.com/`;

		// Baseplate sizes
		if(myQR.qrData.width <= 32){
			document.getElementById("baseplate_link").href = `https://www.bricklink.com/v2/catalog/catalogitem.page?P=3811#T=S&C=1&O={%22color%22:1,%22minqty%22:%221%22,%22iconly%22:1}`;
			document.getElementById("baseplate_part_code").innerText = "3811";
		}else{
			document.getElementById("baseplate_link").href = `https://www.bricklink.com/v2/catalog/catalogitem.page?P=4186#T=S&C=1&O={%22color%22:1,%22minqty%22:%221%22,%22iconly%22:1}`;
			document.getElementById("baseplate_part_code").innerText = "4186";
		}
		
		myQR.create_img_tag(document.getElementById('scannable_qr'));
		document.getElementById("test_img").src = myQR.render_instructions();
	}
});
