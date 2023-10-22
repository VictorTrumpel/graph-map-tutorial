import { Scene, PerspectiveCamera } from 'three';
import { Renderer } from './shared/Renderer';
import { Ground } from './shared/Ground';

export interface IActionScene {
  readonly renderer: Renderer;
  readonly scene: Scene;
  readonly camera: PerspectiveCamera;
  readonly ground: Ground;

  start(): Promise<void>;
}
