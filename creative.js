import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from './node_modules/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './node_modules/three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from './node_modules/three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { Lensflare, LensflareElement } from './node_modules/three/examples/jsm/objects/Lensflare.js';
import { OutlinePass } from './node_modules/three/examples/jsm/postprocessing/OutlinePass.js';

//Variables
const raycaster = new THREE.Raycaster();

let mixer;
let audioLoader = new THREE.AudioLoader();
let listener = new THREE.AudioListener();
let developianSoundobject;
let GallerySound;
let mesh;


//Renderer Setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor("rgb(0, 0, 0)");
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const fogColor = new THREE.Color("rgb(40, 20,0)");

//document.body.appendChild(renderer.domElement);
document.getElementById("heading").appendChild(renderer.domElement);

// Scene Setup
const scene = new THREE.Scene();
const near = 5;
const far = 25;
scene.fog = new THREE.Fog(fogColor, near, far);
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.set(10, 5, 0.1);

//Composer Setup
const renderPass = new RenderPass(scene, camera);
const effectComposer = new EffectComposer(renderer);
effectComposer.addPass(renderPass);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.34, 1, 0.1);
effectComposer.addPass(bloomPass);
const outlinepass_ = new OutlinePass(
  new THREE.Vector2(window.innerWidth, window.innerHeight), //resolution parameter
  scene,
  camera
);
effectComposer.addPass(outlinepass_);
const ambientLightOffice = new THREE.AmbientLight('white', 1);
ambientLightOffice.position.set(3.5, 4, 1);
scene.add(ambientLightOffice);

const pointLightOffice = new THREE.PointLight('rgb(209, 197, 171)', 20, 10, 1.5);
pointLightOffice.position.set(3, 4, 1.5);
pointLightOffice.castShadow = false;
pointLightOffice.shadow.bias = -0.01;
scene.add(pointLightOffice);

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 1.5;
controls.maxDistance = 15;
controls.minPolarAngle = 1;
controls.maxPolarAngle = 1.5;
controls.minAzimuthAngle = -Math.PI / 360; // -45 derece
controls.maxAzimuthAngle = Math.PI / 1.8; // 45 derece
controls.autoRotate = false;
controls.target = new THREE.Vector3(0, 1, 0);
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
