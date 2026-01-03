import * as THREE from 'three';

export interface FoodModelOptions {
  scale?: number;
}

export function createFoodModel(options: FoodModelOptions = {}): THREE.Group {
  const { scale = 1 } = options;

  const group = new THREE.Group();

  // Create a two-colored capsule tablet
  // Left half - red
  const leftGeometry = new THREE.SphereGeometry(0.08, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  leftGeometry.rotateZ(-Math.PI / 2);
  leftGeometry.translate(-0.04, 0, 0);
  const leftMaterial = new THREE.MeshToonMaterial({ color: 0xe74c3c });
  const leftCap = new THREE.Mesh(leftGeometry, leftMaterial);
  leftCap.castShadow = true;
  group.add(leftCap);

  // Right half - cream
  const rightGeometry = new THREE.SphereGeometry(0.08, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  rightGeometry.rotateZ(Math.PI / 2);
  rightGeometry.translate(0.04, 0, 0);
  const rightMaterial = new THREE.MeshToonMaterial({ color: 0xf5f5dc });
  const rightCap = new THREE.Mesh(rightGeometry, rightMaterial);
  rightCap.castShadow = true;
  group.add(rightCap);

  // Middle cylinder - split color
  const middleGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.08, 12);
  middleGeometry.rotateZ(Math.PI / 2);
  
  // Use vertex colors to split the cylinder
  const positions = middleGeometry.attributes.position;
  const colors = new Float32Array(positions.count * 3);
  
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    if (x < 0) {
      // Red side
      colors[i * 3] = 0.91;
      colors[i * 3 + 1] = 0.30;
      colors[i * 3 + 2] = 0.24;
    } else {
      // Cream side
      colors[i * 3] = 0.96;
      colors[i * 3 + 1] = 0.96;
      colors[i * 3 + 2] = 0.86;
    }
  }
  middleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  
  const middleMaterial = new THREE.MeshToonMaterial({ vertexColors: true });
  const middle = new THREE.Mesh(middleGeometry, middleMaterial);
  middle.castShadow = true;
  group.add(middle);

  group.scale.setScalar(scale);

  return group;
}

// Animation helper for food
export function animateFood(food: THREE.Group | THREE.Mesh, time: number): void {
  // Tumbling rotation while sinking
  food.rotation.x = time * 2;
  food.rotation.z = time * 1.5;
}
