// Image manipulation

class ImageProperties {
	#properties;
	#originImage;

	constructor(image) {
		this.position = { x: 0, y: 0 };
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
		const newScale = this.scale + scaleFactor;
		if (newScale <= 8 && newScale >= 0.3) {
			this.scale = newScale;
			this.image.style.transform = `rotate(${this.rotation}deg) scale(${this.scale})`;
		}
	};

	rotateImage = (degrees) => {
		this.rotation += degrees;
		this.image.style.transform = `rotate(${this.rotation}deg) scale(${this.scale})`;
	};

	transformImage = (dx, dy) => {
		this.position.x += dx;
		this.position.y += dy;
		this.image.style.translate = `${this.position.x}% ${this.position.y}%`;
	};

	setProperties = () => {
		this.image.src = this.#originImage.src;
		this.#properties = `contrast(${this.contrast}%) brightness(${this.brightness}%) grayscale(${this.grayscale}%)`;

		this.image.style.filter = this.#properties;
	};

	modifyContrast = (contrast) => {
		const newContrast = this.contrast + contrast;
		if (newContrast >= 0 && newContrast <= 500) {
			this.contrast = newContrast;
			this.setProperties();
		}
	};

	modifyBrightness = (brightness) => {
		const newBrightness = this.brightness + brightness;
		if (newBrightness >= 0 && newBrightness <= 500) {
			this.brightness = newBrightness;
			this.setProperties();
		}
	};

	toggleGrayscale = () => {
		this.grayscale = this.grayscale === 0 ? 100 : 0;
		this.setProperties();
	};

	resetProperties = () => {
		this.grayscale = 0;
		this.brightness = 100;
		this.contrast = 100;
		this.image.src = this.#originImage.src;
		this.setProperties();
	};

	applyFilter = (contrast, brightness) => {
		this.resetProperties();
		this.image.style.filter = `contrast(${contrast}%) brightness(${brightness}%) grayscale(100%)`;
	};
}

function initImageKeyHandler(image) {
	document.addEventListener('keydown', (event) => {
		const keyHandlers = {
			65: () => image.transformImage(5, 0),			// A
			68: () => image.transformImage(-5, 0),		// D
			87: () => event.shiftKey ? image.scaleImage(0.3) : image.transformImage(0, 5),  	// W
			83: () => event.shiftKey ? image.scaleImage(-0.3) : image.transformImage(0, -5), // S
			81: () => image.rotateImage(event.shiftKey ? -5 : -90), 								// Q
			69: () => image.rotateImage(event.shiftKey ? 5 : 90), 	    						// E
			82: () => image.resetProperties(), 																			// R
			90: () => image.modifyContrast(event.shiftKey ? -10 : 10), 			// Z
			88: () => image.modifyBrightness(event.shiftKey ? -10 : 10),	// X
			70: () => image.toggleGrayscale(), 			// F
			49: () => image.applyFilter(140, 110), 	// 1
			50: () => image.applyFilter(170, 120), 	// 2
			51: () => image.applyFilter(200, 130), 	// 3
			52: () => image.applyFilter(250, 130),	// 4
			53: () => image.applyFilter(280, 140),	// 5
		};

		const handler = keyHandlers[event.which];
		if (handler) {
			handler();
		}
	});
}


// Resizable modal and editor

function setModalStyles() {
	const saveDimensions = (element) => {
		const { height, width } = element.style;
		localStorage.setItem('contentListBodyHeight', height);
		localStorage.setItem('contentListBodyWidth', width);
	};

	const loadDimensions = (element) => {
		const savedHeight = localStorage.getItem('contentListBodyHeight');
		const savedWidth = localStorage.getItem('contentListBodyWidth');
		element.style.height = savedHeight || '45rem';
		element.style.width = savedWidth || '50rem';
	};

	const contentListBodyElements = document.querySelectorAll('.modal-body .contentList__body');
	contentListBodyElements.forEach((element) => {
		element.style.resize = 'both';
		element.style.minHeight = '37rem';
		element.style.minWidth = '40rem';
		element.style.maxHeight = '100%';
		element.style.paddingBottom = '5rem';
		element.style.maxWidth = '100%';
		element.style.maxHeight = '80vh';

		loadDimensions(element);

		element.addEventListener('mouseup', () => saveDimensions(element));
	});

	const modalDialogElements = document.querySelectorAll('.modal-dialog');
	modalDialogElements.forEach((element) => {
		element.style.maxWidth = '90%';
		element.style.width = 'auto';
		element.style.height = 'auto';
		element.style.display = 'flex';
		element.style.justifyContent = 'center';
		element.style.minWidth = '40rem';
	});

	const modalContentElements = document.querySelectorAll('.modal-content');
	modalContentElements.forEach((element) => {
		element.style.width = 'auto';
		element.style.maxHeight = '95vh';
		element.style.minHeight = '40rem';
		element.style.maxWidth = '90vw';
		element.style.minWidth = '40rem';
	});
}

function editorResizable() {
	const qlEditorElements = document.querySelectorAll('.ql-container .ql-editor');
	qlEditorElements.forEach((element) => {
		element.style.resize = 'vertical';
		element.style.minHeight = '5rem';
	});
}

function syncModalHeaderWidth() {
	const contentListBodyElements = document.querySelectorAll('.modal-body .contentList__body');
	contentListBodyElements.forEach((contentBody) => {
		const modalHeader = contentBody.closest('.modal').querySelector('.modal-header');

		if (modalHeader) {
			modalHeader.style.width = `${contentBody.offsetWidth}px`;
		}
	});
}

