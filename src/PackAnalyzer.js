import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export default class PackAnalyzer {
  constructor(filePath, scene) {
    this.filePath = filePath;
    this.scene = scene;
    this.model = null;
    this.meshes = [];
    this.totalMeshesCount = null;
    this.positionObjectsArray = [];
    this.allYPosArray = [];
    this.loaded = false;

    // Bind class methods to the instance to maintain correct context
    this.loadModel = this.loadModel.bind(this);
    this.processMeshes = this.processMeshes.bind(this);
    this.roundToTwoDecimalPlaces = this.roundToTwoDecimalPlaces.bind(this);
    this.separateCommonYposValuesAsLayers = this.separateCommonYposValuesAsLayers.bind(this);
    this.countUniqueValues = this.countUniqueValues.bind(this);
    this.calculateCylinderProperties = this.calculateCylinderProperties.bind(this);

    // Load the model when the instance is created
    this.packDetails = null
    this.loadModel();

  }

  async loadModel() {
    const gltfLoader = new GLTFLoader();

    await gltfLoader.load(this.filePath, (gltf) => {
      this.model = gltf.scene;
      this.loaded = true;

      this.model.scale.set(2, 2, 2);
      // this.packDetails = this.processMeshes();
      // console.log(this.packDetails);

      // Perform additional analysis or operations here
      // ...

      // Add the model to the provided scene
      this.scene.add(this.model);

      // Call any other methods or perform actions after the model is loaded
      // ...

    });
  }

  processMeshes() {
    if (!this.loaded) {
      console.error("Model not loaded yet!");
      return;
    }

    this.model.traverse((object) => {
      if (object.isMesh) {
        const cylinderCellRegex = /^Boss/;
        if (object.name.match(cylinderCellRegex)) {
          let { x, y, z } = object.position;
          this.positionObjectsArray.push({ x, y, z });
          this.meshes.push(object);
          object.material = new THREE.MeshNormalMaterial({ transparent: true, opacity: 1 });
        }
      }
    });

    this.totalMeshesCount = this.meshes.length;
    // console.log("Total cells in the model:", this.totalMeshesCount);

    this.positionObjectsArray.forEach((posObj) => {
      this.allYPosArray.push(posObj.y);
    });
    // console.log(this.positionObjectsArray, "Position Objects Array");

    const result = this.separateCommonYposValuesAsLayers(this.allYPosArray);
    // console.log("Total layers:", result.length);

    let cylinderA = this.meshes[0];
    let cylinderB = this.meshes[1];
    let props = this.calculateCylinderProperties(cylinderA, cylinderB);
    // console.log('cell height:',props.height, 'cell radius:',props.radius, 'cell gap:',props.gap);

    // Round x, y, and z values of each object in the positionObjectsArray
    for (const obj of this.positionObjectsArray) {
      obj.x = this.roundToTwoDecimalPlaces(obj.x);
      obj.y = this.roundToTwoDecimalPlaces(obj.y);
      obj.z = this.roundToTwoDecimalPlaces(obj.z);
    }

    // Group objects by y-coordinate
    const groupedByY = new Map();
    for (const obj of this.positionObjectsArray) {
      const { y } = obj;
      if (groupedByY.has(y)) {
        groupedByY.get(y).push(obj);
      } else {
        groupedByY.set(y, [obj]);
      }
    }

    // Convert the Map values back to an array of arrays (grouped objects)
    const groupedArrays = Array.from(groupedByY.values());
    // console.log(groupedArrays);

    let uniqueXValues = null
    let uniqueZValues = null

    // Loop through each layer (group) in groupedArrays and calculate unique x and z values
    for (let i = 0; i < groupedArrays.length; i++) {
      const layer = groupedArrays[i];
      uniqueXValues = this.countUniqueValues(layer.map((obj) => obj.x));
      uniqueZValues = this.countUniqueValues(layer.map((obj) => obj.z));
      // console.log(`Layer ${i + 1} - cells in X direction: ${uniqueXValues}, cells in Z direction: ${uniqueZValues}`);
    }

    return {
      'totalMeshesCount': this.totalMeshesCount , 'totalLayers': result.length, 'cellsInX': uniqueXValues, 'cellsInY': uniqueZValues
    }
  }

  roundToTwoDecimalPlaces(value) {
    return Math.round(value * 100) / 100;
  }

  separateCommonYposValuesAsLayers(arr) {
    const layers = {};
    for (let i = 0; i < arr.length; i++) {
      const value = this.roundToTwoDecimalPlaces(arr[i]);
      if (layers.hasOwnProperty(value)) {
        layers[value].push(arr[i]);
      } else {
        layers[value] = [arr[i]];
      }
    }
    // Convert the 'layers' object into an array of arrays
    const result = Object.values(layers);
    return result;
  }

  countUniqueValues(arr) {
    const uniqueValues = new Set(arr);
    return uniqueValues.size;
  }

  calculateCylinderProperties(cylinder1, cylinder2) {
    // Assuming cylinder1 and cylinder2 are instances of THREE.Mesh with custom 3D model geometries
    // Calculate the height of the cylinder (use cylinder1 or cylinder2 as both have the same height)
    const box1 = new THREE.Box3().setFromObject(cylinder1);
    const height = box1.max.y - box1.min.y;
    // Calculate the radius of the cylinder (use cylinder1 or cylinder2 as both have the same radius)
    const diameterX = box1.max.x - box1.min.x;
    const diameterZ = box1.max.z - box1.min.z;
    const radius = Math.max(diameterX, diameterZ) / 2;
    // Calculate the gap between the cylinders (discard the radius of both cylinders)
    const box2 = new THREE.Box3().setFromObject(cylinder2);
    const distanceBetweenCenters = box1.getCenter(new THREE.Vector3()).distanceTo(box2.getCenter(new THREE.Vector3()));
    const gap = distanceBetweenCenters - radius * 2;

    return {
      height,
      radius,
      gap,
    };
  }
}




/// usage 


// const filePath = 'BatteryPack2.glb';
// const glbModelAnalyzer = new PackAnalyzer(filePath, scene);