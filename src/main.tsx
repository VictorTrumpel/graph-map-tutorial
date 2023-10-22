import { InitScene } from './scene/InitScene';
import { LoadAssetsScene } from './scene/LoadAssetsScene';
import { createRoot } from 'react-dom/client';
import { HouseMenu } from './HouseMenu';
import { IndexDB } from './IndexDB';
import { MainFlowScene } from './scene/MainFlowScene';
import './index.css';

new IndexDB();

const initScene = new InitScene();
initScene.start();

const loadAssetsScene = new LoadAssetsScene(initScene);
loadAssetsScene.start();

const mainFlowScene = new MainFlowScene(initScene, loadAssetsScene.assetMap);
mainFlowScene.start();

// @ts-ignore
window.actionScene = loadAssetsScene;

const root = createRoot(document.getElementById('root')!);

root.render(<HouseMenu scene={mainFlowScene} />);
