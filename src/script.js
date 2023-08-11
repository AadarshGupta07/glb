import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Pane } from 'tweakpane';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'

import PackAnalyzer from './PackAnalyzer.js'

/**
 * Base
 */
// GLTF loader
const gltfLoader = new GLTFLoader()

// Debug
const pane = new Pane();
pane.registerPlugin(EssentialsPlugin);

const fpsGraph = pane.addBlade({
    view: 'fpsgraph',
    label: 'fpsgraph',
})

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/***
 *  Lights
 */
// Ambient Light
const light = new THREE.AmbientLight(0x404040); // soft white light
scene.add(light);

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
camera.position.x = 0
camera.position.y = 0
camera.position.z = 1
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
// controls.dampingFactor = 0.04
// controls.minDistance = 5
// controls.maxDistance = 60
// controls.enableRotate = true
// controls.enableZoom = true
// controls.maxPolarAngle = Math.PI /2.5



/**
 * Texture Loader
 */
// const textureLoader = new THREE.TextureLoader()
// const texture = textureLoader.load('any.jpg')
// texture.flipY = false
// texture.encoding = THREE.sRGBEncoding


/**
 * Cube
 */

const utilsObj = { value: 0 };


const material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
        uTime: { value: 0 },
        //  uTexture: { value: texture},
        progress: { value: utilsObj.value },
    },
    side: THREE.DoubleSide,
    // wireframe: true,
    transparent: true
})

let geometry = new THREE.BoxGeometry(1, 1, 1)

const cube = new THREE.Mesh(geometry, material)
// scene.add(cube)




/**
 *  try 2
 */

// let model;
// let meshes = []
// let totalMeshesCount = null
// let positionObjectsArray = []

// let allYPosArray = []

// gltfLoader.load('newOne.glb', (gltf) => {
//     model = gltf.scene;

//     model.scale.set(2, 2, 2)
//     model.traverse((object) => {
//         if (object.isMesh) {

//             const cylinderCellRegex = /^Cylinder/;

//             if (object.name.match(cylinderCellRegex)) {

//                 let { x, y, z } = object.position

//                 positionObjectsArray.push({ x, y, z })
//                 meshes.push(object)
//                 object.material = new THREE.MeshNormalMaterial({ transparent: true, opacity: 1 });
//             }
//         }
//     });

//     // now have access to all meshes data
//     if (totalMeshesCount === null) {

//         totalMeshesCount = meshes.length;
//         console.log('total meshes in the scene', totalMeshesCount);


//         positionObjectsArray.forEach((posObj) => {
//             allYPosArray.push(posObj.y)
//         })
//         console.log(positionObjectsArray, 'position Objects Array');



//         const result = separateCommonYposValuesAsLayers(allYPosArray);

//         console.log('total layers', result.length);

//         let cylinderA = meshes[0]
//         let cylinderB = meshes[1]

//         let props = calculateCylinderProperties(cylinderA, cylinderB)
//         console.log(props, 'props');

//         // try
//         const data = positionObjectsArray
//         // Iterate through the data array and round x, y, and z values of each object
//         for (const obj of data) {
//             obj.x = roundToTwoDecimalPlaces(obj.x);
//             obj.y = roundToTwoDecimalPlaces(obj.y);
//             obj.z = roundToTwoDecimalPlaces(obj.z);
//         }

//         // Create a Map to group objects by y-coordinate
//         const groupedByY = new Map();

//         // Iterate through the data array and group objects by their y-coordinate
//         for (const obj of data) {
//             const { y } = obj;
//             if (groupedByY.has(y)) {
//                 groupedByY.get(y).push(obj);
//             } else {
//                 groupedByY.set(y, [obj]);
//             }
//         }

//         // Convert the Map values back to an array of arrays (grouped objects)
//         const groupedArrays = Array.from(groupedByY.values());

//         console.log(groupedArrays);



