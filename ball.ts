interface ICoords {
    x: number;
    y: number;
}
interface INewCoords extends ICoords {
    changed: boolean;
}

const calculatePageBorder = (): void => {
    pageBorder = {
        top: 0,
        right: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
        bottom: Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
        left: 0
    };
    console.log(pageBorder);
    sq.style.width = pageBorder.right - 4 + 'px';
    sq.style.height = pageBorder.bottom - 4 + 'px';
};

const validateCoordsByPage = (el: HTMLElement, coords: ICoords, shift: ICoords): INewCoords => {
    const elBorders = {
        top: coords.y - shift.y,
        right: coords.x + (el.offsetWidth - shift.x),
        bottom: coords.y + (el.offsetHeight - shift.y),
        left: coords.x - shift.x
    };

    const newCoords = {
        ...coords,
        changed: true
    };

    if (elBorders.top < pageBorder.top) {
        newCoords.y = pageBorder.top;
    } else if (elBorders.right > pageBorder.right) {
        newCoords.x = pageBorder.right - el.offsetWidth;
    } else if (elBorders.bottom > pageBorder.bottom) {
        newCoords.y = pageBorder.bottom - el.offsetHeight;
    } else if (elBorders.left < pageBorder.left) {
        newCoords.x = pageBorder.left;
    } else {
        newCoords.changed = false;
    }

    return newCoords;
};

const drag = (el: HTMLElement, newCoords: ICoords, shift: ICoords): void => {
    const validCoords = validateCoordsByPage(el, newCoords, shift);
    el.style.left = validCoords.x - (validCoords.changed ? 0 : shift.x) + 'px';
    el.style.top = validCoords.y - (validCoords.changed ? 0 : shift.y) + 'px';
    if (validCoords.changed) {
        drop(el);
    }
};

const drop = (el: HTMLElement): void => {
    console.log('dropping');
    document.onmousemove = null;
    el.onmouseup = null;
};

const getCoords = (elem): {top,left} => {
    const box = elem.getBoundingClientRect();
    return {
        top: box.top + pageYOffset,
        left: box.left + pageXOffset
    };
};

const startDrag = (el: HTMLElement, e: MouseEvent): void => {
    const coords = getCoords(el);
    const shift: ICoords = {
        x: e.pageX - coords.left,
        y: e.pageY - coords.top
    };
    const newCoords: ICoords = {
        x: e.pageX,
        y: e.pageY
    };

    console.log('start', newCoords, shift, validateCoordsByPage(el, newCoords, shift));
    drag(el, newCoords, shift);

    document.onmousemove = (e: MouseEvent): void => {
        const newCoords: ICoords = {
            x: e.pageX,
            y: e.pageY
        };
        console.log('move', newCoords, shift, validateCoordsByPage(el, newCoords, shift));

        drag(el, newCoords, shift);
    };

    el.onmouseup = (): void => {
        drop(el);
    };
};

const ball = document.getElementById('ball');
const sq = document.getElementById('square');
let pageBorder = undefined;

ball.ondragstart = (): boolean => {
    return false;
};

ball.onmousedown = (e: MouseEvent): void => {
    startDrag(ball, e);
};

document.body.onresize = () => {
    calculatePageBorder();
    const coords = getCoords(ball);
    drag(ball, {
        x: coords.left,
        y: coords.top,
    }, {x: 0, y: 0})
};

window.onload = (): void => {
    calculatePageBorder();
    drag(ball, {
        x: pageBorder.right / 2 - ball.offsetWidth,
        y: pageBorder.bottom / 2 - ball.offsetHeight,
    }, {x: 0, y: 0})
};
