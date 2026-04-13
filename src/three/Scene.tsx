import { Canvas, useThree } from '@react-three/fiber';
import { Suspense, useState, useEffect, memo } from 'react';
import { Preload } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { CameraRig } from './CameraRig';
import { Buildings } from './Buildings';
import { Particles } from './Particles';
import { Lights } from './Lights';
import { PowerWrapper } from './PowerWrapper';
import { WorldBounds } from './WorldBounds';
import { CombatSystem } from './CombatSystem';
import { themeState } from './themeState';
import * as THREE from 'three';

interface SceneProps {
  droneMode: boolean;
}

const ThemeSync = () => {
  const { scene } = useThree();

  useEffect(() => {
    const handler = () => {
      const c = themeState.colors;
      scene.background = new THREE.Color(c.fogColor);
      if (scene.fog) {
        (scene.fog as THREE.Fog).color.set(c.fogColor);
      }
    };
    window.addEventListener('theme-change', handler);
    return () => window.removeEventListener('theme-change', handler);
  }, [scene]);

  return null;
};

// Memoize the entire inner scene to prevent re-renders
const InnerScene = memo(() => (
  <>
    <CameraRig />
    <Lights />
    <Buildings />
    <Particles />
    <WorldBounds />
    <CombatSystem />
  </>
));

InnerScene.displayName = 'InnerScene';

const Scene = ({ droneMode }: SceneProps) => {
  const [bgColor, setBgColor] = useState(themeState.colors.fogColor);

  useEffect(() => {
    const handler = () => setBgColor(themeState.colors.fogColor);
    window.addEventListener('theme-change', handler);
    return () => window.removeEventListener('theme-change', handler);
  }, []);

  return (
    <div className="fixed inset-0 z-0" style={{ backgroundColor: bgColor }}>
      <Canvas
        camera={{ position: [0, 2, 15], fov: 60, near: 0.1, far: 200 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: false, stencil: false, depth: true, powerPreference: 'high-performance' }}
        frameloop="always"
      >
        <Suspense fallback={null}>
          <color attach="background" args={[bgColor]} />
          <ThemeSync />
          <PowerWrapper>
            <InnerScene />
          </PowerWrapper>
          <fog attach="fog" args={[bgColor, 15, 90]} />

          <EffectComposer enableNormalPass={false} multisampling={0}>
            <Bloom mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.5} intensity={1.5} />
          </EffectComposer>

          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default memo(Scene);
