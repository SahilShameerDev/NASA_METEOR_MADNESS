import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

function MoonModel() {
  const meshRef = useRef();
  const groupRef = useRef();
  const [animationProgress, setAnimationProgress] = useState(0);
  
  // Load the Moon OBJ model
  const obj = useLoader(OBJLoader, '/assets/Moon.obj');
  
  // Load textures
  const colorTexture = useLoader(THREE.TextureLoader, '/assets/texture/lroc_color_poles_1k.jpg');
  const displacementTexture = useLoader(THREE.TextureLoader, '/assets/texture/ldisplacement.jpg');

  // Apply materials to the loaded model
  useEffect(() => {
    if (obj) {
      obj.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshStandardMaterial({
            map: colorTexture,
            displacementMap: displacementTexture,
            displacementScale: 0.05,
            roughness: 0.9,
            metalness: 0.1,
            transparent: true,
            opacity: 0,
          });
        }
      });
    }
  }, [obj, colorTexture, displacementTexture]);

  // Slide-up animation with fade-in
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Auto-rotate the moon
      meshRef.current.rotation.y += 0.002;
    }

    // Slide-up and fade-in animation
    if (groupRef.current && animationProgress < 1) {
      const newProgress = Math.min(animationProgress + delta * 0.5, 1);
      setAnimationProgress(newProgress);
      
      // Easing function for smooth animation
      const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
      const easedProgress = easeOutCubic(newProgress);
      
      // Slide from bottom to top (start at -5, end at 0)
      groupRef.current.position.y = -5 + (easedProgress * 5);
      
      // Fade in
      if (obj) {
        obj.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material) {
            child.material.opacity = easedProgress;
          }
        });
      }
    }
  });

  return (
    <group ref={groupRef} rotation={[-0.5, 0, 0]} position={[0, -2, 0]}>
      <primitive ref={meshRef} object={obj} scale={2.75625} />
    </group>
  );
}

function Moon() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    setIsVisible(true);
  }, []);

  return (
    <div 
      className="absolute inset-0 z-[2] transition-opacity duration-1000"
      style={{ 
        pointerEvents: 'auto',
        opacity: isVisible ? 1 : 0
      }}
    >
      <Canvas
        camera={{ position: [0, 1, 5], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <pointLight position={[-5, -5, -5]} intensity={0.4} color="#4a5568" />
        
        <MoonModel />
        
        {/* Enable orbit controls for interaction */}
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={3}
          maxDistance={10}
          enableDamping={true}
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  );
}

export default Moon;
