import { BufferGeometry, LineBasicMaterial, Line, BufferAttribute } from 'three';

export class PathLine extends Line {
  constructor() {
    const geometry = new BufferGeometry();

    const material = new LineBasicMaterial({ color: 0x4080ff });

    super(geometry, material);
  }

  setFromTo(fromPoint: [number, number, number], toPoint: [number, number, number]) {
    const vertices = new Float32Array([...fromPoint, ...toPoint]);

    this.geometry.setAttribute('position', new BufferAttribute(vertices, 3));
  }
}
