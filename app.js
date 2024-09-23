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


// copy timing button

function getMainHeader() {
	const mainHeader = document.querySelector('div.col-12.mb-3');
	mainHeader.style.display = 'flex';
	mainHeader.style.justifyContent = 'space-between';

	return mainHeader;
}

class CopyTimingButton {
	timing = {
		studentId: '',
		hwId: '',
		dateTime: '',
	};

	constructor(parentElement) {
		this.button = document.createElement('button');
		this.applyButtonStyles();
		this.initMessage();
		this.addEventListeners();
		this.button.onclick = () => this
			.copyTimingToClipboard()
			.catch((e) => console.error(e));

		parentElement.appendChild(this.button);
	}

	applyButtonStyles() {
		this.button.innerText = 'Копировать тайминг';
		this.button.style.display = 'flex';
		this.button.style.justifyContent = 'center';
		this.button.style.position = 'relative';
		this.button.style.padding = '7px 20px';
		this.button.style.backgroundColor = '#55a62d';
		this.button.style.borderRadius = '0.375rem';
		this.button.style.color = 'white';
		this.button.style.border = 'none';
		this.button.style.cursor = 'pointer';
		this.button.style.zIndex = '1000';
		this.button.style.transition = 'transform 0.2s ease';
		this.button.style.opacity = '0';
		this.button.style.cursor = 'default';
	}

	initMessage() {
		this.message = document.createElement('div');
		this.message.innerText = 'Скопировано!';
		this.message.style.position = 'absolute';
		this.message.style.top = '-46px';
		this.message.style.padding = '7px 20px';
		this.message.style.backgroundColor = '#333';
		this.message.style.color = '#fff';
		this.message.style.borderRadius = '10px';
		this.message.style.opacity = '0';
		this.message.style.transition = 'opacity 0.5s ease';
		this.message.style.zIndex = '1000';
		this.button.appendChild(this.message);
	}

	addEventListeners() {
		this.button.addEventListener('mouseover', () => {
			this.button.style.backgroundColor = '#3e8e41';
		});

		this.button.addEventListener('mouseout', () => {
			this.button.style.backgroundColor = '#55a62d';
		});

		this.button.addEventListener('mousedown', () => {
			this.button.style.transform = 'translateY(4px)';
		});

		this.button.addEventListener('mouseup', () => {
			this.button.style.transform = 'translateY(0)';
			this.message.style.opacity = '1';

			setTimeout(() => {
				this.message.style.opacity = '0';
			}, 1000);
		});
	}

	setInvisible() {
		this.button.style.opacity = '0';
		this.button.style.cursor = 'default';
	}

	setVisible() {
		this.button.style.opacity = '1';
		this.button.style.cursor = 'pointer';
	}

	async copyTimingToClipboard() {
		try {
			const timing = `${this.timing.hwId} ${this.timing.studentId} ${this.timing.dateTime}`;
			await navigator.clipboard.writeText(timing);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	}
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

function handleClickEvents(event, copyTimingButton) {
	if (
		event.target.closest('button.btn.btn-sm') || 
		event.target.closest('div.col button.btn.btn-success')
	) {
		copyTimingButton.setInvisible();
	}

	if (event.target.closest('.contentList .answers__row')) {
		handleClickStudentList(event, copyTimingButton);
	}

	if (event.target.closest('div.col-12 .answerList .answers__row')) {
		handleClickHWList(event, copyTimingButton);
	}
}

function handleClickStudentList(event, copyTimingButton) {
	const row = event.target.closest('.contentList .answers__row');
	copyTimingButton.timing.studentId = row.querySelector('.answers__cell').textContent.trim();
	copyTimingButton.timing.hwId = '';
	copyTimingButton.timing.dateTime = '';

	copyTimingButton.setInvisible();
}

function handleClickHWList(event, copyTimingButton) {
	if (copyTimingButton.timing.hwId !== '') {
		copyTimingButton.setInvisible();
	}

	const row = event.target.closest('.answerList .answers__row');
	copyTimingButton.timing.hwId = row.querySelectorAll('.answers__cell')[1].textContent.toLowerCase();

	if (copyTimingButton.timing.hwId === null || copyTimingButton.timing.hwId === '') {
		copyTimingButton.timing.hwId = '***';
	}

	searchDateTime(copyTimingButton);
}

function searchDateTime(copyTimingButton) {
	let attempts = 0;
	const maxAttempts = 10;
	const intervalId = setInterval(() => {
		let answer = document.querySelectorAll('div.col .answers tr');

		if (answer.length >= 2) {
			const dateTime = answer[answer.length - 1].textContent.trim();

			if (dateTime && dateTime !== '') {
				const newDateTime = formatDateTime(dateTime);
				
				if (copyTimingButton.timing.dateTime !== newDateTime) {
					copyTimingButton.timing.dateTime = newDateTime;
					copyTimingButton.setVisible();
					clearInterval(intervalId);
				}
			}
		}

		attempts += 1;
		if (attempts >= maxAttempts) {
			clearInterval(intervalId);
			console.error('Homework date and time not found');
		}
	}, 1000);
}


// Main

if (window.location.href.includes('https://platform.sotkaonline.ru/storage')) {
	let img = document.querySelector('img');
	let image = new ImageProperties(img);
	initImageKeyHandler(image);
}

if (window.location.href.includes('https://admin.sotkaonline.ru/admin/study/verifier')) {
	setModalStyles();
	closeModalOnEscape();
	initializeResizeObservers();

	const mainHeader = getMainHeader();
	const copyTimingButton = new CopyTimingButton(mainHeader);
	document.addEventListener('click', event => handleClickEvents(event, copyTimingButton));
}