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
			'KeyA': () => image.transformImage(5, 0),                // A
			'KeyD': () => image.transformImage(-5, 0),               // D
			'KeyW': () => event.shiftKey ? image.scaleImage(0.3) : image.transformImage(0, 5), // W
			'KeyS': () => event.shiftKey ? image.scaleImage(-0.3) : image.transformImage(0, -5), // S
			'KeyQ': () => image.rotateImage(event.shiftKey ? -5 : -90), // Q
			'KeyE': () => image.rotateImage(event.shiftKey ? 5 : 90), // E
			'KeyR': () => image.resetProperties(), // R
			'KeyZ': () => image.modifyContrast(event.shiftKey ? -10 : 10), // Z
			'KeyX': () => image.modifyBrightness(event.shiftKey ? -10 : 10), // X
			'KeyF': () => image.toggleGrayscale(), // F
			'Digit1': () => image.applyFilter(140, 110), // 1
			'Digit2': () => image.applyFilter(170, 120), // 2
			'Digit3': () => image.applyFilter(200, 130), // 3
			'Digit4': () => image.applyFilter(250, 130), // 4
			'Digit5': () => image.applyFilter(280, 140), // 5
		};

		const handler = keyHandlers[event.code];
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
		element.style.overflow = 'auto';
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

function getButtonPlace() {
	// place button near datetime row of the window
	const place = document.querySelector('div.modal.show .modal-body .mb-2');
	if (!place) return null;

	place.style.display = 'inline-flex';
	place.style.justifyContent = 'space-between';
	place.style.alignItems = 'center';

	return place;
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
		this.message.style.position = 'fixed';   // stays above modal
		this.message.style.padding = '7px 20px';
		this.message.style.backgroundColor = '#333';
		this.message.style.color = '#fff';
		this.message.style.borderRadius = '10px';
		this.message.style.opacity = '0';
		this.message.style.transition = 'opacity 0.5s ease';
		this.message.style.zIndex = '99999';    // above modal
		this.message.style.pointerEvents = 'none'; // do not block clicks
		this.message.style.whiteSpace = 'nowrap';
		document.body.appendChild(this.message);
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

			// get button’s position in viewport
			const rect = this.button.getBoundingClientRect();

			// position message just above the button
			this.message.style.left = `${rect.left + rect.width / 2}px`;
			this.message.style.top = `${rect.top - 8}px`; // a bit above
			this.message.style.transform = 'translate(-50%, -100%)'; // center horizontally above button

			// show bubble
			this.message.style.opacity = '1';

			// hide after 1s
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
	const regex = /(\d{1,2})\.(\d{1,2})\.(\d{4}) (\d{1,2}):(\d{2})/;
	const match = input.match(regex);

	if (match) {
		const [_, day, month, year, hours, minutes] = match;

		const formattedDate = `${day}.${month}.${year}`;
		const formattedTime = `${hours}:${minutes}`;

		return `${formattedDate} ${formattedTime}`;
	} else {
		return '';
	}
}

function handleClickEvents(event, copyTimingButton) {
	if (
		event.target.closest('button.btn-close') ||             // Close window btn
		event.target.closest('button.btn.btn-success') ||       // Accept task btn
		event.target.closest('button.btn.btn-outline-danger')   // No answer btn
	) {
		copyTimingButton.setInvisible();
	}

	if (event.target.closest('.answer.clickable')) {     // if the answer was clicked
		handleClickStudentList(event, copyTimingButton);
	}
}

function handleClickStudentList(event, copyTimingButton) {
	// identify the answer was clicked
    const clicked = event.target.closest('.answer.clickable');
	if (!clicked) {
		console.error("Answer not found.");
		return;
	}

	// inner table is inside the outer <td>; the table's ancestor <tr> is the outer row we want
	const innerTable = clicked.closest('table');
	const row = innerTable ? innerTable.closest('tr') : clicked.closest('tr');

	if (!row) {
		console.error("Row not found.");
		return;
	}

	// parsing the row
	copyTimingButton.timing.hwId = row.querySelector('td:first-child > span:last-of-type')?.textContent.trim().toLowerCase();
	copyTimingButton.timing.studentId = row.querySelector('code.id span').textContent.trim();
	const dateTime = row.querySelector('td:nth-child(6) span').textContent.trim();

	if (copyTimingButton.timing.hwId === null || copyTimingButton.timing.hwId === '') {
		copyTimingButton.timing.hwId = '***';
	}

	if (dateTime && dateTime !== '') {
		copyTimingButton.timing.dateTime = formatDateTime(dateTime);
	} else {
		console.error('Homework date and time not found');
	}
	copyTimingButton.setVisible();
}

// Main

if (window.location.href.includes('https://platform.sotkaonline.ru/storage')) {
	let img = document.querySelector('img');
	let image = new ImageProperties(img);
	initImageKeyHandler(image);
}

if (window.location.href.includes('https://admin.sotkaonline.ru/admin/study/homeworks')) {
	setModalStyles();
	closeModalOnEscape();
	initializeResizeObservers();

	const place = getButtonPlace();
	const copyTimingButton = new CopyTimingButton(place);
	document.addEventListener('click', event => handleClickEvents(event, copyTimingButton));
}