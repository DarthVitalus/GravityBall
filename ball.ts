interface ICoords {
	x: number;
	y: number;
}
interface IChangingCoords {
	prevCoords: ICoords;
	curCoords: ICoords;
	deltaX: number;
	deltaY: number;
}
interface INewCoords extends ICoords {
	reachedSide: boolean;
	reachedUpside: boolean;
	reachedTop: boolean;
	reachedRight: boolean;
	reachedLeft: boolean;
	reachedBottom: boolean;
}
interface ISceneBorder {
	top: number;
	right: number;
	left: number;
	bottom: number;
}
enum Penetration {
	On = 'on',
	Off = 'off',
}

const calculatePageBorder = (): void => {
	const borderSpace = 0;
	pageBorder = {
		top: borderSpace,
		right: Math.max(document.documentElement.clientWidth, window.innerWidth || 0) - borderSpace,
		bottom: Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - borderSpace,
		left: borderSpace,
	};
	console.log(pageBorder);
	sq.style.width = pageBorder.right - 4 + 'px';
	sq.style.height = pageBorder.bottom - 4 + 'px';
};

const validateCoordsByPage = (el: HTMLElement, coords: ICoords, shift: ICoords = {x: 0, y: 0}): INewCoords => {
	const newElBorders = {
		top: coords.y - shift.y,
		right: coords.x + (el.offsetWidth - shift.x),
		bottom: coords.y + (el.offsetHeight - shift.y),
		left: coords.x - shift.x,
	};

	const newCoords: INewCoords = {
		...coords,
		reachedSide: false,
		reachedUpside: false,
		reachedTop: false,
		reachedRight: false,
		reachedLeft: false,
		reachedBottom: false,
	};

	if (newElBorders.top < pageBorder.top) {
		newCoords.y = pageBorder.top;
		newCoords.reachedTop = true;
		newCoords.reachedUpside = true;
	}
	if (newElBorders.right > pageBorder.right) {
		newCoords.x = pageBorder.right - el.offsetWidth;
		newCoords.reachedRight = true;
		newCoords.reachedSide = true;
	}
	if (newElBorders.bottom > pageBorder.bottom) {
		newCoords.y = pageBorder.bottom - el.offsetHeight;
		newCoords.reachedBottom = true;
		newCoords.reachedUpside = true;
	}
	if (newElBorders.left < pageBorder.left) {
		newCoords.x = pageBorder.left;
		newCoords.reachedLeft = true;
		newCoords.reachedSide = true;
	}

	return newCoords;
};

const move = (el: HTMLElement, newCoords: ICoords, shift: ICoords = {x: 0, y: 0}): void => {
	const validCoords = validateCoordsByPage(el, newCoords, shift);
	const newValidCoords = {
		x: validCoords.x - (validCoords.reachedSide ? 0 : shift.x),
		y: validCoords.y - (validCoords.reachedUpside ? 0 : shift.y),
	};
	el.style.left = newValidCoords.x + 'px';
	el.style.top = newValidCoords.y + 'px';

	if (!changingCoords) {
		changingCoords = {
			prevCoords: {...newValidCoords},
			curCoords: {...newValidCoords},
			deltaX: 0,
			deltaY: 0,
		};
	}
	changingCoords.prevCoords = {...changingCoords.curCoords};
	changingCoords.curCoords = {...newValidCoords};
	changingCoords.deltaX = changingCoords.curCoords.x - changingCoords.prevCoords.x;
	changingCoords.deltaY = changingCoords.curCoords.y - changingCoords.prevCoords.y;

	if (
		(validCoords.reachedTop && changingCoords.deltaY < 0) ||
		(validCoords.reachedBottom && changingCoords.deltaY > 0) ||
		(validCoords.reachedLeft && changingCoords.deltaX < 0) ||
		(validCoords.reachedRight && changingCoords.deltaX < 0)
	) {
		drop(el);
	}
};

const drop = (el: HTMLElement): void => {
	console.log('dropping');
	document.onmousemove = null;
	el.onmouseup = null;
	startFalling(el);
};

const getCoords = (elem: HTMLElement): ICoords => {
	const box = elem.getBoundingClientRect();
	return {
		y: box.top + pageYOffset,
		x: box.left + pageXOffset,
	};
};

const drag = (e: MouseEvent, shift: ICoords, el: HTMLElement): void => {
	const newCoords2: ICoords = {
		x: e.pageX,
		y: e.pageY,
	};

	move(el, newCoords2, shift);
};

