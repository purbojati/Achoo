import * as THREE from 'three';
import { GAME_WIDTH, GAME_HEIGHT, WORLD_CONFIG, COLORS } from '../config/gameConfig';

export class Scene3D {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;

  constructor(container: HTMLElement) {
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(COLORS.water);
    this.scene.fog = new THREE.Fog(COLORS.waterFog, 10, 30);

    // Create camera (fixed position for 2.5D)
    this.camera = new THREE.PerspectiveCamera(
      50,
      GAME_WIDTH / GAME_HEIGHT,
      0.1,
      100
    );
    this.camera.position.set(0, 0, WORLD_CONFIG.cameraZ);
    this.camera.lookAt(0, 0, 0);

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
    });
    this.renderer.setSize(GAME_WIDTH, GAME_HEIGHT);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    container.appendChild(this.renderer.domElement);

    // Setup lighting
    this.setupLighting();

    // Handle resize
    window.addEventListener('resize', this.onResize.bind(this));
  }

  private setupLighting(): void {
    // Ambient light - underwater blue tint
    const ambientLight = new THREE.AmbientLight(COLORS.ambient, 0.4);
    this.scene.add(ambientLight);

    // Main directional light (sun through water)
    const directionalLight = new THREE.DirectionalLight(COLORS.directional, 1);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -15;
    directionalLight.shadow.camera.right = 15;
    directionalLight.shadow.camera.top = 15;
    directionalLight.shadow.camera.bottom = -15;
    this.scene.add(directionalLight);

    // Fill light from below (caustics simulation)
    const fillLight = new THREE.DirectionalLight(0x88ccff, 0.3);
    fillLight.position.set(-3, -5, 2);
    this.scene.add(fillLight);

    // Rim light for depth
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.2);
    rimLight.position.set(0, 0, -10);
    this.scene.add(rimLight);
  }

  private onResize(): void {
    const aspect = window.innerWidth / window.innerHeight;
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  public render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  public add(object: THREE.Object3D): void {
    this.scene.add(object);
  }

  public remove(object: THREE.Object3D): void {
    this.scene.remove(object);
  }

  public getCanvas(): HTMLCanvasElement {
    return this.renderer.domElement;
  }
}
