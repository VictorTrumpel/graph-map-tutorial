import { Scene, PerspectiveCamera } from 'three';

export interface IActionScene {
  scene: Scene;
  camera: PerspectiveCamera;

  start(): Promise<void>;
}