function closeModalOnEscape() {
	document.addEventListener('keydown', (event) => {
		if (event.key === 'Escape') {
			const closeButton = document.querySelector('.btn.btn-close.text-sm');
			if (closeButton) {
				closeButton.click();
			}
		}
	});
}

function initializeResizeObservers() {
	const resizeObserver = new ResizeObserver(syncModalHeaderWidth);

	const editorObserver = new ResizeObserver(editorResizable);
	document.querySelectorAll('.modal-body .contentList__body').forEach((contentBody) => {
		resizeObserver.observe(contentBody);
		editorObserver.observe(contentBody);
	});
}


// Main

if (window.location.href.includes('platform.sotkaonline.ru/storage')) {
	let img = document.querySelector('img');
	let image = new ImageProperties(img);
	initImageKeyHandler(image);
}

if (window.location.href.includes('https://admin.sotkaonline.ru/admin/study/verifier')) {
	setModalStyles();
	closeModalOnEscape();
	initializeResizeObservers();


	const mainHeader = document.querySelector('div.col-12.mb-3');
	mainHeader.style.display = 'flex';
	mainHeader.style.justifyContent = 'space-between';

	const button = document.createElement('button');
	button.innerText = 'Копировать тайминг';
	button.style.display = 'flex';
	button.style.justifyContent = 'center';
	button.style.position = 'relative';
	button.style.padding = '7px 20px';
	button.style.backgroundColor = '#55a62d';
	button.style.borderRadius = '0.375rem';
	button.style.color = 'white';
	button.style.border = 'none';
	button.style.cursor = 'pointer';
	button.style.zIndex = '1000';
	button.style.transition = 'transform 0.2s ease';
	button.style.opacity = '0';
	button.style.cursor = 'default';

	button.onclick = () => copyToClipboard(`${selectedHWId} ${selectedStudentId} ${selectedTaskId}`)
		.catch((e) => console.error(e));

	mainHeader.appendChild(button);

	const message = document.createElement('div');
	message.innerText = 'Скопировано!';
	message.style.position = 'absolute';
	message.style.top = '-46px';
	message.style.padding = '7px 20px';
	message.style.backgroundColor = '#333';
	message.style.color = '#fff';
	message.style.borderRadius = '10px';
	message.style.opacity = '0'; // Изначально скрываем
	message.style.transition = 'opacity 0.5s ease';
	message.style.zIndex = '1000';

	button.appendChild(message);

	button.addEventListener('mouseover', function() {
		button.style.backgroundColor = '#3e8e41';
	});

	button.addEventListener('mouseout', function() {
		button.style.backgroundColor = '#55a62d';
	});

	button.addEventListener('mousedown', function() {
		button.style.transform = 'translateY(4px)';
	});

	button.addEventListener('mouseup', function() {
		button.style.transform = 'translateY(0)';
		message.style.opacity = '1';

		setTimeout(function() {
			message.style.opacity = '0';
		}, 1000);
	});


	let selectedStudentId = '';
	let selectedHWId = '';
	let selectedTaskId = '';

	document.addEventListener('click', (event) => {
		if (event.target.closest('button.btn.btn-sm')) {
			button.style.opacity = '0';
			button.style.cursor = 'default';
		}

		if (event.target.closest('.contentList .answers__row')) {
			const row = event.target.closest('.contentList .answers__row');
			selectedStudentId = row.querySelector('.answers__cell').textContent.trim();

			selectedHWId = '';
			selectedTaskId = '';

			button.style.opacity = '0';
			button.style.cursor = 'default';
		}

		if (event.target.closest('div.col-12 .answerList .answers__row')) {
			if (selectedHWId !== '') {
				button.style.opacity = '0';
				button.style.cursor = 'default';
			}

			const row = event.target.closest('.answerList .answers__row');
			selectedHWId = row.querySelectorAll('.answers__cell')[1].textContent.toLowerCase();

			if (selectedHWId === null || selectedHWId === '') {
				selectedHWId = '***';
			}

			selectedTaskId = '';


			//TODO: переделать в нормальный цикл
			setTimeout(function() {

				let answer = document.querySelectorAll('div.col .answers tr');

				if (answer.length === 0) {
					setTimeout(function() {
						answer = document.querySelectorAll('div.col .answers tr');
					}, 1000);
				}

				const dateTime = answer[answer.length - 1].textContent.trim();

				if (dateTime !== undefined && dateTime !== null && dateTime !== '') {
					selectedTaskId = formatDateTime(dateTime);
					console.log(selectedTaskId);
					button.style.opacity = '1';
					button.style.cursor = 'pointer';
				}
			}, 500);
		}
	});
}

function formatDateTime(input) {
	const regex = /дата:\s(\d{4})-(\d{2})-(\d{2})\s(\d{2}):(\d{2}):(\d{2})/;
	const match = input.match(regex);

	if (match) {
		const [_, year, month, day, hours, minutes] = match;

		const formattedDate = `${day}.${month}.${year}`;
		const formattedTime = `${hours}:${minutes}`;

		return `${formattedDate} ${formattedTime}`;
	} else {
		return '';
	}
}

async function copyToClipboard(text) {
	try {
		await navigator.clipboard.writeText(text);
	} catch (err) {
		console.error('Failed to copy:', err);
	}
}