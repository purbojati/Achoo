import * as THREE from 'three';

export interface FishModelOptions {
  stage?: 'baby' | 'juvenile' | 'adult' | 'elder';
  scale?: number;
}

// Texture cache to avoid loading same texture multiple times
const textureCache = new Map<string, THREE.Texture>();
const textureLoader = new THREE.TextureLoader();

// Preload all fish textures
export function preloadFishTextures(): Promise<void> {
  const stages = ['baby', 'juvenile', 'adult', 'elder'];
  const promises = stages.map((stage) => {
    const path = `/assets/clownfish-${stage}.svg`;
    return new Promise<void>((resolve) => {
      textureLoader.load(
        path,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          textureCache.set(stage, texture);
          resolve();
        },
        undefined,
        () => {
          // If loading fails, we'll create a fallback texture
          resolve();
        }
      );
    });
  });
  return Promise.all(promises).then(() => undefined);
}

// Get or load texture for a stage
function getTexture(stage: string): THREE.Texture | null {
  return textureCache.get(stage) ?? null;
}

export function createFishModel(options: FishModelOptions = {}): THREE.Group {
  const { stage = 'baby', scale = 1 } = options;

  const fish = new THREE.Group();

  // Get the texture for this stage
  const texture = getTexture(stage);

  if (texture) {
    // Create sprite-based fish with texture
    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.1,
    });

    const sprite = new THREE.Sprite(spriteMaterial);
    // SVG aspect ratio is 200:120 = 5:3
    // Start facing right (positive X scale)
    sprite.scale.set(2.5 * scale, 1.5 * scale, 1);
    sprite.name = 'fishSprite';
    fish.add(sprite);
  } else {
    // Fallback: Create procedural clownfish if texture not loaded
    createProceduralClownfish(fish, stage, scale);
  }

  return fish;
}

