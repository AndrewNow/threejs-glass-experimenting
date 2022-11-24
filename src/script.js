import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

/**
 * ════════════════════════════════════
 *             Base
 * ════════════════════════════════════
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color("#b5b5b5");

/**
 * ════════════════════════════════════
 *             Sizes
 * ════════════════════════════════════
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * ════════════════════════════════════
 *             Textures
 * ════════════════════════════════════
 */

scene.background = new THREE.CubeTextureLoader()
  .setPath("textures/environmentmaps/3/")
  .load(["px.png", "nx.png", "py.png", "ny.png", "pz.png", "nz.png"]);

const options = {
  enableSwoopingCamera: false,
  enableRotation: true,
  transmission: 1,
  thickness: 2,
  roughness: 0.13,
  envMapIntensity: 1,
  clearcoat: 0.45,
  clearcoatRoughness: 0.25,
  normalScale: .15,
  clearcoatNormalScale: 0.2,
  normalRepeat: 3,
  bloomThreshold: 0.85,
  bloomStrength: 0.5,
  bloomRadius: 0.33,
};

const hdrEquirect = new RGBELoader().load(
  "textures/matcaps/boiler_room_4k.hdr",
  () => {
    hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;
  }
);
// scene.background = new RGBELoader().load("textures/matcaps/boiler_room_4k.hdr");







const normalMapTexture = new THREE.TextureLoader().load(
  "textures/matcaps/normal.jpg"
);

normalMapTexture.wrapS = THREE.RepeatWrapping;
normalMapTexture.wrapT = THREE.RepeatWrapping;
normalMapTexture.repeat.set(options.normalRepeat, options.normalRepeat);

const material = new THREE.MeshPhysicalMaterial({
  transmission: options.transmission,
  thickness: options.thickness,
  roughness: options.roughness,
  envMap: hdrEquirect,
  envMapIntensity: options.envMapIntensity,
  clearcoat: options.clearcoat,
  clearcoatRoughness: options.clearcoatRoughness,
  normalScale: new THREE.Vector2(options.normalScale),
  normalMap: normalMapTexture,
  clearcoatNormalMap: normalMapTexture,
  clearcoatNormalScale: new THREE.Vector2(options.clearcoatNormalScale),
});

const objLoader = new OBJLoader();

const meshes = [];

meshes.forEach((mesh) => {
  scene.add(mesh);
});

objLoader.load("obj/Official_Firefly_1.obj", function (object) {
  console.log(object);

  object.traverse(function (child) {
    if (child instanceof THREE.Mesh) {
      child.material = material;
    }
  });
  object.scale.set(0.35, 0.35, 0.35);
  meshes.push(object);
  scene.add(object);
});

// const AxesHelper = new THREE.AxesHelper();
// scene.add(AxesHelper);

/**
 * ════════════════════════════════════
 *             background
 * ════════════════════════════════════
 */

const bgTexture = new THREE.TextureLoader().load(
  "textures/matcaps/underwater.png"
);
const bgGeo = new THREE.PlaneGeometry(5, 5);

const bgMaterial = new THREE.MeshBasicMaterial({ map: bgTexture });

const bgMesh = new THREE.Mesh(bgGeo, bgMaterial);
bgMesh.position.set(0, 0, -1);
// scene.add(bgMesh);

/**
 * ════════════════════════════════════
 *             Light
 * ════════════════════════════════════
 */

/**
 * ════════════════════════════════════
 *             GUI
 * ════════════════════════════════════
 */

gui.add(options, "enableSwoopingCamera").onChange((val) => {
  controls.enabled = !val;
  controls.reset();
});

gui.add(options, "enableRotation").onChange(() => {
  meshes.forEach((mesh) => mesh.rotation.set(0, 0, 0));
});

gui.add(options, "transmission", 0, 1, 0.01).onChange((val) => {
  material.transmission = val;
});

gui.add(options, "thickness", 0, 5, 0.1).onChange((val) => {
  material.thickness = val;
});

gui.add(options, "roughness", 0, 1, 0.01).onChange((val) => {
  material.roughness = val;
});

gui.add(options, "envMapIntensity", 0, 3, 0.1).onChange((val) => {
  material.envMapIntensity = val;
});

gui.add(options, "clearcoat", 0, 1, 0.01).onChange((val) => {
  material.clearcoat = val;
});

gui.add(options, "clearcoatRoughness", 0, 1, 0.01).onChange((val) => {
  material.clearcoatRoughness = val;
});

gui.add(options, "normalScale", 0, 5, 0.01).onChange((val) => {
  material.normalScale.set(val, val);
});

gui.add(options, "clearcoatNormalScale", 0, 5, 0.01).onChange((val) => {
  material.clearcoatNormalScale.set(val, val);
});

gui.add(options, "normalRepeat", 1, 4, 1).onChange((val) => {
  normalMapTexture.repeat.set(val, val);
});

// const postprocessing = gui.addFolder("Post Processing");
// postprocessing.open();

// postprocessing.add(options, "bloomThreshold", 0, 1, 0.01).onChange((val) => {
//   bloomPass.threshold = val;
// });

// postprocessing.add(options, "bloomStrength", 0, 5, 0.01).onChange((val) => {
//   bloomPass.strength = val;
// });

// postprocessing.add(options, "bloomRadius", 0, 1, 0.01).onChange((val) => {
//   bloomPass.radius = val;
// });
/**
 * ════════════════════════════════════
 *             Camera
 * ════════════════════════════════════
 */

// Base camera
const camera = new THREE.PerspectiveCamera(
  85,
  sizes.width / sizes.height,
  0.1,
  1000
);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 2.25;
scene.add(camera);

// const helper = new THREE.CameraHelper(camera);
// scene.add(helper);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enabled = true;
controls.enableDamping = true;

/**
 * ════════════════════════════════════
 *             Renderer
 * ════════════════════════════════════
 */

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * ════════════════════════════════════
 *             Animate
 * ════════════════════════════════════
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  if (options.enableRotation) {
    meshes.forEach((mesh) => {
      mesh.rotation.y = elapsedTime * Math.PI * 2 * 0.15;
    });
  }

  // Update controls
  controls.update();

  // Render
  renderer.setClearColor(0x1f1e1c, 1);
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
