// =====================================================================
// IIT ROPAR 3D CAMPUS MODEL — Complete Hardcoded Build
// Every building shape, road, field, and feature modeled from
// satellite imagery analysis. No satellite tiles, no external APIs.
//
// World coordinate system:
//   X axis: left(-150) to right(+150)  ~300 units
//   Z axis: top(-100)  to bottom(+100) ~200 units
//   Y axis: up (height)
//
// Pixel→World mapping (from 2559x1599 image, sidebar at x<130):
//   wx = (px - 130) / 2429 * 300 - 150
//   wz = (py - 130) / 1469 * 200 - 100
// =====================================================================

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

// =====================================================================
// 1. RENDERER, SCENE, CAMERA
// =====================================================================
const canvas = document.getElementById('campus3d');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // sky blue

// Gradient sky via hemisphere
const skyGeo = new THREE.SphereGeometry(800, 32, 15);
const skyMat = new THREE.ShaderMaterial({
    uniforms: {
        topColor: { value: new THREE.Color(0x0077ff) },
        bottomColor: { value: new THREE.Color(0xc8e6c9) },
        offset: { value: 50 },
        exponent: { value: 0.4 },
    },
    vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPos.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
            float h = normalize(vWorldPosition + offset).y;
            gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
        }
    `,
    side: THREE.BackSide,
});
scene.add(new THREE.Mesh(skyGeo, skyMat));

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1200);
camera.position.set(0, 160, 180);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, logarithmicDepthBuffer: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

// CSS2D label renderer
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'fixed';
labelRenderer.domElement.style.top = '0';
labelRenderer.domElement.style.left = '0';
labelRenderer.domElement.style.pointerEvents = 'none';
labelRenderer.domElement.style.zIndex = '50';
document.body.appendChild(labelRenderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.minDistance = 15;
controls.maxDistance = 400;
controls.maxPolarAngle = Math.PI / 2.05;
controls.target.set(0, 0, 0);

// =====================================================================
// 2. LIGHTING
// =====================================================================
scene.add(new THREE.AmbientLight(0xd0dce8, 0.55));

const hemi = new THREE.HemisphereLight(0x87ceeb, 0x556b2f, 0.45);
scene.add(hemi);

const sun = new THREE.DirectionalLight(0xfff8e7, 1.5);
sun.position.set(150, 180, 80);
sun.castShadow = true;
sun.shadow.mapSize.set(4096, 4096);
const sc = sun.shadow.camera;
sc.left = -300; sc.right = 300; sc.top = 200; sc.bottom = -200;
sc.near = 1; sc.far = 600;
sun.shadow.bias = -0.001;
sun.shadow.normalBias = 0.02;
scene.add(sun);

const fill = new THREE.DirectionalLight(0x8ec8f0, 0.35);
fill.position.set(-120, 60, -60);
scene.add(fill);

// =====================================================================
// 3. MATERIALS LIBRARY
// =====================================================================
const MAT = {
    // Ground
    grass: new THREE.MeshStandardMaterial({ color: 0x4a7c59, roughness: 0.95, metalness: 0 }),
    grassDark: new THREE.MeshStandardMaterial({ color: 0x3d6b4a, roughness: 0.95, metalness: 0 }),
    grassLight: new THREE.MeshStandardMaterial({ color: 0x6aaf5e, roughness: 0.9, metalness: 0 }),
    field: new THREE.MeshStandardMaterial({ color: 0x5da84e, roughness: 0.85, metalness: 0 }),
    dirt: new THREE.MeshStandardMaterial({ color: 0xa08060, roughness: 0.95, metalness: 0 }),
    sand: new THREE.MeshStandardMaterial({ color: 0xc4a87c, roughness: 0.9, metalness: 0 }),
    road: new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.85, metalness: 0.05 }),
    roadLight: new THREE.MeshStandardMaterial({ color: 0x707070, roughness: 0.8, metalness: 0.05 }),
    sidewalk: new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.8, metalness: 0 }),
    parking: new THREE.MeshStandardMaterial({ color: 0x484848, roughness: 0.9, metalness: 0.05 }),
    water: new THREE.MeshStandardMaterial({ color: 0x3a9ad9, roughness: 0.15, metalness: 0.35, transparent: true, opacity: 0.8 }),
    // Buildings
    concrete: new THREE.MeshStandardMaterial({ color: 0xe8e0d4, roughness: 0.7, metalness: 0.05 }),
    concreteW: new THREE.MeshStandardMaterial({ color: 0xf0ece6, roughness: 0.65, metalness: 0.05 }),
    brick: new THREE.MeshStandardMaterial({ color: 0xc4956a, roughness: 0.75, metalness: 0 }),
    brickDark: new THREE.MeshStandardMaterial({ color: 0xa07050, roughness: 0.8, metalness: 0 }),
    glass: new THREE.MeshStandardMaterial({ color: 0x88bbdd, roughness: 0.15, metalness: 0.55, transparent: true, opacity: 0.7, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }),
    roof: new THREE.MeshStandardMaterial({ color: 0xd0c8bc, roughness: 0.6, metalness: 0.1 }),
    roofRed: new THREE.MeshStandardMaterial({ color: 0xb05040, roughness: 0.7, metalness: 0.05 }),
    roofDark: new THREE.MeshStandardMaterial({ color: 0x706860, roughness: 0.7, metalness: 0.1 }),
    metal: new THREE.MeshStandardMaterial({ color: 0x8899aa, roughness: 0.35, metalness: 0.6 }),
    gate: new THREE.MeshStandardMaterial({ color: 0xb89a6a, roughness: 0.6, metalness: 0.15 }),
    hostel: new THREE.MeshStandardMaterial({ color: 0xd4c4a8, roughness: 0.7, metalness: 0.05 }),
    hostelAlt: new THREE.MeshStandardMaterial({ color: 0xc8b898, roughness: 0.7, metalness: 0.05 }),
    academic: new THREE.MeshStandardMaterial({ color: 0xe0d8cc, roughness: 0.65, metalness: 0.05 }),
    academicB: new THREE.MeshStandardMaterial({ color: 0xd8cfc0, roughness: 0.65, metalness: 0.05 }),
    admin: new THREE.MeshStandardMaterial({ color: 0xd4ccc0, roughness: 0.6, metalness: 0.08 }),
    sports: new THREE.MeshStandardMaterial({ color: 0xc0a888, roughness: 0.7, metalness: 0 }),
    poolWater: new THREE.MeshStandardMaterial({ color: 0x40a0d0, roughness: 0.1, metalness: 0.3 }),
    track: new THREE.MeshStandardMaterial({ color: 0xc06030, roughness: 0.85, metalness: 0 }),
    white: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5, metalness: 0.1 }),
};

// =====================================================================
// 4. COLORS FOR CATEGORIES (sidebar)
// =====================================================================
const CAT_COLORS = {
    academic: '#3b82f6', hostel: '#f59e0b', sports: '#10b981',
    admin: '#a855f7', landmark: '#ef4444', facility: '#06b6d4',
    dining: '#f97316', residential: '#78716c', infrastructure: '#64748b',
};

// =====================================================================
// 5. HELPER: CREATE SHAPE FUNCTIONS
// =====================================================================
const allMeshes = [];    // for raycasting
const meshById = {};     // id -> mesh
const labelById = {};    // id -> CSS2DObject
const origColor = {};    // id -> color hex
let selectedId = null;
let labelsVisible = true;

// Make a box building
function box(id, x, z, w, d, h, mat, castShadow = true) {
    if (id && typeof id === 'string') {
        h = 10; // Match height of all main buildings
    }
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, h / 2, z);
    mesh.castShadow = castShadow;
    mesh.receiveShadow = true;
    mesh.userData.id = id;
    scene.add(mesh);
    if (id) {
        allMeshes.push(mesh);
        if (!meshById[id]) meshById[id] = [];
        meshById[id].push(mesh);
    }
    return mesh;
}

// L-shaped building (2 boxes joined)
function lShape(id, x, z, w1, d1, w2, d2, h, mat, orient = 'BL') {
    // orient: which corner the L notch is at:
    // BL = bottom-left missing, BR, TL, TR
    const m1 = box(id, x, z, w1, d1, h, mat);
    let m2;
    if (orient === 'BL') {
        m2 = box(id, x + (w1 - w2) / 2, z - (d1 + d2) / 2 + d2 / 2, w2, d2, h, mat);
        m2.position.x = x + w1 / 2 - w2 / 2;
        m2.position.z = z + d1 / 2 + d2 / 2;
    } else if (orient === 'BR') {
        m2 = box(id, x - w1 / 2 + w2 / 2, z + d1 / 2 + d2 / 2, w2, d2, h, mat);
    } else if (orient === 'TL') {
        m2 = box(id, x + w1 / 2 - w2 / 2, z - d1 / 2 - d2 / 2, w2, d2, h, mat);
    } else {
        m2 = box(id, x - w1 / 2 + w2 / 2, z - d1 / 2 - d2 / 2, w2, d2, h, mat);
    }
    return [m1, m2];
}

// U-shaped building (3 boxes)
function uShape(id, x, z, w, d, wingW, wingD, h, mat) {
    // Main bar + 2 wings
    box(id, x, z, w, d, h, mat); // center bar
    box(id, x - w / 2 + wingW / 2, z - d / 2 - wingD / 2, wingW, wingD, h, mat); // left wing
    box(id, x + w / 2 - wingW / 2, z - d / 2 - wingD / 2, wingW, wingD, h, mat); // right wing
}

// Flat ground patch
function ground(x, z, w, d, mat) {
    const geo = new THREE.PlaneGeometry(w, d);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, 0.05, z);
    mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
}

// Road strip
function road(x, z, w, d) {
    const geo = new THREE.PlaneGeometry(w, d);
    const mesh = new THREE.Mesh(geo, MAT.road);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, 0.12, z);
    mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
}

// Road with dashes (center line)
function roadWithLine(x, z, w, d, isVertical = true) {
    road(x, z, w, d);
    // Center dashes
    const dashCount = isVertical ? Math.floor(d / 4) : Math.floor(w / 4);
    for (let i = 0; i < dashCount; i++) {
        const dGeo = new THREE.PlaneGeometry(isVertical ? 0.3 : 1.5, isVertical ? 1.5 : 0.3);
        const dash = new THREE.Mesh(dGeo, MAT.white);
        dash.rotation.x = -Math.PI / 2;
        if (isVertical) {
            dash.position.set(x, 0.15, z - d / 2 + i * 4 + 2);
        } else {
            dash.position.set(x - w / 2 + i * 4 + 2, 0.15, z);
        }
        scene.add(dash);
    }
}

// ── Mess Complex (detailed structure from satellite imagery) ─────────
function buildMessComplex(id, cx, cz) {
    const messGroup = new THREE.Group();

    const wallMat = MAT.concrete;
    const roofCapMat = MAT.roofDark;
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8, metalness: 0.2 });

    const bHeight = 10;
    const exSettings = { depth: bHeight, bevelEnabled: false };

    function addExtruded(shape, settings, mat) {
        const mesh = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, settings), mat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData.id = id;
        messGroup.add(mesh);
        return mesh;
    }

    // --- Left Wing (angled trapezoid) ---
    const leftShape = new THREE.Shape();
    leftShape.moveTo(-45, -5);
    leftShape.lineTo(-15, 10);
    leftShape.lineTo(-15, -10);
    leftShape.lineTo(-45, -25);
    leftShape.lineTo(-45, -5);
    addExtruded(leftShape, exSettings, wallMat);

    // --- Right Wing (mirror of left) ---
    const rightShape = new THREE.Shape();
    rightShape.moveTo(15, 10);
    rightShape.lineTo(45, -5);
    rightShape.lineTo(45, -25);
    rightShape.lineTo(15, -10);
    rightShape.lineTo(15, 10);
    addExtruded(rightShape, exSettings, wallMat);

    // --- Center Back block (bridges the two wings) ---
    const centerBackShape = new THREE.Shape();
    centerBackShape.moveTo(-15, -10);
    centerBackShape.lineTo(15, -10);
    centerBackShape.lineTo(15, 0);
    centerBackShape.lineTo(-15, 0);
    centerBackShape.lineTo(-15, -10);
    addExtruded(centerBackShape, exSettings, wallMat);

    // --- Center roof slab with jutting entrance canopy ---
    const roofShape = new THREE.Shape();
    roofShape.moveTo(-15, 0);
    roofShape.lineTo(15, 0);
    roofShape.lineTo(15, 10);
    roofShape.lineTo(6, 10);
    roofShape.lineTo(4, 15);
    roofShape.lineTo(-4, 15);
    roofShape.lineTo(-6, 10);
    roofShape.lineTo(-15, 10);
    roofShape.lineTo(-15, 0);
    const roofSettings = { depth: 2, bevelEnabled: false };
    const centerRoof = addExtruded(roofShape, roofSettings, roofCapMat);
    centerRoof.position.z = bHeight - 2;

    // --- Gate supporting pillars ---
    const pGeo = new THREE.BoxGeometry(2, 2, bHeight - 2);
    const p1 = new THREE.Mesh(pGeo, wallMat);
    p1.position.set(-13, 8, (bHeight - 2) / 2);
    p1.castShadow = true;
    p1.userData.id = id;
    messGroup.add(p1);
    const p2 = new THREE.Mesh(pGeo, wallMat);
    p2.position.set(13, 8, (bHeight - 2) / 2);
    p2.castShadow = true;
    p2.userData.id = id;
    messGroup.add(p2);

    // --- Glass front facades with mullion frames ---
    function addGlass(x1, y1, x2, y2) {
        const dx = x2 - x1, dy = y2 - y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        const ang = Math.atan2(dy, dx);
        const plane = new THREE.Mesh(new THREE.PlaneGeometry(len, bHeight), MAT.glass);
        plane.rotation.order = 'ZXY';
        plane.rotation.x = Math.PI / 2;
        plane.rotation.z = ang;
        const nx = -dy / len, ny = dx / len;
        const offset = 0.25;
        plane.position.set(x1 + dx / 2 + nx * offset, y1 + dy / 2 + ny * offset, bHeight / 2);
        plane.userData.id = id;
        messGroup.add(plane);

        const segs = Math.floor(len / 3.5);
        for (let i = 0; i <= segs; i++) {
            const vf = new THREE.Mesh(new THREE.BoxGeometry(0.3, bHeight, 0.3), frameMat);
            vf.rotation.copy(plane.rotation);
            vf.position.set(
                x1 + dx * (i / segs) + nx * offset,
                y1 + dy * (i / segs) + ny * offset,
                bHeight / 2
            );
            vf.userData.id = id;
            messGroup.add(vf);
        }
    }
    addGlass(-45, -5, -15, 10);   // left front
    addGlass(15, 10, 45, -5);     // right front

    // Stand the group up (extrude was along Z, rotate so Z→Y)
    messGroup.rotation.x = -Math.PI / 2;

    // Scale to campus proportions:
    // Local:  width=90(X), depth=40(Y), height=10(Z)
    // Target: width≈25, depth≈15, height≈5.5
    messGroup.scale.set(0.28, 0.375, 0.55);
    messGroup.position.set(cx, 0, cz);
    scene.add(messGroup);

    // Register all child meshes for raycasting / highlight
    messGroup.traverse(c => {
        if (c.isMesh) {
            c.userData.id = id;
            allMeshes.push(c);
            if (!meshById[id]) meshById[id] = [];
            meshById[id].push(c);
        }
    });
}

// ── BHS Boys Hostel (detailed quadrilateral courtyard from bhs_boys.html) ────
function buildBHSBoys(id, cx, cz) {
    const buildingGroup = new THREE.Group();

    const matBrown = new THREE.MeshStandardMaterial({ color: 0xAA8B70, roughness: 0.9 });
    const matWhite = new THREE.MeshStandardMaterial({ color: 0xF7F4E9, roughness: 0.8 });
    const matTower = new THREE.MeshStandardMaterial({ color: 0x7E6855, roughness: 0.9 });
    const matGlass = MAT.glass;

    const bHeight = 36;
    const floors = 6;
    const floorHeight = bHeight / floors;

    // --- Quadrilateral base ring with courtyard hole ---
    const quadShape = new THREE.Shape();
    quadShape.moveTo(-45, 15);
    quadShape.lineTo(45, 15);
    quadShape.lineTo(20, -55);
    quadShape.lineTo(-45, -55);
    quadShape.lineTo(-45, 15);

    const courtyardHole = new THREE.Path();
    courtyardHole.moveTo(-30, 0);
    courtyardHole.lineTo(25, 0);
    courtyardHole.lineTo(8, -40);
    courtyardHole.lineTo(-30, -40);
    courtyardHole.lineTo(-30, 0);
    quadShape.holes.push(courtyardHole);

    const extrudeSettings = { depth: bHeight, bevelEnabled: false };
    const quadBuilding = new THREE.Mesh(new THREE.ExtrudeGeometry(quadShape, extrudeSettings), matBrown);
    quadBuilding.rotation.x = -Math.PI / 2;
    quadBuilding.castShadow = true;
    quadBuilding.receiveShadow = true;
    buildingGroup.add(quadBuilding);

    // --- Windows on walls ---
    function addWallWindows(startNode, endNode, numWindows) {
        const pStart = new THREE.Vector3(startNode[0], 0, -startNode[1]);
        const pEnd = new THREE.Vector3(endNode[0], 0, -endNode[1]);
        const dir = new THREE.Vector3().subVectors(pEnd, pStart).normalize();
        const normal = new THREE.Vector3(-dir.z, 0, dir.x);
        const winWidth = 3, winHeight = 3.5;

        for (let floor = 1; floor < floors; floor++) {
            const floorY = floor * floorHeight;
            for (let i = 1; i <= numWindows; i++) {
                const t = i / (numWindows + 1);
                const pos = new THREE.Vector3().copy(pStart).lerp(pEnd, t);
                pos.y = floorY - 0.5;
                pos.addScaledVector(normal, 0.1);
                const angle = Math.atan2(normal.x, normal.z);

                const frame = new THREE.Mesh(new THREE.BoxGeometry(winWidth + 0.5, winHeight + 0.5, 0.2), matWhite);
                frame.position.copy(pos);
                frame.rotation.y = angle;
                buildingGroup.add(frame);

                const glass = new THREE.Mesh(new THREE.PlaneGeometry(winWidth, winHeight), matGlass);
                glass.position.copy(pos).addScaledVector(normal, 0.11);
                glass.rotation.y = angle;
                buildingGroup.add(glass);
            }
        }
    }

    // Outer walls
    addWallWindows([-45, 15], [-45, -55], 10);
    addWallWindows([-45, -55], [20, -55], 12);
    addWallWindows([20, -55], [45, 15], 10);
    // Inner courtyard walls
    addWallWindows([-30, 0], [25, 0], 8);
    addWallWindows([25, 0], [8, -40], 6);
    addWallWindows([8, -40], [-30, -40], 6);
    addWallWindows([-30, -40], [-30, 0], 6);

    // --- Front facade overlay ---
    const frontZ = -15.1;
    const frontWidth = 90;

    // Central glass column
    const glassCol = new THREE.Mesh(new THREE.PlaneGeometry(4, bHeight), matGlass);
    glassCol.position.set(0, bHeight / 2, frontZ - 0.1);
    buildingGroup.add(glassCol);

    // Glass column white frames
    const lf = new THREE.Mesh(new THREE.BoxGeometry(0.5, bHeight, 1.5), matWhite);
    lf.position.set(-2, bHeight / 2, frontZ - 0.3);
    buildingGroup.add(lf);
    const rf = lf.clone();
    rf.position.set(2, bHeight / 2, frontZ - 0.3);
    buildingGroup.add(rf);

    // Horizontal floor bands
    for (let i = 1; i < floors; i++) {
        const hBand = new THREE.Mesh(new THREE.BoxGeometry(frontWidth - 20, 1, 1), matWhite);
        hBand.position.set(0, i * floorHeight, frontZ - 0.2);
        buildingGroup.add(hBand);
    }

    // Vertical pillars
    [-28, -18, -8, 8, 18, 28].forEach(xPos => {
        const vBand = new THREE.Mesh(new THREE.BoxGeometry(1, bHeight, 1), matWhite);
        vBand.position.set(xPos, bHeight / 2, frontZ - 0.2);
        buildingGroup.add(vBand);
    });

    // End towers
    const towerWidth = 9;
    const leftTower = new THREE.Mesh(new THREE.BoxGeometry(towerWidth, bHeight + 2, 16), matTower);
    leftTower.position.set(-frontWidth / 2 + towerWidth / 2, bHeight / 2 + 1, frontZ - 2);
    leftTower.castShadow = true; leftTower.receiveShadow = true;
    buildingGroup.add(leftTower);

    const rightTower = new THREE.Mesh(new THREE.BoxGeometry(towerWidth, bHeight + 2, 16), matTower);
    rightTower.position.set(frontWidth / 2 - towerWidth / 2, bHeight / 2 + 1, frontZ - 2);
    rightTower.castShadow = true; rightTower.receiveShadow = true;
    buildingGroup.add(rightTower);

    // Louvers on tower fronts
    for (let i = 2; i < bHeight; i += 1.5) {
        const louverL = new THREE.Mesh(new THREE.BoxGeometry(towerWidth - 1, 0.4, 0.5), matWhite);
        louverL.position.set(leftTower.position.x, i, frontZ - 10.2);
        buildingGroup.add(louverL);
        const louverR = new THREE.Mesh(new THREE.BoxGeometry(towerWidth - 1, 0.4, 0.5), matWhite);
        louverR.position.set(rightTower.position.x, i, frontZ - 10.2);
        buildingGroup.add(louverR);
    }

    // Scale to campus proportions:
    // Local: width≈90(X), depth≈70(Z), height≈36(Y)
    // Target: w≈12, d≈10, h≈10
    const scaleX = 12 / 90;
    const scaleZ = 10 / 70;
    const scaleY = 10 / 36;
    buildingGroup.scale.set(scaleX, scaleY, scaleZ);
    buildingGroup.rotation.y = -Math.PI / 2; // rotate 90° right
    buildingGroup.position.set(cx, 0, cz);
    scene.add(buildingGroup);

    // Register all child meshes for raycasting / highlight
    buildingGroup.traverse(c => {
        if (c.isMesh) {
            c.userData.id = id;
            allMeshes.push(c);
            if (!meshById[id]) meshById[id] = [];
            meshById[id].push(c);
        }
    });

    addLabel(id, '🏠 Brahmaputra Boys', cx, 12, cz);
}

// ── BHS Girls Hostel (U-shaped building from bhs_girls.html) ───────────
function buildBHSGirls(id, cx, cz) {
    const buildingGroup = new THREE.Group();

    const matBrown = new THREE.MeshStandardMaterial({ color: 0xAA8B70, roughness: 0.9 });
    const matWhite = new THREE.MeshStandardMaterial({ color: 0xF7F4E9, roughness: 0.8 });
    const matTower = new THREE.MeshStandardMaterial({ color: 0x7E6855, roughness: 0.9 });
    const matGlass = MAT.glass;

    const bHeight = 36;
    const floors = 6;
    const floorHeight = bHeight / floors;

    // --- U-Shape base (main block + two wings extending backward) ---
    const uShape = new THREE.Shape();
    uShape.moveTo(-45, 15);
    uShape.lineTo(45, 15);
    uShape.lineTo(45, -50);
    uShape.lineTo(20, -50);
    uShape.lineTo(20, -5);
    uShape.lineTo(-20, -5);
    uShape.lineTo(-20, -50);
    uShape.lineTo(-45, -50);
    uShape.lineTo(-45, 15);

    const extrudeSettings = { depth: bHeight, bevelEnabled: false };
    const uBuilding = new THREE.Mesh(new THREE.ExtrudeGeometry(uShape, extrudeSettings), matBrown);
    uBuilding.rotation.x = -Math.PI / 2;
    uBuilding.castShadow = true;
    uBuilding.receiveShadow = true;
    buildingGroup.add(uBuilding);

    // --- Windows on walls ---
    function addWallWindows(startNode, endNode, numWindows) {
        const pStart = new THREE.Vector3(startNode[0], 0, -startNode[1]);
        const pEnd = new THREE.Vector3(endNode[0], 0, -endNode[1]);
        const dir = new THREE.Vector3().subVectors(pEnd, pStart).normalize();
        const normal = new THREE.Vector3(-dir.z, 0, dir.x);
        const winWidth = 3, winHeight = 3.5;

        for (let floor = 1; floor < floors; floor++) {
            const floorY = floor * floorHeight;
            for (let i = 1; i <= numWindows; i++) {
                const t = i / (numWindows + 1);
                const pos = new THREE.Vector3().copy(pStart).lerp(pEnd, t);
                pos.y = floorY - 0.5;
                pos.addScaledVector(normal, 0.1);
                const angle = Math.atan2(normal.x, normal.z);

                const frame = new THREE.Mesh(new THREE.BoxGeometry(winWidth + 0.5, winHeight + 0.5, 0.2), matWhite);
                frame.position.copy(pos);
                frame.rotation.y = angle;
                buildingGroup.add(frame);

                const glass = new THREE.Mesh(new THREE.PlaneGeometry(winWidth, winHeight), matGlass);
                glass.position.copy(pos).addScaledVector(normal, 0.11);
                glass.rotation.y = angle;
                buildingGroup.add(glass);
            }
        }
    }

    // U-shape perimeter windows (skipping open front facade)
    addWallWindows([-45, 15], [-45, -50], 12);
    addWallWindows([-45, -50], [-20, -50], 3);
    addWallWindows([-20, -50], [-20, -5], 8);
    addWallWindows([-20, -5], [20, -5], 6);
    addWallWindows([20, -5], [20, -50], 8);
    addWallWindows([20, -50], [45, -50], 3);
    addWallWindows([45, -50], [45, 15], 12);

    // --- Front facade overlay ---
    const frontZ = -15.1;
    const frontWidth = 90;

    // Central glass column
    const glassCol = new THREE.Mesh(new THREE.PlaneGeometry(4, bHeight), matGlass);
    glassCol.position.set(0, bHeight / 2, frontZ - 0.1);
    buildingGroup.add(glassCol);

    // Glass column white frames
    const lf = new THREE.Mesh(new THREE.BoxGeometry(0.5, bHeight, 1.5), matWhite);
    lf.position.set(-2, bHeight / 2, frontZ - 0.3);
    buildingGroup.add(lf);
    const rf = lf.clone();
    rf.position.set(2, bHeight / 2, frontZ - 0.3);
    buildingGroup.add(rf);

    // Horizontal floor bands
    for (let i = 1; i < floors; i++) {
        const hBand = new THREE.Mesh(new THREE.BoxGeometry(frontWidth - 20, 1, 1), matWhite);
        hBand.position.set(0, i * floorHeight, frontZ - 0.2);
        buildingGroup.add(hBand);
    }

    // Vertical pillars
    [-28, -18, -8, 8, 18, 28].forEach(xPos => {
        const vBand = new THREE.Mesh(new THREE.BoxGeometry(1, bHeight, 1), matWhite);
        vBand.position.set(xPos, bHeight / 2, frontZ - 0.2);
        buildingGroup.add(vBand);
    });

    // End towers
    const towerWidth = 9;
    const leftTower = new THREE.Mesh(new THREE.BoxGeometry(towerWidth, bHeight + 2, 16), matTower);
    leftTower.position.set(-frontWidth / 2 + towerWidth / 2, bHeight / 2 + 1, frontZ - 2);
    leftTower.castShadow = true; leftTower.receiveShadow = true;
    buildingGroup.add(leftTower);

    const rightTower = new THREE.Mesh(new THREE.BoxGeometry(towerWidth, bHeight + 2, 16), matTower);
    rightTower.position.set(frontWidth / 2 - towerWidth / 2, bHeight / 2 + 1, frontZ - 2);
    rightTower.castShadow = true; rightTower.receiveShadow = true;
    buildingGroup.add(rightTower);

    // Louvers on tower fronts
    for (let i = 2; i < bHeight; i += 1.5) {
        const louverL = new THREE.Mesh(new THREE.BoxGeometry(towerWidth - 1, 0.4, 0.5), matWhite);
        louverL.position.set(leftTower.position.x, i, frontZ - 10.2);
        buildingGroup.add(louverL);
        const louverR = new THREE.Mesh(new THREE.BoxGeometry(towerWidth - 1, 0.4, 0.5), matWhite);
        louverR.position.set(rightTower.position.x, i, frontZ - 10.2);
        buildingGroup.add(louverR);
    }

    // Scale to campus proportions:
    // Local: width≈90(X), depth≈65(Z), height≈36(Y)
    // Target: w≈12, d≈10, h≈10
    const scaleX = 12 / 90;
    const scaleZ = 10 / 65;
    const scaleY = 10 / 36;
    buildingGroup.scale.set(scaleX, scaleY, scaleZ);
    buildingGroup.rotation.y = -Math.PI / 2;
    buildingGroup.position.set(cx, 0, cz);
    scene.add(buildingGroup);

    // Register all child meshes for raycasting / highlight
    buildingGroup.traverse(c => {
        if (c.isMesh) {
            c.userData.id = id;
            allMeshes.push(c);
            if (!meshById[id]) meshById[id] = [];
            meshById[id].push(c);
        }
    });

    addLabel(id, '🏠 Brahmaputra Girls', cx, 12, cz);
}

// Tree
function tree(x, z, scale = 1) {
    const trunkGeo = new THREE.CylinderGeometry(0.15 * scale, 0.25 * scale, 2 * scale, 6);
    const trunk = new THREE.Mesh(trunkGeo, new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.9 }));
    trunk.position.set(x, scale, z);
    trunk.castShadow = true;
    scene.add(trunk);

    const canopyGeo = new THREE.SphereGeometry(1.5 * scale, 8, 6);
    const green = 0x2e7d32 + Math.floor(Math.random() * 0x1a3a1a);
    const canopy = new THREE.Mesh(canopyGeo, new THREE.MeshStandardMaterial({ color: green, roughness: 0.8 }));
    canopy.position.set(x, 2.5 * scale + scale * 0.5, z);
    canopy.castShadow = true;
    scene.add(canopy);
}

// Row of trees
function treeRow(x1, z1, x2, z2, count, scaleMin = 0.7, scaleMax = 1.2) {
    for (let i = 0; i < count; i++) {
        const t = i / Math.max(count - 1, 1);
        const tx = x1 + (x2 - x1) * t + (Math.random() - 0.5) * 1.5;
        const tz = z1 + (z2 - z1) * t + (Math.random() - 0.5) * 1.5;
        tree(tx, tz, scaleMin + Math.random() * (scaleMax - scaleMin));
    }
}

// Fence/Wall
function wall(x1, z1, x2, z2, height = 2, thickness = 0.3) {
    const dx = x2 - x1, dz = z2 - z1;
    const len = Math.sqrt(dx * dx + dz * dz);
    const angle = Math.atan2(dx, dz);
    const geo = new THREE.BoxGeometry(thickness, height, len);
    const mesh = new THREE.Mesh(geo, MAT.concrete);
    mesh.position.set((x1 + x2) / 2, height / 2, (z1 + z2) / 2);
    mesh.rotation.y = angle;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
}

// Label
function addLabel(id, text, x, y, z) {
    const div = document.createElement('div');
    div.className = 'label3d';
    div.textContent = text;
    const label = new CSS2DObject(div);
    label.position.set(x, y, z);
    scene.add(label);
    if (id) labelById[id] = label;
    return label;
}

// Pillar (for gate)
function pillar(x, z, w, d, h, mat) {
    // Tapered pillar (pyramid-like)
    const geo = new THREE.CylinderGeometry(w * 0.3, w * 0.5, h, 4);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, h / 2, z);
    mesh.rotation.y = Math.PI / 4;
    mesh.castShadow = true;
    scene.add(mesh);
    return mesh;
}

// =====================================================================
// VISITING FACULTY BUILDING — Detailed model (square courtyard + tensile roof)
// Adapted from standalone visitingfaculty.html
// =====================================================================
function createVisitingFacultyBuilding(cx, cz) {
    const id = 'visiting_faculty';
    const buildingGroup = new THREE.Group();

    // Scale: the HTML model is 100 units wide; campus scale ~15 units
    const S = 0.15;
    const size = 100 * S;       // 15
    const height = 40 * S;      // 6
    const wallDepth = 15 * S;   // 2.25

    // Materials (reuse campus palette where possible)
    const wallMaterial = MAT.concreteW;
    const windowMaterial = MAT.glass;
    const redAccentMaterial = new THREE.MeshStandardMaterial({ color: 0xcc0000 });
    const roofMaterial = MAT.roofDark;

    function createWing() {
        const wingGroup = new THREE.Group();

        // Main wall block
        const wallGeo = new THREE.BoxGeometry(size, height, wallDepth);
        const wall = new THREE.Mesh(wallGeo, wallMaterial);
        wall.castShadow = true;
        wall.receiveShadow = true;
        wall.userData.id = id;
        wingGroup.add(wall);

        // Windows & red accent grid
        const cols = 12;
        const rows = 6;
        const stepX = (size - 10 * S) / cols;
        const stepY = (height - 10 * S) / rows;
        const startX = -size / 2 + 5 * S;
        const startY = -height / 2 + 5 * S;

        for (let i = 0; i < cols; i++) {
            const isRedPanel = (i % 4 === 2) || (i % 4 === 3 && i % 7 < 3);
            for (let j = 0; j < rows; j++) {
                const x = startX + i * stepX + stepX / 2;
                const y = startY + j * stepY + stepY / 2;
                const z = wallDepth / 2 + 0.05;

                if (isRedPanel) {
                    const panelH = stepY + 1 * S;
                    const panelGeo = new THREE.BoxGeometry(stepX * 0.8, panelH, 0.15);
                    const panel = new THREE.Mesh(panelGeo, redAccentMaterial);
                    panel.position.set(x, y, z);
                    wingGroup.add(panel);
                } else {
                    const winGeo = new THREE.BoxGeometry(stepX * 0.6, stepY * 0.6, 0.08);
                    const win = new THREE.Mesh(winGeo, windowMaterial);
                    win.position.set(x, y, z);
                    wingGroup.add(win);
                }
            }
        }

        // Roof cap for wing
        const roofGeo = new THREE.BoxGeometry(size + 2 * S, 2 * S, wallDepth + 2 * S);
        const roof = new THREE.Mesh(roofGeo, roofMaterial);
        roof.position.y = height / 2 + 1 * S;
        roof.castShadow = true;
        wingGroup.add(roof);

        return wingGroup;
    }

    // Assemble 4 sides to form a hollow square
    const offset = (size - wallDepth) / 2;

    const front = createWing();
    front.position.z = offset;
    buildingGroup.add(front);

    const back = createWing();
    back.rotation.y = Math.PI;
    back.position.z = -offset;
    buildingGroup.add(back);

    const left = createWing();
    left.rotation.y = -Math.PI / 2;
    left.position.x = -offset;
    buildingGroup.add(left);

    const right = createWing();
    right.rotation.y = Math.PI / 2;
    right.position.x = offset;
    buildingGroup.add(right);

    // Central tensile / cone roof structure
    const innerSize = size * 0.6;

    // Fabric cone
    const fabricGeo = new THREE.ConeGeometry(innerSize / 1.5, 15 * S, 16, 4, true);
    const fabricMat = new THREE.MeshStandardMaterial({
        color: 0xffffff, side: THREE.DoubleSide, roughness: 0.9
    });
    const fabric = new THREE.Mesh(fabricGeo, fabricMat);
    fabric.position.y = height / 2 - 5 * S;
    fabric.rotation.y = Math.PI / 4;
    fabric.castShadow = true;
    buildingGroup.add(fabric);

    // Wire frame overlay (cables)
    const wireframeGeo = new THREE.WireframeGeometry(fabricGeo);
    const wireframeMat = new THREE.LineBasicMaterial({ color: 0x8B4513 });
    const wireframe = new THREE.LineSegments(wireframeGeo, wireframeMat);
    wireframe.position.copy(fabric.position);
    wireframe.rotation.copy(fabric.rotation);
    buildingGroup.add(wireframe);

    // Central cap ring
    const capGeo = new THREE.CylinderGeometry(2 * S, 2 * S, 1 * S, 16);
    const capMat = new THREE.MeshStandardMaterial({ color: 0x8B0000 });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.set(0, height / 2 + 2.5 * S, 0);
    buildingGroup.add(cap);

    // Corner anchor cables
    const cableMat = new THREE.LineBasicMaterial({ color: 0x555555 });
    const corners = [
        new THREE.Vector3(-innerSize / 2, height / 2, -innerSize / 2),
        new THREE.Vector3(innerSize / 2, height / 2, -innerSize / 2),
        new THREE.Vector3(innerSize / 2, height / 2, innerSize / 2),
        new THREE.Vector3(-innerSize / 2, height / 2, innerSize / 2),
    ];
    const topPoint = new THREE.Vector3(0, height / 2 + 2.5 * S, 0);
    corners.forEach(corner => {
        const points = [topPoint, corner];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, cableMat);
        buildingGroup.add(line);
    });

    // Position the whole group in campus coordinates
    buildingGroup.position.set(cx, height / 2, cz);
    scene.add(buildingGroup);

    // Register meshes for raycasting (collect all Mesh children)
    buildingGroup.traverse((child) => {
        if (child.isMesh) {
            child.userData.id = id;
            allMeshes.push(child);
            if (!meshById[id]) meshById[id] = [];
            meshById[id].push(child);
        }
    });

    // Add label
    addLabel(id, '🏢 Visiting Faculty', cx, height + 3, cz);
}

// =====================================================================
// ADMIN BUILDING — M. Visvesvaraya Block: Twin Wings with Concrete Grid
// Adapted from standalone admin.html
// =====================================================================
function createAdminBuilding(cx, cz) {
    const id = 'admin_block';
    const buildingGroup = new THREE.Group();

    // Dimensions adapted for campus scale
    const bHeight = 10;
    const wingWidth = 16;
    const wingDepth = 5;
    const gap = 4;

    const leftCenter = -(wingWidth / 2 + gap / 2);
    const rightCenter = (wingWidth / 2 + gap / 2);

    // Materials
    const matConcrete = MAT.concrete;
    const matDarkGlass = new THREE.MeshPhysicalMaterial({
        color: 0x112233, metalness: 0.8, roughness: 0.1,
        transmission: 0.5, transparent: true,
        polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1
    });
    const matSign = MAT.white;
    const matRoof = MAT.roofDark;

    // PART A: Main Glass Base Blocks
    const blockGeo = new THREE.BoxGeometry(wingWidth, bHeight, wingDepth);

    const leftBlock = new THREE.Mesh(blockGeo, matDarkGlass);
    leftBlock.position.set(leftCenter, bHeight / 2, 0);
    leftBlock.castShadow = true;
    leftBlock.receiveShadow = true;
    leftBlock.userData.id = id;
    buildingGroup.add(leftBlock);

    const rightBlock = new THREE.Mesh(blockGeo, matDarkGlass);
    rightBlock.position.set(rightCenter, bHeight / 2, 0);
    rightBlock.castShadow = true;
    rightBlock.receiveShadow = true;
    rightBlock.userData.id = id;
    buildingGroup.add(rightBlock);

    // PART B: Concrete Facade Grid & X-Braces
    function generateFacadeGrid(centerX, width, zPos) {
        const startX = centerX - width / 2;
        const bayWidth = 1.5;
        const numBays = Math.floor(width / bayWidth);
        const floors = 4;
        const floorHeight = bHeight / floors;
        const gridGroup = new THREE.Group();

        // Vertical Fins
        for (let i = 0; i <= numBays; i++) {
            const fin = new THREE.Mesh(
                new THREE.BoxGeometry(0.15, bHeight, 0.3), matConcrete
            );
            fin.position.set(startX + i * bayWidth, bHeight / 2, zPos);
            fin.castShadow = true;
            gridGroup.add(fin);
        }

        // Horizontal Floor Bands
        for (let i = 0; i <= floors; i++) {
            const band = new THREE.Mesh(
                new THREE.BoxGeometry(width + 0.15, 0.2, 0.2), matConcrete
            );
            band.position.set(centerX, i * floorHeight, zPos);
            band.castShadow = true;
            gridGroup.add(band);
        }

        // X-Cross bracing on outer bays
        const braceLen = Math.sqrt(bayWidth * bayWidth + floorHeight * floorHeight);
        const braceGeo = new THREE.BoxGeometry(0.12, braceLen, 0.2);

        function addXBrace(bayIndex, floorIndex) {
            const bx = startX + bayIndex * bayWidth + bayWidth / 2;
            const by = floorIndex * floorHeight + floorHeight / 2;
            const angle = Math.atan2(floorHeight, bayWidth);

            const brace1 = new THREE.Mesh(braceGeo, matConcrete);
            brace1.position.set(bx, by, zPos);
            brace1.rotation.z = angle;
            gridGroup.add(brace1);

            const brace2 = new THREE.Mesh(braceGeo, matConcrete);
            brace2.position.set(bx, by, zPos);
            brace2.rotation.z = -angle;
            gridGroup.add(brace2);
        }

        addXBrace(1, 1); addXBrace(1, 2);
        addXBrace(numBays - 2, 1); addXBrace(numBays - 2, 2);

        return gridGroup;
    }

    const fZ = wingDepth / 2 + 0.25;
    buildingGroup.add(generateFacadeGrid(leftCenter, wingWidth, fZ));
    buildingGroup.add(generateFacadeGrid(rightCenter, wingWidth, fZ));
    buildingGroup.add(generateFacadeGrid(leftCenter, wingWidth, -fZ));
    buildingGroup.add(generateFacadeGrid(rightCenter, wingWidth, -fZ));

    // PART C: Bridging Elements
    // 1. Elevated Connecting Walkway
    const bridge = new THREE.Mesh(
        new THREE.BoxGeometry(gap + 0.5, 2.5, 2.5), matConcrete
    );
    bridge.position.set(0, bHeight * 0.625, -1);
    bridge.castShadow = true;
    bridge.receiveShadow = true;
    buildingGroup.add(bridge);

    const bridgeWin = new THREE.Mesh(
        new THREE.BoxGeometry(gap, 2, 2.55), matDarkGlass
    );
    bridgeWin.position.set(0, bHeight * 0.625, -1);
    buildingGroup.add(bridgeWin);

    // 2. Central Entrance Canopy
    const canopyDepth = 5;
    const canopyWidth = gap + 2;

    const canopyRoof = new THREE.Mesh(
        new THREE.BoxGeometry(canopyWidth, 0.3, canopyDepth), matConcrete
    );
    canopyRoof.position.set(0, bHeight * 0.33, wingDepth / 2 + 1);
    canopyRoof.castShadow = true;
    buildingGroup.add(canopyRoof);

    // Sign board
    const signBoard = new THREE.Mesh(
        new THREE.BoxGeometry(canopyWidth, 0.8, 0.2), matSign
    );
    signBoard.position.set(0, bHeight * 0.33 + 0.5, wingDepth / 2 + canopyDepth / 2 + 0.9);
    signBoard.castShadow = true;
    buildingGroup.add(signBoard);

    // Canopy Pillars
    const pGeo = new THREE.BoxGeometry(0.3, bHeight * 0.33, 0.3);
    const pillarPositions = [
        [-canopyWidth / 2 + 0.5, bHeight * 0.165, wingDepth / 2 + canopyDepth / 2 + 0.6],
        [canopyWidth / 2 - 0.5, bHeight * 0.165, wingDepth / 2 + canopyDepth / 2 + 0.6],
        [-canopyWidth / 2 + 0.5, bHeight * 0.165, wingDepth / 2 + 0.5],
        [canopyWidth / 2 - 0.5, bHeight * 0.165, wingDepth / 2 + 0.5],
    ];
    pillarPositions.forEach(pos => {
        const p = new THREE.Mesh(pGeo, matConcrete);
        p.position.set(pos[0], pos[1], pos[2]);
        p.castShadow = true;
        buildingGroup.add(p);
    });

    // 3. Roof Pergola (slatted structure bridging the top gap)
    for (let i = -2.5; i <= 2.5; i += 0.6) {
        const slat = new THREE.Mesh(
            new THREE.BoxGeometry(gap + 0.5, 0.1, 0.1), matConcrete
        );
        slat.position.set(0, bHeight, i);
        slat.castShadow = true;
        buildingGroup.add(slat);
    }

    // PART D: Roof Equipment (Solar Panels)
    function addRoofEquipment(ctrX) {
        const panels = new THREE.Mesh(
            new THREE.BoxGeometry(wingWidth - 1.5, 0.3, wingDepth - 1.5), matRoof
        );
        panels.position.set(ctrX, bHeight + 0.15, 0);
        panels.castShadow = true;
        buildingGroup.add(panels);
    }
    addRoofEquipment(leftCenter);
    addRoofEquipment(rightCenter);

    // Position the whole group in campus coordinates
    buildingGroup.position.set(cx, 0, cz);
    buildingGroup.rotation.y = Math.PI;
    scene.add(buildingGroup);

    // Register meshes for raycasting
    buildingGroup.traverse((child) => {
        if (child.isMesh) {
            child.userData.id = id;
            allMeshes.push(child);
            if (!meshById[id]) meshById[id] = [];
            meshById[id].push(child);
        }
    });

    // Add label
    addLabel(id, '🏛️ Admin Block', cx, bHeight + 3, cz);
}

// =====================================================================
// HOSTEL BLOCK — Single wing with hostel.html visual style
// Green balconies, pale yellow walls, window panels, room dividers
// =====================================================================
function createHostelBlock(id, cx, cz, w, d, h, labelText) {
    const buildingGroup = new THREE.Group();
    const floorCount = 5;
    const floorHeight = h / floorCount;

    // Materials (matching hostel.html palette)
    const wallMat = MAT.hostel;
    const wallMatAlt = MAT.hostelAlt;
    const roofMat = MAT.roof;
    const balconyMat = new THREE.MeshStandardMaterial({ color: 0x3e5f3e, roughness: 0.8 });
    const windowMat = MAT.glass;

    // Core wall block
    const coreGeo = new THREE.BoxGeometry(w - 0.5, h, d - 0.5);
    const core = new THREE.Mesh(coreGeo, wallMat);
    core.position.y = h / 2;
    core.castShadow = true;
    core.receiveShadow = true;
    buildingGroup.add(core);

    // Roof slab
    const roofGeo = new THREE.BoxGeometry(w + 0.3, 0.4, d + 0.3);
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = h + 0.2;
    roof.receiveShadow = true;
    buildingGroup.add(roof);

    // Floor-by-floor facade details
    for (let i = 1; i <= floorCount; i++) {
        const yPos = i * floorHeight - floorHeight / 2;

        // Green balcony slab
        const slabGeo = new THREE.BoxGeometry(w, 0.3, d);
        const slab = new THREE.Mesh(slabGeo, balconyMat);
        slab.position.y = i * floorHeight;
        slab.castShadow = true;
        buildingGroup.add(slab);

        // Room divider columns + windows along Z-faces (left/right sides)
        const roomWidth = Math.max(2, d / Math.floor(d / 2.5));
        const stepsZ = Math.max(1, Math.floor(d / roomWidth));
        for (let k = 0; k <= stepsZ; k++) {
            const divZ = -d / 2 + k * (d / stepsZ);
            // Left column
            const pL = new THREE.Mesh(new THREE.BoxGeometry(0.3, floorHeight, 0.3), wallMatAlt);
            pL.position.set(-w / 2, yPos, divZ);
            buildingGroup.add(pL);
            // Right column
            const pR = new THREE.Mesh(new THREE.BoxGeometry(0.3, floorHeight, 0.3), wallMatAlt);
            pR.position.set(w / 2, yPos, divZ);
            buildingGroup.add(pR);
            // Windows between columns
            if (k < stepsZ) {
                const winD = (d / stepsZ) - 0.6;
                if (winD > 0) {
                    const winGeo = new THREE.BoxGeometry(0.15, floorHeight * 0.6, winD);
                    const wL = new THREE.Mesh(winGeo, windowMat);
                    wL.position.set(-w / 2 + 0.15, yPos, divZ + (d / stepsZ) / 2);
                    buildingGroup.add(wL);
                    const wR = new THREE.Mesh(winGeo, windowMat);
                    wR.position.set(w / 2 - 0.15, yPos, divZ + (d / stepsZ) / 2);
                    buildingGroup.add(wR);
                }
            }
        }

        // Room divider columns + windows along X-faces (front/back sides)
        const roomWidthX = Math.max(2, w / Math.floor(w / 2.5));
        const stepsX = Math.max(1, Math.floor(w / roomWidthX));
        for (let k = 0; k <= stepsX; k++) {
            const divX = -w / 2 + k * (w / stepsX);
            const pF = new THREE.Mesh(new THREE.BoxGeometry(0.3, floorHeight, 0.3), wallMatAlt);
            pF.position.set(divX, yPos, -d / 2);
            buildingGroup.add(pF);
            const pB = new THREE.Mesh(new THREE.BoxGeometry(0.3, floorHeight, 0.3), wallMatAlt);
            pB.position.set(divX, yPos, d / 2);
            buildingGroup.add(pB);
            if (k < stepsX) {
                const winW = (w / stepsX) - 0.6;
                if (winW > 0) {
                    const winGeo = new THREE.BoxGeometry(winW, floorHeight * 0.6, 0.15);
                    const wF = new THREE.Mesh(winGeo, windowMat);
                    wF.position.set(divX + (w / stepsX) / 2, yPos, -d / 2 + 0.15);
                    buildingGroup.add(wF);
                    const wB = new THREE.Mesh(winGeo, windowMat);
                    wB.position.set(divX + (w / stepsX) / 2, yPos, d / 2 - 0.15);
                    buildingGroup.add(wB);
                }
            }
        }
    }

    // Water tank on roof
    const tankGeo = new THREE.CylinderGeometry(0.5, 0.5, 1, 8);
    const tankMat2 = new THREE.MeshStandardMaterial({ color: 0xeeeeee });
    const tank = new THREE.Mesh(tankGeo, tankMat2);
    tank.position.set(0, h + 0.9, 0);
    tank.castShadow = true;
    buildingGroup.add(tank);

    // Position on campus
    buildingGroup.position.set(cx, 0, cz);
    scene.add(buildingGroup);

    // Register for raycasting
    buildingGroup.traverse((child) => {
        if (child.isMesh) {
            child.userData.id = id;
            allMeshes.push(child);
            if (!meshById[id]) meshById[id] = [];
            meshById[id].push(child);
        }
    });

    addLabel(id, labelText, cx, h + 2, cz);
}

// =====================================================================
// HOSTEL BUILDING — Detailed model (multi-wing with balconies, dome, tanks)
// Adapted from standalone hostel.html
// =====================================================================
function createHostelBuilding(id, cx, cz, fitW, fitD, labelText) {
    const buildingGroup = new THREE.Group();

    // The original hostel model spans roughly 170 (x: -82..88) by 280 (z: -105..175).
    // We scale to fit the requested footprint (fitW x fitD).
    const origW = 170;
    const origD = 280;
    const sx = fitW / origW;
    const sz = fitD / origD;
    const S = Math.min(sx, sz); // uniform scale to preserve proportions

    const buildingHeight = 50 * S;
    const floorCount = 10;
    const floorHeight = buildingHeight / floorCount;

    // Materials
    const wallMat = MAT.hostel;
    const wallMatAlt = MAT.hostelAlt;
    const roofMat = MAT.roof;
    const balconyMat = new THREE.MeshStandardMaterial({ color: 0x3e5f3e, roughness: 0.8 });
    const railingMat = new THREE.MeshStandardMaterial({ color: 0x2f4f2f, metalness: 0.1 });
    const windowMat = MAT.glass;
    const domeMat = new THREE.MeshStandardMaterial({ color: 0xffffee, roughness: 0.4 });

    function createDetailedBlock(x, z, width, depth, hasCourtyard) {
        const group = new THREE.Group();
        group.position.set(x * S, 0, z * S);

        const w = width * S;
        const d = depth * S;
        const coreW = w - 2 * S;
        const coreD = d - 2 * S;

        // Core structure
        const coreGeo = new THREE.BoxGeometry(coreW, buildingHeight, coreD);
        const core = new THREE.Mesh(coreGeo, wallMat);
        core.position.y = buildingHeight / 2;
        core.castShadow = true;
        core.receiveShadow = true;
        group.add(core);

        // Roof slab
        const roofGeo = new THREE.BoxGeometry(w, 1 * S, d);
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = buildingHeight + 0.5 * S;
        roof.receiveShadow = true;
        group.add(roof);

        // Floor slabs (green balcony strips) and window details
        for (let i = 1; i <= floorCount; i++) {
            const yPos = i * floorHeight - floorHeight / 2;

            // Balcony slab
            const slabGeo = new THREE.BoxGeometry(w, 0.5 * S, d);
            const slab = new THREE.Mesh(slabGeo, balconyMat);
            slab.position.y = i * floorHeight;
            slab.castShadow = true;
            group.add(slab);

            // Room dividers and windows on the longer sides
            const roomWidth = 10 * S;
            const stepsZ = Math.max(1, Math.floor(d / roomWidth));

            for (let k = 0; k <= stepsZ; k++) {
                const divZ = -d / 2 + k * (d / stepsZ);

                // Left column
                const pL = new THREE.Mesh(new THREE.BoxGeometry(1 * S, floorHeight, 1 * S), wallMatAlt);
                pL.position.set(-w / 2, yPos - floorHeight / 2, divZ);
                group.add(pL);

                // Right column
                const pR = new THREE.Mesh(new THREE.BoxGeometry(1 * S, floorHeight, 1 * S), wallMatAlt);
                pR.position.set(w / 2, yPos - floorHeight / 2, divZ);
                group.add(pR);

                // Windows between columns
                if (k < stepsZ) {
                    const winH = floorHeight * 0.6;
                    const winD = (d / stepsZ) - 2 * S;
                    if (winD > 0) {
                        const winGeo = new THREE.BoxGeometry(0.5 * S, winH, winD);

                        const wL = new THREE.Mesh(winGeo, windowMat);
                        wL.position.set(-w / 2 + 0.5 * S, yPos - floorHeight / 2, divZ + (d / stepsZ) / 2);
                        group.add(wL);

                        const wR = new THREE.Mesh(winGeo, windowMat);
                        wR.position.set(w / 2 - 0.5 * S, yPos - floorHeight / 2, divZ + (d / stepsZ) / 2);
                        group.add(wR);
                    }
                }
            }
        }

        // Courtyard square on roof
        if (hasCourtyard) {
            const cyGeo = new THREE.PlaneGeometry(w * 0.4, d * 0.4);
            const cyMat = new THREE.MeshStandardMaterial({ color: 0x3b4d3b });
            const cy = new THREE.Mesh(cyGeo, cyMat);
            cy.rotation.x = -Math.PI / 2;
            cy.position.y = buildingHeight + 0.6 * S;
            group.add(cy);
        }

        buildingGroup.add(group);
    }

    // Recreate the hostel wings from hostel.html (original coordinates)
    const wingW = 32;

    // Top wings
    createDetailedBlock(-40, -70, wingW, 70, true);
    createDetailedBlock(40, -70, wingW, 70, true);

    // Central connector
    createDetailedBlock(0, -15, 60, 35, false);

    // Middle wings
    createDetailedBlock(-40, 25, wingW, 45, false);
    createDetailedBlock(40, 25, wingW, 45, false);

    // Stepped connectors
    createDetailedBlock(-54, 55, 28, wingW, false);
    createDetailedBlock(54, 55, 28, wingW, false);

    // Bottom wings (long)
    createDetailedBlock(-68, 115, wingW, 110, true);
    createDetailedBlock(68, 115, wingW, 110, true);

    // Central dome
    const domeGeo = new THREE.SphereGeometry(22 * S, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.scale.set(1.3, 0.6, 2.0);
    dome.position.set(0, buildingHeight + 0.2 * S, -15 * S);
    dome.castShadow = true;
    buildingGroup.add(dome);

    // Water tanks on roof
    for (let i = 0; i < 6; i++) {
        const tankGeo = new THREE.CylinderGeometry(2 * S, 2 * S, 4 * S, 16);
        const tankMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee });
        const tank = new THREE.Mesh(tankGeo, tankMat);
        tank.position.set((-15 + i * 6) * S, buildingHeight + 2 * S, 10 * S);
        tank.castShadow = true;
        buildingGroup.add(tank);
    }

    // Position group in campus world
    buildingGroup.position.set(cx, 0, cz);
    scene.add(buildingGroup);

    // Register all meshes for raycasting
    buildingGroup.traverse((child) => {
        if (child.isMesh) {
            child.userData.id = id;
            allMeshes.push(child);
            if (!meshById[id]) meshById[id] = [];
            meshById[id].push(child);
        }
    });

    // Add label
    addLabel(id, labelText, cx, buildingHeight + 4, cz);
}

// =====================================================================
// SATISH DHAWAN BLOCK — Detailed model from satish_dhawan.html
// =====================================================================
function buildSatishDhawan(id, cx, cz) {
    const B = new THREE.Group();

    const M = {
        panel: new THREE.MeshStandardMaterial({ color: 0xb0b8c0, roughness: 0.5, metalness: 0.35 }),
        recess: new THREE.MeshStandardMaterial({ color: 0x18202c, roughness: 0.8 }),
        glass: new THREE.MeshStandardMaterial({ color: 0x2a6080, roughness: 0.05, metalness: 0.85, transparent: true, opacity: 0.88 }),
        green: new THREE.MeshStandardMaterial({ color: 0x22cc33, roughness: 0.4, metalness: 0.1 }),
        lobby: new THREE.MeshStandardMaterial({ color: 0x3a7898, roughness: 0.05, metalness: 0.9, transparent: true, opacity: 0.7 }),
        concrete: new THREE.MeshStandardMaterial({ color: 0xb0a08a, roughness: 0.85 }),
        roof: new THREE.MeshStandardMaterial({ color: 0x5a6268, roughness: 0.92 }),
    };

    function box(grp, w, h, d, mat, x, y, z) {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
        m.position.set(x, y, z);
        m.castShadow = true;
        m.receiveShadow = true;
        grp.add(m);
        return m;
    }

    function stampFacade(grp, faceX, faceY, faceZ, facingRotY, w, h, cols, rows, lobbyGround) {
        const g = new THREE.Group();
        g.position.set(faceX, faceY, faceZ);
        g.rotation.y = facingRotY;
        grp.add(g);

        const cw = w / cols;
        const ch = h / rows;

        for (let r = 0; r < rows; r++) {
            const py = -h / 2 + (r + 0.5) * ch;
            const isLobby = lobbyGround && r === 0;

            for (let c = 0; c < cols; c++) {
                const px = -w / 2 + (c + 0.5) * cw;
                if (isLobby) {
                    box(g, cw * 0.70, ch * 0.82, 0.6, M.lobby, px, py, 0.4);
                } else {
                    box(g, cw * 0.72, ch * 0.66, 1.8, M.recess, px, py, 0.7);
                    box(g, cw * 0.50, ch * 0.46, 0.5, M.glass, px, py, 1.45);
                }
            }
            if (r < rows - 1) {
                const bandY = -h / 2 + (r + 1) * ch;
                box(g, w + 0.4, 0.85, 0.9, M.green, 0, bandY, 0.3);
            }
        }
        box(g, w + 0.4, 0.85, 0.9, M.green, 0, h / 2, 0.3);
    }

    const FH = 13;
    const FL = 4;
    const TH = FH * FL;

    const NW_W = 180, NW_D = 20, NW_H = TH;
    box(B, NW_W, NW_H, NW_D, M.panel, 0, NW_H / 2, NW_D / 2);
    stampFacade(B, 0, NW_H / 2, 0, 0, NW_W, NW_H, 18, FL, true);
    stampFacade(B, 0, NW_H / 2, NW_D, Math.PI, NW_W, NW_H, 14, FL, false);
    box(B, NW_W + 2, 1.5, NW_D + 1, M.roof, 0, NW_H + 0.75, NW_D / 2);

    const EW_W = 28, EW_D = 138, EW_H = TH;
    const EW_X = NW_W / 2 - EW_W / 2;
    const EW_ZC = EW_D / 2;
    box(B, EW_W, EW_H, EW_D, M.panel, EW_X, EW_H / 2, EW_ZC);
    stampFacade(B, EW_X - EW_W / 2, EW_H / 2, EW_ZC, -Math.PI / 2, EW_D, EW_H, 12, FL, false);
    stampFacade(B, EW_X + EW_W / 2, EW_H / 2, EW_ZC, Math.PI / 2, EW_D, EW_H, 12, FL, false);
    stampFacade(B, EW_X, EW_H / 2, EW_D, 0, EW_W, EW_H, 2, FL, false);
    box(B, EW_W + 1, 1.5, EW_D + 1, M.roof, EW_X, EW_H + 0.75, EW_ZC);

    const WW_W = 30, WW_D1 = 60, WW_H = FH * 4;
    const WW_X = -NW_W / 2 + WW_W / 2;
    const WW_ZC = NW_D + WW_D1 / 2;
    box(B, WW_W, WW_H, WW_D1, M.panel, WW_X, WW_H / 2, WW_ZC);
    stampFacade(B, WW_X + WW_W / 2, WW_H / 2, WW_ZC, -Math.PI / 2, WW_D1, WW_H, 6, 4, false);
    stampFacade(B, WW_X - WW_W / 2, WW_H / 2, WW_ZC, Math.PI / 2, WW_D1, WW_H, 6, 4, false);
    stampFacade(B, WW_X, WW_H / 2, NW_D + WW_D1, 0, WW_W, WW_H, 2, 4, false);
    box(B, WW_W + 1, 1.5, WW_D1 + 1, M.roof, WW_X, WW_H + 0.75, WW_ZC);

    const CW_W = WW_W, CW_D = 55, CW_H = TH;
    const CW_X = WW_X;
    const CW_ZC = NW_D + WW_D1 + CW_D / 2;
    box(B, CW_W, CW_H, CW_D, M.concrete, CW_X, CW_H / 2, CW_ZC);
    stampFacade(B, CW_X + CW_W / 2, CW_H / 2, CW_ZC, -Math.PI / 2, CW_D, CW_H, 5, FL, false);
    stampFacade(B, CW_X - CW_W / 2, CW_H / 2, CW_ZC, Math.PI / 2, CW_D, CW_H, 5, FL, false);
    stampFacade(B, CW_X, CW_H / 2, NW_D + WW_D1 + CW_D, 0, CW_W, CW_H, 2, FL, false);
    box(B, CW_W + 1, 1.5, CW_D + 1, M.roof, CW_X, CW_H + 0.75, CW_ZC);

    const CB_W = 42, CB_D = 30, CB_H = TH;
    const CB_X = -8;
    const CB_ZC = 73;
    box(B, CB_W, CB_H, CB_D, M.panel, CB_X, CB_H / 2, CB_ZC);
    stampFacade(B, CB_X, CB_H / 2, CB_ZC - CB_D / 2, 0, CB_W, CB_H, 3, FL, false);
    stampFacade(B, CB_X, CB_H / 2, CB_ZC + CB_D / 2, Math.PI, CB_W, CB_H, 3, FL, false);
    stampFacade(B, CB_X - CB_W / 2, CB_H / 2, CB_ZC, -Math.PI / 2, CB_D, CB_H, 2, FL, false);
    stampFacade(B, CB_X + CB_W / 2, CB_H / 2, CB_ZC, Math.PI / 2, CB_D, CB_H, 2, FL, false);
    box(B, CB_W + 1, 1.5, CB_D + 1, M.roof, CB_X, CB_H + 0.75, CB_ZC);

    const NC_ZS = NW_D;
    const NC_ZE = CB_ZC - CB_D / 2;
    const NC_D = NC_ZE - NC_ZS;
    const NC_ZC = NC_ZS + NC_D / 2;
    const NC_W = 12, NC_H = FH * 2;
    box(B, NC_W, NC_H, NC_D, M.panel, CB_X, NC_H / 2, NC_ZC);
    stampFacade(B, CB_X + NC_W / 2, NC_H / 2, NC_ZC, -Math.PI / 2, NC_D, NC_H, 4, 2, false);
    stampFacade(B, CB_X - NC_W / 2, NC_H / 2, NC_ZC, Math.PI / 2, NC_D, NC_H, 4, 2, false);

    const EC_XS = CB_X + CB_W / 2;
    const EC_XE = EW_X - EW_W / 2;
    const EC_W = EC_XE - EC_XS;
    const EC_XC = (EC_XS + EC_XE) / 2;
    const EC_D2 = CB_D * 0.5;
    const EC_H2 = FH * 2;
    box(B, EC_W, EC_H2, EC_D2, M.panel, EC_XC, EC_H2 / 2, CB_ZC);
    stampFacade(B, EC_XC, EC_H2 / 2, CB_ZC - EC_D2 / 2, 0, EC_W, EC_H2, 4, 2, false);
    stampFacade(B, EC_XC, EC_H2 / 2, CB_ZC + EC_D2 / 2, Math.PI, EC_W, EC_H2, 4, 2, false);

    (function buildCourtPergolas() {
        const CANOPY_Y = FH * 3;
        const mBeam = new THREE.MeshStandardMaterial({ color: 0xede8e0, roughness: 0.6 });
        const mPink = new THREE.MeshStandardMaterial({ color: 0xd63384, roughness: 0.2, metalness: 0.35, transparent: true, opacity: 0.90 });
        const mWhite = new THREE.MeshStandardMaterial({ color: 0xf5f2ee, roughness: 0.3, transparent: true, opacity: 0.82 });
        const beamT = 0.9;
        const panelT = 0.3;

        function pergola(parent, x0, x1, z0, z1, cols, rows) {
            const W = x1 - x0;
            const D = z1 - z0;
            const cw = W / cols;
            const cd = D / rows;
            const cx_p = (x0 + x1) / 2;
            const cz_p = (z0 + z1) / 2;

            for (let r = 0; r <= rows; r++) {
                const bz = z0 + r * cd;
                const b = new THREE.Mesh(new THREE.BoxGeometry(W, beamT, beamT), mBeam);
                b.position.set(cx_p, CANOPY_Y, bz);
                b.castShadow = true;
                parent.add(b);
            }
            for (let c = 0; c <= cols; c++) {
                const bx = x0 + c * cw;
                const b = new THREE.Mesh(new THREE.BoxGeometry(beamT, beamT, D), mBeam);
                b.position.set(bx, CANOPY_Y, cz_p);
                b.castShadow = true;
                parent.add(b);
            }
            for (let c = 0; c < cols; c++) {
                for (let r = 0; r < rows; r++) {
                    const px = x0 + (c + 0.5) * cw;
                    const pz = z0 + (r + 0.5) * cd;
                    const mat = (c + r) % 2 === 0 ? mPink : mWhite;
                    const p = new THREE.Mesh(new THREE.BoxGeometry(cw - beamT - 0.2, panelT, cd - beamT - 0.2), mat);
                    p.position.set(px, CANOPY_Y, pz);
                    parent.add(p);
                }
            }
        }

        const CY_Z0 = NW_D;
        const CY_Z1 = CB_ZC - CB_D / 2;
        const LC_X0 = WW_X + WW_W / 2;
        const LC_X1 = CB_X - NC_W / 2;
        pergola(B, LC_X0, LC_X1, CY_Z0, CY_Z1, 6, 5);
        const RC_X0 = CB_X + NC_W / 2;
        const RC_X1 = EW_X - EW_W / 2;
        pergola(B, RC_X0, RC_X1, CY_Z0, CY_Z1, 8, 5);
    })();

    B.scale.set(0.08, 0.08, 0.08);
    // Center it roughly around (cx, cz)
    B.position.set(cx, 0, cz - (138 * 0.08) / 2);
    scene.add(B);

    B.traverse(c => {
        if (c.isMesh) {
            c.userData.id = id;
            allMeshes.push(c);
            if (!meshById[id]) meshById[id] = [];
            meshById[id].push(c);
        }
    });

    addLabel(id, '🏫 Satish Dhawan Block', cx, 15, cz);
}

// ── Ramanujan Block (detailed traced footprint from ramanunjan.html) ─────────
function buildRamanujan(id, cx, cz) {
    const B = new THREE.Group();

    const M = {
        base: new THREE.MeshStandardMaterial({ color: 0xa1a6a9, roughness: 0.9 }),
        roof: MAT.roofDark,
        ground: MAT.grassDark,
        sidewalk: MAT.sidewalk,
        panelLight: new THREE.MeshStandardMaterial({ color: 0xe0e2e4, roughness: 0.4, metalness: 0.1 }),
        panelMid: new THREE.MeshStandardMaterial({ color: 0x989da3, roughness: 0.4, metalness: 0.1 }),
        panelDark: new THREE.MeshStandardMaterial({ color: 0x50555a, roughness: 0.4, metalness: 0.2 }),
        glass: MAT.glass,
        frame: new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.7, metalness: 0.3 }),
        frameYellow: new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.5, metalness: 0.4 }) 
    };

    const FH = 14;     
    const FL = 4;      
    const TH = FH * FL; 

    function boxLocal(w, h, d, mat, x, y, z) {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
        m.position.set(x, y, z);
        m.castShadow = true;
        m.receiveShadow = true;
        B.add(m);
        return m;
    }

    function stampRamanujanFacade(faceX, faceY, faceZ, facingRotY, w, h, cols, rows, hasEntrance = false) {
        const g = new THREE.Group();
        g.position.set(faceX, faceY, faceZ);
        g.rotation.y = facingRotY;
        B.add(g);

        const cw = w / cols;
        const ch = h / rows;
        const panelDepth = 0.5;

        let seed = Math.abs(faceX * 7 + faceY * 13 + faceZ * 17 + facingRotY * 23) * 100;
        function rand() {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        }

        for (let r = 0; r < rows; r++) {
            const py = -h / 2 + (r + 0.5) * ch;
            for (let c = 0; c < cols; c++) {
                const px = -w / 2 + (c + 0.5) * cw;
                if (hasEntrance && r < 2) {
                    const midC = Math.floor(cols / 2);
                    if (c >= midC - 2 && c <= midC + 2) {
                        const gm = new THREE.Mesh(new THREE.BoxGeometry(cw, ch, panelDepth), M.glass);
                        gm.position.set(px, py, panelDepth / 2);
                        g.add(gm);
                        const fm = new THREE.Mesh(new THREE.BoxGeometry(cw*1.02, ch*1.02, panelDepth*1.1), M.frame);
                        fm.position.set(px, py, panelDepth / 2 - 0.1);
                        g.add(fm);
                        continue; 
                    }
                }
                const val = rand();
                let mat = val < 0.40 ? M.panelLight : val < 0.70 ? M.panelMid : val < 0.85 ? M.panelDark : M.glass;
                if (mat === M.glass) {
                    const frameMesh = new THREE.Mesh(new THREE.BoxGeometry(cw * 0.95, ch * 0.95, panelDepth), M.frameYellow);
                    frameMesh.position.set(px, py, panelDepth / 2);
                    g.add(frameMesh);
                    const glassMesh = new THREE.Mesh(new THREE.BoxGeometry(cw * 0.80, ch * 0.80, panelDepth * 1.05), M.glass);
                    glassMesh.position.set(px, py, panelDepth / 2);
                    g.add(glassMesh);
                } else {
                    const pMesh = new THREE.Mesh(new THREE.BoxGeometry(cw * 0.95, ch * 0.95, panelDepth), mat);
                    pMesh.position.set(px, py, panelDepth / 2);
                    pMesh.castShadow = true;
                    pMesh.receiveShadow = true;
                    g.add(pMesh);
                }
                const bg = new THREE.Mesh(new THREE.BoxGeometry(cw, ch, panelDepth * 0.5), M.base);
                bg.position.set(px, py, panelDepth * 0.25);
                g.add(bg);
            }
        }
    }

    function addBlockLocal(w, d, x, z, entranceFace = null) {
        boxLocal(w, TH, d, M.base, x, TH/2, z);
        boxLocal(w + 0.5, 1.5, d + 0.5, M.roof, x, TH + 0.75, z);
        const cW = Math.max(2, Math.floor(w / 6));
        const cD = Math.max(2, Math.floor(d / 6));
        const offset = 0.05;
        stampRamanujanFacade(x, TH/2, z - d/2 - offset, Math.PI, w, TH, cW, FL, entranceFace === 'NORTH');
        stampRamanujanFacade(x, TH/2, z + d/2 + offset, 0, w, TH, cW, FL, entranceFace === 'SOUTH');
        stampRamanujanFacade(x + w/2 + offset, TH/2, z, Math.PI/2, d, TH, cD, FL, entranceFace === 'EAST');
        stampRamanujanFacade(x - w/2 - offset, TH/2, z, -Math.PI/2, d, TH, cD, FL, entranceFace === 'WEST');
    }

    addBlockLocal(50, 80, -95, -60);  
    addBlockLocal(50, 60, -95, 50);   
    addBlockLocal(30, 180, -55, -10); 
    addBlockLocal(90, 30, 5, -55);    
    addBlockLocal(90, 30, 5, 65, 'SOUTH'); 
    addBlockLocal(20, 20, 40, 90);    
    addBlockLocal(30, 170, 65, 15);   
    addBlockLocal(20, 20, 90, -20);   
    addBlockLocal(20, 20, 90, 20);    
    addBlockLocal(20, 20, 90, 60);    
    addBlockLocal(20, 30, -30, 15);   

    B.scale.set(0.065, 0.065, 0.065);
    B.position.set(cx, 0, cz);
    scene.add(B);

    B.traverse(c => {
        if (c.isMesh) {
            c.userData.id = id;
            allMeshes.push(c);
            if (!meshById[id]) meshById[id] = [];
            meshById[id].push(c);
        }
    });

    addLabel(id, '🏫 Ramanujan', cx, 15, cz);
}

// =====================================================================
// SS BHATNAGAR BLOCK — Detailed model from ss_bhtanagr.html
// =====================================================================
function buildSSBhatnagar(id, cx, cz) {
    const buildingGroup = new THREE.Group();

    const FLOOR_HEIGHT_SS = 13;
    const NUM_FLOORS_SS = 4;
    const TOTAL_HEIGHT_SS = FLOOR_HEIGHT_SS * NUM_FLOORS_SS; // 52
    const BASE_HEIGHT_SS = 1.5;

    // Materials
    const MATS = {
        lightPanel: new THREE.MeshStandardMaterial({ color: 0xD8D8D8, roughness: 0.35, metalness: 0.1 }),
        darkPanel: new THREE.MeshStandardMaterial({ color: 0x505860, roughness: 0.4, metalness: 0.15 }),
        window: new THREE.MeshStandardMaterial({ color: 0x1a3050, roughness: 0.05, metalness: 0.9 }),
        windowFrame: new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5, metalness: 0.3 }),
        roof: new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.7, metalness: 0.1 }),
        concrete: new THREE.MeshStandardMaterial({ color: 0xBBB8B0, roughness: 0.8, metalness: 0.05 }),
        darkBase: new THREE.MeshStandardMaterial({ color: 0x2A2A2A, roughness: 0.6, metalness: 0.1 }),
        metal: new THREE.MeshStandardMaterial({ color: 0xAAAAAA, roughness: 0.3, metalness: 0.7 }),
        glass: new THREE.MeshStandardMaterial({ color: 0x88BBDD, roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.4 }),
        entrance: new THREE.MeshStandardMaterial({ color: 0xEEEEEE, roughness: 0.3, metalness: 0.1 }),
    };

    function ssBox(w, h, d, mat) {
        const geo = new THREE.BoxGeometry(w, h, d);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
    }

    // ── Facade panel wall system ──
    function createFacadeWall(width, height, depth) {
        const group = new THREE.Group();
        const wallBg = ssBox(width, height, depth * 0.5, MATS.darkBase);
        group.add(wallBg);

        const panelColors = [
            new THREE.MeshStandardMaterial({ color: 0xD5D5D5, roughness: 0.3, metalness: 0.15 }),
            new THREE.MeshStandardMaterial({ color: 0xC8C8C8, roughness: 0.35, metalness: 0.12 }),
            new THREE.MeshStandardMaterial({ color: 0xBBBBBB, roughness: 0.38, metalness: 0.1 }),
            new THREE.MeshStandardMaterial({ color: 0xE0E0E0, roughness: 0.25, metalness: 0.18 }),
        ];
        const darkBandMat = new THREE.MeshStandardMaterial({ color: 0x4A5568, roughness: 0.4, metalness: 0.2 });
        const darkBand2Mat = new THREE.MeshStandardMaterial({ color: 0x556677, roughness: 0.35, metalness: 0.25 });

        const panelW = 3.0;
        const panelH = FLOOR_HEIGHT_SS - 0.3;
        const gapSize = 0.12;
        const numCols = Math.floor(width / (panelW + gapSize));

        for (let f = 0; f < NUM_FLOORS_SS; f++) {
            const rowY = -height / 2 + f * FLOOR_HEIGHT_SS + panelH / 2 + gapSize;
            for (let c = 0; c < numCols; c++) {
                const colX = -width / 2 + c * (panelW + gapSize) + (panelW + gapSize) / 2;
                if (colX > width / 2 - panelW / 2) continue;
                let mat;
                const bandGroup = c % 6;
                if (bandGroup === 0 || bandGroup === 5) {
                    mat = (c + f) % 2 === 0 ? darkBandMat : darkBand2Mat;
                } else {
                    const colorIdx = Math.abs((c * 3 + f * 7) % panelColors.length);
                    mat = panelColors[colorIdx];
                }
                const panel = ssBox(panelW, panelH, depth + 0.15, mat);
                panel.position.set(colX, rowY, 0);
                group.add(panel);
            }
        }

        for (let f = 0; f <= NUM_FLOORS_SS; f++) {
            const y = -height / 2 + f * FLOOR_HEIGHT_SS;
            const hLine = ssBox(width + 0.2, gapSize, depth + 0.2, MATS.darkBase);
            hLine.position.set(0, y, 0);
            group.add(hLine);
        }
        for (let c = 0; c <= numCols; c++) {
            const colX = -width / 2 + c * (panelW + gapSize);
            const vLine = ssBox(gapSize, height, depth + 0.18, MATS.darkBase);
            vLine.position.set(colX, 0, 0);
            group.add(vLine);
        }
        return group;
    }

    // ── Window grid ──
    function createWindowsForWall(width, height) {
        const group = new THREE.Group();
        const winW = 1.8, winH = 2.0, spacingX = 5;
        const numCols = Math.floor(width / spacingX) - 1;
        for (let f = 0; f < NUM_FLOORS_SS; f++) {
            const y = -height / 2 + f * FLOOR_HEIGHT_SS + FLOOR_HEIGHT_SS * 0.55;
            for (let c = 0; c < numCols; c++) {
                const x = -width / 2 + (c + 1) * spacingX;
                const winGeo = new THREE.PlaneGeometry(winW, winH);
                const win = new THREE.Mesh(winGeo, MATS.window);
                win.position.set(x, y, 0.2);
                group.add(win);
                const accent = ssBox(winW + 0.3, 0.15, 0.15, new THREE.MeshStandardMaterial({ color: 0x3366AA, roughness: 0.3, metalness: 0.5 }));
                accent.position.set(x, y + winH / 2 + 0.1, 0.2);
                group.add(accent);
            }
        }
        return group;
    }

    function addFacade(group, width, height, x, y, z, rotY) {
        const facade = createFacadeWall(width, height, 0.3);
        facade.position.set(x, y, z);
        facade.rotation.y = rotY;
        group.add(facade);
    }

    function addWindows(group, width, height, x, y, z, rotY) {
        const windows = createWindowsForWall(width, height);
        windows.position.set(x, y, z);
        windows.rotation.y = rotY;
        group.add(windows);
    }

    // ── Footprint blocks ──
    const blocks = [
        { w: 130, d: 25, x: 0, z: 55 },      // North wing
        { w: 25, d: 90, x: 52.5, z: 10 },     // East wing
        { w: 45, d: 25, x: 42.5, z: -40 },    // South-East tab
        { w: 25, d: 75, x: -52.5, z: 20 },    // West wing
        { w: 50, d: 25, x: -40, z: -25 },     // South-West wing
        { w: 30, d: 20, x: -5, z: -35 },      // Connection block
    ];

    // Dark base/plinth
    blocks.forEach(b => {
        const base = ssBox(b.w, BASE_HEIGHT_SS, b.d, MATS.darkBase);
        base.position.set(b.x, BASE_HEIGHT_SS / 2, b.z);
        buildingGroup.add(base);
    });

    // Main building volumes
    blocks.forEach(b => {
        const volume = ssBox(b.w, TOTAL_HEIGHT_SS, b.d, MATS.lightPanel);
        volume.position.set(b.x, TOTAL_HEIGHT_SS / 2 + BASE_HEIGHT_SS, b.z);
        buildingGroup.add(volume);
        const roof = ssBox(b.w + 1, 0.5, b.d + 1, MATS.roof);
        roof.position.set(b.x, TOTAL_HEIGHT_SS + BASE_HEIGHT_SS + 0.25, b.z);
        buildingGroup.add(roof);
    });

    // ── Facades on all visible walls ──
    addFacade(buildingGroup, 130, TOTAL_HEIGHT_SS, 0, TOTAL_HEIGHT_SS / 2 + BASE_HEIGHT_SS, 55 + 12.6, 0);
    addFacade(buildingGroup, 130, TOTAL_HEIGHT_SS, 0, TOTAL_HEIGHT_SS / 2 + BASE_HEIGHT_SS, 55 - 12.6, Math.PI);
    addFacade(buildingGroup, 90, TOTAL_HEIGHT_SS, 52.5 + 12.6, TOTAL_HEIGHT_SS / 2 + BASE_HEIGHT_SS, 10, Math.PI / 2);
    addFacade(buildingGroup, 90, TOTAL_HEIGHT_SS, 52.5 - 12.6, TOTAL_HEIGHT_SS / 2 + BASE_HEIGHT_SS, 10, -Math.PI / 2);
    addFacade(buildingGroup, 75, TOTAL_HEIGHT_SS, -52.5 - 12.6, TOTAL_HEIGHT_SS / 2 + BASE_HEIGHT_SS, 20, -Math.PI / 2);
    addFacade(buildingGroup, 75, TOTAL_HEIGHT_SS, -52.5 + 12.6, TOTAL_HEIGHT_SS / 2 + BASE_HEIGHT_SS, 20, Math.PI / 2);
    addFacade(buildingGroup, 45, TOTAL_HEIGHT_SS, 42.5, TOTAL_HEIGHT_SS / 2 + BASE_HEIGHT_SS, -40 - 12.6, Math.PI);
    addFacade(buildingGroup, 25, TOTAL_HEIGHT_SS, 42.5 + 22.6, TOTAL_HEIGHT_SS / 2 + BASE_HEIGHT_SS, -40, Math.PI / 2);
    addFacade(buildingGroup, 50, TOTAL_HEIGHT_SS, -40, TOTAL_HEIGHT_SS / 2 + BASE_HEIGHT_SS, -25 - 12.6, Math.PI);
    addFacade(buildingGroup, 25, TOTAL_HEIGHT_SS, -40 - 25.1, TOTAL_HEIGHT_SS / 2 + BASE_HEIGHT_SS, -25, -Math.PI / 2);

    // ── Windows on major faces ──
    addWindows(buildingGroup, 130, TOTAL_HEIGHT_SS, 0, TOTAL_HEIGHT_SS / 2 + BASE_HEIGHT_SS, 55 + 12.7, 0);
    addWindows(buildingGroup, 130, TOTAL_HEIGHT_SS, 0, TOTAL_HEIGHT_SS / 2 + BASE_HEIGHT_SS, 55 - 12.7, Math.PI);
    addWindows(buildingGroup, 90, TOTAL_HEIGHT_SS, 52.5 + 12.7, TOTAL_HEIGHT_SS / 2 + BASE_HEIGHT_SS, 10, Math.PI / 2);
    addWindows(buildingGroup, 90, TOTAL_HEIGHT_SS, 52.5 - 12.7, TOTAL_HEIGHT_SS / 2 + BASE_HEIGHT_SS, 10, -Math.PI / 2);
    addWindows(buildingGroup, 75, TOTAL_HEIGHT_SS, -52.5 - 12.7, TOTAL_HEIGHT_SS / 2 + BASE_HEIGHT_SS, 20, -Math.PI / 2);
    addWindows(buildingGroup, 75, TOTAL_HEIGHT_SS, -52.5 + 12.7, TOTAL_HEIGHT_SS / 2 + BASE_HEIGHT_SS, 20, Math.PI / 2);

    // ── Khanda-shaped Canopy ──
    (function buildKhandaCanopy() {
        const canopyY = TOTAL_HEIGHT_SS + BASE_HEIGHT_SS + 1;
        const mRed = new THREE.MeshStandardMaterial({ color: 0xCC3333, roughness: 0.3, metalness: 0.2, transparent: true, opacity: 0.95 });
        const mWhite = new THREE.MeshStandardMaterial({ color: 0xF5E8E0, roughness: 0.4, metalness: 0.1, transparent: true, opacity: 0.90 });
        const mBeam = new THREE.MeshStandardMaterial({ color: 0xDDD5CC, roughness: 0.6, metalness: 0.1 });
        const borderMat = new THREE.MeshStandardMaterial({ color: 0xCC2222, roughness: 0.3, metalness: 0.4 });

        function isInsideKhanda(x, z) {
            const kcx = 0, kcz = 10;
            const scale = 1.1;
            const u = Math.abs((x - kcx) / scale);
            const v = (z - kcz) / scale;

            if (v > -32 && v < 30) {
                let hw = 0;
                if (v > 15) hw = 5 * (30 - v) / 15;
                else if (v > 0) hw = 2 + 3 * (v / 15);
                else if (v > -20) hw = 2;
                else if (v > -25) hw = 2 + 3 * (-20 - v) / 5;
                else hw = 5 - 5 * (-25 - v) / 7;
                if (u <= hw) return true;
            }
            const curR2 = u * u + (v + 5) * (v + 5);
            if (curR2 >= 10 * 10 && curR2 <= 14 * 14) return true;
            if (v > -28 && v < 20) {
                let targetU;
                if (v > -2) targetU = 22 - Math.pow(v + 2, 2) / 22;
                else targetU = 22 - Math.pow(-2 - v, 2) / 30.8;
                let thickness = 0;
                if (v > -2) thickness = 3.5 * (1 - Math.pow(v + 2, 2) / (22 * 22));
                else thickness = 3.5 * (1 - Math.pow(-2 - v, 2) / (26 * 26));
                if (Math.abs(u - targetU) <= thickness) return true;
            }
            return false;
        }

        const cellSize = 4;
        const beamT = 0.6;
        const panelT = 0.3;
        const xMin = -36, xMax = 36;
        const zMin = -30, zMax = 46;
        const cols = Math.ceil((xMax - xMin) / cellSize);
        const rows = Math.ceil((zMax - zMin) / cellSize);

        const activeCells = new Set();
        const activeVLines = new Set();
        const activeHLines = new Set();

        for (let c = 0; c < cols; c++) {
            for (let r = 0; r < rows; r++) {
                const ccx = xMin + (c + 0.5) * cellSize;
                const ccz = zMin + (r + 0.5) * cellSize;
                if (!isInsideKhanda(ccx, ccz)) {
                    const off = cellSize / 4;
                    if (!isInsideKhanda(ccx - off, ccz - off) && !isInsideKhanda(ccx + off, ccz - off) &&
                        !isInsideKhanda(ccx - off, ccz + off) && !isInsideKhanda(ccx + off, ccz + off)) continue;
                }
                activeCells.add(`${c},${r}`);
                activeVLines.add(`${c},${r}`); activeVLines.add(`${c + 1},${r}`);
                activeHLines.add(`${c},${r}`); activeHLines.add(`${c},${r + 1}`);

                const mat = (c + r) % 2 === 0 ? mRed : mWhite;
                const panel = ssBox(cellSize - beamT - 0.2, panelT, cellSize - beamT - 0.2, mat);
                panel.position.set(ccx, canopyY, ccz);
                buildingGroup.add(panel);
            }
        }

        for (let c = 0; c < cols; c++) {
            for (let r = 0; r <= rows; r++) {
                if (activeHLines.has(`${c},${r}`)) {
                    const bcx = xMin + (c + 0.5) * cellSize;
                    const bcz = zMin + r * cellSize;
                    const beam = ssBox(cellSize + beamT, beamT, beamT, mBeam);
                    beam.position.set(bcx, canopyY, bcz);
                    buildingGroup.add(beam);
                }
            }
        }
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c <= cols; c++) {
                if (activeVLines.has(`${c},${r}`)) {
                    const bcx = xMin + c * cellSize;
                    const bcz = zMin + (r + 0.5) * cellSize;
                    const beam = ssBox(beamT, beamT, cellSize + beamT, mBeam);
                    beam.position.set(bcx, canopyY, bcz);
                    buildingGroup.add(beam);
                }
            }
        }

        function addBorderSegment(x1, z1, x2, z2) {
            const len = Math.hypot(x2 - x1, z2 - z1);
            const seg = ssBox(beamT + 0.2, beamT + 0.6, len + beamT, borderMat);
            seg.position.set((x1 + x2) / 2, canopyY, (z1 + z2) / 2);
            if (Math.abs(x1 - x2) > 0.01) seg.rotation.y = Math.PI / 2;
            buildingGroup.add(seg);
        }

        for (let c = 0; c < cols; c++) {
            for (let r = 0; r < rows; r++) {
                if (!activeCells.has(`${c},${r}`)) continue;
                const bcx = xMin + c * cellSize;
                const bcz = zMin + r * cellSize;
                if (!activeCells.has(`${c},${r + 1}`)) addBorderSegment(bcx, bcz + cellSize, bcx + cellSize, bcz + cellSize);
                if (!activeCells.has(`${c},${r - 1}`)) addBorderSegment(bcx, bcz, bcx + cellSize, bcz);
                if (!activeCells.has(`${c + 1},${r}`)) addBorderSegment(bcx + cellSize, bcz, bcx + cellSize, bcz + cellSize);
                if (!activeCells.has(`${c - 1},${r}`)) addBorderSegment(bcx, bcz, bcx, bcz + cellSize);
            }
        }

        // Support pillars
        const pillarMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.5, metalness: 0.4 });
        [
            { x: -10, z: -40 }, { x: 15, z: -40 }, { x: 35, z: -38 },
            { x: 36, z: -15 }, { x: 36, z: 5 }, { x: 36, z: 15 },
            { x: 25, z: 32 }, { x: 5, z: 38 },
            { x: -10, z: 25 }, { x: -16, z: 10 },
            { x: -16, z: -5 }, { x: -23, z: -25 }, { x: -23, z: -35 },
            { x: 5, z: -20 }, { x: 20, z: -15 }, { x: 25, z: 5 },
            { x: 15, z: 20 }, { x: 0, z: 10 }, { x: -5, z: -5 },
        ].forEach(p => {
            const col = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, canopyY - 0.1, 8), pillarMat);
            col.position.set(p.x, canopyY / 2, p.z);
            col.castShadow = true;
            buildingGroup.add(col);
        });
    })();

    // ── Glass Bridge ──
    (function buildGlassBridge() {
        const bridgeY = BASE_HEIGHT_SS + FLOOR_HEIGHT_SS * 2.5;
        const bridgeLength = 30, bridgeWidth = 5, bridgeHeight = 4;
        const floor = ssBox(bridgeLength, 0.3, bridgeWidth, MATS.concrete);
        floor.position.set(0, bridgeY, 15);
        buildingGroup.add(floor);
        const ceil = ssBox(bridgeLength, 0.3, bridgeWidth, MATS.concrete);
        ceil.position.set(0, bridgeY + bridgeHeight, 15);
        buildingGroup.add(ceil);
        const glassWall1 = ssBox(bridgeLength, bridgeHeight, 0.15, MATS.glass);
        glassWall1.position.set(0, bridgeY + bridgeHeight / 2, 15 + bridgeWidth / 2);
        buildingGroup.add(glassWall1);
        const glassWall2 = ssBox(bridgeLength, bridgeHeight, 0.15, MATS.glass);
        glassWall2.position.set(0, bridgeY + bridgeHeight / 2, 15 - bridgeWidth / 2);
        buildingGroup.add(glassWall2);
        const glassEnd1 = ssBox(0.15, bridgeHeight, bridgeWidth, MATS.glass);
        glassEnd1.position.set(bridgeLength / 2, bridgeY + bridgeHeight / 2, 15);
        buildingGroup.add(glassEnd1);
        const glassEnd2 = ssBox(0.15, bridgeHeight, bridgeWidth, MATS.glass);
        glassEnd2.position.set(-bridgeLength / 2, bridgeY + bridgeHeight / 2, 15);
        buildingGroup.add(glassEnd2);
    })();

    // ── Entrance ──
    (function buildEntrance() {
        const entranceZ = 55 + 12.5 + 0.5;
        const entranceX = 0;
        const entranceW = 12, entranceH = 5, entranceD = 4;
        const canopy = ssBox(entranceW + 4, 0.4, entranceD + 2, MATS.entrance);
        canopy.position.set(entranceX, entranceH + BASE_HEIGHT_SS, entranceZ + entranceD / 2);
        buildingGroup.add(canopy);
        const glassWall = ssBox(entranceW, entranceH - 1, 0.15, MATS.glass);
        glassWall.position.set(entranceX, (entranceH - 1) / 2 + BASE_HEIGHT_SS + 0.5, entranceZ + 0.2);
        buildingGroup.add(glassWall);
        for (let i = -1; i <= 1; i++) {
            const doorFrame = ssBox(0.2, entranceH - 1, 0.3, MATS.darkBase);
            doorFrame.position.set(entranceX + i * 3, (entranceH - 1) / 2 + BASE_HEIGHT_SS + 0.5, entranceZ + 0.2);
            buildingGroup.add(doorFrame);
        }
        [entranceX - entranceW / 2 - 1, entranceX + entranceW / 2 + 1].forEach(ecx => {
            const col = ssBox(0.5, entranceH, 0.5, MATS.metal);
            col.position.set(ecx, entranceH / 2 + BASE_HEIGHT_SS, entranceZ + entranceD);
            buildingGroup.add(col);
        });
    })();

    // ── Name Board ──
    (function buildNameBoard() {
        const boardW = 28, boardH = 3.5;
        const boardY = BASE_HEIGHT_SS + FLOOR_HEIGHT_SS * 3;
        const border = ssBox(boardW + 0.8, boardH + 0.8, 0.25, new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5 }));
        border.position.set(-10, boardY, 55 + 12.75);
        buildingGroup.add(border);
        const bg = ssBox(boardW, boardH, 0.3, new THREE.MeshStandardMaterial({ color: 0xEEEEEE, roughness: 0.3 }));
        bg.position.set(-10, boardY, 55 + 12.8);
        buildingGroup.add(bg);

        const textCanvas = document.createElement('canvas');
        textCanvas.width = 1024; textCanvas.height = 128;
        const tCtx = textCanvas.getContext('2d');
        tCtx.fillStyle = '#EEEEEE'; tCtx.fillRect(0, 0, 1024, 128);
        tCtx.fillStyle = '#1a3a7a'; tCtx.font = 'bold 40px Arial'; tCtx.textAlign = 'center';
        tCtx.fillText('एस. एस. भटनागर ब्लॉक', 512, 50);
        tCtx.font = 'bold 36px Arial'; tCtx.fillText('S.S. BHATNAGAR BLOCK', 512, 100);
        const textTexture = new THREE.CanvasTexture(textCanvas);
        const textPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(boardW - 1, boardH - 0.4),
            new THREE.MeshStandardMaterial({ map: textTexture, roughness: 0.3 })
        );
        textPlane.position.set(-10, boardY, 55 + 13);
        buildingGroup.add(textPlane);
    })();

    // ── Scale, rotate, and position ──
    buildingGroup.scale.set(0.08, 0.08, 0.08);
    buildingGroup.rotation.y = Math.PI; // Rotate 180° so entrance faces north (toward spiral/main gate)
    buildingGroup.position.set(cx, 0, cz);
    scene.add(buildingGroup);

    // Register for raycasting
    buildingGroup.traverse(c => {
        if (c.isMesh) {
            c.userData.id = id;
            allMeshes.push(c);
            if (!meshById[id]) meshById[id] = [];
            meshById[id].push(c);
        }
    });

    addLabel(id, '🏫 SS Bhatnagar Block', cx, 15, cz);
}

// =====================================================================
// JC BOSE BLOCK — Detailed model from jc_bose.html with extended canopy + centre block
// =====================================================================
function buildJCBose(id, cx, cz) {
    const buildingGroup = new THREE.Group();

    const NUM_FLOORS_JC = 4;
    const FLOOR_HEIGHT_JC = 13.0;
    const TOTAL_HEIGHT_JC = FLOOR_HEIGHT_JC * NUM_FLOORS_JC;
    const BASE_HEIGHT_JC = 1.0;

    // Materials
    const MJCB = {
        lightPanel: new THREE.MeshStandardMaterial({ color: 0xF2F2F2, roughness: 0.2, metalness: 0.1 }),
        darkPanel: new THREE.MeshStandardMaterial({ color: 0x2A2D30, roughness: 0.3, metalness: 0.2 }),
        glass: new THREE.MeshPhysicalMaterial({
            color: 0x1A406A, metalness: 0.9, roughness: 0.1,
            clearcoat: 1.0, clearcoatRoughness: 0.1
        }),
        frame: new THREE.MeshStandardMaterial({ color: 0xD34020, roughness: 0.4, metalness: 0.1 }),
        base: new THREE.MeshStandardMaterial({ color: 0x1A1A1A, roughness: 0.7, metalness: 0.0 }),
        roof: new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.8, metalness: 0.0 }),
        concrete: new THREE.MeshStandardMaterial({ color: 0xCCCCCC, roughness: 0.6, metalness: 0.0 }),
        panel: new THREE.MeshStandardMaterial({ color: 0xb0b8c0, roughness: 0.5, metalness: 0.35 }),
    };

    function jcBox(w, h, d, mat) {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
    }

    function jcBoxAt(w, h, d, mat, x, y, z) {
        const m = jcBox(w, h, d, mat);
        m.position.set(x, y, z);
        buildingGroup.add(m);
        return m;
    }

    // ── Angle geometry parameters ──
    // V-shape with 110-degree inner angle
    const angleRad = (110 * Math.PI) / 180;

    // Centre block (pivot of the V)
    const C_X = -108 * 0.15; // matching oval-relative position
    const C_Z = -64 * 0.15;
    const C_W = 40;
    const C_D = 40;

    // Center Connection Block
    const centerBase = jcBox(C_W, BASE_HEIGHT_JC, C_D, MJCB.base);
    centerBase.position.set(C_X, BASE_HEIGHT_JC / 2, C_Z);
    buildingGroup.add(centerBase);
    const centerBody = jcBox(C_W, TOTAL_HEIGHT_JC, C_D, MJCB.concrete);
    centerBody.position.set(C_X, BASE_HEIGHT_JC + TOTAL_HEIGHT_JC / 2, C_Z);
    buildingGroup.add(centerBody);
    const centerRoof = jcBox(C_W, 0.4, C_D, MJCB.roof);
    centerRoof.position.set(C_X, BASE_HEIGHT_JC + TOTAL_HEIGHT_JC + 0.2, C_Z);
    buildingGroup.add(centerRoof);

    // ── Build rotated wing ──
    function buildRotatedWing(pivotX, pivotZ, w, d, offsetY, rotY) {
        const blockGroup = new THREE.Group();
        blockGroup.position.set(pivotX, BASE_HEIGHT_JC / 2, pivotZ);
        blockGroup.rotation.y = rotY;

        const pX = w / 2;
        const pZ = offsetY;

        const base = jcBox(w, BASE_HEIGHT_JC, d, MJCB.base);
        base.position.set(pX, 0, pZ);
        base.receiveShadow = true;
        blockGroup.add(base);
        const body = jcBox(w, TOTAL_HEIGHT_JC, d, MJCB.concrete);
        body.position.set(pX, TOTAL_HEIGHT_JC / 2, pZ);
        blockGroup.add(body);
        const roof = jcBox(w, 0.4, d, MJCB.roof);
        roof.position.set(pX, TOTAL_HEIGHT_JC + 0.2, pZ);
        blockGroup.add(roof);

        buildingGroup.add(blockGroup);
        return blockGroup;
    }

    // Front Wing (points East)
    const F_W = 160;
    const F_D = 30;
    const frontPivotX = C_X + C_W / 2;
    const frontPivotZ = C_Z;
    buildRotatedWing(frontPivotX, frontPivotZ, F_W, F_D, 0, 0);

    // Left Wing (points South-West, 110° inner angle)
    const L_W = 120;
    const L_D = 30;
    const leftPivotX = C_X;
    const leftPivotZ = C_Z + C_D / 2;
    buildRotatedWing(leftPivotX, leftPivotZ, L_W, L_D, 0, -angleRad);

    // ── CENTRE BLOCK (new, like Satish Dhawan) ──
    // Place it in the courtyard area between the two wings
    const CB_W = 50, CB_D = 18, CB_H = TOTAL_HEIGHT_JC;
    const CB_X = C_X + C_W / 2 + 80;
    const CB_Z = C_Z + C_D / 2 + 65;
    const cbBase = jcBox(CB_W, BASE_HEIGHT_JC, CB_D, MJCB.base);
    cbBase.position.set(CB_X, BASE_HEIGHT_JC / 2, CB_Z);
    buildingGroup.add(cbBase);
    const cbBody = jcBox(CB_W, CB_H, CB_D, MJCB.panel);
    cbBody.position.set(CB_X, BASE_HEIGHT_JC + CB_H / 2, CB_Z);
    buildingGroup.add(cbBody);
    const cbRoof = jcBox(CB_W + 1, 0.4, CB_D + 1, MJCB.roof);
    cbRoof.position.set(CB_X, BASE_HEIGHT_JC + CB_H + 0.2, CB_Z);
    buildingGroup.add(cbRoof);

    // ── North Connector (front wing south face → CB north face) ──
    const NC_ZS = C_Z + F_D / 2; // front wing south face
    const NC_ZE = CB_Z - CB_D / 2; // CB north face
    const NC_D = NC_ZE - NC_ZS;
    const NC_W = 10, NC_H_CONN = FLOOR_HEIGHT_JC * 2;
    if (NC_D > 0) {
        const NC_ZC = NC_ZS + NC_D / 2;
        const ncBody = jcBox(NC_W, NC_H_CONN, NC_D, MJCB.panel);
        ncBody.position.set(CB_X, BASE_HEIGHT_JC + NC_H_CONN / 2, NC_ZC);
        buildingGroup.add(ncBody);
        const ncRoof = jcBox(NC_W + 0.5, 0.3, NC_D + 0.5, MJCB.roof);
        ncRoof.position.set(CB_X, BASE_HEIGHT_JC + NC_H_CONN + 0.15, NC_ZC);
        buildingGroup.add(ncRoof);
    }

    // ── Left Wing Connector (CB west face → towards left wing) ──
    const LC_XS = CB_X - CB_W / 2;
    const LC_XE = C_X + C_W / 2;
    const LC_W = LC_XS - LC_XE;
    if (LC_W > 0) {
        const LC_XC = (LC_XS + LC_XE) / 2;
        const LC_D2 = CB_D * 0.5;
        const LC_H2 = FLOOR_HEIGHT_JC * 2;
        const lcBody = jcBox(LC_W, LC_H2, LC_D2, MJCB.panel);
        lcBody.position.set(LC_XC, BASE_HEIGHT_JC + LC_H2 / 2, CB_Z);
        buildingGroup.add(lcBody);
        const lcRoof = jcBox(LC_W + 0.5, 0.3, LC_D2 + 0.5, MJCB.roof);
        lcRoof.position.set(LC_XC, BASE_HEIGHT_JC + LC_H2 + 0.15, CB_Z);
        buildingGroup.add(lcRoof);
    }

    // ── Extended Arrow-shaped Courtyard Canopy ──
    (function buildCanopy() {
        const canopyGroup = new THREE.Group();
        canopyGroup.position.set(0, BASE_HEIGHT_JC + TOTAL_HEIGHT_JC / 2 + 2, 0);

        const mRed = new THREE.MeshStandardMaterial({ color: 0xcc2222, roughness: 0.6 });
        const mWhite = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.6 });

        const originX = C_X + C_W / 2;
        const originZ = C_Z + C_D / 2;

        const dirF = new THREE.Vector2(1, 0);
        const dirL = new THREE.Vector2(Math.cos(-angleRad), -Math.sin(-angleRad));

        // Canopy covers both wings corner-to-corner:
        // - Front wing: full 46-column rows (top band)
        // - Left wing: uniform 9-column rows extending full length (~35 rows)
        const canopyMap = [
            "##############################################",
            "##############################################",
            "##############################################",
            "#################            #################",
            "###############                ###############",
            "############                    ##############",
            "#########",
            "#########",
            "#########",
            "#########",
            "#########",
            "#########",
            "#########",
            "#########",
            "#########",
            "#########",
            "#########",
            "#########",
            "#########",
            "#########",
            "#########",
            "#########",
            "#########",
            "#########",
            "#########",
            "#########",
            "#########",
            "#########",
            "#########",
            "#########",
            "#########",
            "#########",
            "#########",
            "#########",
            "#########",
        ];

        const boxSize = 3.47;
        const boxGeo = new THREE.BoxGeometry(boxSize + 0.5, 0.4, boxSize + 0.5);

        for (let r = 0; r < canopyMap.length; r++) {
            const rowStr = canopyMap[r];
            let isRed = (r % 2 === 0);
            for (let c = 0; c < rowStr.length; c++) {
                if (rowStr[c] === '#') {
                    const px = originX + (c + 0.5) * boxSize * dirF.x + (r + 0.5) * boxSize * dirL.x;
                    const pz = originZ + (c + 0.5) * boxSize * dirF.y + (r + 0.5) * boxSize * dirL.y;
                    const mesh = new THREE.Mesh(boxGeo, isRed ? mRed : mWhite);
                    mesh.position.set(px, 0, pz);
                    mesh.rotation.y = angleRad / 2;
                    mesh.castShadow = true;
                    mesh.receiveShadow = true;
                    canopyGroup.add(mesh);
                }
                isRed = !isRed;
            }
        }
        buildingGroup.add(canopyGroup);
    })();

    // ── Mapped Facade Engine ──
    function buildMappedFacade(mapArray, p1, p2, height) {
        const rows = mapArray.length;
        if (rows === 0) return;
        const cols = mapArray[0].length;
        const wallVector = new THREE.Vector3().subVectors(p2, p1);
        const wallLength = wallVector.length();
        const wallDir = wallVector.clone().normalize();
        const normal = new THREE.Vector3(wallDir.z, 0, -wallDir.x).normalize();
        const cellW = wallLength / cols;
        const cellH = height / rows;

        for (let r = 0; r < rows; r++) {
            const rowStr = mapArray[rows - 1 - r];
            for (let c = 0; c < cols; c++) {
                const char = rowStr[c];
                if (char === ' ' || char === 'S') continue;
                let mat, type, depth = 0.4, pop = 0.2;
                if (char === 'L') { mat = MJCB.lightPanel; type = 'light'; }
                else if (char === 'D') { mat = MJCB.darkPanel; type = 'dark'; }
                else if (char === 'G') { mat = MJCB.glass; type = 'glass'; pop = 0.05; }
                else continue;

                const panelGeo = new THREE.BoxGeometry(cellW - 0.05, cellH - 0.05, depth);
                const panel = new THREE.Mesh(panelGeo, mat);
                panel.castShadow = true;
                panel.receiveShadow = true;
                const localX = c * cellW + cellW / 2;
                const localY = r * cellH + cellH / 2;
                const pos = p1.clone().add(wallDir.clone().multiplyScalar(localX));
                pos.y += localY;
                pos.add(normal.clone().multiplyScalar(pop));
                panel.position.copy(pos);
                panel.lookAt(pos.clone().add(normal));
                buildingGroup.add(panel);

                if (type === 'glass') {
                    const ft = 0.12;
                    const fm = MJCB.frame;
                    const tbGeo = new THREE.BoxGeometry(cellW, ft, 0.2);
                    const lrGeo = new THREE.BoxGeometry(ft, cellH, 0.2);
                    function placeFrame(geo, offsetX, offsetY) {
                        const mesh = new THREE.Mesh(geo, fm);
                        const mPos = pos.clone()
                            .add(wallDir.clone().multiplyScalar(offsetX))
                            .add(new THREE.Vector3(0, offsetY, 0))
                            .add(normal.clone().multiplyScalar(0.12));
                        mesh.position.copy(mPos);
                        mesh.lookAt(mPos.clone().add(normal));
                        buildingGroup.add(mesh);
                    }
                    placeFrame(tbGeo, 0, cellH / 2 - ft / 2);
                    placeFrame(tbGeo, 0, -cellH / 2 + ft / 2);
                    placeFrame(lrGeo, -cellW / 2 + ft / 2, 0);
                    placeFrame(lrGeo, cellW / 2 - ft / 2, 0);
                }
            }
        }
    }

    // ── Shared Ramanujan-style facade materials (created once, reused) ──
    const RM = {
        panelLight: new THREE.MeshStandardMaterial({ color: 0xe0e2e4, roughness: 0.4, metalness: 0.1 }),
        panelMid: new THREE.MeshStandardMaterial({ color: 0x989da3, roughness: 0.4, metalness: 0.1 }),
        panelDark: new THREE.MeshStandardMaterial({ color: 0x50555a, roughness: 0.4, metalness: 0.2 }),
        glass: new THREE.MeshStandardMaterial({ color: 0x1f2b38, roughness: 0.1, metalness: 0.8 }),
        frameOrange: new THREE.MeshStandardMaterial({ color: 0xFF5722, roughness: 0.5, metalness: 0.4 }),
        base: new THREE.MeshStandardMaterial({ color: 0xa1a6a9, roughness: 0.9 })
    };

    // ── Ramanujan-style Side Facade ──
    function buildRamanujanFacade(p1, p2, height, rows) {
        const wallVector = new THREE.Vector3().subVectors(p2, p1);
        const wallLength = wallVector.length();
        if (wallLength < 0.1) return; // skip degenerate walls
        const wallDir = wallVector.clone().normalize();
        const normal = new THREE.Vector3(wallDir.z, 0, -wallDir.x).normalize();
        const cols = Math.max(1, Math.floor(wallLength / 7));
        const cellW = wallLength / cols;
        const cellH = height / rows;

        let seed = Math.abs(p1.x * 7 + p1.z * 17 + p2.x * 11 + p2.z * 3) * 100;
        function rand() {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        }

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const val = rand();
                let mat = val < 0.40 ? RM.panelLight : val < 0.70 ? RM.panelMid : val < 0.85 ? RM.panelDark : RM.glass;

                const localX = c * cellW + cellW / 2;
                const localY = r * cellH + cellH / 2;
                const pos = p1.clone().add(wallDir.clone().multiplyScalar(localX));
                pos.y += BASE_HEIGHT_JC + localY;
                pos.add(normal.clone().multiplyScalar(0.25));

                if (mat === RM.glass) {
                    const frameMesh = new THREE.Mesh(new THREE.BoxGeometry(cellW * 0.95, cellH * 0.95, 0.4), RM.frameOrange);
                    frameMesh.position.copy(pos);
                    frameMesh.lookAt(pos.clone().add(normal));
                    buildingGroup.add(frameMesh);

                    const glassMesh = new THREE.Mesh(new THREE.BoxGeometry(cellW * 0.80, cellH * 0.80, 0.45), RM.glass);
                    glassMesh.position.copy(pos);
                    glassMesh.lookAt(pos.clone().add(normal));
                    buildingGroup.add(glassMesh);
                } else {
                    const pMesh = new THREE.Mesh(new THREE.BoxGeometry(cellW * 0.95, cellH * 0.95, 0.4), mat);
                    pMesh.position.copy(pos);
                    pMesh.lookAt(pos.clone().add(normal));
                    buildingGroup.add(pMesh);
                }
            }
        }
    }

    // ── Apply Ramanujan-style Facades on ALL walls (orangish-red frames) ──

    // --- CENTER CONNECTION BLOCK (4 faces) ---
    // North face
    buildRamanujanFacade(
        new THREE.Vector3(C_X - C_W/2, 0, C_Z - C_D/2),
        new THREE.Vector3(C_X + C_W/2, 0, C_Z - C_D/2),
        TOTAL_HEIGHT_JC, NUM_FLOORS_JC);
    // South face
    buildRamanujanFacade(
        new THREE.Vector3(C_X + C_W/2, 0, C_Z + C_D/2),
        new THREE.Vector3(C_X - C_W/2, 0, C_Z + C_D/2),
        TOTAL_HEIGHT_JC, NUM_FLOORS_JC);
    // East face
    buildRamanujanFacade(
        new THREE.Vector3(C_X + C_W/2, 0, C_Z - C_D/2),
        new THREE.Vector3(C_X + C_W/2, 0, C_Z + C_D/2),
        TOTAL_HEIGHT_JC, NUM_FLOORS_JC);
    // West face
    buildRamanujanFacade(
        new THREE.Vector3(C_X - C_W/2, 0, C_Z + C_D/2),
        new THREE.Vector3(C_X - C_W/2, 0, C_Z - C_D/2),
        TOTAL_HEIGHT_JC, NUM_FLOORS_JC);

    // --- FRONT WING (4 faces, extends east from center) ---
    const fwX1 = C_X + C_W/2;            // west end
    const fwX2 = C_X + C_W/2 + F_W;      // east end
    const fwZn = C_Z - F_D/2;            // north face z
    const fwZs = C_Z + F_D/2;            // south face z
    // North face
    buildRamanujanFacade(
        new THREE.Vector3(fwX1, 0, fwZn),
        new THREE.Vector3(fwX2, 0, fwZn),
        TOTAL_HEIGHT_JC, NUM_FLOORS_JC);
    // South face
    buildRamanujanFacade(
        new THREE.Vector3(fwX2, 0, fwZs),
        new THREE.Vector3(fwX1, 0, fwZs),
        TOTAL_HEIGHT_JC, NUM_FLOORS_JC);
    // East end
    buildRamanujanFacade(
        new THREE.Vector3(fwX2, 0, fwZn),
        new THREE.Vector3(fwX2, 0, fwZs),
        TOTAL_HEIGHT_JC, NUM_FLOORS_JC);

    // --- LEFT WING (all faces, properly accounting for rotation) ---
    const lwP_local = (lx, lz) => {
        const c = Math.cos(-angleRad);
        const s = Math.sin(-angleRad);
        // Three.js local to world for rotation around Y:
        // x' = x*c + z*s
        // z' = -x*s + z*c
        return new THREE.Vector3(
            leftPivotX + lx * c + lz * s,
            0,
            leftPivotZ - lx * s + lz * c
        );
    };

    // Inner face (z = -L_D/2) -> facing local -Z -> trace +X
    buildRamanujanFacade(
        lwP_local(0, -L_D/2),
        lwP_local(L_W, -L_D/2),
        TOTAL_HEIGHT_JC, NUM_FLOORS_JC);
    
    // Outer face (z = +L_D/2) -> facing local +Z -> trace -X
    buildRamanujanFacade(
        lwP_local(L_W, L_D/2),
        lwP_local(0, L_D/2),
        TOTAL_HEIGHT_JC, NUM_FLOORS_JC);
    
    // End face (x = L_W) -> facing local +X -> trace +Z
    buildRamanujanFacade(
        lwP_local(L_W, -L_D/2),
        lwP_local(L_W, L_D/2),
        TOTAL_HEIGHT_JC, NUM_FLOORS_JC);
    
    // Start face (x = 0) -> facing local -X -> trace -Z
    buildRamanujanFacade(
        lwP_local(0, L_D/2),
        lwP_local(0, -L_D/2),
        TOTAL_HEIGHT_JC, NUM_FLOORS_JC);

    // --- NORTH CONNECTOR (front wing south → CB north) facades ---
    if (NC_D > 0) {
        // West face
        buildRamanujanFacade(
            new THREE.Vector3(CB_X - NC_W/2, 0, NC_ZS),
            new THREE.Vector3(CB_X - NC_W/2, 0, NC_ZE),
            NC_H_CONN, 2);
        // East face
        buildRamanujanFacade(
            new THREE.Vector3(CB_X + NC_W/2, 0, NC_ZE),
            new THREE.Vector3(CB_X + NC_W/2, 0, NC_ZS),
            NC_H_CONN, 2);
    }

    // --- LEFT WING CONNECTOR (CB west → towards center/left wing) facades ---
    if (LC_W > 0) {
        const LC_H2 = FLOOR_HEIGHT_JC * 2;
        const LC_D2 = CB_D * 0.5;
        const LC_XC_start = LC_XE;  // west end (towards center block)
        const LC_XC_end = LC_XS;    // east end (towards CB)
        // North face
        buildRamanujanFacade(
            new THREE.Vector3(LC_XC_start, 0, CB_Z - LC_D2/2),
            new THREE.Vector3(LC_XC_end, 0, CB_Z - LC_D2/2),
            LC_H2, 2);
        // South face
        buildRamanujanFacade(
            new THREE.Vector3(LC_XC_end, 0, CB_Z + LC_D2/2),
            new THREE.Vector3(LC_XC_start, 0, CB_Z + LC_D2/2),
            LC_H2, 2);
        // West face (end)
        buildRamanujanFacade(
            new THREE.Vector3(LC_XC_start, 0, CB_Z + LC_D2/2),
            new THREE.Vector3(LC_XC_start, 0, CB_Z - LC_D2/2),
            LC_H2, 2);
        // East face (end)
        buildRamanujanFacade(
            new THREE.Vector3(LC_XC_end, 0, CB_Z - LC_D2/2),
            new THREE.Vector3(LC_XC_end, 0, CB_Z + LC_D2/2),
            LC_H2, 2);
    }

    // --- CENTRE BLOCK (CB) (4 faces) ---
    buildRamanujanFacade(
        new THREE.Vector3(CB_X - CB_W/2, 0, CB_Z - CB_D/2),
        new THREE.Vector3(CB_X + CB_W/2, 0, CB_Z - CB_D/2),
        CB_H, NUM_FLOORS_JC);
    buildRamanujanFacade(
        new THREE.Vector3(CB_X + CB_W/2, 0, CB_Z + CB_D/2),
        new THREE.Vector3(CB_X - CB_W/2, 0, CB_Z + CB_D/2),
        CB_H, NUM_FLOORS_JC);
    buildRamanujanFacade(
        new THREE.Vector3(CB_X + CB_W/2, 0, CB_Z - CB_D/2),
        new THREE.Vector3(CB_X + CB_W/2, 0, CB_Z + CB_D/2),
        CB_H, NUM_FLOORS_JC);
    buildRamanujanFacade(
        new THREE.Vector3(CB_X - CB_W/2, 0, CB_Z + CB_D/2),
        new THREE.Vector3(CB_X - CB_W/2, 0, CB_Z - CB_D/2),
        CB_H, NUM_FLOORS_JC);

    // ── Bilingual Signage ──
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 1024; signCanvas.height = 256;
    const ctx = signCanvas.getContext('2d');
    ctx.fillStyle = '#222222'; ctx.fillRect(0, 0, 1024, 256);
    ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = 'bold 80px sans-serif'; ctx.fillText('जे. सी. बोस ब्लॉक', 512, 90);
    ctx.font = 'bold 65px sans-serif'; ctx.fillText('J. C. BOSE BLOCK', 512, 180);
    const signMat = new THREE.MeshStandardMaterial({
        map: new THREE.CanvasTexture(signCanvas), roughness: 0.5, metalness: 0.1
    });
    const signMesh = new THREE.Mesh(new THREE.BoxGeometry(20, 5, 0.8), signMat);
    // Place sign on the north face of the front wing, centered
    const signPosX = (fwX1 + fwX2) / 2;
    const signPosZ = fwZn;
    const signPos = new THREE.Vector3(signPosX, BASE_HEIGHT_JC + TOTAL_HEIGHT_JC - 6, signPosZ - 0.6);
    signMesh.position.copy(signPos);
    buildingGroup.add(signMesh);

    // ── Scale and position ──
    buildingGroup.scale.set(0.08, 0.08, 0.08);
    buildingGroup.position.set(cx, 0, cz);
    scene.add(buildingGroup);

    // Register for raycasting
    buildingGroup.traverse(c => {
        if (c.isMesh) {
            c.userData.id = id;
            allMeshes.push(c);
            if (!meshById[id]) meshById[id] = [];
            meshById[id].push(c);
        }
    });

    addLabel(id, '🏫 JC Bose Block', cx, 15, cz);
}

// =====================================================================
// 5x. BUILD LHC (S. RADHAKRISHNAN COMPLEX)
// =====================================================================
function buildLHC(id, cx, cz) {
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xf5f1e8 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0xe0ddd5 });
    const accentMat = new THREE.MeshStandardMaterial({ color: 0x8b5a3c });
    const glassMat = new THREE.MeshStandardMaterial({
        color: 0x111111,
        transparent: true,
        opacity: 0.85
    });
    const greenMat = new THREE.MeshStandardMaterial({ color: 0x2f6b3a });
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const building = new THREE.Group();

    // CENTRAL BLOCK
    const central = new THREE.Mesh(new THREE.BoxGeometry(40, 12, 30), wallMat);
    central.position.set(0, 6, 0);
    building.add(central);

    // LEFT + RIGHT WINGS
    const leftWing = new THREE.Mesh(new THREE.BoxGeometry(18, 12, 65), wallMat);
    leftWing.position.set(-30, 6, 0);
    building.add(leftWing);

    const rightWing = new THREE.Mesh(new THREE.BoxGeometry(18, 12, 70), wallMat);
    rightWing.position.set(30, 6, 5);
    building.add(rightWing);

    // CENTRAL ENTRANCE CANOPY
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(20, 2, 6), accentMat);
    canopy.position.set(0, 10, 33);
    building.add(canopy);

    // Entrance pillars
    for (let x of [-6, 6]) {
        const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.5, 8, 1.5), wallMat);
        pillar.position.set(x, 4, 33);
        building.add(pillar);
    }

    // Entrance glass
    const gate = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 0.5), glassMat);
    gate.position.set(0, 3, 30);
    building.add(gate);

    // Green entrance frame
    const frameMesh = new THREE.Mesh(new THREE.BoxGeometry(11, 5.5, 0.2), blackMat);
    frameMesh.position.set(0, 3, 30.3);
    building.add(frameMesh);

    // Circular hall lower ring
    const outerBase = new THREE.Mesh(new THREE.CylinderGeometry(12, 12, 6, 64), wallMat);
    outerBase.position.set(-22, 3, 38);
    building.add(outerBase);

    // Circular hollow opening
    const innerCut = new THREE.Mesh(new THREE.CylinderGeometry(9, 9, 5.8, 64), new THREE.MeshStandardMaterial({ color: 0x222222 }));
    innerCut.position.set(-22, 3, 38);
    building.add(innerCut);

    // Circular roof ring
    const upperRing = new THREE.Mesh(new THREE.CylinderGeometry(11, 11, 2, 64), wallMat);
    upperRing.position.set(-22, 8, 38);
    building.add(upperRing);

    // Upper inner fill
    const upperInner = new THREE.Mesh(new THREE.CylinderGeometry(8, 8, 1.8, 64), roofMat);
    upperInner.position.set(-22, 8, 38);
    building.add(upperInner);

    // Right side windows
    for (let i = -20; i <= 20; i += 10) {
        const frameR = new THREE.Mesh(new THREE.BoxGeometry(1, 3, 4), greenMat);
        frameR.position.set(39, 4, i);
        building.add(frameR);

        const pane = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2.5, 3), glassMat);
        pane.position.set(39.6, 4, i);
        building.add(pane);
    }

    // Left side windows
    for (let i = -20; i <= 20; i += 10) {
        const frameL = new THREE.Mesh(new THREE.BoxGeometry(1, 3, 4), greenMat);
        frameL.position.set(-39, 4, i);
        building.add(frameL);

        const pane = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2.5, 3), glassMat);
        pane.position.set(-39.6, 4, i);
        building.add(pane);
    }

    // Roof utility
    const utility = new THREE.Mesh(new THREE.BoxGeometry(10, 4, 10), roofMat);
    utility.position.set(5, 14, -5);
    building.add(utility);

    // Text label using canvas texture
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#8b5a3c';
    ctx.fillRect(0, 0, 600, 128);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('S. RADHAKRISHNAN COMPLEX', 300, 64);

    const texture = new THREE.CanvasTexture(canvas);
    if (typeof renderer !== 'undefined') {
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    }
    const textBoard = new THREE.Mesh(
        new THREE.PlaneGeometry(20, 4),
        new THREE.MeshStandardMaterial({ map: texture, roughness: 0.8 })
    );
    textBoard.position.set(0, 10, 36.1);
    building.add(textBoard);

    // Final scaling and positioning in the map
    building.scale.set(0.12, 0.12, 0.12);
    building.position.set(cx, 0, cz);
    building.rotation.y = Math.PI; // Rotated 180 degrees

    // Register for raycasting
    building.traverse(c => {
        if (c.isMesh) {
            c.userData.id = id;
            c.castShadow = true;
            c.receiveShadow = true;
            allMeshes.push(c);
            if (!meshById[id]) meshById[id] = [];
            meshById[id].push(c);
        }
    });

    scene.add(building);
    addLabel(id, '🎓 LHC', cx, 4, cz);
}

// =====================================================================
// 5y. BUILD AUDITORIUM (structure from audi.html)
// =====================================================================
function buildAuditoriumStructure(id, cx, cz) {
    const wallMat = MAT.concrete;
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x6b8fd6, roughness: 0.7, metalness: 0.08 });
    const darkMat = new THREE.MeshStandardMaterial({
        color: 0x666666,
        roughness: 0.8,
        metalness: 0.05,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1
    });
    const glassMat = new THREE.MeshStandardMaterial({
        color: 0x2f5f8f,
        transparent: true,
        opacity: 0.72,
        roughness: 0.2,
        metalness: 0.2,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1
    });

    const building = new THREE.Group();

    const outer = new THREE.Mesh(new THREE.BoxGeometry(90, 6, 120), wallMat);
    outer.position.set(0, 3, 0);
    building.add(outer);

    const inner = new THREE.Mesh(new THREE.BoxGeometry(70, 6, 100), darkMat);
    inner.position.set(0, 2.94, 0);
    building.add(inner);

    const rearBlock = new THREE.Mesh(new THREE.BoxGeometry(36, 20, 28), wallMat);
    rearBlock.position.set(0, 10, -35);
    building.add(rearBlock);

    const circle = new THREE.Mesh(new THREE.CylinderGeometry(28, 28, 20, 64), roofMat);
    circle.position.set(0, 10, 5);
    building.add(circle);

    const frontTrim = new THREE.Mesh(new THREE.BoxGeometry(60, 20, 18), roofMat);
    frontTrim.position.set(0, 10, 18);
    building.add(frontTrim);

    const entrance = new THREE.Mesh(new THREE.BoxGeometry(12, 10, 10), wallMat);
    entrance.position.set(0, 5, 45);
    building.add(entrance);

    const gate = new THREE.Mesh(new THREE.BoxGeometry(8, 5, 0.5), glassMat);
    gate.position.set(0, 3, 50);
    building.add(gate);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(4, 18, 90), wallMat);
    leftWall.position.set(-38, 9, 0);
    building.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(4, 18, 90), wallMat);
    rightWall.position.set(38, 9, 0);
    building.add(rightWall);

    for (let x of [-12, 12]) {
        const utility = new THREE.Mesh(new THREE.BoxGeometry(10, 8, 8), wallMat);
        utility.position.set(x, 24, -42);
        building.add(utility);
    }

    for (let x of [-18, 18]) {
        const win = new THREE.Mesh(new THREE.BoxGeometry(8, 4, 0.5), glassMat);
        win.position.set(x, 8, 49);
        building.add(win);
    }

    building.scale.set(0.12, 0.12, 0.12);
    building.position.set(cx, 0, cz);
    building.rotation.y = Math.PI;

    building.traverse(c => {
        if (c.isMesh) {
            c.userData.id = id;
            c.castShadow = true;
            c.receiveShadow = true;
            allMeshes.push(c);
            if (!meshById[id]) meshById[id] = [];
            meshById[id].push(c);
        }
    });

    scene.add(building);
    addLabel(id, '🎭 Auditorium', cx, 4, cz);
}

// =====================================================================
// 5z. BUILD LIBRARY (structure from lib.html)
// =====================================================================
function buildLibraryStructure(id, cx, cz) {
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x9999a2, roughness: 0.72, metalness: 0.06 });
    const darkWallMat = new THREE.MeshStandardMaterial({ color: 0x5c5c5c, roughness: 0.8, metalness: 0.05 });
    const glassMat = new THREE.MeshStandardMaterial({
        color: 0x3f6b8f,
        transparent: true,
        opacity: 0.72,
        roughness: 0.22,
        metalness: 0.28,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1
    });
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xc8c8c8, roughness: 0.6, metalness: 0.12 });
    const blueRoofMat = new THREE.MeshStandardMaterial({ color: 0x5b8bd4, roughness: 0.68, metalness: 0.08 });

    const building = new THREE.Group();
    building.position.y = 0.1;

    const outer = new THREE.Mesh(new THREE.BoxGeometry(90, 6, 90), wallMat);
    outer.position.set(0, 3, 0);
    building.add(outer);

    const courtyard = new THREE.Mesh(new THREE.BoxGeometry(60, 6, 60), darkWallMat);
    courtyard.position.set(0, 2.9, 0);
    building.add(courtyard);

    const main = new THREE.Mesh(new THREE.BoxGeometry(45, 24, 55), wallMat);
    main.position.set(0, 12, 0);
    main.rotation.y = -0.18;
    building.add(main);

    const entrance = new THREE.Mesh(new THREE.BoxGeometry(14, 10, 8), darkWallMat);
    entrance.position.set(0, 5, 31);
    building.add(entrance);

    const canopy = new THREE.Mesh(new THREE.BoxGeometry(16, 1, 6), frameMat);
    canopy.position.set(0, 10, 35);
    building.add(canopy);

    const sideBlock = new THREE.Mesh(new THREE.BoxGeometry(16, 10, 45), blueRoofMat);
    sideBlock.position.set(42, 5, 0);
    building.add(sideBlock);

    const windowX = [-15, -5, 5, 15];
    const windowY = [-5, 5];
    const frontWindows = new THREE.Group();
    frontWindows.position.copy(main.position);
    frontWindows.rotation.y = main.rotation.y;

    for (let y of windowY) {
        for (let x of windowX) {
            const frameBox = new THREE.Mesh(new THREE.BoxGeometry(8.5, 4.5, 0.6), frameMat);
            frameBox.position.set(x, y, 28);
            frontWindows.add(frameBox);

            const glassPane = new THREE.Mesh(new THREE.BoxGeometry(7.6, 3.8, 0.8), glassMat);
            glassPane.position.set(x, y, 28.2);
            frontWindows.add(glassPane);
        }
    }
    building.add(frontWindows);

    const sidePanels = new THREE.Group();
    sidePanels.position.copy(main.position);
    sidePanels.rotation.y = main.rotation.y;

    const leftSlope = new THREE.Mesh(new THREE.BoxGeometry(3.6, 24, 55), darkWallMat);
    leftSlope.position.set(-25.5, 0, 0);
    leftSlope.rotation.z = 0.08;
    sidePanels.add(leftSlope);

    const rightSlope = new THREE.Mesh(new THREE.BoxGeometry(3.6, 24, 55), darkWallMat);
    rightSlope.position.set(25.5, 0, 0);
    rightSlope.rotation.z = -0.08;
    sidePanels.add(rightSlope);

    building.add(sidePanels);

    const utility = new THREE.Mesh(new THREE.BoxGeometry(8, 6, 8), darkWallMat);
    utility.position.set(0, 27, 0);
    building.add(utility);

    // Keep scale comparable to auditorium for consistent perceived height.
    building.scale.set(0.12, 0.12, 0.12);
    building.position.set(cx, 0, cz);
    // Auditorium is rotated by PI, so library faces the opposite direction.
    building.rotation.y = 0;

    building.traverse(c => {
        if (c.isMesh) {
            c.userData.id = id;
            c.castShadow = true;
            c.receiveShadow = true;
            allMeshes.push(c);
            if (!meshById[id]) meshById[id] = [];
            meshById[id].push(c);
        }
    });

    scene.add(building);
    addLabel(id, '📚 Library', cx, 4, cz);
}

// =====================================================================
// 6. BUILD THE GROUND / TERRAIN
// =====================================================================
function buildTerrain() {
    // Outer terrain (lowest layer)
    const outerGeo = new THREE.PlaneGeometry(1000, 600);
    const outerMesh = new THREE.Mesh(outerGeo, MAT.grassDark);
    outerMesh.rotation.x = -Math.PI / 2;
    outerMesh.position.set(0, -0.05, -20);
    outerMesh.receiveShadow = true;
    scene.add(outerMesh);

    // Main campus ground (grass) — one layer above outer
    const campusGeo = new THREE.PlaneGeometry(500, 300);
    const campusMesh = new THREE.Mesh(campusGeo, MAT.grass);
    campusMesh.rotation.x = -Math.PI / 2;
    campusMesh.position.set(0, 0.01, -20);
    campusMesh.receiveShadow = true;
    scene.add(campusMesh);

    // Sandy/bare areas around construction zones (above grass)
    ground(-180, -60, 45, 40, MAT.sand);
    ground(165, -50, 60, 30, MAT.dirt);
    ground(150, 60, 75, 30, MAT.sand);
    ground(-150, 50, 45, 25, MAT.dirt);
}

// =====================================================================
// 7. BUILD ROAD NETWORK — from real GeoJSON / OSM data
// =====================================================================

// ── Geo→World coordinate conversion ──────────────────────────────────
// Calibrated against known building positions:
//   Main gate  (lat 30.9607, lon 76.47333) → world (0, 87)
//   Khorana Blk (lat 30.9715, lon 76.4810) → world (72, -84)
//   Ramanujan  (lat 30.9715, lon 76.4680) → world (-50, -84)
const GEO_CENTER_LAT = 30.96620;
const GEO_CENTER_LON = 76.47333;
const GEO_DEG_LAT_M = 111139;                                            // m per degree latitude
const GEO_DEG_LON_M = 111139 * Math.cos(GEO_CENTER_LAT * Math.PI / 180); // m per degree longitude (~95299)
const GEO_SCALE_X = 0.22161;                                           // world units per meter (E-W) — 1.5× horizontal stretch
const GEO_SCALE_Z = 0.21360;                                           // world units per meter (N-S) — 1.5× original

function geoToWorld(lon, lat) {
    return {
        x: (lon - GEO_CENTER_LON) * GEO_DEG_LON_M * GEO_SCALE_X,
        z: -(lat - GEO_CENTER_LAT) * GEO_DEG_LAT_M * GEO_SCALE_Z
    };
}

// ── Road ribbon mesh from polyline ───────────────────────────────────
// Creates a flat ribbon (triangle strip) following a series of world-space points.
function createRoadRibbon(points, width, material, yPos) {
    if (points.length < 2) return null;

    const verts = [];
    const uvs = [];
    const idx = [];
    let cumLen = 0;

    for (let i = 0; i < points.length; i++) {
        const p = points[i];

        // Tangent direction (averaged at interior vertices for smooth corners)
        let dx, dz;
        if (i === 0) {
            dx = points[1].x - p.x;
            dz = points[1].z - p.z;
        } else if (i === points.length - 1) {
            dx = p.x - points[i - 1].x;
            dz = p.z - points[i - 1].z;
        } else {
            dx = points[i + 1].x - points[i - 1].x;
            dz = points[i + 1].z - points[i - 1].z;
        }
        const len = Math.sqrt(dx * dx + dz * dz) || 1;
        // Perpendicular (left-hand normal in XZ plane)
        const nx = -dz / len;
        const nz = dx / len;

        const hw = width / 2;
        verts.push(
            p.x + nx * hw, yPos, p.z + nz * hw,
            p.x - nx * hw, yPos, p.z - nz * hw
        );

        if (i > 0) {
            const segDx = p.x - points[i - 1].x;
            const segDz = p.z - points[i - 1].z;
            cumLen += Math.sqrt(segDx * segDx + segDz * segDz);
        }
        uvs.push(0, cumLen / width, 1, cumLen / width);
    }

    // Build triangle indices (CCW winding so normals face upward)
    const vertCount = verts.length / 3;
    for (let i = 0; i < vertCount / 2 - 1; i++) {
        const a = i * 2, b = i * 2 + 1, c = i * 2 + 2, d = i * 2 + 3;
        idx.push(a, c, b, b, c, d);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(idx);
    geo.computeVertexNormals();

    const mesh = new THREE.Mesh(geo, material);
    mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
}

// ── Center-line dashes along a polyline ──────────────────────────────
function createRoadDashes(points, yPos) {
    const dashLen = 1.5, gapLen = 2.5, dashW = 0.3;
    let dist = 0;
    let inDash = true;
    let remaining = dashLen;

    for (let i = 1; i < points.length; i++) {
        const sx = points[i].x - points[i - 1].x;
        const sz = points[i].z - points[i - 1].z;
        const segLen = Math.sqrt(sx * sx + sz * sz);
        if (segLen === 0) continue;
        const ux = sx / segLen, uz = sz / segLen;
        let walked = 0;

        while (walked < segLen) {
            const step = Math.min(remaining, segLen - walked);
            if (inDash) {
                const cx = points[i - 1].x + ux * (walked + step / 2);
                const cz = points[i - 1].z + uz * (walked + step / 2);
                const angle = Math.atan2(ux, uz);
                const geo = new THREE.PlaneGeometry(dashW, step);
                const dash = new THREE.Mesh(geo, MAT.white);
                dash.rotation.x = -Math.PI / 2;
                dash.rotation.z = -angle;
                dash.position.set(cx, yPos, cz);
                scene.add(dash);
            }
            walked += step;
            remaining -= step;
            if (remaining <= 0) {
                inDash = !inDash;
                remaining = inDash ? dashLen : gapLen;
            }
        }
    }
}

// ── Road style config ────────────────────────────────────────────────
const ROAD_MAT = {
    tertiary: MAT.road,
    service: MAT.road,
    path: MAT.sidewalk,
    track: MAT.roadLight,
    raceway: new THREE.MeshStandardMaterial({ color: 0xc06030, roughness: 0.85, metalness: 0 }),
    unclassified: MAT.roadLight
};

const ROAD_WIDTH = {
    tertiary: 4, service: 2.5, path: 1.5, track: 2, raceway: 2.5, unclassified: 2.5
};

const ROAD_Y = {
    tertiary: 0.14, service: 0.12, path: 0.10, track: 0.12, raceway: 0.13, unclassified: 0.12
};

// ── Inline road network (92 features from map_roads_only.geojson) ────
const ROAD_NETWORK = [
    { t: "tertiary", n: "IIT Ropar (Main Campus) Road", c: [[76.5198725, 30.9822351], [76.5171891, 30.9807331], [76.5162724, 30.9800779], [76.5157224, 30.9797212], [76.5140152, 30.977749], [76.5138831, 30.9776005], [76.5121067, 30.9764499], [76.5118705, 30.9762318], [76.5112709, 30.9752971], [76.5107803, 30.9748454], [76.5102534, 30.9745806], [76.5081458, 30.9741288], [76.5068921, 30.9739886], [76.5056021, 30.9739418], [76.50473, 30.9740509], [76.5028404, 30.9745182], [76.5017139, 30.9746584], [76.5000822, 30.9747825], [76.4990522, 30.9747866], [76.4985809, 30.9747652], [76.4961337, 30.9746702], [76.4948854, 30.9743621], [76.4934479, 30.9736485], [76.4889997, 30.9716252], [76.4869223, 30.9708429], [76.486634, 30.9707766], [76.4862982, 30.9707456], [76.4855987, 30.9707352], [76.4849174, 30.970778], [76.4843997, 30.9709031], [76.4840284, 30.9710375], [76.482549, 30.9716758], [76.4819416, 30.971858], [76.4814037, 30.9719886], [76.4809638, 30.9720461], [76.4807573, 30.9720921], [76.4803871, 30.9721381], [76.4798266, 30.9721381], [76.4788127, 30.9720806], [76.4763491, 30.9719277], [76.4751193, 30.9719484], [76.4738737, 30.9718744], [76.4724058, 30.9717871]] },
    { t: "service", n: null, c: [[76.4731211, 30.9709765], [76.4733283, 30.9709765], [76.4739123, 30.9709765], [76.4739561, 30.9709534], [76.4739999, 30.9708957], [76.4740327, 30.9696363]] },
    { t: "service", n: null, c: [[76.4731211, 30.9709765], [76.472937, 30.9709731], [76.4724055, 30.9709631], [76.4723042, 30.9709161], [76.4722892, 30.97087], [76.4723047, 30.969613]] },
    { t: "service", n: null, c: [[76.4723047, 30.969613], [76.4740327, 30.9696363]] },
    { t: "service", n: null, c: [[76.4723047, 30.969613], [76.4723083, 30.9692689], [76.4723089, 30.9692111], [76.4723089, 30.9691136], [76.4723189, 30.9690838], [76.4723521, 30.9690467], [76.4723903, 30.9690254], [76.4724351, 30.969014], [76.4725381, 30.969014], [76.4731446, 30.9690214], [76.4738955, 30.9690306], [76.4739808, 30.9690439], [76.4740312, 30.9691005], [76.474039, 30.9691902], [76.4740327, 30.9696363]] },
    { t: "service", n: null, c: [[76.4651665, 30.9692521], [76.4652801, 30.9692533], [76.4656374, 30.9692571], [76.4657936, 30.9692588], [76.4668369, 30.9692529], [76.4670203, 30.9693342], [76.4673234, 30.969465], [76.4674295, 30.9694793], [76.4675539, 30.9695052], [76.4678628, 30.9695178], [76.4683034, 30.9695126], [76.4684381, 30.9695146], [76.4685779, 30.9695167], [76.4689367, 30.9695221], [76.4693499, 30.9695284], [76.4697235, 30.9695287], [76.4723047, 30.969613]] },
    { t: "service", n: null, c: [[76.4693499, 30.9695284], [76.4693799, 30.9682059]] },
    { t: "service", n: null, c: [[76.4696371, 30.9681769], [76.470031, 30.9681798], [76.4700647, 30.9681481], [76.4700849, 30.968099], [76.470088, 30.9679273], [76.47013, 30.9673489]] },
    { t: "service", n: null, c: [[76.470088, 30.9679273], [76.4715686, 30.9679677]] },
    { t: "service", n: null, c: [[76.4740327, 30.9696363], [76.4751434, 30.9696555], [76.4768261, 30.9696775], [76.4774254, 30.9696801], [76.4778605, 30.969682], [76.4778913, 30.9696511], [76.4779016, 30.9696025], [76.4778347, 30.969479], [76.477737, 30.969276], [76.4776752, 30.9690819], [76.4776542, 30.9689349], [76.4776443, 30.9688657], [76.4776362, 30.968625], [76.4776443, 30.968548], [76.4776705, 30.9683848], [76.4776879, 30.9682764], [76.4776906, 30.9682594], [76.477769, 30.9680976], [76.4778039, 30.9680256], [76.4778707, 30.9678667], [76.4778685, 30.9677939], [76.4778094, 30.9677317], [76.4776565, 30.9675759], [76.477601, 30.9675431], [76.4775321, 30.96753], [76.4772747, 30.9675258], [76.4764803, 30.9675248]] },
    { t: "service", n: null, c: [[76.4774254, 30.9696801], [76.4774224, 30.9699154], [76.4774186, 30.9702138], [76.4774144, 30.9705474], [76.4774104, 30.9708655], [76.4774063, 30.9711848], [76.4774291, 30.9711948], [76.4784375, 30.9712064], [76.4784662, 30.9711833], [76.4784727, 30.9708758], [76.4784794, 30.9705648], [76.4784866, 30.9702289], [76.478493, 30.9699308]] },
    { t: "service", n: null, c: [[76.4774186, 30.9702138], [76.4784866, 30.9702289]] },
    { t: "service", n: null, c: [[76.4774144, 30.9705474], [76.4784794, 30.9705648]] },
    { t: "service", n: null, c: [[76.4774104, 30.9708655], [76.4784727, 30.9708758]] },
    { t: "service", n: null, c: [[76.4784866, 30.9702289], [76.4792013, 30.9702449], [76.4792459, 30.9702028], [76.4792549, 30.9699423], [76.478493, 30.9699308], [76.4774224, 30.9699154]] },
    { t: "service", n: null, c: [[76.4710521, 30.9690798], [76.4710561, 30.9688724], [76.4710676, 30.9682812], [76.4710985, 30.9682657], [76.4716253, 30.9682657], [76.4716645, 30.9682657], [76.4718102, 30.9682669], [76.4722079, 30.9682701], [76.4722388, 30.9682922], [76.4722385, 30.9683162], [76.4722367, 30.9684457], [76.4722322, 30.9688009], [76.472231, 30.968879], [76.4722027, 30.9688945], [76.4715878, 30.9688812], [76.4710561, 30.9688724]] },
    { t: "service", n: null, c: [[76.4722367, 30.9684457], [76.4731628, 30.9684521], [76.4741773, 30.9684591], [76.4741697, 30.9688325], [76.4741682, 30.9689052], [76.4743819, 30.9689085], [76.4746578, 30.9689128], [76.4752269, 30.9689204], [76.4752298, 30.9691517], [76.4756847, 30.9691585], [76.4760807, 30.9691644], [76.4760777, 30.9690195], [76.4760836, 30.9686434], [76.4760836, 30.9685824], [76.4760407, 30.9685816], [76.4759558, 30.9685801], [76.4752419, 30.9685672], [76.4752269, 30.9689204]] },
    { t: "service", n: null, c: [[76.4723083, 30.9692689], [76.4717773, 30.9692642], [76.4711475, 30.9692587], [76.4702808, 30.969251]] },
    { t: "service", n: null, c: [[76.4711475, 30.9692587], [76.471156, 30.9690342], [76.4711813, 30.9690024], [76.4712099, 30.9689923], [76.471752, 30.969001], [76.4717772, 30.9690298], [76.4717773, 30.9692642]] },
    { t: "service", n: null, c: [[76.4697235, 30.9695287], [76.4696763, 30.9702359]] },
    { t: "service", n: null, c: [[76.466681, 30.9664748], [76.4690069, 30.9664903], [76.4692566, 30.966491], [76.4704842, 30.9664947], [76.4705904, 30.9664605], [76.4707131, 30.9664953], [76.4720239, 30.9665191], [76.4721406, 30.9665238], [76.4725716, 30.9665274], [76.4728248, 30.966531], [76.473513, 30.9665407], [76.4743177, 30.9665521], [76.4753953, 30.9665725], [76.4759893, 30.9665838], [76.4766818, 30.9665969], [76.4772816, 30.9666083], [76.4773075, 30.9666088], [76.4779101, 30.9666153], [76.4786739, 30.9666236], [76.4789875, 30.9666277], [76.4795072, 30.9666346], [76.4797537, 30.9666397]] },
    { t: "service", n: null, c: [[76.4759893, 30.9665838], [76.4759967, 30.9663265], [76.4760057, 30.9660097], [76.4760151, 30.9656809], [76.4760283, 30.9652222], [76.476038, 30.9648825], [76.4760556, 30.964266], [76.4760651, 30.9639342]] },
    { t: "service", n: null, c: [[76.4762301, 30.9639701], [76.4762735, 30.96213], [76.4762891, 30.9610507], [76.4762891, 30.9605765], [76.4762713, 30.9604621], [76.4762189, 30.9603507], [76.4761569, 30.9602543], [76.4760871, 30.9601977], [76.4760231, 30.9601595], [76.4759436, 30.9601312], [76.4758427, 30.9601063], [76.4757613, 30.9600963], [76.4752998, 30.9600896], [76.474411, 30.9600892], [76.4742233, 30.9601389], [76.4740799, 30.9601916], [76.4738955, 30.9602824], [76.4737624, 30.9603936], [76.4736676, 30.9604742], [76.4728267, 30.961435], [76.4719255, 30.9623332], [76.4717185, 30.9625143], [76.471379, 30.9627166], [76.4709667, 30.9629718], [76.4704148, 30.963313], [76.4703397, 30.9634155], [76.4703226, 30.9635062], [76.4703152, 30.9638994]] },
    { t: "service", n: null, c: [[76.4707131, 30.9664953], [76.4707042, 30.9667962], [76.4706952, 30.9670375], [76.4706952, 30.9671237], [76.4707086, 30.9671448], [76.4707399, 30.9671505], [76.4712281, 30.9671616], [76.4718395, 30.9671755], [76.4720663, 30.9671806], [76.4721167, 30.9671628], [76.4721316, 30.9671298], [76.4721406, 30.9665238]] },
    { t: "service", n: null, c: [[76.4692566, 30.966491], [76.4692415, 30.9673265], [76.47013, 30.9673489], [76.4701844, 30.9673498], [76.4704488, 30.9673569], [76.4704828, 30.9665279], [76.4704842, 30.9664947]] },
    { t: "service", n: null, c: [[76.4772747, 30.9675258], [76.4772816, 30.9666083]] },
    { t: "service", n: null, c: [[76.4764604, 30.9683793], [76.4776705, 30.9683848]] },
    { t: "service", n: null, c: [[76.4764554, 30.9686068], [76.4776362, 30.968625]] },
    { t: "service", n: null, c: [[76.4764492, 30.9689369], [76.4776542, 30.9689349]] },
    { t: "service", n: null, c: [[76.4764492, 30.9689369], [76.4764554, 30.9686068], [76.4764399, 30.9684439], [76.4764604, 30.9683793], [76.476464, 30.9682237], [76.4764642, 30.9682169], [76.4764672, 30.9680852], [76.4764744, 30.967778], [76.4764803, 30.9675248]] },
    { t: "service", n: null, c: [[76.4764744, 30.967778], [76.4778685, 30.9677939]] },
    { t: "service", n: null, c: [[76.4764672, 30.9680852], [76.4774046, 30.9680958], [76.477769, 30.9680976]] },
    { t: "service", n: null, c: [[76.4718395, 30.9671755], [76.4718196, 30.967378], [76.4717813, 30.9674405], [76.4716038, 30.9676303], [76.4714803, 30.9678399], [76.4714931, 30.9678752], [76.4715686, 30.9679677]] },
    { t: "service", n: null, c: [[76.4715686, 30.9679677], [76.4716253, 30.9682657]] },
    { t: "service", n: null, c: [[76.4718196, 30.967378], [76.4721014, 30.9673901], [76.4724601, 30.96762], [76.4721475, 30.9679493], [76.4718415, 30.9681332], [76.4718281, 30.9681638], [76.4718102, 30.9682669]] },
    { t: "service", n: null, c: [[76.4724058, 30.9717871], [76.4724599, 30.9716589], [76.4725192, 30.9715853], [76.4725933, 30.9715217], [76.4726792, 30.9714684], [76.4728155, 30.9714023], [76.4728926, 30.971354], [76.4729282, 30.9712879], [76.4729324, 30.9711365], [76.472937, 30.9709731]] },
    { t: "service", n: null, c: [[76.4738737, 30.9718744], [76.4737936, 30.9716589], [76.4737165, 30.97157], [76.4735802, 30.9714709], [76.4734202, 30.9713947], [76.4733673, 30.9713591], [76.4733372, 30.9713388], [76.4733194, 30.9713006], [76.4733216, 30.9712209], [76.4733283, 30.9709765]] },
    { t: "service", n: null, c: [[76.4728926, 30.971354], [76.4733673, 30.9713591]] },
    { t: "path", n: null, c: [[76.4722121, 30.9696494], [76.4721986, 30.9696898], [76.4722239, 30.969723], [76.4722222, 30.9699078], [76.4722138, 30.9702281], [76.472207, 30.9705349], [76.4721986, 30.9708705], [76.4722138, 30.9709124], [76.4722508, 30.9709586], [76.4722845, 30.970986], [76.4723265, 30.9710091], [76.4723737, 30.9710206], [76.4725336, 30.9710264], [76.4726464, 30.9710264], [76.4728114, 30.9710264], [76.4728568, 30.9710452], [76.4728669, 30.9710596], [76.4728669, 30.9711159], [76.4728669, 30.9711318], [76.4729006, 30.9711347], [76.4729324, 30.9711365]] },
    { t: "path", n: null, c: [[76.4733216, 30.9712209], [76.4733926, 30.9712209], [76.4733926, 30.9712741], [76.4734072, 30.9713041], [76.4734452, 30.9713267], [76.4736162, 30.9714081], [76.4737156, 30.971474], [76.4738179, 30.9715742], [76.473888, 30.9716782], [76.4739407, 30.9717785]] },
    { t: "path", n: null, c: [[76.4723827, 30.9696797], [76.4723671, 30.9701842], [76.4723654, 30.9704116], [76.4723619, 30.9706357], [76.4723619, 30.9708672], [76.4723671, 30.9708831], [76.472395, 30.9708929], [76.4727313, 30.9708944], [76.4733669, 30.9709054], [76.4737204, 30.9709088], [76.4738704, 30.970911], [76.4739019, 30.9709054], [76.4739145, 30.9708946], [76.4739198, 30.9706653], [76.4739273, 30.9702959], [76.4739373, 30.9699559], [76.4739373, 30.9696636]] },
    { t: "path", n: null, c: [[76.4743819, 30.9689085], [76.4743835, 30.9690567], [76.4744043, 30.9692348], [76.4743887, 30.9692511], [76.4740858, 30.9692526]] },
    { t: "service", n: null, c: [[76.4797537, 30.9666397], [76.4797408, 30.966532], [76.4797057, 30.9663183], [76.479639, 30.9660746], [76.4794355, 30.9654034], [76.4793934, 30.9653222], [76.4791161, 30.9651325], [76.4785989, 30.9648896], [76.4785049, 30.9648458], [76.4779543, 30.964589], [76.4776262, 30.9644361], [76.4767945, 30.9641474], [76.4767305, 30.9641273], [76.4762301, 30.9639701]] },
    { t: "path", n: null, c: [[76.4746053, 30.9636385], [76.4752254, 30.9637192], [76.4755607, 30.9637763], [76.4760544, 30.9638768], [76.4761738, 30.9639063]] },
    { t: "path", n: null, c: [[76.4752552, 30.9637645], [76.4752805, 30.9636109]] },
    { t: "path", n: null, c: [[76.4754481, 30.9619417], [76.4754681, 30.9614784]] },
    { t: "path", n: null, c: [[76.4731446, 30.9690214], [76.4731512, 30.9688158], [76.4731628, 30.9684521]] },
    { t: "path", n: null, c: [[76.4722322, 30.9688009], [76.4731512, 30.9688158], [76.4741697, 30.9688325]] },
    { t: "service", n: null, c: [[76.4674295, 30.9694793], [76.4675144, 30.9693442], [76.4676646, 30.9690375], [76.4676917, 30.9689595], [76.4677151, 30.968859], [76.4677157, 30.9688281], [76.4677427, 30.9686245], [76.4677367, 30.9683823], [76.4677097, 30.9682148], [76.4676943, 30.9681733], [76.4676736, 30.9681177], [76.4675504, 30.9678806], [76.4673813, 30.967604], [76.4669615, 30.9669234], [76.466681, 30.9664748]] },
    { t: "raceway", n: null, c: [[76.4734115, 30.9613435], [76.4734221, 30.961838], [76.4742051, 30.9618471], [76.4743268, 30.9619061], [76.4746971, 30.9622146], [76.474676, 30.9631809], [76.4745702, 30.9632625], [76.4741469, 30.9632308], [76.4741363, 30.9631582], [76.473967, 30.9631899], [76.4738295, 30.9632081], [76.4735279, 30.963199], [76.4730042, 30.9632625], [76.4728137, 30.9631854], [76.4725968, 30.9626816], [76.4721259, 30.9626953], [76.4721365, 30.9623732], [76.472327, 30.9623686], [76.472921, 30.9617437], [76.4731198, 30.9615024], [76.4731047, 30.9613731], [76.4732165, 30.9613556], [76.4734115, 30.9613435]] },
    { t: "service", n: null, c: [[76.4786813, 30.9682905], [76.4786625, 30.9678627], [76.4786531, 30.9672107], [76.4786625, 30.9667956], [76.4786739, 30.9666236]] },
    { t: "service", n: null, c: [[76.4652801, 30.9692533], [76.4652534, 30.9690805], [76.4650953, 30.9680586], [76.4655458, 30.9680626], [76.4663671, 30.96807], [76.46687, 30.9680745], [76.4669994, 30.9680956], [76.4671966, 30.9681326], [76.4676428, 30.9681691], [76.4676943, 30.9681733]] },
    { t: "service", n: null, c: [[76.4652534, 30.9690805], [76.4656349, 30.9690863], [76.4661599, 30.9690933], [76.4665305, 30.9691], [76.466756, 30.9691034], [76.4668391, 30.969177], [76.4668369, 30.9692529]] },
    { t: "service", n: null, c: [[76.4656374, 30.9692571], [76.4656349, 30.9690863]] },
    { t: "service", n: null, c: [[76.4661599, 30.9690933], [76.4663215, 30.9683169], [76.4663671, 30.96807]] },
    { t: "service", n: null, c: [[76.4663215, 30.9683169], [76.4664261, 30.9684732], [76.4665305, 30.9691]] },
    { t: "service", n: null, c: [[76.4668391, 30.969177], [76.4671141, 30.9691898], [76.4674185, 30.969208], [76.4674937, 30.9688537], [76.4676428, 30.9681691]] },
    { t: "service", n: null, c: [[76.4674937, 30.9688537], [76.4677151, 30.968859]] },
    { t: "service", n: null, c: [[76.4693799, 30.9682059], [76.4691329, 30.968201], [76.4680124, 30.9681783], [76.467952, 30.9681981], [76.4679281, 30.968261], [76.4680816, 30.9691647], [76.4681136, 30.9691976], [76.4681501, 30.9692198], [76.4683939, 30.9692112], [76.4684252, 30.9692581], [76.4684381, 30.9695146]] },
    { t: "service", n: null, c: [[76.4685779, 30.9695167], [76.4685955, 30.9692308], [76.4686236, 30.9692059], [76.4688633, 30.9692132], [76.4689119, 30.9692011], [76.4689448, 30.9691728], [76.4691329, 30.968201]] },
    { t: "service", n: null, c: [[76.4653462, 30.9664338], [76.4655712, 30.9664407], [76.466681, 30.9664748]] },
    { t: "service", n: null, c: [[76.4655712, 30.9664407], [76.4655458, 30.9680626]] },
    { t: "service", n: null, c: [[76.466681, 30.9664748], [76.4664116, 30.9660348], [76.4663869, 30.9659358], [76.4663952, 30.9658545], [76.4664158, 30.9657944], [76.4664694, 30.9657273], [76.4664941, 30.9656955], [76.46656, 30.9656601], [76.4666549, 30.9656425], [76.4673598, 30.9656531], [76.4674669, 30.9656319], [76.4675494, 30.9655859], [76.4676153, 30.9655081], [76.4676236, 30.9654162], [76.4676277, 30.9651122], [76.4676442, 30.9650309], [76.4676937, 30.9649497], [76.4681636, 30.9646669], [76.4686954, 30.9644124], [76.469223, 30.9641968], [76.4697589, 30.9640377], [76.4703152, 30.9638994], [76.470773, 30.963815], [76.4714408, 30.9637196], [76.4722611, 30.9636418], [76.4730154, 30.9636312], [76.4739512, 30.9636524], [76.4745942, 30.9637019], [76.4755176, 30.963815], [76.4760651, 30.9639342], [76.4762301, 30.9639701]] },
    { t: "service", n: null, c: [[76.4760283, 30.9652222], [76.4767047, 30.9652328], [76.4779494, 30.9652522], [76.4784939, 30.9652607], [76.4785049, 30.9648458]] },
    { t: "service", n: null, c: [[76.4767305, 30.9641273], [76.4767271, 30.9642743], [76.4767124, 30.9649038], [76.4767047, 30.9652328]] },
    { t: "service", n: null, c: [[76.4779543, 30.964589], [76.4779494, 30.9652522]] },
    { t: "service", n: null, c: [[76.476038, 30.9648825], [76.4767124, 30.9649038]] },
    { t: "service", n: null, c: [[76.4760556, 30.964266], [76.4767271, 30.9642743]] },
    { t: "service", n: null, c: [[76.4794355, 30.9654034], [76.4807675, 30.965424], [76.4811419, 30.9652742], [76.4812467, 30.9652871]] },
    { t: "service", n: null, c: [[76.4760151, 30.9656809], [76.476709, 30.9656975], [76.4779357, 30.9657267]] },
    { t: "service", n: null, c: [[76.4760057, 30.9660097], [76.4766996, 30.9660212], [76.4779267, 30.9660398]] },
    { t: "service", n: null, c: [[76.4759967, 30.9663265], [76.4766899, 30.9663357], [76.4779177, 30.9663527], [76.4784561, 30.9663605], [76.4789941, 30.9663681]] },
    { t: "service", n: null, c: [[76.476709, 30.9656975], [76.4766996, 30.9660212], [76.4766899, 30.9663357], [76.4766818, 30.9665969]] },
    { t: "service", n: null, c: [[76.4779101, 30.9666153], [76.4779177, 30.9663527], [76.4779267, 30.9660398], [76.477929, 30.9659594], [76.4779357, 30.9657267], [76.4779494, 30.9652522]] },
    { t: "service", n: null, c: [[76.477929, 30.9659594], [76.4781327, 30.9659624], [76.4782801, 30.9659644], [76.4784557, 30.9659711], [76.4786829, 30.9659694], [76.4788229, 30.9659778], [76.4790038, 30.9659834], [76.4789941, 30.9663681], [76.4789875, 30.9666277]] },
    { t: "service", n: null, c: [[76.4784557, 30.9659711], [76.4784561, 30.9663605]] },
    { t: "service", n: null, c: [[76.473513, 30.9665407], [76.4735391, 30.967064], [76.4735889, 30.9680634], [76.4727622, 30.9680465]] },
    { t: "service", n: null, c: [[76.4725716, 30.9665274], [76.4726982, 30.9666844], [76.4728248, 30.966531]] },
    { t: "service", n: null, c: [[76.4726982, 30.9666844], [76.4726899, 30.9670526], [76.4726771, 30.9676168]] },
    { t: "service", n: null, c: [[76.4726899, 30.9670526], [76.4735391, 30.967064]] },
    { t: "service", n: null, c: [[76.4735889, 30.9680634], [76.4753235, 30.968093], [76.4753583, 30.9680751], [76.4753769, 30.9680372], [76.4753953, 30.9665725]] },
    { t: "service", n: null, c: [[76.4776879, 30.9682764], [76.4786813, 30.9682905], [76.4805907, 30.9683548], [76.4810389, 30.9684769]] },
    { t: "service", n: null, c: [[76.4812467, 30.9652871], [76.4811955, 30.9657971], [76.4810389, 30.9684769]] },
    { t: "service", n: null, c: [[76.4689367, 30.9695221], [76.468937, 30.9696954], [76.4689382, 30.9702427], [76.4692216, 30.9702401], [76.4696763, 30.9702359]] },
    { t: "service", n: null, c: [[76.4692216, 30.9702401], [76.4692375, 30.9697076], [76.468937, 30.9696954]] },
    { t: "service", n: null, c: [[76.4705904, 30.9664605], [76.4705938, 30.9657735], [76.4706725, 30.9656915], [76.4708861, 30.9656951], [76.4718284, 30.9657108], [76.4719687, 30.9657132], [76.4720446, 30.965759], [76.4720239, 30.9665191]] },
    { t: "service", n: null, c: [[76.4708861, 30.9656951], [76.4709412, 30.9659095], [76.4717331, 30.9659312], [76.4718284, 30.9657108]] },
    { t: "service", n: null, c: [[76.4867813, 30.9653168], [76.4866975, 30.9653155], [76.4861776, 30.9653074], [76.4860971, 30.9653061], [76.485307, 30.9653028], [76.484584, 30.965191], [76.4830191, 30.9652173], [76.481389, 30.965265], [76.4812467, 30.9652871]] },
    { t: "tertiary", n: null, c: [[76.4724058, 30.9717871], [76.4720803, 30.9717678], [76.4715924, 30.9717877], [76.4701234, 30.9720682], [76.4685431, 30.97251], [76.4678121, 30.9726293], [76.4664059, 30.9726771], [76.465473, 30.9727248], [76.4641711, 30.9726234], [76.4634611, 30.9724144], [76.4623054, 30.9721697], [76.4607251, 30.9717877], [76.4603422, 30.9717101], [76.4595258, 30.9717086], [76.4574747, 30.9717017]] },
    { t: "unclassified", n: null, c: [[76.4786614, 30.953388], [76.4780593, 30.9542469], [76.4772712, 30.9553999], [76.4765153, 30.9565501], [76.476218, 30.9570087], [76.4761165, 30.9571652], [76.4756179, 30.9578272], [76.4752963, 30.9582437], [76.4746272, 30.9590822], [76.4736945, 30.9601055], [76.47299, 30.9608723], [76.4723403, 30.961526], [76.471385, 30.9623507], [76.4711213, 30.9625438], [76.4706323, 30.9628362], [76.4697124, 30.9633133], [76.4687732, 30.9638236], [76.4681267, 30.9641656], [76.4671489, 30.9646014], [76.4657947, 30.965164], [76.4648845, 30.9655915], [76.4643344, 30.9658921], [76.4631025, 30.9664189], [76.4629063, 30.9665817], [76.462723, 30.9667499], [76.4626683, 30.9669705], [76.4626811, 30.9672105], [76.4627326, 30.9673456], [76.4627776, 30.9674753], [76.4627519, 30.9675635], [76.4626876, 30.9676132], [76.462649, 30.9677207], [76.4626393, 30.9679083], [76.4625911, 30.9680158], [76.4624303, 30.9682668], [76.4621794, 30.9685647], [76.461758, 30.9691411], [76.4616872, 30.9692983], [76.4615843, 30.9693893], [76.4614524, 30.9694803], [76.4613045, 30.9695382], [76.4609764, 30.9695631], [76.4601594, 30.9695934], [76.4599729, 30.9696513], [76.4597959, 30.9698085], [76.4596351, 30.9700126], [76.4595451, 30.9702801], [76.4594872, 30.9705532], [76.459455, 30.9708455], [76.4595161, 30.9715433], [76.4595258, 30.9717086]] },
    { t: "track", n: null, c: [[76.4725167, 30.9578128], [76.4725418, 30.9579334], [76.4725263, 30.9581023], [76.4724414, 30.9583507], [76.472368, 30.9586356], [76.4722058, 30.9590065], [76.4719393, 30.9592682], [76.4718272, 30.9593675], [76.4714951, 30.959659], [76.4712786, 30.9598726]] },
    { t: "unclassified", n: null, c: [[76.4703401, 30.9521285], [76.4703554, 30.9522169], [76.4703876, 30.9526804], [76.4696864, 30.9537782], [76.4695513, 30.953963], [76.4690752, 30.9547299], [76.4685027, 30.9556181], [76.4683097, 30.9558994], [76.4677307, 30.9567821], [76.4673287, 30.9574082], [76.4670231, 30.9578744], [76.4665052, 30.9586853], [76.4662576, 30.9590467], [76.4658587, 30.9595983], [76.4654245, 30.9600231], [76.464971, 30.9603292], [76.4644113, 30.9606713], [76.4637519, 30.9609912], [76.4633659, 30.9611788], [76.4618124, 30.9618352], [76.4596251, 30.9628144], [76.4577563, 30.9636225], [76.4564118, 30.9642155], [76.4546653, 30.9649492], [76.4528446, 30.9657542]] }
];

// ── Build all roads from the network data ────────────────────────────
function buildRoads() {
    ROAD_NETWORK.forEach(rd => {
        const hw = rd.t;
        const mat = ROAD_MAT[hw] || MAT.road;
        const w = ROAD_WIDTH[hw] || 2.5;
        const y = ROAD_Y[hw] || 0.12;

        // Convert geo coordinates to world-space points
        const pts = rd.c.map(c => geoToWorld(c[0], c[1]));

        // Create road ribbon mesh
        createRoadRibbon(pts, w, mat, y);

        // Add center-line dashes for all roads/paths
        createRoadDashes(pts, y + 0.01);
    });

    // Parking areas (kept from original layout) — X coords & widths ×1.5
    ground(-30, 15, 22.5, 8, MAT.parking);
    ground(30, 15, 22.5, 8, MAT.parking);
    ground(-75, -70, 18, 8, MAT.parking);
    ground(75, -70, 18, 8, MAT.parking);
    ground(-1.5, 75, 30, 6, MAT.parking);
}

// =====================================================================
// 8. BUILDING DATABASE — every building from image analysis
// =====================================================================
// Each entry: { id, name, cat, desc, tags, build() }
// build() creates the 3D geometry at exact positions from image analysis.

const CAMPUS_DATA = [];

function reg(id, name, cat, desc, tags) {
    const entry = { id, name, cat, desc, tags };
    CAMPUS_DATA.push(entry);
    return entry;
}

function buildAllBuildings() {

    // =====================================================================
    // Positions aligned to reference map annotations over the 3D campus view.
    // Only buildings labelled in the reference map are active.
    // Campus layout (world coords):
    //   z ≈ -133 : Main entrance road (tertiary)
    //   z ≈ -115 : Spiral structure
    //   z ≈ -65 to -75 : Row 1 — H1-H3, P, D1-D4
    //   z ≈ -35 to -50 : Row 2 — H4-H6, Mess, UT, MC, Workshop, LHC, A, Lib, VF
    //   z ≈ +50 to +90 : Sports — VG, BG, FG, CG
    // =====================================================================

    // =====================================================================
    // M — MAIN GATE  (tertiary road junction at x≈-19.5, z≈-132.6)
    // Tertiary road runs E-W: (11.5,-134.7)→(-19.5,-132.6)→(-26.4,-132.2)
    // Service road enters campus south from (-19.5,-132.6)
    // =====================================================================
    reg('main_gate', 'Main Gate Complex', 'landmark',
        'Iconic entrance inspired by Indus Valley Civilisation with flanking security rooms and large overhead signage.',
        ['Entrance', 'Gate', 'Iconic']);

    (function buildMainGate() {
        const id = 'main_gate';
        const cx = -4, cz = -123;
        const group = new THREE.Group();

        // 1. Establish Colors/Materials (matching original MAT.gate mostly)
        const wallMat = new THREE.MeshStandardMaterial({ color: 0xe8e0d4, roughness: 0.9 });
        const roofMat = MAT.gate; // 0xb89a6a
        const darkMat = new THREE.MeshStandardMaterial({ color: 0x444444 });

        // 2. The Two Flanking Rooms
        const roomW = 8, roomH = 6, roomD = 8;
        
        // Left Room
        const leftRoom = new THREE.Mesh(new THREE.BoxGeometry(roomW, roomH, roomD), wallMat);
        leftRoom.position.set(cx - 18, roomH / 2, cz);
        group.add(leftRoom);
        // Left Room Roof
        const leftRoof = new THREE.Mesh(new THREE.BoxGeometry(roomW + 1, 1, roomD + 1), roofMat);
        leftRoof.position.set(cx - 18, roomH + 0.5, cz);
        group.add(leftRoof);

        // Right Room
        const rightRoom = new THREE.Mesh(new THREE.BoxGeometry(roomW, roomH, roomD), wallMat);
        rightRoom.position.set(cx + 18, roomH / 2, cz);
        group.add(rightRoom);
        // Right Room Roof
        const rightRoof = new THREE.Mesh(new THREE.BoxGeometry(roomW + 1, 1, roomD + 1), roofMat);
        rightRoof.position.set(cx + 18, roomH + 0.5, cz);
        group.add(rightRoof);

        // 3. Central Gate Pillars (3 pillars creating 2 distinct lanes/gaps)
        const pillarGap = 14; // span between pillars
        const numPillars = 3;
        const startX = cx - (pillarGap * (numPillars - 1)) / 2; // cx - 14
        const pillarH = 10;
        
        for (let i = 0; i < numPillars; i++) {
            const p = new THREE.Mesh(new THREE.BoxGeometry(3, pillarH, 3), roofMat);
            p.position.set(startX + i * pillarGap, pillarH / 2, cz);
            group.add(p);
        }

        // 3b. Add sliding physical metal gates filling the two gaps
        const gateMetallicMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8, roughness: 0.2 });
        // Left gap (incoming lane)
        const leftBarrier = new THREE.Mesh(new THREE.BoxGeometry(pillarGap - 3, 3, 0.5), gateMetallicMat);
        leftBarrier.position.set(cx - pillarGap / 2, 1.5, cz);
        group.add(leftBarrier);
        
        // Right gap (outgoing lane)
        const rightBarrier = new THREE.Mesh(new THREE.BoxGeometry(pillarGap - 3, 3, 0.5), gateMetallicMat);
        rightBarrier.position.set(cx + pillarGap / 2, 1.5, cz);
        group.add(rightBarrier);

        // 4. Heavy Overhead Canopy
        const canopyW = (numPillars * pillarGap) + 4; // 32
        const canopyH = 3;
        const canopy = new THREE.Mesh(new THREE.BoxGeometry(canopyW, canopyH, 5), roofMat);
        canopy.position.set(cx, pillarH + canopyH / 2, cz);
        group.add(canopy);

        // 5. Big Text Sign ("INDIAN INSTITUTE OF TECHNOLOGY ROPAR")
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        // Background matching canopy
        ctx.fillStyle = '#b89a6a';  
        ctx.fillRect(0, 0, 2048, 256);
        // Text styling
        ctx.fillStyle = '#ffffff'; // White text
        ctx.font = 'bold 85px "Arial Black", sans-serif'; // Very thick, huge font
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('INDIAN INSTITUTE OF TECHNOLOGY ROPAR', 1024, 128);

        const tex = new THREE.CanvasTexture(canvas);
        if (typeof renderer !== 'undefined') tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
        
        const signGeo = new THREE.PlaneGeometry(canopyW - 1, canopyH - 0.2);
        const signMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 });
        
        // South-facing sign (outward)
        const signS = new THREE.Mesh(signGeo, signMat);
        signS.position.set(cx, pillarH + canopyH / 2, cz + 2.51);
        group.add(signS);
        
        // North-facing sign (inward)
        const signN = new THREE.Mesh(signGeo, signMat);
        signN.rotation.y = Math.PI;
        signN.position.set(cx, pillarH + canopyH / 2, cz - 2.51);
        group.add(signN);

        // Add to raycasting state properly
        group.traverse(c => {
            if (c.isMesh) {
                c.userData.id = id;
                c.castShadow = true;
                c.receiveShadow = true;
                allMeshes.push(c);
                if (!meshById[id]) meshById[id] = [];
                meshById[id].push(c);
            }
        });
        scene.add(group);
    })();
    
    addLabel('main_gate', '🏛️ Main Gate', -4, 20, -123);
    origColor['main_gate'] = 0xb89a6a;

    // Gate plaza & security booths
    reg('gate_plaza', 'Gate Plaza & Security', 'infrastructure',
        'Entry plaza with security booth, visitor registration, and vehicle checking.',
        ['Security', 'Entry', 'Parking']);
    const plazaGround = ground(-17, -137, 20, 6, MAT.sidewalk);
    plazaGround.userData.id = 'gate_plaza';
    allMeshes.push(plazaGround);
    if (!meshById['gate_plaza']) meshById['gate_plaza'] = [];
    meshById['gate_plaza'].push(plazaGround);
    box('gate_plaza', -11, -127, 3, 3, 3, MAT.concrete);
    box('gate_plaza', 3, -127, 3, 3, 3, MAT.concrete);
    origColor['gate_plaza'] = 0xe8e0d4;

    // =====================================================================
    // S — SPIRAL STRUCTURE  (just south of main gate, on the entry road)
    // Gate service road: (-19.5,-132.6)→(-18.4,-129.6)→(-17.1,-127.8)→(-15.6,-126.3)
    // Placed at the midpoint of the entry path, before the first internal junction
    // =====================================================================
    reg('spiral', 'Spiral / DNA Sculpture', 'landmark',
        'Decorative spiral sculpture near the main entrance.',
        ['Spiral', 'Art', 'Sculpture']);

    // Build detailed zig-zag ribbon sculpture (from spiral.html)
    (function buildSpiral() {
        const group = new THREE.Group();

        const matMetal = new THREE.MeshStandardMaterial({
            color: 0xdee4ea, roughness: 0.35, metalness: 0.85
        });
        const matBase = new THREE.MeshStandardMaterial({
            color: 0x111111, roughness: 0.8
        });

        // Black Pedestal Base
        const baseW = 50, baseH = 8, baseD = 50;
        const base = new THREE.Mesh(new THREE.BoxGeometry(baseW, baseH, baseD), matBase);
        base.position.y = baseH / 2;
        base.castShadow = true; base.receiveShadow = true;
        base.userData.id = 'spiral';
        group.add(base);

        // Zig-Zag path
        const numPts = 8;
        const w = 16, d = 16;
        const h = 14;
        const W = 14, H = 14;

        const pts = [];
        for (let i = 0; i < numPts; i++) {
            let x = w * [-1, 1, 1, -1][i % 4];
            let z = d * [1, 1, -1, -1][i % 4];
            let y = baseH + (i * h);
            pts.push(new THREE.Vector3(x, y, z));
        }

        const dirs = [];
        for (let i = 0; i < numPts - 1; i++) {
            dirs.push(pts[i + 1].clone().sub(pts[i]).normalize());
        }

        // Miter planes for flush corners
        const Ts = [];
        for (let i = 0; i < numPts; i++) {
            if (i === 0) { Ts.push(new THREE.Vector3(0, 1, 0)); }
            else if (i === numPts - 1) { Ts.push(new THREE.Vector3(0, 1, 0)); }
            else {
                let dIn = dirs[i - 1];
                let dOut = dirs[i];
                Ts.push(dIn.clone().add(dOut).normalize());
            }
        }

        // Construct mitered beam segments
        for (let i = 0; i < numPts - 1; i++) {
            let pA = pts[i];
            let pB = pts[i + 1];
            let D = dirs[i];
            let len = pA.distanceTo(pB);

            let geo = new THREE.BoxGeometry(W, H, len);
            geo.translate(0, 0, len / 2);

            let mesh = new THREE.Mesh(geo, matMetal);
            mesh.position.copy(pA);
            mesh.lookAt(pB);
            mesh.updateMatrixWorld();

            geo.applyMatrix4(mesh.matrixWorld);

            let pos = geo.attributes.position;
            const center = pA.clone().add(pB).multiplyScalar(0.5);

            for (let j = 0; j < pos.count; j++) {
                let v = new THREE.Vector3().fromBufferAttribute(pos, j);
                let isStart = v.clone().sub(center).dot(D) < 0;
                let P_plane = isStart ? pA : pB;
                let T_plane = isStart ? Ts[i] : Ts[i + 1];
                let num_k = v.clone().sub(P_plane).dot(T_plane);
                let den_k = D.dot(T_plane);
                if (Math.abs(den_k) > 0.0001) {
                    let k = -num_k / den_k;
                    v.add(D.clone().multiplyScalar(k));
                }
                pos.setXYZ(j, v.x, v.y, v.z);
            }

            geo.computeVertexNormals();
            geo.computeBoundingBox();
            geo.computeBoundingSphere();

            mesh.position.set(0, 0, 0);
            mesh.rotation.set(0, 0, 0);
            mesh.scale.set(1, 1, 1);
            mesh.castShadow = true; mesh.receiveShadow = true;
            mesh.userData.id = 'spiral';
            group.add(mesh);
        }

        // Scale down to campus units and position
        group.scale.set(0.12, 0.12, 0.12);
        group.position.set(-4, 0, -93);
        scene.add(group);

        group.traverse(c => {
            if (c.isMesh) {
                allMeshes.push(c);
                if (!meshById['spiral']) meshById['spiral'] = [];
                meshById['spiral'].push(c);
            }
        });
    })();
    addLabel('spiral', '🌀 Spiral Structure', -4, 16, -93);
    origColor['spiral'] = 0xdee4ea;

    // =====================================================================
    // ROW 1 — HOSTELS H1-H3, PARKING, DEPARTMENTS D1-D4
    // =====================================================================

    // H1 — Hostel 1 (far left, top row) — detailed multi-wing from hostel.html
    reg('hostel_1', 'Chenab Hostel', 'hostel',
        'Chenab Hostel — student hostel block in the north-west residential cluster. Multi-wing complex with green balconies, central dome, and courtyards.',
        ['Hostel', 'Residential']);
    createHostelBuilding('hostel_1', -159, -56, 15, 15, '🏠 Chenab Hostel');
    origColor['hostel_1'] = 0xd4c4a8;

    // H2 — Hostel 2 — detailed multi-wing from hostel.html
    reg('hostel_2', 'Beas Hostel', 'hostel',
        'Beas Hostel — student hostel block adjacent to Chenab. Multi-wing complex with green balconies, central dome, and courtyards.',
        ['Hostel', 'Residential']);
    createHostelBuilding('hostel_2', -133, -56, 15, 15, '🏠 Beas Hostel');
    origColor['hostel_2'] = 0xc8b898;

    // H3 — Hostel 3 — detailed multi-wing from hostel.html
    reg('hostel_3', 'Satluj Hostel', 'hostel',
        'Satluj Hostel — student hostel block. Multi-wing complex with green balconies, central dome, and courtyards.',
        ['Hostel', 'Residential']);
    createHostelBuilding('hostel_3', -102, -58, 15, 15, '🏠 Satluj Hostel');
    origColor['hostel_3'] = 0xd4c4a8;

    // P — Parking Area
    reg('parking', 'Parking Area', 'infrastructure',
        'Open parking lot between hostel and department zones.',
        ['Parking', 'Vehicles']);
    const parkingMesh = ground(-75, -58, 12, 8, MAT.parking);
    parkingMesh.userData.id = 'parking';
    allMeshes.push(parkingMesh);
    meshById['parking'] = [parkingMesh];
    addLabel('parking', '🅿️ Parking', -75, 2, -58);
    origColor['parking'] = 0x484848;

    // D1 — Department 1
    reg('dept_1', 'Satish Dhawan Block', 'academic',
        'Satish Dhawan Block — academic department building.',
        ['Department', 'Academic']);
    buildSatishDhawan('dept_1', -58, -58);
    origColor['dept_1'] = 0xb0b8c0;

    // D2 — Department 2 (large central block)
    reg('dept_2', 'SS Bhatnagar Block', 'academic',
        'SS Bhatnagar Block — main academic department building, largest block on campus.',
        ['Department', 'Academic']);
    buildSSBhatnagar('dept_2', -36, -58);
    origColor['dept_2'] = 0xD8D8D8;

    // Admin — Administrative Block (between SS Bhatnagar and JC Bose)
    reg('admin_block', 'Administrative Block', 'admin',
        'Main administrative building — Director\'s office, registrar, academic section, and administrative offices.',
        ['Admin', 'Office', 'Administration']);
    createAdminBuilding(-2, -58);
    origColor['admin_block'] = 0xd4ccc0;

    // D3 — Department 3
    reg('dept_3', 'JC Bose Block', 'academic',
        'JC Bose Block — academic department building, right of centre.',
        ['Department', 'Academic']);
    buildJCBose('dept_3', 24, -58);
    origColor['dept_3'] = 0xCCCCCC;

    // D4 — Department 4
    reg('dept_4', 'Ramanujan Block', 'academic',
        'Ramanujan Block — academic department building on the eastern side.',
        ['Department', 'Academic']);
    buildRamanujan('dept_4', 49, -63);
    origColor['dept_4'] = 0xa1a6a9;

    // =====================================================================
    // ROW 2 — H4-H6, MESS, UT, MC, WORKSHOP, CAFETERIA, LHC, A, LIB, VF
    // =====================================================================

    // H5 — Hostel 5 (below H1) — Detailed U-shaped building
    reg('hostel_5', 'Brahmaputra Girls Hostel', 'hostel',
        'Brahmaputra Girls Hostel — U-shaped building with open courtyard, detailed facade, towers, and glass features.',
        ['Hostel', 'Residential']);
    buildBHSGirls('hostel_5', -139, -27);
    origColor['hostel_5'] = 0xAA8B70;

    // H4 — Hostel 4 (below H2) — Detailed quadrilateral courtyard building
    reg('hostel_4', 'Brahmaputra Boys Hostel', 'hostel',
        'Brahmaputra Boys Hostel — quadrilateral courtyard building with detailed facade, towers, and glass features.',
        ['Hostel', 'Residential']);
    buildBHSBoys('hostel_4', -147, -15);
    origColor['hostel_4'] = 0xAA8B70;

    // Mess — Dining Hall (detailed structure from satellite imagery)
    reg('mess', 'Mess / Dining Hall', 'dining',
        'Main dining facility for hostel residents — breakfast, lunch, dinner. Two symmetrical wings with a central gate entrance, glass facades, and roof canopy.',
        ['Food', 'Mess', 'Dining']);
    buildMessComplex('mess', -110, -18);
    addLabel('mess', '🍽️ Mess', -110, 8, -18);
    origColor['mess'] = 0xe8e0d4;

    // UT — Utility Block
    reg('utility', 'Utility Block', 'infrastructure',
        'Campus utility services — power, water treatment, maintenance.',
        ['Utility', 'Services']);
    box('utility', -75, -41, 6, 5, 5, MAT.concrete);
    addLabel('utility', '🔧 Utility Block', -75, 8, -41);
    origColor['utility'] = 0xe8e0d4;

    // MC — Medical Centre
    reg('medical', 'Medical Centre', 'facility',
        'Campus health centre — primary healthcare, first aid, medical assistance.',
        ['Medical', 'Health', 'Clinic']);
    box('medical', -75, -33, 8, 6, 6, MAT.concreteW);
    addLabel('medical', '🏥 Medical Centre', -75, 9, -33);
    origColor['medical'] = 0xf0ece6;

    // H6 — Hostel 6
    reg('hostel_6', 'Raavi Hostel', 'hostel',
        'Raavi Hostel — student hostel south of the utility and medical blocks.',
        ['Hostel', 'Residential']);
    createHostelBlock('hostel_6', -72, -15, 15, 10, 10, '🏠 Raavi Hostel');
    origColor['hostel_6'] = 0xd4c4a8;

    // Workshop
    reg('workshop', 'Workshop', 'facility',
        'Fabrication and machining workshop for research and academic projects.',
        ['Workshop', 'Fabrication', 'Machining']);
    box('workshop', -42, -15, 12, 8, 6, MAT.brick);
    addLabel('workshop', '🔧 Workshop', -42, 9, -15);
    origColor['workshop'] = 0xc4956a;

    // Cafeteria (below Workshop)
    reg('cafeteria', 'Cafeteria', 'dining',
        'Campus cafeteria — snacks, beverages, casual dining.',
        ['Cafeteria', 'Food', 'Snacks']);
    buildMessComplex('cafeteria', -42, 3);
    addLabel('cafeteria', '☕ Cafeteria', -42, 10, 3);
    origColor['cafeteria'] = 0xa07050;

    // LHC — Lecture Hall Complex
    reg('lhc', 'Lecture Hall Complex', 'academic',
        'Multiple tiered auditoriums for classes, seminars, and workshops.',
        ['Lectures', 'Seminars', 'Auditorium']);
    buildLHC('lhc', -30, -36);
    origColor['lhc'] = 0xe8e0d4;

    // A — Auditorium
    reg('auditorium', 'Auditorium', 'admin',
        'Large auditorium for convocations, Zeitgeist, Advitiya, and major events.',
        ['Auditorium', 'Events', 'Convocation']);
    buildAuditoriumStructure('auditorium', -2, -38);
    origColor['auditorium'] = 0xe8e0d4;

    // Lib — Library
    reg('library', 'Central Library', 'facility',
        'State-of-the-art library with digital & physical collections, reading rooms, e-resources.',
        ['Library', 'Books', 'E-Resources']);
    buildLibraryStructure('library', -2, -27);
    origColor['library'] = 0x9999a2;

    // Visiting Faculty (distinctive courtyard building)
    reg('visiting_faculty', 'Visiting Faculty Block', 'residential',
        'Square courtyard building with tensile cone roof — short-term accommodation for visiting professors and researchers.',
        ['Visiting', 'Faculty', 'Accommodation']);
    createVisitingFacultyBuilding(25, -25);
    origColor['visiting_faculty'] = 0xd4c4a8;

    // =====================================================================
    // SPORTS ZONE — VG, BG, FG, CG  (south campus, z ≈ +50 to +90)
    // =====================================================================

    // VG — Volleyball Ground
    reg('volleyball', 'Volleyball Ground', 'sports',
        'Outdoor volleyball court.',
        ['Volleyball', 'Sports']);
    ground(-48, 67, 8, 14, MAT.sand);
    // Court lines
    box(null, -48, 67, 7.5, 13.5, 0.02, MAT.white, false);
    const vgGeo = new THREE.PlaneGeometry(8, 14);
    const vgMesh = new THREE.Mesh(vgGeo, MAT.field);
    vgMesh.rotation.x = -Math.PI / 2;
    vgMesh.position.set(-48, 0.08, 67);
    vgMesh.receiveShadow = true;
    scene.add(vgMesh);
    vgMesh.userData.id = 'volleyball';
    allMeshes.push(vgMesh);
    meshById['volleyball'] = [vgMesh];
    origColor['volleyball'] = 0x5da84e;
    addLabel('volleyball', '🏐 VG', -48, 3, 67);

    // BG — Basketball Ground
    reg('basketball', 'Basketball Ground', 'sports',
        'Outdoor basketball court.',
        ['Basketball', 'Sports']);
    ground(-34, 70, 12, 16, MAT.sand);
    box(null, -34, 70, 11.5, 15.5, 0.02, MAT.white, false);
    const bgGeo = new THREE.PlaneGeometry(12, 16);
    const bgMesh = new THREE.Mesh(bgGeo, MAT.field);
    bgMesh.rotation.x = -Math.PI / 2;
    bgMesh.position.set(-34, 0.08, 70);
    bgMesh.receiveShadow = true;
    scene.add(bgMesh);
    bgMesh.userData.id = 'basketball';
    allMeshes.push(bgMesh);
    meshById['basketball'] = [bgMesh];
    origColor['basketball'] = 0x5da84e;
    addLabel('basketball', '🏀 BG', -34, 3, 70);

    // FG — Football Ground
    reg('football', 'Football Ground', 'sports',
        'Standard football field for inter-IIT and intra-college matches.',
        ['Football', 'Soccer']);
    ground(45, 82, 24, 16, MAT.field);
    box(null, 33, 82, 0.3, 16, 3, MAT.white, false);   // left goal
    box(null, 57, 82, 0.3, 16, 3, MAT.white, false);   // right goal
    const fgGeo = new THREE.PlaneGeometry(24, 16);
    const fgMesh = new THREE.Mesh(fgGeo, MAT.grassLight);
    fgMesh.rotation.x = -Math.PI / 2;
    fgMesh.position.set(45, 0.08, 82);
    fgMesh.receiveShadow = true;
    scene.add(fgMesh);
    fgMesh.userData.id = 'football';
    allMeshes.push(fgMesh);
    meshById['football'] = [fgMesh];
    origColor['football'] = 0x6aaf5e;
    addLabel('football', '⚽ FG', 45, 4, 82);

    // CG — Cricket Ground
    reg('cricket', 'Cricket Ground', 'sports',
        'Full-size cricket ground with pitch and boundary markings.',
        ['Cricket', 'Sports']);
    const cricketGeo = new THREE.CircleGeometry(14, 32);
    const cricketMesh = new THREE.Mesh(cricketGeo, MAT.field);
    cricketMesh.rotation.x = -Math.PI / 2;
    cricketMesh.position.set(45, 0.08, 120);
    cricketMesh.receiveShadow = true;
    cricketMesh.userData.id = 'cricket';
    scene.add(cricketMesh);
    allMeshes.push(cricketMesh);
    meshById['cricket'] = [cricketMesh];
    origColor['cricket'] = 0x5da84e;
    box(null, 45, 120, 1.5, 8, 0.05, MAT.sand, false); // pitch strip
    addLabel('cricket', '🏏 CG', 45, 4, 120);

    // =====================================================================
    // BOUNDARY WALLS
    // =====================================================================
    reg('boundary', 'Campus Boundary Wall', 'infrastructure',
        'Perimeter boundary wall of the 525-acre permanent campus.',
        ['Boundary', 'Wall', 'Perimeter']);
    meshById['boundary'] = [];
    [wall(-200, -140, 200, -140, 2.5, 0.4),  // North wall
    wall(-200, 150, 200, 150, 2.5, 0.4),    // South wall
    wall(-200, -140, -200, 150, 2.5, 0.4),  // West wall
    wall(200, -140, 200, 150, 2.5, 0.4)     // East wall
    ].forEach(m => {
        m.userData.id = 'boundary';
        allMeshes.push(m);
        meshById['boundary'].push(m);
    });
    origColor['boundary'] = 0xe8e0d4;

    // =====================================================================
    // COMMENTED-OUT STRUCTURES — may be re-enabled later
    // =====================================================================
    /*
    // --- Academic Row (z ≈ 0) --- named blocks along SROW

    reg('visvesvaraya', 'M. Visvesvaraya Block', 'academic', '...', ['Mechanical']);
    box('visvesvaraya', 31, 0, 16, 8, 12, MAT.academicB);
    addLabel('visvesvaraya', '⚙️ Visvesvaraya Block', 31, 16, 0);
    origColor['visvesvaraya'] = 0xd8cfc0;


    reg('khorana', 'Har Gobind Khorana Block', 'academic', '...', ['Biomedical']);
    box('khorana', 77, 0, 12, 8, 12, MAT.academicB);
    addLabel('khorana', '🧬 Khorana Block', 77, 16, 0);
    origColor['khorana'] = 0xd8cfc0;

    // --- Labs row (z ≈ 14) ---
    reg('cse', 'CSE Department', 'academic', '...', ['CSE']);
    box('cse', -8, 14, 12, 6, 11, MAT.academic);
    reg('ee_labs', 'EE Research Labs', 'academic', '...', ['Electrical']);
    box('ee_labs', 63, 14, 10, 6, 10, MAT.academicB);
    reg('mech_labs', 'ME Research Labs', 'academic', '...', ['Mechanical']);
    box('mech_labs', 77, 14, 10, 6, 10, MAT.academic);
    reg('biotech', 'Biotech Lab', 'academic', '...', ['Biotech']);
    box('biotech', 12, 14, 8, 6, 9, MAT.academicB);

    // --- Faculty Housing ---
    reg('faculty_housing', 'Faculty Housing Complex', 'residential', '...', ['Faculty']);
    box('faculty_housing', 150, 0, 10, 15, 8, MAT.hostel);
    box('faculty_housing', 162, 0, 10, 15, 8, MAT.hostelAlt);
    addLabel('faculty_housing', '🏘️ Faculty Housing', 156, 11, 0);
    origColor['faculty_housing'] = 0xd4c4a8;

    // --- Guest House ---
    reg('guest_house', 'Guest House', 'admin', '...', ['Guest']);
    box('guest_house', 155, -40, 8, 8, 7, MAT.hostel);
    addLabel('guest_house', '🏠 Guest House', 155, 10, -40);
    origColor['guest_house'] = 0xd4c4a8;

    // --- Server Room ---
    reg('server_room', 'Data Center & IT', 'facility', '...', ['IT']);
    box('server_room', 125, 0, 6, 10, 10, MAT.metal);
    addLabel('server_room', '🖥️ Data Center', 125, 13, 0);
    origColor['server_room'] = 0x8899aa;

    // --- Indoor Sports Complex ---
    reg('sports_complex', 'Indoor Sports Complex', 'sports', '...', ['Indoor']);
    box('sports_complex', 1.5, 60, 14, 8, 8, MAT.sports);
    addLabel('sports_complex', '🏀 Sports Complex', 1.5, 11, 60);
    origColor['sports_complex'] = 0xc0a888;

    // --- Other facilities ---
    reg('admin_block', 'Administrative Block', 'admin', '...', ['Admin']);
    box('admin_block', -35, -59, 20, 14, 10, MAT.admin);
    reg('crf', 'Central Research Facility', 'facility', '...', ['Research']);
    box('crf', -3, -58, 16, 6, 10, MAT.concrete);
    reg('awadh', 'AWaDH Innovation Hub', 'facility', '...', ['Innovation']);
    box('awadh', 31, -65, 14, 5, 9, MAT.concrete);
    reg('sac', 'Student Activity Centre', 'facility', '...', ['Students']);
    box('sac', -83, -62, 8, 8, 8, MAT.concrete);
    reg('sbi', 'SBI Bank & Post Office', 'facility', '...', ['Bank']);
    box('sbi', -83, -75, 6, 5, 5, MAT.concrete);
    */
}



// =====================================================================
// 12. COMPASS
// =====================================================================
function buildCompass() {
    const arrowGeo = new THREE.ConeGeometry(1.5, 5, 3);
    const arrow = new THREE.Mesh(arrowGeo, new THREE.MeshStandardMaterial({ color: 0xef4444 }));
    arrow.position.set(195, 5, -85);
    scene.add(arrow);
    addLabel(null, '⬆ N', 195, 10, -85);
}

// =====================================================================
// 13. INTERACTION — Click, Hover, Selection
// =====================================================================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

canvas.addEventListener('pointerdown', (e) => {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(allMeshes, false);
    if (hits.length > 0 && hits[0].object.userData.id) {
        selectBuilding(hits[0].object.userData.id);
    }
});

canvas.addEventListener('pointermove', (e) => {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(allMeshes, false);
    renderer.domElement.style.cursor = hits.length > 0 && hits[0].object.userData.id ? 'pointer' : 'grab';
});

function selectBuilding(id) {
    // Deselect previous
    if (selectedId && meshById[selectedId]) {
        meshById[selectedId].forEach(m => {
            m.material = m.material.clone();
            m.material.color.setHex(origColor[selectedId]);
            m.material.emissive.setHex(0x000000);
        });
    }

    selectedId = id;

    // Highlight new
    if (meshById[id]) {
        meshById[id].forEach(m => {
            m.material = m.material.clone();
            m.material.color.setHex(0xfbbf24);
            m.material.emissive.setHex(0x443300);
        });
    }

    // Fly camera — use world position (handles grouped/scaled meshes)
    const meshes = meshById[id];
    if (meshes && meshes.length > 0) {
        const bbox = new THREE.Box3();
        meshes.forEach(m => bbox.expandByObject(m));
        const center = new THREE.Vector3();
        bbox.getCenter(center);
        animateCamera(
            new THREE.Vector3(center.x + 25, center.y + 30, center.z + 30),
            center
        );
    }

    // Show info
    showInfo(id);
    document.querySelectorAll('.bl-item').forEach(el => el.classList.toggle('active', el.dataset.id === id));
}

function animateCamera(toPos, toLook) {
    const startPos = camera.position.clone();
    const startTarget = controls.target.clone();
    const dur = 800, t0 = performance.now();
    function step(now) {
        const t = Math.min((now - t0) / dur, 1);
        const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        camera.position.lerpVectors(startPos, toPos, ease);
        controls.target.lerpVectors(startTarget, toLook, ease);
        controls.update();
        if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

// =====================================================================
// 14. INFO PANEL
// =====================================================================
function showInfo(id) {
    const b = CAMPUS_DATA.find(b => b.id === id);
    if (!b) return;
    document.getElementById('infoTitle').textContent = b.name;
    document.getElementById('infoDesc').textContent = b.desc;
    const tagsEl = document.getElementById('infoTags');
    tagsEl.innerHTML = '';
    b.tags.forEach(t => {
        const s = document.createElement('span');
        s.className = 'itag';
        s.textContent = t;
        tagsEl.appendChild(s);
    });
    document.getElementById('infoPanel').classList.remove('hidden');
}

document.getElementById('closeInfo').addEventListener('click', () => {
    document.getElementById('infoPanel').classList.add('hidden');
});

// =====================================================================
// 15. SIDEBAR
// =====================================================================
function populateList(filter = '') {
    const el = document.getElementById('buildingList');
    el.innerHTML = '';
    const cats = ['academic', 'hostel', 'admin', 'facility', 'dining', 'sports', 'landmark', 'residential', 'infrastructure'];
    const catNames = {
        academic: '📚 Academic', hostel: '🏠 Hostels', admin: '🏛️ Admin',
        facility: '🔧 Facilities', dining: '🍽️ Dining', sports: '⚽ Sports',
        landmark: '🗿 Landmarks', residential: '🏘️ Residential', infrastructure: '⚙️ Infrastructure',
    };
    const q = filter.toLowerCase();
    const filtered = CAMPUS_DATA.filter(b =>
        b.name.toLowerCase().includes(q) || b.cat.includes(q) || b.tags.some(t => t.toLowerCase().includes(q))
    );
    cats.forEach(cat => {
        const items = filtered.filter(b => b.cat === cat);
        if (!items.length) return;
        const hdr = document.createElement('div');
        hdr.className = 'bl-cat';
        hdr.textContent = catNames[cat] || cat;
        el.appendChild(hdr);
        items.forEach(b => {
            const row = document.createElement('div');
            row.className = 'bl-item';
            row.dataset.id = b.id;
            row.innerHTML = `<div class="bl-dot" style="background:${CAT_COLORS[b.cat] || '#888'}"></div>
                <div><div class="bl-name">${b.name}</div><div class="bl-sub">${b.tags.slice(0, 2).join(' · ')}</div></div>`;
            row.addEventListener('click', () => selectBuilding(b.id));
            el.appendChild(row);
        });
    });
}

document.getElementById('searchBox').addEventListener('input', e => populateList(e.target.value));

// =====================================================================
// 16. HEADER BUTTONS
// =====================================================================

// Sidebar toggle
document.getElementById('btnSidebar').addEventListener('click', () => {
    document.getElementById('sidePanel').classList.toggle('collapsed');
});

document.getElementById('btnReset').addEventListener('click', () => {
    if (selectedId && meshById[selectedId]) {
        meshById[selectedId].forEach(m => {
            m.material = m.material.clone();
            m.material.color.setHex(origColor[selectedId]);
            m.material.emissive.setHex(0x000000);
        });
        selectedId = null;
    }
    document.getElementById('infoPanel').classList.add('hidden');
    document.querySelectorAll('.bl-item').forEach(el => el.classList.remove('active'));
    animateCamera(new THREE.Vector3(0, 160, 180), new THREE.Vector3(0, 0, 0));
});

document.getElementById('btnTop').addEventListener('click', () => {
    animateCamera(new THREE.Vector3(0, 250, 1), new THREE.Vector3(0, 0, 0));
});

const btnLocate = document.getElementById('btnLocate');
if (btnLocate) {
    btnLocate.addEventListener('click', () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        btnLocate.textContent = '📍 Locating...';
        navigator.geolocation.getCurrentPosition(
            (position) => {
                btnLocate.textContent = '📍 Locate Me';
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                
                const worldPos = geoToWorld(lon, lat);
                
                let marker = scene.getObjectByName('userMarker');
                if (!marker) {
                    const mkg = new THREE.SphereGeometry(1.5, 16, 16);
                    const mkm = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                    marker = new THREE.Mesh(mkg, mkm);
                    marker.name = 'userMarker';
                    scene.add(marker);
                }
                marker.position.set(worldPos.x, 2, worldPos.z);
                
                animateCamera(new THREE.Vector3(worldPos.x, 40, worldPos.z + 40), new THREE.Vector3(worldPos.x, 0, worldPos.z));
            },
            (error) => {
                btnLocate.textContent = '📍 Locate Me';
                alert('Unable to retrieve your location');
            }
        );
    });
}

document.getElementById('btnLabels').addEventListener('click', function () {
    labelsVisible = !labelsVisible;
    this.classList.toggle('active', labelsVisible);
    Object.values(labelById).forEach(l => { l.visible = labelsVisible; });
});

document.getElementById('btnWire').addEventListener('click', function () {
    const active = this.classList.toggle('active');
    Object.values(meshById).forEach(arr => arr.forEach(m => {
        m.material = m.material.clone();
        m.material.wireframe = active;
    }));
});

// =====================================================================
// 17. RESIZE
// =====================================================================
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
});

// =====================================================================
// 18. ANIMATION LOOP
// =====================================================================
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}

// =====================================================================
// 19. INIT
// =====================================================================
buildTerrain();
buildRoads();
buildAllBuildings();
buildCompass();
populateList();
animate();

// Hide loader
setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) { loader.classList.add('gone'); setTimeout(() => loader.remove(), 500); }
}, 800);

console.log(`✅ IIT Ropar 3D Campus: ${CAMPUS_DATA.length} buildings, fully hardcoded.`);