//         // Function to count the number of unique values in an array
//         function countUniqueValues(arr) {
//             const uniqueValues = new Set(arr);
//             return uniqueValues.size;
//         }

//         // Loop through each layer (group) in groupedArrays and calculate unique x and z values
//         for (let i = 0; i < groupedArrays.length; i++) {
//             const layer = groupedArrays[i];

//             const uniqueXValues = countUniqueValues(layer.map(obj => obj.x));
//             const uniqueZValues = countUniqueValues(layer.map(obj => obj.z));

//             console.log(`Layer ${i + 1} - Unique X Values:`, uniqueXValues, `, Unique Z Values:`, uniqueZValues);
//         }

//     }

//     scene.add(model);

// });



// function roundToTwoDecimalPlaces(value) {
//     return Math.round(value * 100) / 100;
// }


// function separateCommonYposValuesAsLayers(arr) {
//     const layers = {};

//     for (let i = 0; i < arr.length; i++) {
//         const value = roundToTwoDecimalPlaces(arr[i]);

//         if (layers.hasOwnProperty(value)) {
//             layers[value].push(arr[i]);
//         } else {
//             layers[value] = [arr[i]];
//         }
//     }

//     // In JavaScript, Object.values() is a built-in method that is used to extract the values of an object and return them as an array.Convert the 'layers' object into an array of arrays
//     const result = Object.values(layers);
//     return result;
// }

// function calculateCylinderProperties(cylinder1, cylinder2) {
//     // Assuming cylinder1 and cylinder2 are instances of THREE.Mesh with custom 3D model geometries
  
//     // Calculate the height of the cylinder (use cylinder1 or cylinder2 as both have the same height)
//     const box1 = new THREE.Box3().setFromObject(cylinder1);
//     const height = box1.max.y - box1.min.y;
  
//     // Calculate the radius of the cylinder (use cylinder1 or cylinder2 as both have the same radius)
//     const diameterX = box1.max.x - box1.min.x;
//     const diameterZ = box1.max.z - box1.min.z;
//     const radius = Math.max(diameterX, diameterZ) / 2;
  
//     // Calculate the gap between the cylinders (discard the radius of both cylinders)
//     const box2 = new THREE.Box3().setFromObject(cylinder2);
//     const distanceBetweenCenters = box1.getCenter(new THREE.Vector3()).distanceTo(box2.getCenter(new THREE.Vector3()));
//     const gap = distanceBetweenCenters - radius * 2;
  
//     return {
//       height,
//       radius,
//       gap,
//     };
//   }


//

const filePath = 'BatteryPack2.glb';
const glbModelAnalyzer = new PackAnalyzer(filePath, scene);
// console.log(glbModelAnalyzer.packDetails)

console.log(
    glbModelAnalyzer.processMeshes()
)


/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor(0x18142c, 1);


/**
 *  Gui 
 */
const params = { color: '#ffffff' };

// add a folder for the scene background color
const folder = pane.addFolder({ title: 'Background Color' });

folder.addInput(params, 'color').on('change', () => {
    const color = new THREE.Color(params.color);
    scene.background = color;
});

// For Tweaking Numbers

// add a number input to the pane
const numberInput = pane.addInput(utilsObj, 'value', {
    min: 0,
    max: 1,
    step: 0.001,
});

// update the number value when the input value changes
numberInput.on('change', () => {
    console.log(`Number value updated to ${utilsObj.value}`);
});



/**
 * Animate
 */
const clock = new THREE.Clock()
let lastElapsedTime = 0

const tick = () => {
    fpsGraph.begin()

    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - lastElapsedTime
    lastElapsedTime = elapsedTime

    // if(model){

    //     // group.rotation.y = elapsedTime 

    // }
    if(glbModelAnalyzer){
    // console.log(glbModelAnalyzer.packDetails)
}

    material.uniforms.uTime.value = elapsedTime


    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    fpsGraph.end()

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()