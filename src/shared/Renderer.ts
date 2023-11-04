import { WebGLRenderer } from 'three';

export class Renderer extends WebGLRenderer {
  constructor() {
    super({ alpha: true });
    this.setPixelRatio(window.devicePixelRatio);
    this.setSize(window.innerWidth, window.innerHeight);
    this.shadowMap.enabled = true;
    document.body.appendChild(this.domElement);
  }
}
