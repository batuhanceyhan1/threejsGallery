import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from './node_modules/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './node_modules/three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './node_modules/three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { Lensflare, LensflareElement } from './node_modules/three/examples/jsm/objects/Lensflare.js';
import { OutlinePass } from './node_modules/three/examples/jsm/postprocessing/OutlinePass.js';
import { RGBELoader, ThreeMFLoader } from 'three/examples/jsm/Addons.js';

//Variables
const raycaster = new THREE.Raycaster();

const imagepath = './public/textures/golden_bay_2k.hdr'

let mixer;
let audioLoader = new THREE.AudioLoader();
let listener = new THREE.AudioListener();
let developianSoundobject;
let GallerySound;
let mesh;

let hdrTexture = new RGBELoader().load(imagepath);

let skySphereGeometry = new THREE.SphereGeometry(300, 60, 60);
let skySphereMaterial = new THREE.MeshPhongMaterial({
  map: hdrTexture
});

skySphereMaterial.side = THREE.BackSide;
let skySphereMesh = new THREE.Mesh(skySphereGeometry, skySphereMaterial);

//Renderer Setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor("rgb(237, 196, 135)");
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const fogColor = new THREE.Color("rgb(20,20,20)");

document.body.appendChild(renderer.domElement);
//document.getElementById("heading").appendChild(renderer.domElement);

// Scene Setup
const scene = new THREE.Scene();
const near = 5;
const far = 250;
scene.fog = new THREE.Fog(fogColor, near, far);
const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.set(10, 15, 0.1);
camera.rotation.set(-0.3, 0, 0);

//Composer Setup
const renderPass = new RenderPass(scene, camera);
const effectComposer = new EffectComposer(renderer);
effectComposer.addPass(renderPass);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.05, 0.1, 0.1);
effectComposer.addPass(bloomPass);

/*
const outlinepass_ = new OutlinePass(
  new THREE.Vector2(window.innerWidth, window.innerHeight), //resolution parameter
  scene,
  camera
);

effectComposer.addPass(outlinepass_);
*/


// SpotLights Setup

/*
const geometry = new THREE.SphereGeometry(1, 32, 32);
const material = new THREE.MeshBasicMaterial({ color: 0x0077ff });
const soundObject = new THREE.Mesh(geometry, material);
scene.add(soundObject);
soundObject.position.set(1, 25, 100); // x, y, z koordinatlarını belirleyin
*/
const pointLight1 = new THREE.PointLight('rgb(209, 197, 171)', 500, 100, 1.5);
pointLight1.position.set(0, 25, 0);
pointLight1.castShadow = true;
pointLight1.shadow.bias = -0.01;
scene.add(pointLight1);

const pointLight3 = new THREE.PointLight('rgb(209, 197, 171)', 500, 100, 1.5);
pointLight3.position.set(0, 25, 75);
pointLight3.castShadow = true;
pointLight3.shadow.bias = -0.01;
scene.add(pointLight3);


const pointLight5 = new THREE.PointLight('rgb(209, 197, 171)', 500, 100, 1.5);
pointLight5.position.set(0, 25, -50);
pointLight5.castShadow = true;
pointLight5.shadow.bias = -0.01;
scene.add(pointLight5);

const ambLight = new THREE.AmbientLight('white', .5);
ambLight.position.set(3.5, 4, 1);
scene.add(ambLight);
scene.add(skySphereMesh);

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = true;
controls.minDistance = 50;
controls.maxDistance = 70;
controls.minPolarAngle = 1;
controls.maxPolarAngle = 1.5;

controls.autoRotate = false;
//controls.target = new THREE.Vector3(camera.position.x, 1, 0);
controls.enabled = false;
controls.update();
new THREE.Color("rgb(255, 0, 0)");


const loader = new GLTFLoader().setPath('public/models/Scenes/Galeri/');
loader.load('scene.gltf', gltf => {
  mesh = gltf.scene;
  mixer = new THREE.AnimationMixer(mesh);
  //const clips = gltf.animations;
  //const clip = THREE.AnimationClip.findByName(clips, 'catidle');
  //const action = mixer.clipAction(clip);
  //action.play();
  mesh.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  mesh.position.set(0, 0, 0);
  scene.add(mesh);

  document.getElementById('progress-container').style.display = 'none';
}, (xhr) => {
  console.log(`loading ${xhr.loaded / xhr.total * 100}%`);
}, (error) => {
  console.log(`Error: ${error.message}`);
});
//GLTF Load
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

//MouseMove
document.addEventListener('mousemove', onMouseMove);
function onMouseMove(event) {
  const coords = new THREE.Vector2(
    (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
    -((event.clientY / renderer.domElement.clientHeight) * 2 - 1)
  );
  raycaster.setFromCamera(coords, camera);

  const intersections = raycaster.intersectObjects(scene.children, true);
  if (intersections.length > 0) {
    const selectedObject = intersections[0].object;

  }
}

//Audio Loader
window.onload = initializeAudio();
function initializeAudio() {
  listener = new THREE.AudioListener();
  camera.add(listener);

  console.log("spawned");
  const developiansound = new THREE.PositionalAudio(listener);
  const urbansound = new THREE.PositionalAudio(listener);
  const fansound = new THREE.PositionalAudio(listener);
  loadSoundFromPath('./public/sounds/DevelopiaSound.mp3', 0.15, 0.17, developiansound, developianSoundobject);

}


function loadSoundFromPath(path, soundVolume, SoundDistance, mainSound, SoundObject) {
  audioLoader.load(path, (buffer) => {
    mainSound.setBuffer(buffer);
    mainSound.setVolume(soundVolume);
    mainSound.setRefDistance(SoundDistance);
    mainSound.loop = true;
    mainSound.play();
    //SoundObject.add(mainSound);
  });
}

window.addEventListener('wheel', (event) => {


  // Scroll up için deltaY negatif, scroll down için pozitif olur
  const scrollSpeed = 0.001; // Scroll hareketinin hızını ayarlayın
  camera.position.z += event.deltaY * scrollSpeed * 7;
  camera.position.z = Math.round(camera.position.z);
  camera.position.z = THREE.MathUtils.clamp(camera.position.z, -75, 105);
  console.log(camera.position.z + " z pos");

});

const clock = new THREE.Clock();
function animate() {

  requestAnimationFrame(animate);


  if (mixer != null) {
    mixer.update(clock.getDelta());
  }
  //controls.update();
  effectComposer.render(scene, camera);

}
animate();