const startDrag = (el: HTMLElement, e: MouseEvent): void => {
	clearInterval(falling);
	const coords: ICoords = getCoords(el);
	const shift: ICoords = {
		x: e.pageX - coords.x,
		y: e.pageY - coords.y,
	};
	drag(e, shift, el);

	document.onmousemove = (event1: MouseEvent): void => {
		drag(event1, shift, el);
	};

	el.onmouseup = (): void => {
		drop(el);
	};
};

const startFalling = (el: HTMLElement): void => {
	console.log('falling');
	const gravity: number = 500;
	const timeDeltaS: number = 0.01;
	const resistanceResistance: number = 0.997;
	let resistanceY: number = 0.96;
	let resistanceX: number = 0.992;
	let velocityY: number = Math.abs(changingCoords.deltaY * 2 / timeDeltaS);
	let directionX: number = 1;
	let directionY: number = changingCoords.deltaY >= 0 ? 1 : -1;
	let deltaX = changingCoords.deltaX;
	let curCoords: ICoords = getCoords(el);

	falling = setInterval(
		() => {
			rotate(el, rotationDeg);

			const velocity = getNewVelocity(gravity, timeDeltaS);
			velocityY = velocityY + velocity * directionY;

			velocityY *= resistanceY;
			deltaX *= resistanceX;
			rotationDeg += deltaX * directionX;
			if (rotationDeg > 360) {
				rotationDeg -= 360;
			}

			const distanceY = getDistance(velocityY, timeDeltaS);
			const newCoords = {
				x: curCoords.x + deltaX * directionX,
				y: curCoords.y + distanceY * directionY,
			};
			const validCoords = validateCoordsByPage(el, newCoords);

			if (wallPenetration === Penetration.On && validCoords.reachedSide) {
				console.log('CLINK!');
				clearInterval(falling);
			}

			directionX = validCoords.reachedSide ? directionX * -1 : directionX;
			directionY = validCoords.reachedUpside ? directionY * -1 : directionY;

			move(el, validCoords);

			curCoords = {...validCoords};

			// reached floor
			if (validCoords.reachedUpside && directionY < 0) {
				resistanceX *= resistanceResistance;
				resistanceY *= resistanceResistance;

				// almost stopped
				if (deltaX < 1 && velocityY < velocity) {
					console.log('stop fall');
					clearInterval(falling);
				}
			}

			// reached highest point
			if (directionY < 0 && velocityY < velocity) {
				velocityY = 0;
				directionY = 1;
			}
		}, timeDeltaS * 1000);
};

const getNewVelocity = (gravity: number, timeDeltaS: number): number => {
	return Math.pow(gravity * timeDeltaS, 3);
};

const getDistance = (velocity: number, timeDeltaS: number): number => {
	return 1 / 2 * velocity * timeDeltaS;
};

const rotate = (el: HTMLElement, degreeNumber: number): void => {
	el.style.transform = `rotate(${degreeNumber}deg)`;
};

// program starts
const ball = document.getElementById('ball');
const sq = document.getElementById('square');
const wallPenetrationEl = document.getElementById('wallPenetration');
const wallPenetrationToggle = document.getElementById('wallPenetrationToggle');
let pageBorder: ISceneBorder;
let changingCoords: IChangingCoords;
let falling;
let rotationDeg = 0;
let wallPenetration = wallPenetrationEl.innerHTML;

wallPenetrationToggle.onclick = () => {
	wallPenetration = wallPenetration === Penetration.On ? Penetration.Off : Penetration.On;
	wallPenetrationEl.innerHTML = wallPenetration;
};

ball.ondragstart = (): boolean => {
	return false;
};

ball.onmousedown = (e: MouseEvent): void => {
	startDrag(ball, e);
};

document.body.onresize = () => {
	calculatePageBorder();
	const coords = getCoords(ball);
	const validCoords = validateCoordsByPage(ball, coords);
	if (validCoords.reachedSide || validCoords.reachedUpside) {
		move(ball, validCoords, {x: 0, y: 0});
	}
};

window.onload = (): void => {
	calculatePageBorder();
	move(ball, {
		x: pageBorder.right / 2 - ball.offsetWidth,
		y: pageBorder.bottom / 2 - ball.offsetHeight,
	}, {x: 0, y: 0});

	startFalling(ball);
	rotate(ball, rotationDeg);
};