// Procedural fallback clownfish
function createProceduralClownfish(
  fish: THREE.Group,
  stage: string,
  scale: number
): void {
  // Colors for different stages - clownfish orange palette
  const stageColors: Record<string, { body: number; belly: number }> = {
    baby: { body: 0xff8c42, belly: 0xffb380 },
    juvenile: { body: 0xff7b29, belly: 0xffa366 },
    adult: { body: 0xff6b00, belly: 0xff9955 },
    elder: { body: 0xff5500, belly: 0xff8844 },
  };

  const colors = stageColors[stage] ?? stageColors.baby;

  // Body material - toon shading for cartoon look
  const bodyMaterial = new THREE.MeshToonMaterial({
    color: colors.body,
  });

  // White stripe material
  const stripeMaterial = new THREE.MeshToonMaterial({
    color: 0xffffff,
  });

  // Black outline material
  const outlineMaterial = new THREE.MeshToonMaterial({
    color: 0x1a1a1a,
  });

  // Body - elongated sphere
  const bodyGeometry = new THREE.SphereGeometry(0.5, 16, 12);
  bodyGeometry.scale(1.8, 1, 0.8);
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.castShadow = true;
  body.receiveShadow = true;
  fish.add(body);

  // Belly - lighter orange
  const bellyMaterial = new THREE.MeshToonMaterial({
    color: colors.belly,
  });
  const bellyGeometry = new THREE.SphereGeometry(0.35, 12, 8);
  bellyGeometry.scale(1.4, 0.6, 0.6);
  const belly = new THREE.Mesh(bellyGeometry, bellyMaterial);
  belly.position.y = -0.15;
  fish.add(belly);

  // White stripes - clownfish pattern
  // Head stripe
  const stripe1Geometry = new THREE.TorusGeometry(0.48, 0.08, 8, 16, Math.PI);
  const stripe1 = new THREE.Mesh(stripe1Geometry, stripeMaterial);
  stripe1.position.set(-0.35, 0, 0);
  stripe1.rotation.y = Math.PI / 2;
  stripe1.rotation.z = Math.PI / 2;
  fish.add(stripe1);

  // Black outline for stripe 1
  const outline1Geometry = new THREE.TorusGeometry(0.48, 0.1, 8, 16, Math.PI);
  const outline1 = new THREE.Mesh(outline1Geometry, outlineMaterial);
  outline1.position.set(-0.37, 0, 0);
  outline1.rotation.y = Math.PI / 2;
  outline1.rotation.z = Math.PI / 2;
  outline1.scale.set(1.05, 1.05, 1.05);
  fish.add(outline1);

  // Middle stripe
  const stripe2Geometry = new THREE.TorusGeometry(0.45, 0.07, 8, 16, Math.PI);
  const stripe2 = new THREE.Mesh(stripe2Geometry, stripeMaterial);
  stripe2.position.set(0.15, 0, 0);
  stripe2.rotation.y = Math.PI / 2;
  stripe2.rotation.z = Math.PI / 2;
  fish.add(stripe2);

  // Tail stripe (for adult and elder)
  if (stage === 'adult' || stage === 'elder') {
    const stripe3Geometry = new THREE.TorusGeometry(0.35, 0.05, 8, 16, Math.PI);
    const stripe3 = new THREE.Mesh(stripe3Geometry, stripeMaterial);
    stripe3.position.set(0.55, 0, 0);
    stripe3.rotation.y = Math.PI / 2;
    stripe3.rotation.z = Math.PI / 2;
    fish.add(stripe3);
  }

  // Tail - fan shape
  const tailGeometry = new THREE.ConeGeometry(0.4, 0.8, 4);
  tailGeometry.rotateZ(Math.PI / 2);
  const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
  tail.position.x = -0.9;
  tail.name = 'tail';
  tail.castShadow = true;
  fish.add(tail);

  // Top fin - triangle
  const topFinGeometry = new THREE.BufferGeometry();
  const topFinVertices = new Float32Array([
    -0.2, 0.5, 0, // top
    0.3, 0.5, 0, // front
    0, 0.3, 0, // bottom
  ]);
  topFinGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(topFinVertices, 3)
  );
  topFinGeometry.computeVertexNormals();

  const finMaterial = new THREE.MeshToonMaterial({
    color: colors.belly,
    side: THREE.DoubleSide,
  });

  const topFin = new THREE.Mesh(topFinGeometry, finMaterial);
  topFin.position.y = 0.1;
  fish.add(topFin);

  // Side fins
  const sideFinGeometry = new THREE.BufferGeometry();
  const sideFinVertices = new Float32Array([0, 0, 0, 0.3, -0.3, 0.2, 0.3, 0, 0]);
  sideFinGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(sideFinVertices, 3)
  );
  sideFinGeometry.computeVertexNormals();

  const leftFin = new THREE.Mesh(sideFinGeometry, finMaterial);
  leftFin.position.set(0.2, -0.1, 0.35);
  leftFin.name = 'leftFin';
  fish.add(leftFin);

  const rightFin = new THREE.Mesh(sideFinGeometry, finMaterial);
  rightFin.position.set(0.2, -0.1, -0.35);
  rightFin.rotation.y = Math.PI;
  rightFin.name = 'rightFin';
  fish.add(rightFin);

  // Eye - white sphere with black pupil
  const eyeWhiteGeometry = new THREE.SphereGeometry(0.12, 12, 8);
  const eyeWhiteMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

  const leftEye = new THREE.Mesh(eyeWhiteGeometry, eyeWhiteMaterial);
  leftEye.position.set(0.55, 0.15, 0.25);
  fish.add(leftEye);

  const rightEye = new THREE.Mesh(eyeWhiteGeometry, eyeWhiteMaterial);
  rightEye.position.set(0.55, 0.15, -0.25);
  fish.add(rightEye);

  // Pupils
  const pupilGeometry = new THREE.SphereGeometry(0.06, 8, 6);
  const pupilMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

  const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
  leftPupil.position.set(0.62, 0.15, 0.28);
  fish.add(leftPupil);

  const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
  rightPupil.position.set(0.62, 0.15, -0.28);
  fish.add(rightPupil);

  // Mouth
  const mouthGeometry = new THREE.CircleGeometry(0.08, 8);
  const mouthMaterial = new THREE.MeshBasicMaterial({
    color: 0xcc4400,
    side: THREE.DoubleSide,
  });
  const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
  mouth.position.set(0.85, -0.05, 0);
  mouth.rotation.y = Math.PI / 2;
  fish.add(mouth);

  // Apply scale
  fish.scale.setScalar(scale);
}

// Animation helper for fish
export function animateFish(
  fish: THREE.Group,
  time: number,
  speed: number = 1,
  swimIntensity: number = 1
): void {
  // Check if sprite-based
  const sprite = fish.getObjectByName('fishSprite') as THREE.Sprite | undefined;
  if (sprite) {
    // Natural swimming motion - gentle bobbing
    const bobAmount = Math.sin(time * 2.5 * speed) * 0.03 * swimIntensity;
    sprite.position.y = bobAmount;

    // Note: Don't modify scale here - it's handled by updateVisualSize in Fish3D
    // to avoid conflicts with direction and size management

    return;
  }

  // Procedural fish animation
  // Tail wagging
  const tail = fish.getObjectByName('tail');
  if (tail) {
    tail.rotation.y = Math.sin(time * 8 * speed) * 0.3;
  }

  // Fin movement
  const leftFin = fish.getObjectByName('leftFin');
  const rightFin = fish.getObjectByName('rightFin');
  if (leftFin && rightFin) {
    leftFin.rotation.x = Math.sin(time * 6 * speed) * 0.2;
    rightFin.rotation.x = Math.sin(time * 6 * speed + Math.PI) * 0.2;
  }

  // Subtle body wobble
  fish.rotation.z = Math.sin(time * 4 * speed) * 0.05;
}

// Helper to flip sprite direction
export function setFishDirection(fish: THREE.Group, facingRight: boolean): void {
  const sprite = fish.getObjectByName('fishSprite') as THREE.Sprite | undefined;
  if (sprite) {
    // Flip sprite by negating scale.x
    const absScaleX = Math.abs(sprite.scale.x);
    sprite.scale.x = facingRight ? absScaleX : -absScaleX;
  }
  // Reset any rotation that might have been set
  fish.rotation.y = 0;
}
