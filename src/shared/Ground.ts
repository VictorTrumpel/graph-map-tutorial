import { Mesh, PlaneGeometry, MeshPhongMaterial } from 'three';

export class Ground extends Mesh {
  constructor() {
    const groundPlane = new PlaneGeometry(40, 40);
    const groundMaterial = new MeshPhongMaterial({ color: 0xbbbbbb, depthWrite: false });

    super(groundPlane, groundMaterial);

    this.rotation.x = -Math.PI / 2;
    this.receiveShadow = true;
  }
}
