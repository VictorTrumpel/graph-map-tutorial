import { Scene, Color, PerspectiveCamera } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer';
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
  readonly renderer2D: CSS2DRenderer;
  readonly orbitControls: OrbitControls;

  onWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer2D.setSize(window.innerWidth, window.innerHeight);
  };

  private animate = () => {
    requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.camera);
    this.renderer2D.render(this.scene, this.camera);
  };

  constructor() {
    this.scene = new Scene();
    this.scene.background = new Color(0xa0a0a0);

    this.camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 500);
    this.camera.position.set(11.355728920849053, 50.579716475504686, 100.31142433676645);

    const hemiLight = new HemiLight();
    this.scene.add(hemiLight);

    const directionalLight = new DirectLight();
    this.scene.add(directionalLight);

    this.ground = new Ground();
    this.scene.add(this.ground);

    const grid = new Grid();
    this.scene.add(grid);

    this.renderer = new Renderer();

    this.renderer2D = new CSS2DRenderer();
    this.renderer2D.domElement.style.position = 'absolute';
    this.renderer2D.domElement.style.top = '0px';
    this.renderer2D.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer2D.domElement);

    this.orbitControls = new OrbitControls(this.camera, this.renderer2D.domElement);
    this.orbitControls.target.set(0, 0.5, 0);
    this.orbitControls.update();

    window.addEventListener('resize', this.onWindowResize);
  }

  async start() {
    this.animate();
  }
}
