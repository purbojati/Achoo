import * as THREE from 'three';

export interface FoodModelOptions {
  scale?: number;
}

export function createFoodModel(options: FoodModelOptions = {}): THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]> {
  const { scale = 1 } = options;

  // Create a two-colored tablet/pill
  // Use a Group to hold two half-capsules with different colors
  const group = new THREE.Group();

  // Left half - red/pink color
  const leftGeometry = new THREE.SphereGeometry(0.08, 8, 8, 0, Math.PI);
  leftGeometry.rotateY(Math.PI / 2);
  leftGeometry.translate(-0.04, 0, 0);
  const leftMaterial = new THREE.MeshToonMaterial({
    color: 0xe74c3c, // Red
  });
  const leftHalf = new THREE.Mesh(leftGeometry, leftMaterial);
  group.add(leftHalf);

  // Right half - white/cream color
  const rightGeometry = new THREE.SphereGeometry(0.08, 8, 8, Math.PI, Math.PI);
  rightGeometry.rotateY(Math.PI / 2);
  rightGeometry.translate(0.04, 0, 0);
  const rightMaterial = new THREE.MeshToonMaterial({
    color: 0xf5f5dc, // Cream white
  });
  const rightHalf = new THREE.Mesh(rightGeometry, rightMaterial);
  group.add(rightHalf);

  // Middle cylinder to connect the two halves
  const middleGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.08, 8);
  middleGeometry.rotateZ(Math.PI / 2);
  
  // Use both materials for the middle (split appearance)
  const middleMaterial = new THREE.MeshToonMaterial({
    color: 0xf0e0d0, // Blend color
  });
  const middle = new THREE.Mesh(middleGeometry, middleMaterial);
  group.add(middle);

  // Apply scale to group
  group.scale.setScalar(scale);

  // Return the first mesh but attach the group structure
  // We need to return a single mesh-like object, so merge geometries
  const mergedGeometry = new THREE.CapsuleGeometry(0.08, 0.08, 4, 8);
  mergedGeometry.rotateZ(Math.PI / 2);
  
  // Create gradient-like effect using vertex colors
  const positions = mergedGeometry.attributes.position;
  const colors = new Float32Array(positions.count * 3);
  
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    // Red on left (negative x), cream on right (positive x)
    if (x < 0) {
      colors[i * 3] = 0.91;     // R
      colors[i * 3 + 1] = 0.30; // G
      colors[i * 3 + 2] = 0.24; // B (red: #e74c3c)
    } else {
      colors[i * 3] = 0.96;     // R
      colors[i * 3 + 1] = 0.96; // G
      colors[i * 3 + 2] = 0.86; // B (cream: #f5f5dc)
    }
  }
  
  mergedGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  
  const material = new THREE.MeshToonMaterial({
    vertexColors: true,
  });

  const food = new THREE.Mesh(mergedGeometry, material);
  food.castShadow = true;
  food.scale.setScalar(scale);

  return food;
}

// Animation helper for food
export function animateFood(food: THREE.Mesh, time: number): void {
  // Tumbling rotation while sinking
  food.rotation.x = time * 2;
  food.rotation.z = time * 1.5;
}
