function drawAllShapes() {
  console.log("drawAllShapes() called; head_anim=", g_jointAngle, "joint2=", g_jointAngle2);

  var wool = [1.0, 0.75, 0.8, 1.0]; // Pink sheep wool
  var skin = [1.0, 0.91, 0.65, 1.0]; // Light skin color

  // Body
  let body = new Cube();
  body.color = wool;
  body.matrix.scale(0.25, 0.25, 0.35);
  body.matrix.translate(-0.5, 0, -0.25);
  body.render();

  // Head
  let head = new Cube();
  head.color = wool;
  head.matrix.rotate(-g_jointAngle, 1, 0, 0); // Head uses g_jointAngle now
  head.matrix.scale(0.35, 0.35, 0.35);
  head.matrix.translate(-0.5, 0.25, -1.25);
  head.render();

  // Face
  let face = new Cube();
  face.color = skin;
  face.matrix.rotate(-g_jointAngle, 1, 0, 0);
  face.matrix.scale(0.30, 0.30, 0.03);
  face.matrix.translate(-0.5, 0.35, -15.5);
  face.render();

  // Hair pieces
  const hairPositions = [
    { scale: [0.32, 0.071, 0.04], translate: [-0.5, 4.85, -11.95] }, // Top
    { scale: [0.05, 0.071, 0.04], translate: [-3.01, 1.5, -11.95] },  // Bottom left
    { scale: [0.05, 0.071, 0.04], translate: [2.01, 1.5, -11.95] }    // Bottom right
  ];

  for (let pos of hairPositions) {
    let hair = new Cube();
    hair.color = wool;
    hair.matrix.rotate(-g_jointAngle, 1, 0, 0);
    hair.matrix.scale(...pos.scale);
    hair.matrix.translate(...pos.translate);
    hair.render();
  }

  // Eyes (white + pupils)
  const eyes = [
    { color: [1, 1, 1, 1], scale: [0.1, 0.061, 0.04], translate: [-1.5, 3.5, -11.95] },
    { color: [0, 0, 0, 1], scale: [0.05, 0.061, 0.04], translate: [-3.001, 3.5, -12] },
    { color: [1, 1, 1, 1], scale: [0.1, 0.061, 0.04], translate: [0.5, 3.5, -11.95] },
    { color: [0, 0, 0, 1], scale: [0.05, 0.061, 0.04], translate: [2.001, 3.5, -12.05] }
  ];

  for (let eye of eyes) {
    let cube = new Cube();
    cube.color = eye.color;
    cube.matrix.rotate(-g_jointAngle, 1, 0, 0);
    cube.matrix.scale(...eye.scale);
    cube.matrix.translate(...eye.translate);
    cube.render();
  }

  // Mouth and tongue
  const mouthParts = [
    { color: [1, 0.79, 0.69, 1], scale: [0.1, 0.071, 0.04], translate: [-0.47, 1.5, -11.95] },
    { color: [0.89, 0.69, 0.64, 1], scale: [0.1, 0.035, 0.04], translate: [-0.4701, 3, -12] }
  ];

  for (let part of mouthParts) {
    let mouth = new Cube();
    mouth.color = part.color;
    mouth.matrix.rotate(-g_jointAngle, 1, 0, 0);
    mouth.matrix.scale(...part.scale);
    mouth.matrix.translate(...part.translate);
    mouth.render();
  }

  // Upper legs (front left, front right, back left, back right)
  const upperLegs = [
    { rotation: -g_jointAngle2, translate: [-1.15, -0.25, -0.75] }, // Front left
    { rotation: g_jointAngle2, translate: [0.2, -0.25, -0.75] },    // Front right
    { rotation: -g_jointAngle2, translate: [-1.15, -0.25, 1.5] },   // Back left
    { rotation: g_jointAngle2, translate: [0.2, -0.25, 1.5] }       // Back right
  ];

  let legCoords = [];

  for (let leg of upperLegs) {
    let upper = new Cube();
    upper.color = wool;
    upper.matrix.setTranslate(0, 0, 0);
    upper.matrix.rotate(leg.rotation, 0, 0, 1);
    legCoords.push(new Matrix4(upper.matrix));
    upper.matrix.scale(0.1, -0.1, 0.1);
    upper.matrix.translate(...leg.translate);
    upper.render();
  }

  // Lower legs (following upper leg joints)
  const lowerLegs = [
    { coord: legCoords[0], rotation: -g_jointAngle2, translate: [-1.25, -1.75, -0.8] },
    { coord: legCoords[1], rotation: g_jointAngle2, translate: [0.37, -1.75, -0.8] },
    { coord: legCoords[2], rotation: -g_jointAngle2, translate: [-1.25, -1.75, 2] },
    { coord: legCoords[3], rotation: g_jointAngle2, translate: [0.37, -1.75, 2] }
  ];

  for (let leg of lowerLegs) {
    let lower = new Cube();
    lower.color = skin;
    lower.matrix = leg.coord;
    lower.matrix.rotate(leg.rotation, 0, 0, 1);
    lower.matrix.scale(0.08, 0.08, 0.08);
    lower.matrix.translate(...leg.translate);
    lower.render();
  }
}