import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

const CityBlendBackground = ({
  showParticles = false,
  showCity = true,
  backgroundColor = 0xffffff,
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const box = containerRef.current;

    // Check if there's already a canvas to avoid duplicates
    const existingCanvas = box.querySelector("canvas");
    if (existingCanvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      1,
      100000,
    );
    camera.position.set(157, 545, -987);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      logarithmicDepthBuffer: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(
      backgroundColor,
      backgroundColor === 0xffffff ? 1 : 0,
    );
    renderer.setPixelRatio(window.devicePixelRatio);
    box.appendChild(renderer.domElement);

    let isMobile = window.innerWidth <= 992;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.3;
    controls.enablePan = false;
    if (isMobile) {
      controls.enabled = false;
    }

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dirLight = new THREE.DirectionalLight(0xffffff, 4.0);
    dirLight.position.set(200, 500, 200);
    scene.add(dirLight);

    // --- Sphere Line Particles Logic ---
    const particlesGroup = new THREE.Group();
    if (showParticles) {
      scene.add(particlesGroup);

      const pCount = 100;
      const points = [];
      for (let i = 0; i < pCount; i++) {
        const phi = Math.acos(-1 + (2 * i) / pCount);
        const theta = Math.sqrt(pCount * Math.PI) * phi;
        const point = new THREE.Vector3().setFromSphericalCoords(
          2200,
          phi,
          theta,
        );
        points.push(point);

        const dotGeo = new THREE.SphereGeometry(12, 8, 8);
        const dotMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
        const dot = new THREE.Mesh(dotGeo, dotMat);
        dot.position.copy(point);
        particlesGroup.add(dot);
      }

      const lineMat = new THREE.LineBasicMaterial({
        color: 0xaaddff,
        transparent: true,
        opacity: 0.35,
      });
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          if (points[i].distanceTo(points[j]) < 900) {
            const lineGeo = new THREE.BufferGeometry().setFromPoints([
              points[i],
              points[j],
            ]);
            const line = new THREE.Line(lineGeo, lineMat);
            particlesGroup.add(line);
          }
        }
      }
      // Use a consistent offset and pull Z closer to the camera to ensure it dominates the viewport
      if (window.innerWidth <= 992) {
        particlesGroup.position.set(224, 0, 0);
        particlesGroup.scale.set(1.0, 1.0, 1.0);
      } else {
        particlesGroup.position.set(224, 600, -49);
      }
    }
    // --- End Particle Logic ---

    const uniforms = {
      uTime: { value: 0.0 },
      uColor1: { value: new THREE.Color(0x00f2fe) },
      uColor2: { value: new THREE.Color(0x1919f9) },
      uCenter: { value: new THREE.Vector3(224, -9, -49) },
      uRadius: { value: 6000.0 },
      uWidth: { value: 1000.0 },
      uIntensity: { value: 7.0 },
    };

    const applyShader = (model) => {
      model.traverse((child) => {
        if (child.isMesh) {
          const material = child.material;
          const materials = Array.isArray(material) ? material : [material];
          materials.forEach((m) => {
            m.onBeforeCompile = (shader) => {
              Object.assign(shader.uniforms, uniforms);
              shader.vertexShader = `
                varying vec3 vWorldPos;
                ${shader.vertexShader.replace(
                  "void main() {",
                  "void main() {\nvWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;",
                )}
              `;
              shader.fragmentShader = `
                uniform float uTime;
                uniform vec3 uColor1;
                uniform vec3 uColor2;
                uniform vec3 uCenter;
                uniform float uRadius;
                uniform float uWidth;
                uniform float uIntensity;
                varying vec3 vWorldPos;
                ${shader.fragmentShader.replace(
                  "vec4 diffuseColor = vec4( diffuse, opacity );",
                  `
                  float dist = length(vWorldPos - uCenter);
                  float wave = mod(dist - uTime * 800.0, uRadius);
                  vec4 diffuseColor = vec4( diffuse, opacity );
                  if (wave < uWidth) {
                    float mask = sin((wave / uWidth) * 3.14159);
                    vec3 waveColor = mix(uColor1, uColor2, wave / uWidth);
                    diffuseColor.rgb += waveColor * mask * uIntensity;
                  }
                  `,
                )}
              `;
            };
            m.needsUpdate = true;
          });
        }
      });
    };

    if (showCity) {
      const loader = new FBXLoader();
      loader.load(
        "https://z2586300277.github.io/three-cesium-examples/files/model/city.FBX",
        (fbx) => {
          fbx.scale.set(0.04, 0.04, 0.04);
          fbx.position.set(224, -9, -49);
          applyShader(fbx);
          scene.add(fbx);
        },
        undefined,
        (err) => console.error("FBX Load Error:", err),
      );
    }

    let animationId;
    const animate = () => {
      const time = performance.now() * 0.001;
      uniforms.uTime.value = time;
      particlesGroup.rotation.y = time * 0.15;
      particlesGroup.rotation.z = time * 0.08;

      const baseRadius = 900;
      const mobileRadius = showParticles ? 4000 : 1000;
      const radius = isMobile
        ? mobileRadius
        : baseRadius + Math.sin(time * 0.2) * 300;
      camera.position.x = 224 + Math.cos(time * 0.3) * radius;
      camera.position.z = (isMobile ? 0 : -49) + Math.sin(time * 0.3) * radius;

      const baseY = isMobile ? (showParticles ? 0 : 300) : 500;
      camera.position.y = baseY;

      const zoom = Math.sin(time * 0.15);
      if (zoom > 0.75 && !isMobile) {
        const factor = (zoom - 0.75) / 0.25;
        camera.position.lerp(new THREE.Vector3(224, 200, -49), factor * factor);
      }

      if (isMobile) {
        camera.lookAt(224, showParticles ? 0 : -9, showParticles ? 0 : -49);
      } else {
        camera.lookAt(224, -9, -49);
        controls.update();
      }
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      isMobile = width <= 992;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);
    };
    const handleOrientationChange = () => setTimeout(handleResize, 100);
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleOrientationChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleOrientationChange);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj.isMesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material))
            obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
      if (box.contains(renderer.domElement))
        box.removeChild(renderer.domElement);
    };
  }, [showParticles, showCity, backgroundColor]);

  return (
    <div
      ref={containerRef}
      className="city-bg-container"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
        pointerEvents: "none",
        background: "#000000",
      }}
    />
  );
};

export default CityBlendBackground;
