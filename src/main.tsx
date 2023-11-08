import { InitScene } from './scene/InitScene';
import { LoadAssetsScene } from './scene/LoadAssetsScene';
import { createRoot } from 'react-dom/client';
import { HouseMenu } from './feature/HouseMenu/HouseMenu';
import { IndexDB } from './IndexDB';
import { MainFlowScene } from './scene/MainFlowScene';
import { FindPathMenu } from './feature/FindPathMenu/FindPathMenu';
import './index.css';

const indexDb = new IndexDB();

indexDb.onSuccessOpened = async () => {
  const initScene = new InitScene();

  const loadAssetsScene = new LoadAssetsScene(initScene);
  await loadAssetsScene.start();
  initScene.start();

  const mainFlowScene = new MainFlowScene(initScene, loadAssetsScene.assetMap);
  mainFlowScene.start();

  // @ts-ignore
  window.actionScene = loadAssetsScene;

  const root = createRoot(document.getElementById('root')!);

  root.render(
    <>
      <HouseMenu scene={mainFlowScene} />
      <FindPathMenu pathPainter={mainFlowScene.pathPainter} />
    </>
  );
};
