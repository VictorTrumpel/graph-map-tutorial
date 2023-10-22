import { Scene, Color, PerspectiveCamera } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Grid } from '../shared/Grid';
import { Renderer } from '../shared/Renderer';
import { Ground } from '../shared/Ground';
import { HemiLight } from '../shared/HemiLight';
import { DirectLight } from '../shared/DirectLight';
import { IActionScene } from '../IActionScene';

export class InitScene implements IActionScene {
  readonly renderer: Renderer;
  readonly scene: Scene;
  readonly camera: PerspectiveCamera;
  readonly ground: Ground;

  onWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  private animate = () => {
    requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.camera);
  };

  constructor() {
    this.scene = new Scene();
    this.scene.background = new Color(0xa0a0a0);

    this.camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(11.355728920849053, 19.579716475504686, 45.31142433676645);

    const hemiLight = new HemiLight();
    this.scene.add(hemiLight);

    const directionalLight = new DirectLight();
    this.scene.add(directionalLight);

    this.ground = new Ground();
    this.scene.add(this.ground);

    const grid = new Grid();
    this.scene.add(grid);

    this.renderer = new Renderer();

    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.target.set(0, 0.5, 0);
    controls.update();

    window.addEventListener('resize', this.onWindowResize);
  }

  async start() {
    this.animate();
  }
}
