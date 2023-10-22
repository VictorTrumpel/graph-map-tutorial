import { InitScene } from './scene/InitScene';
import { LoadAssetsScene } from './scene/LoadAssetsScene';
import { createRoot } from 'react-dom/client';
import { HouseMenu } from './HouseMenu';
import './index.css';

const initScene = new InitScene();
initScene.start();

const loadAssetsScene = new LoadAssetsScene(initScene);

const root = createRoot(document.getElementById('root')!);

root.render(<HouseMenu scene={loadAssetsScene} />);
