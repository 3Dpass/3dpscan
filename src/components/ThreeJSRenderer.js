import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const ThreeJSRenderer = ({ objString }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    const maxCanvasWidth = 1600;
  
    const scene = new THREE.Scene();
  
    const camera = new THREE.PerspectiveCamera(75, Math.min(window.innerWidth, maxCanvasWidth) / 500, 0.1, 1000);
    camera.position.set(0, 0, 3);
  
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    const canvasWidth = Math.min(window.innerWidth, maxCanvasWidth);
    renderer.setSize(canvasWidth, 500);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);
  
    const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
    scene.add(ambientLight);
  
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 10).normalize();
    scene.add(directionalLight);
  
    const loader = new OBJLoader();
    const obj = loader.parse(objString);
    obj.scale.set(1.5, 1.5, 1.5);
    obj.position.set(0, 0, 0);
  
    obj.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshStandardMaterial({ color: 0x0077ff });
      }
    });
  
    scene.add(obj);
  
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2;
  
    const animate = function () {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
  
    animate();
  
    const handleResize = () => {
      const canvasWidth = Math.min(window.innerWidth, maxCanvasWidth);
      camera.aspect = canvasWidth / 500;
      camera.updateProjectionMatrix();
      renderer.setSize(canvasWidth, 500);
    };
    window.addEventListener('resize', handleResize);
  
    return () => {
      window.removeEventListener('resize', handleResize);
      currentMount.removeChild(renderer.domElement);
    };
  }, [objString]);

  return <div ref={mountRef}></div>;
};

export default ThreeJSRenderer;
