/**
 * model.js — Three.js 3D Avatar Loader & Interactive Engine
 * Portfolio of Adwaith Gopinath
 * 
 * Features:
 * - Automatically detects & plays humanoid skeletal animations via AnimationMixer
 * - Debug logging for GLTF animation clips and skeleton bone names
 * - Transparent background layered behind editorial hero typography
 * - Dramatic red rim & atmospheric backlight
 * - Smooth lerped mouse-follow rotation
 */

(function () {
  const container = document.getElementById('hero-3d-container');
  const canvas = document.getElementById('model-canvas');
  if (!container || !canvas) return;

  // ── 1. Renderer Setup ───────────────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  renderer.setClearColor(0x000000, 0);

  // ── 2. Scene & Camera ───────────────────────────────────────────────────────
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0, 5.5);

  // ── 3. Lighting Setup (Cinematic Dark & Deep Red Glow) ──────────────────────
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xf4f4f5, 1.9);
  keyLight.position.set(-2, 3, 4);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xa1a1aa, 0.85);
  fillLight.position.set(-4, -1, 2);
  scene.add(fillLight);

  const redRimLight = new THREE.DirectionalLight(0xef4444, 4.5);
  redRimLight.position.set(3, 2, -2.5);
  scene.add(redRimLight);

  const redAccentLight = new THREE.PointLight(0xdc2626, 3.5, 8);
  redAccentLight.position.set(2, -1.5, 1);
  scene.add(redAccentLight);

  const glowGeo = new THREE.SphereGeometry(1.4, 32, 32);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xef4444,
    transparent: true,
    opacity: 0.14,
    side: THREE.BackSide
  });
  const glowMesh = new THREE.Mesh(glowGeo, glowMat);
  glowMesh.position.set(1.6, 0.2, -1.2);
  scene.add(glowMesh);

  // ── 4. Pivot Group & Variables ─────────────────────────────────────────────
  const pivot = new THREE.Group();
  scene.add(pivot);

  let modelMesh = null;
  let mixer = null;
  let targetRotY = 0;
  let targetRotX = 0;
  let baseScale = 1;

  // ── 5. Responsive Layout Setup ─────────────────────────────────────────────
  function updateLayout() {
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    const isMobile = w < 768;
    const isTablet = w >= 768 && w < 1024;

    if (isMobile) {
      pivot.position.set(0, -1.8, 0);
      baseScale = 0.72;
      glowMesh.position.set(0, -0.5, -1.5);
    } else if (isTablet) {
      pivot.position.set(1.1, -1.4, 0);
      baseScale = 0.85;
      glowMesh.position.set(1.1, 0, -1.2);
    } else {
      pivot.position.set(1.6, -1.3, 0);
      baseScale = 0.98;
      glowMesh.position.set(1.6, 0.2, -1.2);
    }

    if (modelMesh) {
      pivot.scale.setScalar(baseScale);
    }
  }

  window.addEventListener('resize', updateLayout);

  // ── 6. Mouse & Touch Tracking ──────────────────────────────────────────────
  function onMouseMove(e) {
    const normX = (e.clientX / window.innerWidth) * 2 - 1;
    const normY = -(e.clientY / window.innerHeight) * 2 + 1;
    targetRotY = normX * 0.35;
    targetRotX = -normY * 0.2;
  }

  function onTouchMove(e) {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const normX = (touch.clientX / window.innerWidth) * 2 - 1;
      const normY = -(touch.clientY / window.innerHeight) * 2 + 1;
      targetRotY = normX * 0.25;
      targetRotX = -normY * 0.15;
    }
  }

  window.addEventListener('mousemove', onMouseMove, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: true });

  // ── 7. GLTFLoader & Animation Setup ───────────────────────────────────────
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/three@0.134.0/examples/js/loaders/GLTFLoader.js';
  script.onload = () => loadGLTF();
  document.head.appendChild(script);

  function loadGLTF() {
    if (typeof THREE.GLTFLoader === 'undefined') return;

    const loader = new THREE.GLTFLoader();
    const modelUrl = 'model.glb?v=' + Date.now();

    loader.load(
      modelUrl,
      (gltf) => {
        modelMesh = gltf.scene;

        console.log("GLB loaded");
        console.log("Available animations:", gltf.animations);
        console.log("Animation count:", gltf.animations.length);
        console.log(
          "Animation names:",
          gltf.animations.map((clip) => clip.name)
        );

        // Collect and log skeleton bone names
        const boneNames = [];
        modelMesh.traverse((node) => {
          if (node.isBone) {
            boneNames.push(node.name);
          }
          if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
            if (node.material) {
              node.material.roughness = 0.5;
              node.material.metalness = 0.2;
              node.material.needsUpdate = true;
            }
          }
        });
        console.log("Skeleton bone names:", boneNames);

        // Auto-center and normalize model scale
        const box = new THREE.Box3().setFromObject(modelMesh);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scaleFactor = 3.6 / maxDim;

        modelMesh.position.sub(center.multiplyScalar(scaleFactor));
        modelMesh.scale.setScalar(scaleFactor);

        // Animation Mixer Setup
        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(modelMesh);
          const clip = gltf.animations[0];

          console.log("Playing animation:", clip.name);

          const action = mixer.clipAction(clip);
          action.reset();
          action.setLoop(THREE.LoopRepeat, Infinity);
          action.clampWhenFinished = false;
          action.play();

          window.avatarMixer = mixer;
        } else {
          console.warn("Animation count is 0. Applying bone pose fallback.");
          // Pose Fallback: Inspect actual bone names to rest arms naturally if 0 animation clips exist
          modelMesh.traverse((node) => {
            if (node.isBone) {
              const name = node.name;
              if (name === 'RightArm' || name === 'RightShoulder' || name === 'Arm_R' || name === 'mixamorigRightArm') {
                node.rotation.z = 1.2;
              } else if (name === 'LeftArm' || name === 'LeftShoulder' || name === 'Arm_L' || name === 'mixamorigLeftArm') {
                node.rotation.z = -1.2;
              }
            }
          });
        }

        pivot.add(modelMesh);
        updateLayout();
        container.classList.add('loaded');
      },
      undefined,
      (error) => {
        console.warn('[model.js] Could not load model.glb:', error);
        createFallbackMesh();
      }
    );
  }

  function createFallbackMesh() {
    const geo = new THREE.IcosahedronGeometry(1.3, 4);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      metalness: 0.8,
      roughness: 0.2,
      wireframe: true,
      emissive: 0x991b1b,
      emissiveIntensity: 0.4
    });
    modelMesh = new THREE.Mesh(geo, mat);
    pivot.add(modelMesh);
    updateLayout();
    container.classList.add('loaded');
  }

  // ── 8. Render Animation Loop ───────────────────────────────────────────────
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    // Update AnimationMixer before rendering
    if (mixer) {
      mixer.update(delta);
    } else if (window.avatarMixer) {
      window.avatarMixer.update(delta);
    }

    // Smooth Lerp Rotation towards mouse targets
    pivot.rotation.y += (targetRotY - pivot.rotation.y) * 0.05;
    pivot.rotation.x += (targetRotX - pivot.rotation.x) * 0.05;

    // Subtle background float oscillation
    pivot.position.y += (Math.sin(elapsedTime * 0.9) * 0.03 - (pivot.position.y - (window.innerWidth < 768 ? -1.8 : -1.3))) * 0.05;

    // Subtle Red Glow Pulsing
    glowMat.opacity = 0.14 + Math.sin(elapsedTime * 1.5) * 0.04;

    renderer.render(scene, camera);
  }

  // Initialize layout and start animation loop
  updateLayout();
  animate();
})();
