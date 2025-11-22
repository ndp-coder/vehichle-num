import { useRef, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

interface Engine3DModelProps {
  modelPath: string;
}

function Model({ modelPath }: { modelPath: string }) {
  const meshRef = useRef<THREE.Group>(null);
  const gltf = useLoader(GLTFLoader, modelPath);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  useEffect(() => {
    if (gltf.scene) {
      gltf.scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          if (mesh.material) {
            const material = mesh.material as THREE.MeshStandardMaterial;
            material.metalness = 0.8;
            material.roughness = 0.2;
          }
        }
      });
    }
  }, [gltf]);

  return (
    <primitive
      ref={meshRef}
      object={gltf.scene}
      scale={1.5}
      position={[0, 0, 0]}
    />
  );
}

export default function Engine3DModel({ modelPath }: Engine3DModelProps) {
  return (
    <Canvas
      className="w-full h-full"
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      }}
      dpr={[1, 2]}
    >
      <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />

      <ambientLight intensity={0.5} />
      <spotLight
        position={[10, 10, 10]}
        angle={0.3}
        penumbra={1}
        intensity={1}
        castShadow
      />
      <spotLight
        position={[-10, -10, -10]}
        angle={0.3}
        penumbra={1}
        intensity={0.5}
      />

      <Environment preset="city" />

      <Model modelPath={modelPath} />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.5}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </Canvas>
  );
}
