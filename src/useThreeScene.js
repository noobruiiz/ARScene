import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const useThreeScene = (params) => {
  const mountRef = useRef(null);

  useEffect(() => {
    // Setup basic scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, -200, 0);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x080808);
    mountRef.current.appendChild(renderer.domElement);

    // Add controls
    const controls = new OrbitControls(camera, renderer.domElement);

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Call initially to set size correctly

    // Function to load texture
    const loadTexture = (url) => {
      return new Promise((resolve, reject) => {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(
          url,
          (texture) => resolve(texture),
          undefined,
          (error) => reject(error)
        );
      });
    };

    const setupScene = async () => {
      try {
        const texture = await loadTexture(params.imageUrl);

        // Vertex Shader
        const vertexShader = `
          varying vec2 vUv;
          uniform float u_time;
          varying float vElevation;
          varying vec3 vNormal;

          float oscillate(float time, float minVal, float maxVal) {
              float sineWave = sin(time);
              float normalizedSine = (sineWave + 1.0) / 2.0;
              return mix(minVal, maxVal, normalizedSine);
          }

          void main() {
              vUv = uv;
              vNormal = normalize(normalMatrix * normal);
              vec3 newPosition = vec3(position.x, position.y * oscillate(u_time / 4.0, 4.0, 15.0), position.z);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
          }
        `;

        // Fragment Shader
        const fragmentShader = `
          varying vec2 vUv;
          uniform sampler2D u_texture;
          uniform float u_time;
          varying vec3 vNormal;

          vec3 interpolateColors(float t) {
              vec3 color1 = vec3(1.0, 0.0, 0.0); // Rojo
              vec3 color2 = vec3(0.0, 1.0, 0.0); // Verde
              vec3 color3 = vec3(0.0, 0.0, 1.0); // Azul
              vec3 color4 = vec3(1.0, 1.0, 0.0); // Amarillo

              vec3 colorA = mix(color1, color2, smoothstep(0.0, 1.0, sin(t)));
              vec3 colorB = mix(color3, color4, smoothstep(0.0, 1.0, sin(t + 3.14)));
              
              return mix(colorA, colorB, smoothstep(0.0, 1.0, sin(t + 6.28)));
          }

          void main() {
              vec2 animatedUv = (vUv.y + vUv.x) + vec2(u_time * -0.02, vUv.y); 
              vec4 color = texture2D(u_texture, mod(animatedUv, 1.0));
              float blackThreshold = ${params.intensity};
              float intensity = max(color.r, max(color.g, color.b));

              if (intensity < blackThreshold) {
                  discard;
              }

              vec3 animatedColor = interpolateColors(u_time);
              gl_FragColor = color * vec4(animatedColor, 1.0);
          }
        `;

        const geometry = new THREE.SphereGeometry(params.radius, params.segments, params.rings);
        geometry.uvsNeedUpdate = true;

        const customMaterial = new THREE.ShaderMaterial({
          vertexShader: vertexShader,
          fragmentShader: fragmentShader,
          wireframe: false,
          side: THREE.DoubleSide,
          uniforms: {
            u_time: { value: 0.0 },
            u_texture: { value: texture }
          }
        });

        const sphere = new THREE.Mesh(geometry, customMaterial);
        scene.add(sphere);

        // Background Shader
        const bgVertexShader = `
          varying vec2 vUv;
          uniform float u_time;

          void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `;

        const bgFragmentShader = `
          varying vec2 vUv;
          uniform float u_time;

          vec3 backgroundColor() {
              vec3 color1 = vec3(0.1, 0.1, 0.1);
              vec3 color2 = vec3(0.2, 0.2, 0.2);
              return mix(color1, color2, (sin(u_time * 0.1) + 1.0) / 2.0);
          }

          void main() {
              gl_FragColor = vec4(backgroundColor(), 1.0); 
          }
        `;

        const backgroundShader = new THREE.ShaderMaterial({
          vertexShader: bgVertexShader,
          fragmentShader: bgFragmentShader,
          side: THREE.DoubleSide,
          uniforms: {
            u_time: { value: 0.0 }
          }
        });

        const background = new THREE.SphereGeometry(800, 1024, 1024);
        const backgroundMesh = new THREE.Mesh(background, backgroundShader);
        backgroundMesh.position.z = -1;
        scene.add(backgroundMesh);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(10, 10, 10);
        scene.add(directionalLight);

        // Animation loop
        const animate = () => {
          requestAnimationFrame(animate);
          
          controls.update(); // Update controls in the animation loop
          const time = performance.now() / 1000;
          customMaterial.uniforms.u_time.value = time;
          backgroundShader.uniforms.u_time.value = time;

          renderer.render(scene, camera);
        };
        animate();
      } catch (error) {
        console.error('Error loading image:', error);
      }
    };

    setupScene();

    // Cleanup on unmount
    return () => {
      mountRef.current.removeChild(renderer.domElement);
      window.removeEventListener('resize', handleResize);
    };
  }, [params]); // Dependencias de useEffect para actualizar cuando cambian los parámetros

  return mountRef;
};

export default useThreeScene;
