var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var calculatePageBorder = function () {
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
var validateCoordsByPage = function (el, coords, shift) {
    var elBorders = {
        top: coords.y - shift.y,
        right: coords.x + (el.offsetWidth - shift.x),
        bottom: coords.y + (el.offsetHeight - shift.y),
        left: coords.x - shift.x
    };
    var newCoords = __assign({}, coords, { changed: true });
    if (elBorders.top < pageBorder.top) {
        newCoords.y = pageBorder.top;
    }
    else if (elBorders.right > pageBorder.right) {
        newCoords.x = pageBorder.right - el.offsetWidth;
    }
    else if (elBorders.bottom > pageBorder.bottom) {
        newCoords.y = pageBorder.bottom - el.offsetHeight;
    }
    else if (elBorders.left < pageBorder.left) {
        newCoords.x = pageBorder.left;
    }
    else {
        newCoords.changed = false;
    }
    return newCoords;
};
var drag = function (el, newCoords, shift) {
    var validCoords = validateCoordsByPage(el, newCoords, shift);
    el.style.left = validCoords.x - (validCoords.changed ? 0 : shift.x) + 'px';
    el.style.top = validCoords.y - (validCoords.changed ? 0 : shift.y) + 'px';
    if (validCoords.changed) {
        drop(el);
    }
};
var drop = function (el) {
    console.log('dropping');
    document.onmousemove = null;
    el.onmouseup = null;
};
var getCoords = function (elem) {
    var box = elem.getBoundingClientRect();
    return {
        top: box.top + pageYOffset,
        left: box.left + pageXOffset
    };
};
var startDrag = function (el, e) {
    var coords = getCoords(el);
    var shift = {
        x: e.pageX - coords.left,
        y: e.pageY - coords.top
    };
    var newCoords = {
        x: e.pageX,
        y: e.pageY
    };
    console.log('start', newCoords, shift, validateCoordsByPage(el, newCoords, shift));
    drag(el, newCoords, shift);
    document.onmousemove = function (e) {
        var newCoords = {
            x: e.pageX,
            y: e.pageY
        };
        console.log('move', newCoords, shift, validateCoordsByPage(el, newCoords, shift));
        drag(el, newCoords, shift);
    };
    el.onmouseup = function () {
        drop(el);
    };
};
var ball = document.getElementById('ball');
var sq = document.getElementById('square');
var pageBorder = undefined;
ball.ondragstart = function () {
    return false;
};
ball.onmousedown = function (e) {
    startDrag(ball, e);
};
document.body.onresize = function () {
    calculatePageBorder();
    var coords = getCoords(ball);
    drag(ball, {
        x: coords.left,
        y: coords.top,
    }, { x: 0, y: 0 });
};
window.onload = function () {
    calculatePageBorder();
    drag(ball, {
        x: pageBorder.right / 2 - ball.offsetWidth,
        y: pageBorder.bottom / 2 - ball.offsetHeight,
    }, { x: 0, y: 0 });
};
//# sourceMappingURL=ball.js.map