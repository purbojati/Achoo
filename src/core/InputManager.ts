import * as THREE from 'three';

export type ClickCallback = (point: THREE.Vector3, object?: THREE.Object3D) => void;

export class InputManager {
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private camera: THREE.Camera;
  private canvas: HTMLCanvasElement;
  private clickableObjects: THREE.Object3D[] = [];
  private tankPlane: THREE.Plane;

  private onTankClick?: ClickCallback;
  private onObjectClick?: ClickCallback;

  constructor(camera: THREE.Camera, canvas: HTMLCanvasElement) {
    this.camera = camera;
    this.canvas = canvas;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Create an invisible plane for tank clicks (at z = 0)
    this.tankPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.canvas.addEventListener('click', this.handleClick.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
  }

  private handleClick(event: MouseEvent): void {
    this.updateMouse(event);
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Check for clickable objects first
    if (this.clickableObjects.length > 0) {
      const intersects = this.raycaster.intersectObjects(this.clickableObjects, true);
      if (intersects.length > 0) {
        const hit = intersects[0];
        // Find the root clickable object
        let obj: THREE.Object3D | null = hit.object;
        while (obj && !this.clickableObjects.includes(obj)) {
          obj = obj.parent;
        }
        if (obj && this.onObjectClick) {
          this.onObjectClick(hit.point, obj);
          return;
        }
      }
    }

    // If no object clicked, calculate tank plane intersection
    const intersectPoint = new THREE.Vector3();
    this.raycaster.ray.intersectPlane(this.tankPlane, intersectPoint);

    if (intersectPoint && this.onTankClick) {
      this.onTankClick(intersectPoint);
    }
  }

  private handleMouseMove(event: MouseEvent): void {
    this.updateMouse(event);
  }

  private updateMouse(event: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  public addClickable(object: THREE.Object3D): void {
    if (!this.clickableObjects.includes(object)) {
      this.clickableObjects.push(object);
    }
  }

  public removeClickable(object: THREE.Object3D): void {
    const index = this.clickableObjects.indexOf(object);
    if (index > -1) {
      this.clickableObjects.splice(index, 1);
    }
  }

  public setOnTankClick(callback: ClickCallback): void {
    this.onTankClick = callback;
  }

  public setOnObjectClick(callback: ClickCallback): void {
    this.onObjectClick = callback;
  }

  public getMouseWorldPosition(): THREE.Vector3 {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersectPoint = new THREE.Vector3();
    this.raycaster.ray.intersectPlane(this.tankPlane, intersectPoint);
    return intersectPoint;
  }
}
