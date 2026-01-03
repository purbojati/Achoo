import * as THREE from 'three';

export interface EggModelOptions {
  scale?: number;
}

export function createEggModel(options: EggModelOptions = {}): THREE.Group {
  const { scale = 1 } = options;

  const egg = new THREE.Group();

  // Egg body - elongated sphere (oval)
  const eggGeometry = new THREE.SphereGeometry(0.2, 16, 12);
  eggGeometry.scale(1, 1.3, 1);

  // Iridescent/pearlescent material
  const eggMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xfef3c7,
    metalness: 0.1,
    roughness: 0.2,
    transparent: true,
    opacity: 0.9,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    iridescence: 0.8,
    iridescenceIOR: 1.5,
    emissive: 0xfef3c7,
    emissiveIntensity: 0.1,
  });

  const eggMesh = new THREE.Mesh(eggGeometry, eggMaterial);
  eggMesh.castShadow = true;
  egg.add(eggMesh);

  // Shine/highlight
  const shineGeometry = new THREE.SphereGeometry(0.05, 8, 8);
  const shineMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.8,
  });
  const shine = new THREE.Mesh(shineGeometry, shineMaterial);
  shine.position.set(-0.08, 0.12, 0.1);
  egg.add(shine);

  // Outer glow (larger transparent sphere)
  const glowGeometry = new THREE.SphereGeometry(0.28, 12, 8);
  glowGeometry.scale(1, 1.3, 1);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0xfbbf24,
    transparent: true,
    opacity: 0.15,
    side: THREE.BackSide,
  });
  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  egg.add(glow);

  // Apply scale
  egg.scale.setScalar(scale);

  return egg;
}

// Animation helper for egg
export function animateEgg(egg: THREE.Group, time: number): void {
  // Gentle bobbing
  egg.position.y += Math.sin(time * 2) * 0.001;

  // Slow rotation
  egg.rotation.y = time * 0.5;
  egg.rotation.z = Math.sin(time) * 0.1;
}
