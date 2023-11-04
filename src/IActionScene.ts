import { Scene, PerspectiveCamera } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Renderer } from './shared/Renderer';
import { Ground } from './shared/Ground';

export interface IActionScene {
  readonly renderer: Renderer;
  readonly scene: Scene;
  readonly camera: PerspectiveCamera;
  readonly ground: Ground;
  readonly orbitControls: OrbitControls;

  start(): Promise<void>;
}
