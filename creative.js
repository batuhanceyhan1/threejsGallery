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
let skySphereMesh = new THREE.Mesh(skySphereGeometry,skySphereMaterial);

//Renderer Setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor("rgb(237, 196, 135)");
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const fogColor = new THREE.Color("rgb(237, 196, 135)");

document.body.appendChild(renderer.domElement);
//document.getElementById("heading").appendChild(renderer.domElement);

// Scene Setup
const scene = new THREE.Scene();
const near = 5;
const far = 1500;
scene.fog = new THREE.Fog(fogColor, near, far);
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.set(10, 5, 0.1);

//Composer Setup
const renderPass = new RenderPass(scene, camera);
const effectComposer = new EffectComposer(renderer);
effectComposer.addPass(renderPass);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.05, 0.1, 0.1);
effectComposer.addPass(bloomPass);

const outlinepass_ = new OutlinePass(
  new THREE.Vector2(window.innerWidth, window.innerHeight), //resolution parameter
  scene,
  camera
);

effectComposer.addPass(outlinepass_);

const ambLight = new THREE.AmbientLight('237, 196, 135', 2);
ambLight.position.set(3.5, 4, 1);
scene.add(ambLight);
scene.add(skySphereMesh);
const dirLight = new THREE.DirectionalLight('rgb(209, 197, 171)', 3, 5, 1.5);
dirLight.position.set(3, 4, 1.5);
dirLight.castShadow = false;
dirLight.shadow.bias = -0.01;
scene.add(dirLight);

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = true;
controls.minDistance = 50;
controls.maxDistance = 70;
controls.minPolarAngle = 1;
controls.maxPolarAngle = 1.5;

controls.autoRotate = false;
controls.target = new THREE.Vector3(100, 1, 0);
controls.enabled = true;
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
      if (child.name === "Spotlight_") {
        spotlightMesh = child;
        spotlightMesh.material.emissive = new THREE.Color('black');
      }
      else if (child.name === "Macbook") {
        notebookMesh = child;
        notebookMesh.material.emissive = new THREE.Color('black');
        notebookMesh.material.color = new THREE.Color('black');
      }
      else if (child.name === "resim_") {
        photo = child;
        photo.material.emissive = new THREE.Color('black');
      }
      else if (child.name === "CeilLight_") {
        ceilLight = child;
      }
    }
  });

  mesh.position.set(0, 0, 0);
  scene.add(mesh);
  //LensFlare Texture load after model imported
  //lensFlare.addElement(new LensflareElement(textureFlare0, 512, 0));
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

const clock = new THREE.Clock();
function animate() {

  requestAnimationFrame(animate);


  if (mixer != null) {
    mixer.update(clock.getDelta());
  }
  controls.update();
  effectComposer.render(scene, camera);

}
animate();
