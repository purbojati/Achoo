import * as THREE from 'three';
import { WORLD_CONFIG, COLORS } from '../config/gameConfig';

export class TankModel {
  private group: THREE.Group;
  private seaweeds: THREE.Mesh[] = [];
  private bubbles!: THREE.Points;
  private bubblePositions!: Float32Array;
  private time: number = 0;

  constructor() {
    this.group = new THREE.Group();

    this.createGlassWalls();
    this.createSandBottom();
    this.createSeaweed();
    this.bubbles = this.createBubbles();

    // Add subtle water volume effect
    this.createWaterVolume();
  }

  private createGlassWalls(): void {
    const { tankWidth, tankHeight, tankDepth } = WORLD_CONFIG;

    // Glass material
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: COLORS.glass,
      transparent: true,
      opacity: 0.15,
      roughness: 0.1,
      metalness: 0,
      side: THREE.DoubleSide,
    });

    // Frame material
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      metalness: 0.5,
      roughness: 0.3,
    });

    // Back wall
    const backWall = new THREE.Mesh(
      new THREE.PlaneGeometry(tankWidth, tankHeight),
      glassMaterial
    );
    backWall.position.z = -tankDepth / 2;
    this.group.add(backWall);

    // Side walls
    const leftWall = new THREE.Mesh(
      new THREE.PlaneGeometry(tankDepth, tankHeight),
      glassMaterial
    );
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.x = -tankWidth / 2;
    this.group.add(leftWall);

    const rightWall = new THREE.Mesh(
      new THREE.PlaneGeometry(tankDepth, tankHeight),
      glassMaterial
    );
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.x = tankWidth / 2;
    this.group.add(rightWall);

    // Frame edges
    const frameGeom = new THREE.BoxGeometry(0.2, tankHeight + 0.4, 0.2);

    const corners = [
      [-tankWidth / 2, 0, tankDepth / 2],
      [tankWidth / 2, 0, tankDepth / 2],
      [-tankWidth / 2, 0, -tankDepth / 2],
      [tankWidth / 2, 0, -tankDepth / 2],
    ];

    for (const [x, y, z] of corners) {
      const frame = new THREE.Mesh(frameGeom, frameMaterial);
      frame.position.set(x, y, z);
      this.group.add(frame);
    }

    // Top and bottom frame bars
    const topFrameGeom = new THREE.BoxGeometry(tankWidth + 0.4, 0.2, 0.2);
    const topFrameFront = new THREE.Mesh(topFrameGeom, frameMaterial);
    topFrameFront.position.set(0, tankHeight / 2 + 0.1, tankDepth / 2);
    this.group.add(topFrameFront);

    const bottomFrameFront = new THREE.Mesh(topFrameGeom, frameMaterial);
    bottomFrameFront.position.set(0, -tankHeight / 2 - 0.1, tankDepth / 2);
    this.group.add(bottomFrameFront);
  }

  private createSandBottom(): void {
    const { tankWidth, tankHeight, tankDepth } = WORLD_CONFIG;

    // Sand plane
    const sandGeom = new THREE.PlaneGeometry(tankWidth - 0.5, tankDepth - 0.5, 32, 32);

    // Add some displacement for texture
    const positions = sandGeom.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const z = positions.getZ(i);
      positions.setZ(i, z + Math.random() * 0.1);
    }
    sandGeom.computeVertexNormals();

    const sandMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.sand,
      roughness: 0.9,
      metalness: 0,
    });

    const sand = new THREE.Mesh(sandGeom, sandMaterial);
    sand.rotation.x = -Math.PI / 2;
    sand.position.y = -tankHeight / 2 + 0.1;
    sand.receiveShadow = true;
    this.group.add(sand);

    // Pebbles
    const pebbleColors = [0x8b7355, 0xa0826d, 0x6b5344, 0x9a8574];

    for (let i = 0; i < 40; i++) {
      const pebbleGeom = new THREE.SphereGeometry(
        0.1 + Math.random() * 0.15,
        8,
        6
      );
      pebbleGeom.scale(1, 0.6, 1);

      const pebbleMat = new THREE.MeshStandardMaterial({
        color: pebbleColors[Math.floor(Math.random() * pebbleColors.length)],
        roughness: 0.8,
      });

      const pebble = new THREE.Mesh(pebbleGeom, pebbleMat);
      pebble.position.set(
        (Math.random() - 0.5) * (tankWidth - 2),
        -tankHeight / 2 + 0.15,
        (Math.random() - 0.5) * (tankDepth - 1)
      );
      pebble.rotation.y = Math.random() * Math.PI * 2;
      pebble.receiveShadow = true;
      this.group.add(pebble);
    }
  }

  private createSeaweed(): void {
    const { tankWidth, tankHeight } = WORLD_CONFIG;
    const seaweedPositions = [
      [-tankWidth / 2 + 2, 0],
      [-tankWidth / 2 + 4, -1],
      [tankWidth / 2 - 2, 0.5],
      [tankWidth / 2 - 4, -0.5],
    ];

    const seaweedColors = [0x22c55e, 0x16a34a, 0x15803d];

    for (const [x, z] of seaweedPositions) {
      const segments = 5 + Math.floor(Math.random() * 3);
      const seaweedGroup = new THREE.Group();

      for (let i = 0; i < segments; i++) {
        const height = 1 + Math.random() * 0.5;
        const leafGeom = new THREE.PlaneGeometry(0.4, height, 1, 4);

        // Curve the leaf
        const leafPositions = leafGeom.attributes.position;
        for (let j = 0; j < leafPositions.count; j++) {
          const y = leafPositions.getY(j);
          const curve = Math.sin((y / height) * Math.PI) * 0.2;
          leafPositions.setZ(j, curve);
        }
        leafGeom.computeVertexNormals();

        const leafMat = new THREE.MeshStandardMaterial({
          color: seaweedColors[Math.floor(Math.random() * seaweedColors.length)],
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.8,
        });

        const leaf = new THREE.Mesh(leafGeom, leafMat);
        leaf.position.y = -tankHeight / 2 + 0.3 + i * height * 0.8;
        leaf.rotation.y = Math.random() * Math.PI * 2;
        seaweedGroup.add(leaf);
        this.seaweeds.push(leaf);
      }

      seaweedGroup.position.set(x, 0, z);
      this.group.add(seaweedGroup);
    }
  }

  private createBubbles(): THREE.Points {
    const { tankWidth, tankHeight } = WORLD_CONFIG;
    const bubbleCount = 50;

    const geometry = new THREE.BufferGeometry();
    this.bubblePositions = new Float32Array(bubbleCount * 3);
    const sizes = new Float32Array(bubbleCount);

    for (let i = 0; i < bubbleCount; i++) {
      this.bubblePositions[i * 3] = (Math.random() - 0.5) * tankWidth;
      this.bubblePositions[i * 3 + 1] = (Math.random() - 0.5) * tankHeight;
      this.bubblePositions[i * 3 + 2] = (Math.random() - 0.5) * 4;
      sizes[i] = 0.05 + Math.random() * 0.1;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(this.bubblePositions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.15,
      transparent: true,
      opacity: 0.4,
      sizeAttenuation: true,
    });

    const bubbles = new THREE.Points(geometry, material);
    this.group.add(bubbles);

    return bubbles;
  }

  private createWaterVolume(): void {
    const { tankWidth, tankHeight, tankDepth } = WORLD_CONFIG;

    // Subtle water volume for depth effect
    const waterGeom = new THREE.BoxGeometry(
      tankWidth - 0.2,
      tankHeight - 0.2,
      tankDepth - 0.2
    );

    const waterMat = new THREE.MeshPhysicalMaterial({
      color: 0x0066aa,
      transparent: true,
      opacity: 0.05,
      roughness: 0,
      metalness: 0,
      side: THREE.BackSide,
    });

    const water = new THREE.Mesh(waterGeom, waterMat);
    this.group.add(water);
  }

  public update(delta: number): void {
    this.time += delta;

    // Animate seaweed swaying
    for (let i = 0; i < this.seaweeds.length; i++) {
      const seaweed = this.seaweeds[i];
      seaweed.rotation.z = Math.sin(this.time * 0.5 + i * 0.5) * 0.1;
    }

    // Animate bubbles rising
    const { tankHeight } = WORLD_CONFIG;
    for (let i = 0; i < this.bubblePositions.length / 3; i++) {
      this.bubblePositions[i * 3 + 1] += delta * (0.5 + Math.random() * 0.5);
      this.bubblePositions[i * 3] += Math.sin(this.time + i) * delta * 0.1;

      // Reset bubble when it reaches top
      if (this.bubblePositions[i * 3 + 1] > tankHeight / 2) {
        this.bubblePositions[i * 3 + 1] = -tankHeight / 2;
      }
    }

    this.bubbles.geometry.attributes.position.needsUpdate = true;
  }

  public getGroup(): THREE.Group {
    return this.group;
  }
}
