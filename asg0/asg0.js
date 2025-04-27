function main() {
    const canvas = getCanvas();
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    clearCanvas(ctx);

    const v1 = new Vector3([2.25, 2.25, 0]); 
    drawVector(v1, 'red', ctx);
}

function getCanvas() {
    const canvas = document.getElementById('example');
    if (!canvas) {
        console.error('Failed to retrieve the <canvas> element');
    }
    return canvas;
}

function clearCanvas(context) {
    context.fillStyle = 'rgba(0, 0, 0, 1.0)';
    context.fillRect(0, 0, 400, 400);
}

function drawVector(v, color, context) {
    context.strokeStyle = color;
    context.beginPath();
    context.moveTo(200, 200);
    context.lineTo(20 * v.elements[0] + 200, -20 * v.elements[1] + 200);
    context.stroke();
}

function handleDrawEvent() {
    const canvas = getCanvas();
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    clearCanvas(ctx);

    const v1 = getInputVector("v1X", "v1Y");
    const v2 = getInputVector("v2X", "v2Y");

    drawVector(v1, "red", ctx);
    drawVector(v2, "blue", ctx);
}

function handleDrawOperationEvent() {
    const canvas = getCanvas();
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    clearCanvas(ctx);

    const v1 = getInputVector("v1X", "v1Y");
    const v2 = getInputVector("v2X", "v2Y");

    drawVector(v1, "red", ctx);
    drawVector(v2, "blue", ctx);

    const opType = document.getElementById("opSelect").value;
    const opValue = parseFloat(document.getElementById("scalar").value);

    switch (opType) {
        case "mul":
            v1.mul(opValue);
            v2.mul(opValue);
            drawVector(v1, "green", ctx);
            drawVector(v2, "green", ctx);
            break;
        case "div":
            v1.div(opValue);
            v2.div(opValue);
            drawVector(v1, "green", ctx);
            drawVector(v2, "green", ctx);
            break;
        case "add":
            v1.add(v2);
            drawVector(v1, "green", ctx);
            break;
        case "sub":
            v1.sub(v2);
            drawVector(v1, "green", ctx);
            break;
        case "mag":
            console.log(`Magnitude v1: ${v1.magnitude()}`);
            console.log(`Magnitude v2: ${v2.magnitude()}`);
            break;
        case "norm":
            v1.normalize();
            v2.normalize();
            drawVector(v1, "green", ctx);
            drawVector(v2, "green", ctx);
            break;
        case "ang":
            angleBetween(v1, v2);
            break;
        case "tri":
            areaTriangle(v1, v2);
            break;
    }
}

function getInputVector(xId, yId) {
    const x = parseFloat(document.getElementById(xId).value);
    const y = parseFloat(document.getElementById(yId).value);
    return new Vector3([x, y, 0]);
}

function angleBetween(v1, v2) {
    const dot = Vector3.dot(v1, v2);
    const cos = dot / (v1.magnitude() * v2.magnitude());
    const angle = Math.acos(cos) * (180 / Math.PI);
    console.log(`Angle: ${angle.toFixed(2)} degrees`);
}

function areaTriangle(v1, v2) {
    const area = Vector3.cross(v1, v2).magnitude() / 2;
    console.log(`Area of the triangle: ${area}`);
}