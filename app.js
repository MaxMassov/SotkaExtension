class ImageProperties {
	#properties;
	#originImage;

	constructor(image) {
		this.position = {x: 0, y: 0};
		this.image = image;
		this.#originImage = new Image();
		this.#originImage.src = image.src;
		this.scale = 1;
		this.rotation = 0;
		this.contrast = 100;
		this.brightness = 100;
		this.grayscale = 0;
		this.setProperties();
	}

	scaleImage = (scaleFactor) => {
		if (this.scale + scaleFactor > 8 || this.scale + scaleFactor < 0.3)
			return;

		this.scale += scaleFactor;
		this.image.style.transform = 'rotate(' + this.rotation + 'deg) scale(' + this.scale + ')';
	}

	rotateImage = (degrees) => {
		this.rotation += degrees;
		this.image.style.transform = 'rotate(' + this.rotation + 'deg) scale(' + this.scale + ')';
	}

	transformImage = (dx, dy) => {
		this.position.x += dx;
		this.position.y += dy;
		this.image.style.translate = this.position.x + '% ' + this.position.y + '%';
	}

	setProperties = () => {
		this.image.src = this.#originImage.src;
		this.#properties = "contrast(" + this.contrast + "%) "
			+ "brightness(" + this.brightness + "%) "
			+ "grayscale(" + this.grayscale + "%)";

		this.image.style.filter = this.#properties;
	}

	addContrast = (contrast) => {
		if (this.contrast + contrast > 500 || this.contrast + contrast < 0)
			return;

		this.contrast += contrast;
		this.setProperties();
	}

	addBrightness = (brightness) => {
		if (this.brightness + brightness > 500 || this.brightness + brightness < 0)
			return;

		this.brightness += brightness;
		this.setProperties();
	}

	setGrayscale = () => {
		this.grayscale = Math.abs(100 - this.grayscale);
		this.setProperties();
	}

	resetProperties = () => {
		this.grayscale = 0;
		this.brightness = 100;
		this.contrast = 100;
		this.image.src = this.#originImage.src;
		this.setProperties();
	}

	applyFilter = (contrast, brightness) => {
		this.resetProperties();
		this.image.style.filter = "contrast(" + contrast + "%) brightness(" + brightness + "%) grayscale(100%)"
	}
}

function clickCloseButton() {
	const closeButton = document.querySelector('.btn.btn-close.text-sm');
	if (closeButton) {
		closeButton.click();
	}
}

let img = document.querySelector('img');
let image = new ImageProperties(img);

document.addEventListener('keydown', function(event) {
	const keyHandlers = {
		65: () => image.transformImage(5, 0),			// A
		68: () => image.transformImage(-5, 0),		// D
		87: () => {
			if (event.shiftKey){
				image.scaleImage(0.3);
			} else {
				image.transformImage(0, 5);
			}
		},	// W
		83: () => {
			if (event.shiftKey){
				image.scaleImage(-0.3);
			} else {
				image.transformImage(0, -5);
			}
		},	// S
		81: () => image.rotateImage(event.shiftKey ? -5 : -90), 	// Q
		69: () => image.rotateImage(event.shiftKey ? 5 : 90), 	// E
		82: () => image.resetProperties(), 												// R
		90: () => image.addContrast(event.shiftKey ? -10 : 10), 				// Z
		88: () => image.addBrightness(event.shiftKey ? -10 : 10), 			// X
		70: () => image.setGrayscale(), 												// F
		49: () => image.applyFilter(140, 110), // 1
		50: () => image.applyFilter(170, 120), // 2
		51: () => image.applyFilter(200, 130), // 3
		52: () => image.applyFilter(250, 130), // 4
		53: () => image.applyFilter(280, 140), // 5
		
		27:  () => clickCloseButton()
	};

	const handler = keyHandlers[event.which];
	if (handler) {
		handler();
	}
});


function applyStyles() {
	function saveDimensions(element) {
		const height = element.style.height;
		const width = element.style.width;

		localStorage.setItem('contentListBodyHeight', height);
		localStorage.setItem('contentListBodyWidth', width);
	}

	function loadDimensions(element) {
		const savedHeight = localStorage.getItem('contentListBodyHeight');
		const savedWidth = localStorage.getItem('contentListBodyWidth');

		if (savedHeight && savedWidth) {
			element.style.height = savedHeight;
			element.style.width = savedWidth;
		} else {
			element.style.height = '45rem';
			element.style.width = '50rem';
		}
	}
	
	const contentListBodyElements = document.querySelectorAll('.modal-body .contentList__body');
	contentListBodyElements.forEach(function(element) {
		element.style.resize = 'both';
		element.style.minHeight = '37rem';
		element.style.minWidth = '40rem';
		element.style.maxHeight = '100%';
		element.style.maxWidth = '100%';
		element.style.maxHeight = '80vh';

		loadDimensions(element);
		
		element.addEventListener('mouseup', function() {
			saveDimensions(element);
		});
	});

	const modalDialogElements = document.querySelectorAll('.modal-dialog');
	modalDialogElements.forEach(function(element) {
		element.style.maxWidth = '90%';
		element.style.width = 'auto';
		element.style.height = 'auto';
		element.style.display = 'flex';
		element.style.justifyContent = 'center';
		element.style.minWidth = '40rem';
	});

	const modalContentElements = document.querySelectorAll('.modal-content');
	modalContentElements.forEach(function(element) {
		element.style.width = 'auto';
		element.style.maxHeight = '90vh';
		element.style.maxWidth = '90vw';
		element.style.minWidth = '40rem';
	});
}

applyStyles();



function editorResizable() {
	const qlEditorElements = document.querySelectorAll('.ql-container .ql-editor');
	qlEditorElements.forEach(function(element) {
		element.style.resize = 'vertical';
		element.style.minHeight = '5rem';
	});
}

function syncModalHeaderWidth() {
	const contentListBodyElements = document.querySelectorAll('.modal-body .contentList__body');
	contentListBodyElements.forEach(function(contentBody) {
		const modalHeader = contentBody.closest('.modal').querySelector('.modal-header');

		if (modalHeader) {
			modalHeader.style.width = contentBody.offsetWidth + 'px';
		}
	});
}

const resizeObserver = new ResizeObserver(syncModalHeaderWidth);
const editorObserver = new ResizeObserver(editorResizable);

document.querySelectorAll('.modal-body .contentList__body').forEach(function(contentBody) {
	resizeObserver.observe(contentBody);
	editorObserver.observe(contentBody);
});
