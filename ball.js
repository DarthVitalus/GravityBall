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
var Penetration;
(function (Penetration) {
    Penetration["On"] = "on";
    Penetration["Off"] = "off";
})(Penetration || (Penetration = {}));
var calculatePageBorder = function () {
    var borderSpace = 0;
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
var validateCoordsByPage = function (el, coords, shift) {
    if (shift === void 0) { shift = { x: 0, y: 0 }; }
    var newElBorders = {
        top: coords.y - shift.y,
        right: coords.x + (el.offsetWidth - shift.x),
        bottom: coords.y + (el.offsetHeight - shift.y),
        left: coords.x - shift.x,
    };
    var newCoords = __assign({}, coords, { reachedSide: false, reachedUpside: false, reachedTop: false, reachedRight: false, reachedLeft: false, reachedBottom: false });
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
var move = function (el, newCoords, shift) {
    if (shift === void 0) { shift = { x: 0, y: 0 }; }
    var validCoords = validateCoordsByPage(el, newCoords, shift);
    var newValidCoords = {
        x: validCoords.x - (validCoords.reachedSide ? 0 : shift.x),
        y: validCoords.y - (validCoords.reachedUpside ? 0 : shift.y),
    };
    el.style.left = newValidCoords.x + 'px';
    el.style.top = newValidCoords.y + 'px';
    if (!changingCoords) {
        changingCoords = {
            prevCoords: __assign({}, newValidCoords),
            curCoords: __assign({}, newValidCoords),
            deltaX: 0,
            deltaY: 0,
        };
    }
    changingCoords.prevCoords = __assign({}, changingCoords.curCoords);
    changingCoords.curCoords = __assign({}, newValidCoords);
    changingCoords.deltaX = changingCoords.curCoords.x - changingCoords.prevCoords.x;
    changingCoords.deltaY = changingCoords.curCoords.y - changingCoords.prevCoords.y;
    if ((validCoords.reachedTop && changingCoords.deltaY < 0) ||
        (validCoords.reachedBottom && changingCoords.deltaY > 0) ||
        (validCoords.reachedLeft && changingCoords.deltaX < 0) ||
        (validCoords.reachedRight && changingCoords.deltaX < 0)) {
        drop(el);
    }
};
var drop = function (el) {
    console.log('dropping');
    document.onmousemove = null;
    el.onmouseup = null;
    startFalling(el);
};
var getCoords = function (elem) {
    var box = elem.getBoundingClientRect();
    return {
        y: box.top + pageYOffset,
        x: box.left + pageXOffset,
    };
};
var drag = function (e, shift, el) {
    var newCoords2 = {
        x: e.pageX,
        y: e.pageY,
    };
    move(el, newCoords2, shift);
};
var startDrag = function (el, e) {
    clearInterval(falling);
    var coords = getCoords(el);
    var shift = {
        x: e.pageX - coords.x,
        y: e.pageY - coords.y,
    };
    drag(e, shift, el);
    document.onmousemove = function (event1) {
        drag(event1, shift, el);
    };
    el.onmouseup = function () {
        drop(el);
    };
};
var startFalling = function (el) {
    console.log('falling');
    var gravity = 500;
    var timeDeltaS = 0.01;
    var resistanceResistance = 0.997;
    var resistanceY = 0.96;
    var resistanceX = 0.992;
    var velocityY = Math.abs(changingCoords.deltaY * 2 / timeDeltaS);
    var directionX = 1;
    var directionY = changingCoords.deltaY >= 0 ? 1 : -1;
    var deltaX = changingCoords.deltaX;
    var curCoords = getCoords(el);
    falling = setInterval(function () {
        rotate(el, rotationDeg);
        var velocity = getNewVelocity(gravity, timeDeltaS);
        velocityY = velocityY + velocity * directionY;
        velocityY *= resistanceY;
        deltaX *= resistanceX;
        rotationDeg += deltaX * directionX;
        if (rotationDeg > 360) {
            rotationDeg -= 360;
        }
        var distanceY = getDistance(velocityY, timeDeltaS);
        var newCoords = {
            x: curCoords.x + deltaX * directionX,
            y: curCoords.y + distanceY * directionY,
        };
        var validCoords = validateCoordsByPage(el, newCoords);
        if (wallPenetration === Penetration.On && validCoords.reachedSide) {
            console.log('CLINK!');
            clearInterval(falling);
        }
        directionX = validCoords.reachedSide ? directionX * -1 : directionX;
        directionY = validCoords.reachedUpside ? directionY * -1 : directionY;
        move(el, validCoords);
        curCoords = __assign({}, validCoords);
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
var getNewVelocity = function (gravity, timeDeltaS) {
    return Math.pow(gravity * timeDeltaS, 3);
};
var getDistance = function (velocity, timeDeltaS) {
    return 1 / 2 * velocity * timeDeltaS;
};
var rotate = function (el, degreeNumber) {
    el.style.transform = "rotate(" + degreeNumber + "deg)";
};
// program starts
var ball = document.getElementById('ball');
var sq = document.getElementById('square');
var wallPenetrationEl = document.getElementById('wallPenetration');
var wallPenetrationToggle = document.getElementById('wallPenetrationToggle');
var pageBorder;
var changingCoords;
var falling;
var rotationDeg = 0;
var wallPenetration = wallPenetrationEl.innerHTML;
wallPenetrationToggle.onclick = function () {
    wallPenetration = wallPenetration === Penetration.On ? Penetration.Off : Penetration.On;
    wallPenetrationEl.innerHTML = wallPenetration;
};
ball.ondragstart = function () {
    return false;
};
ball.onmousedown = function (e) {
    startDrag(ball, e);
};
document.body.onresize = function () {
    calculatePageBorder();
    var coords = getCoords(ball);
    var validCoords = validateCoordsByPage(ball, coords);
    if (validCoords.reachedSide || validCoords.reachedUpside) {
        move(ball, validCoords, { x: 0, y: 0 });
    }
};
window.onload = function () {
    calculatePageBorder();
    move(ball, {
        x: pageBorder.right / 2 - ball.offsetWidth,
        y: pageBorder.bottom / 2 - ball.offsetHeight,
    }, { x: 0, y: 0 });
    startFalling(ball);
    rotate(ball, rotationDeg);
};
//# sourceMappingURL=ball.js.map