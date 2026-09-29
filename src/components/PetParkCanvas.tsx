'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, Heart, ShieldCheck, Award } from 'lucide-react';

export default function PetParkCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeMood, setActiveMood] = useState<'happy' | 'playful' | 'loved'>('happy');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    // --- SCENE & RENDERER ---
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 2.2, 7.2);
    camera.lookAt(0, 0.6, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    renderer.domElement.style.touchAction = 'pan-y';

    // --- STUDIO LIGHTING SETUP ---
    // Warm key light
    const keyLight = new THREE.DirectionalLight(0xfff5e6, 2.2);
    keyLight.position.set(4, 7, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 20;
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);

    // Cool cyan/mint rim light for depth
    const rimLight = new THREE.DirectionalLight(0xd4f5e2, 1.8);
    rimLight.position.set(-5, 6, -4);
    scene.add(rimLight);

    // Warm golden amber fill light (Pet M&M brand)
    const fillLight = new THREE.PointLight(0xffb800, 1.6, 12);
    fillLight.position.set(0, -1, 3);
    scene.add(fillLight);

    // Soft ambient hemisphere
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x2d5a27, 0.8);
    scene.add(hemiLight);

    // --- LUXURY MATERIALS ---
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xffb800,
      metalness: 0.85,
      roughness: 0.18,
    });

    const emeraldMat = new THREE.MeshStandardMaterial({
      color: 0x2d5a27,
      metalness: 0.3,
      roughness: 0.3,
    });

    const corgiOrangeMat = new THREE.MeshStandardMaterial({
      color: 0xe68a35, // warm cute corgi fur
      roughness: 0.45,
    });

    const pureWhiteFurMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.4,
    });

    const glossyEyeMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.05,
      metalness: 0.1,
    });

    const eyeHighlightMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
    });

    const cutePinkMat = new THREE.MeshStandardMaterial({
      color: 0xf472b6,
      roughness: 0.4,
    });

    const catFurMat = new THREE.MeshStandardMaterial({
      color: 0x64748b, // luxury british shorthair slate
      roughness: 0.4,
    });

    const stageMat = new THREE.MeshStandardMaterial({
      color: 0xfdfdfd,
      roughness: 0.25,
      metalness: 0.05,
    });

    const stageRingMat = new THREE.MeshStandardMaterial({
      color: 0xffb800,
      metalness: 0.9,
      roughness: 0.15,
    });

    // --- MAIN STAGE (STUDIO PODIUM) ---
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Luxury rounded pedestal
    const podiumGeo = new THREE.CylinderGeometry(2.6, 2.7, 0.35, 48);
    const podiumMesh = new THREE.Mesh(podiumGeo, stageMat);
    podiumMesh.position.y = -0.18;
    podiumMesh.receiveShadow = true;
    rootGroup.add(podiumMesh);

    // Glowing Golden Accent Ring around stage
    const ringGeo = new THREE.TorusGeometry(2.62, 0.035, 16, 64);
    const ringMesh = new THREE.Mesh(ringGeo, stageRingMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = -0.01;
    rootGroup.add(ringMesh);

    // Soft Contact Shadow Plane underneath
    const shadowGeo = new THREE.PlaneGeometry(6.5, 6.5);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const ctx = shadowCanvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(30, 45, 25, 0.35)');
    grad.addColorStop(0.5, 'rgba(30, 45, 25, 0.12)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.37;
    rootGroup.add(shadowPlane);

    // ==========================================
    // 1. ADORABLE 3D CORGI DOG (Center-Left)
    // ==========================================
    const dog = new THREE.Group();
    dog.position.set(-0.75, 0, 0.2);
    dog.rotation.y = 0.45;
    rootGroup.add(dog);

    // Torso (Cute plump rounded cylinder)
    const dogBodyGeo = new THREE.CylinderGeometry(0.5, 0.52, 0.95, 24);
    const dogBody = new THREE.Mesh(dogBodyGeo, corgiOrangeMat);
    dogBody.rotation.x = Math.PI / 2;
    dogBody.position.set(0, 0.52, 0);
    dogBody.castShadow = true;
    dog.add(dogBody);

    // White fluffy chest & underbelly
    const chestGeo = new THREE.SphereGeometry(0.48, 20, 20);
    const chest = new THREE.Mesh(chestGeo, pureWhiteFurMat);
    chest.scale.set(0.9, 0.9, 1.05);
    chest.position.set(0, 0.56, 0.3);
    dog.add(chest);

    // Dog Head Group
    const dogHead = new THREE.Group();
    dogHead.position.set(0, 0.95, 0.48);
    dog.add(dogHead);

    // Main rounded head
    const headSphereGeo = new THREE.SphereGeometry(0.44, 24, 24);
    const headMesh = new THREE.Mesh(headSphereGeo, corgiOrangeMat);
    headMesh.castShadow = true;
    dogHead.add(headMesh);

    // White face blaze
    const blazeGeo = new THREE.SphereGeometry(0.26, 16, 16);
    const blazeMesh = new THREE.Mesh(blazeGeo, pureWhiteFurMat);
    blazeMesh.scale.set(0.7, 1.2, 0.8);
    blazeMesh.position.set(0, 0.05, 0.24);
    dogHead.add(blazeMesh);

    // Cute rounded muzzle
    const muzzleGeo = new THREE.CylinderGeometry(0.2, 0.24, 0.28, 16);
    const muzzleMesh = new THREE.Mesh(muzzleGeo, pureWhiteFurMat);
    muzzleMesh.rotation.x = Math.PI / 2;
    muzzleMesh.position.set(0, -0.1, 0.38);
    dogHead.add(muzzleMesh);

    // Black heart/button nose
    const noseGeo = new THREE.SphereGeometry(0.07, 12, 12);
    const nose = new THREE.Mesh(noseGeo, glossyEyeMat);
    nose.scale.set(1.2, 0.9, 1);
    nose.position.set(0, -0.04, 0.53);
    dogHead.add(nose);

    // Big happy eyes with bright catchlights
    const eyeGeo = new THREE.SphereGeometry(0.065, 16, 16);
    const eyeL = new THREE.Mesh(eyeGeo, glossyEyeMat);
    eyeL.position.set(-0.18, 0.08, 0.35);
    dogHead.add(eyeL);

    const eyeR = new THREE.Mesh(eyeGeo, glossyEyeMat);
    eyeR.position.set(0.18, 0.08, 0.35);
    dogHead.add(eyeR);

    // Catchlights (sparkle in eye)
    const catchGeo = new THREE.SphereGeometry(0.02, 8, 8);
    const catchL = new THREE.Mesh(catchGeo, eyeHighlightMat);
    catchL.position.set(-0.16, 0.1, 0.4);
    dogHead.add(catchL);

    const catchR = new THREE.Mesh(catchGeo, eyeHighlightMat);
    catchR.position.set(0.16, 0.1, 0.4);
    dogHead.add(catchR);

    // Panting pink tongue
    const tongueGeo = new THREE.CylinderGeometry(0.07, 0.08, 0.16, 12);
    const tongue = new THREE.Mesh(tongueGeo, cutePinkMat);
    tongue.rotation.x = Math.PI / 2.5;
    tongue.position.set(0, -0.22, 0.44);
    dogHead.add(tongue);

    // Big Corgi Ears with Pink Inner
    const createCorgiEar = (side: number) => {
      const earGroup = new THREE.Group();
      earGroup.position.set(side * 0.28, 0.36, -0.02);
      earGroup.rotation.z = side * -0.32;
      earGroup.rotation.x = -0.15;

      const outerGeo = new THREE.ConeGeometry(0.18, 0.44, 16);
      outerGeo.scale(1, 1, 0.5);
      const outer = new THREE.Mesh(outerGeo, corgiOrangeMat);
      outer.castShadow = true;
      earGroup.add(outer);

      const innerGeo = new THREE.ConeGeometry(0.12, 0.35, 16);
      innerGeo.scale(1, 1, 0.4);
      const inner = new THREE.Mesh(innerGeo, cutePinkMat);
      inner.position.z = 0.03;
      earGroup.add(inner);

      return earGroup;
    };
    const earLeft = createCorgiEar(-1);
    const earRight = createCorgiEar(1);
    dogHead.add(earLeft);
    dogHead.add(earRight);

    // Medical Bandana / Collar around Corgi Neck (Pet M&M Emerald & Gold)
    const collarGeo = new THREE.TorusGeometry(0.46, 0.05, 12, 28);
    const collar = new THREE.Mesh(collarGeo, emeraldMat);
    collar.rotation.x = Math.PI / 2;
    collar.position.set(0, 0.86, 0.35);
    dog.add(collar);

    const tagGeo = new THREE.SphereGeometry(0.08, 12, 12);
    tagGeo.scale(1, 1, 0.3);
    const tag = new THREE.Mesh(tagGeo, goldMat);
    tag.position.set(0, 0.76, 0.78);
    dog.add(tag);

    // 4 Stubby cute paws
    const pawGeo = new THREE.CylinderGeometry(0.13, 0.15, 0.25, 16);
    const pawFL = new THREE.Mesh(pawGeo, pureWhiteFurMat);
    pawFL.position.set(-0.25, 0.12, 0.35);
    dog.add(pawFL);

    const pawFR = new THREE.Mesh(pawGeo, pureWhiteFurMat);
    pawFR.position.set(0.25, 0.12, 0.35);
    dog.add(pawFR);

    const pawBL = new THREE.Mesh(pawGeo, corgiOrangeMat);
    pawBL.position.set(-0.3, 0.12, -0.32);
    dog.add(pawBL);

    const pawBR = new THREE.Mesh(pawGeo, corgiOrangeMat);
    pawBR.position.set(0.3, 0.12, -0.32);
    dog.add(pawBR);

    // Corgi Tail (Wagging joyfully)
    const tailGroup = new THREE.Group();
    tailGroup.position.set(0, 0.65, -0.48);
    dog.add(tailGroup);

    const tailMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 16, 16),
      pureWhiteFurMat
    );
    tailMesh.scale.set(0.9, 1.2, 1.4);
    tailGroup.add(tailMesh);

    // ==========================================
    // 2. LUXURY BRITISH SHORTHAIR CAT (Center-Right)
    // ==========================================
    const cat = new THREE.Group();
    cat.position.set(0.85, 0, 0.35);
    cat.rotation.y = -0.55;
    rootGroup.add(cat);

    // Cat Body (Sleek sitting posture)
    const catBodyGeo = new THREE.CylinderGeometry(0.32, 0.44, 0.85, 20);
    const catBody = new THREE.Mesh(catBodyGeo, catFurMat);
    catBody.position.set(0, 0.44, 0);
    catBody.castShadow = true;
    cat.add(catBody);

    // Cat Chest (White Tuxedo patch)
    const catChestGeo = new THREE.SphereGeometry(0.34, 16, 16);
    catChestGeo.scale(0.8, 1.1, 0.9);
    const catChest = new THREE.Mesh(catChestGeo, pureWhiteFurMat);
    catChest.position.set(0, 0.46, 0.15);
    cat.add(catChest);

    // Cat Head
    const catHead = new THREE.Group();
    catHead.position.set(0, 0.96, 0.05);
    cat.add(catHead);

    const catHeadGeo = new THREE.SphereGeometry(0.35, 24, 24);
    const catHeadMesh = new THREE.Mesh(catHeadGeo, catFurMat);
    catHeadMesh.castShadow = true;
    catHead.add(catHeadMesh);

    // Cat Cheeks (Cute chubby British Shorthair cheeks)
    const cheekGeo = new THREE.SphereGeometry(0.15, 14, 14);
    const cheekL = new THREE.Mesh(cheekGeo, pureWhiteFurMat);
    cheekL.position.set(-0.11, -0.07, 0.24);
    catHead.add(cheekL);

    const cheekR = new THREE.Mesh(cheekGeo, pureWhiteFurMat);
    cheekR.position.set(0.11, -0.07, 0.24);
    catHead.add(cheekR);

    // Golden Amber Cat Eyes
    const catEyeMat = new THREE.MeshStandardMaterial({
      color: 0xffb800,
      roughness: 0.1,
      metalness: 0.2,
    });
    const cEyeGeo = new THREE.SphereGeometry(0.06, 16, 16);
    const cEyeL = new THREE.Mesh(cEyeGeo, catEyeMat);
    cEyeL.position.set(-0.14, 0.05, 0.28);
    catHead.add(cEyeL);

    const cEyeR = new THREE.Mesh(cEyeGeo, catEyeMat);
    cEyeR.position.set(0.14, 0.05, 0.28);
    catHead.add(cEyeR);

    // Slit pupil
    const pupilGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.09, 8);
    const pupilL = new THREE.Mesh(pupilGeo, glossyEyeMat);
    pupilL.position.set(-0.14, 0.05, 0.33);
    catHead.add(pupilL);

    const pupilR = new THREE.Mesh(pupilGeo, glossyEyeMat);
    pupilR.position.set(0.14, 0.05, 0.33);
    catHead.add(pupilR);

    // Cat Nose
    const cNose = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.04, 3), cutePinkMat);
    cNose.rotation.x = Math.PI;
    cNose.position.set(0, -0.05, 0.35);
    catHead.add(cNose);

    // Cat Triangular Ears
    const createCatEar = (side: number) => {
      const earGroup = new THREE.Group();
      earGroup.position.set(side * 0.22, 0.28, 0);
      earGroup.rotation.z = side * -0.25;

      const out = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.26, 4), catFurMat);
      out.castShadow = true;
      earGroup.add(out);

      const inn = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.2, 4), cutePinkMat);
      inn.position.z = 0.02;
      earGroup.add(inn);

      return earGroup;
    };
    catHead.add(createCatEar(-1));
    catHead.add(createCatEar(1));

    // Cat Paws
    const cPawGeo = new THREE.SphereGeometry(0.11, 14, 14);
    cPawGeo.scale(1, 0.7, 1.3);
    const cPawL = new THREE.Mesh(cPawGeo, pureWhiteFurMat);
    cPawL.position.set(-0.16, 0.08, 0.28);
    cat.add(cPawL);

    const cPawR = new THREE.Mesh(cPawGeo, pureWhiteFurMat);
    cPawR.position.set(0.16, 0.08, 0.28);
    cat.add(cPawR);

    // Elegant long swaying Cat Tail
    const catTailGroup = new THREE.Group();
    catTailGroup.position.set(0, 0.15, -0.32);
    cat.add(catTailGroup);

    const catTailMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.06, 0.8, 12),
      catFurMat
    );
    catTailMesh.position.set(0.1, 0.35, -0.15);
    catTailMesh.rotation.x = -0.5;
    catTailMesh.rotation.z = 0.3;
    catTailGroup.add(catTailMesh);

    // ==========================================
    // 3. FLOATING LUXURY ELEMENTS & TOYS
    // ==========================================
    // Playful Luxury Gold Ball
    const ballMesh = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 24), goldMat);
    ballMesh.position.set(0.05, 0.22, 0.95);
    ballMesh.castShadow = true;
    rootGroup.add(ballMesh);

    // Floating 3D Medical Cross Gem (Gold & Diamond)
    const floatGemGroup = new THREE.Group();
    floatGemGroup.position.set(0, 2.5, 0);
    rootGroup.add(floatGemGroup);

    const barH = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.18, 0.18), goldMat);
    const barV = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.55, 0.18), goldMat);
    barH.castShadow = true;
    barV.castShadow = true;
    floatGemGroup.add(barH);
    floatGemGroup.add(barV);

    // Orbiting Sparkle Stars / Spheres
    const sparkleGroup = new THREE.Group();
    scene.add(sparkleGroup);
    const sparkles: THREE.Mesh[] = [];
    for (let i = 0; i < 8; i++) {
      const sp = new THREE.Mesh(
        new THREE.SphereGeometry(0.045, 8, 8),
        new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0xffb800 : 0x2d5a27 })
      );
      const angle = (i / 8) * Math.PI * 2;
      const radius = 2.2 + (i % 3) * 0.4;
      sp.position.set(
        Math.cos(angle) * radius,
        1.2 + Math.sin(angle * 2) * 0.8,
        Math.sin(angle) * radius
      );
      sparkleGroup.add(sp);
      sparkles.push(sp);
    }

    // --- MOUSE PARALLAX / ROTATION ---
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX = x * 0.6;
      mouseY = y * 0.3;
    };

    window.addEventListener('mousemove', onMouseMove);

    // --- ANIMATION LOOP ---
    const startTime = performance.now();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = (performance.now() - startTime) * 0.001;

      // Smooth camera/scene parallax tracking
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      rootGroup.rotation.y = targetX * 1.1 + Math.sin(t * 0.4) * 0.08;
      rootGroup.rotation.x = -targetY * 0.5;

      // 1. Corgi playful animation (Tail wag, head bob, breathing)
      tailGroup.rotation.y = Math.sin(t * 16) * 0.65;
      dogHead.rotation.z = Math.sin(t * 2.2) * 0.08;
      dogHead.rotation.x = Math.sin(t * 3.5) * 0.04;
      dog.position.y = Math.abs(Math.sin(t * 4)) * 0.035;
      tongue.position.y = -0.22 + Math.sin(t * 8) * 0.015;

      // 2. Cat gentle breathing & tail sway
      catTailGroup.rotation.y = Math.sin(t * 2.5) * 0.45;
      catHead.rotation.y = Math.sin(t * 1.5) * 0.12;
      catBody.scale.y = 1 + Math.sin(t * 2.5) * 0.02;

      // 3. Playful gold ball bounce
      ballMesh.position.y = 0.22 + Math.abs(Math.sin(t * 4.5)) * 0.18;
      ballMesh.rotation.x += 0.03;
      ballMesh.rotation.y += 0.02;

      // 4. Floating 3D Gold Cross Gem
      floatGemGroup.position.y = 2.4 + Math.sin(t * 2) * 0.15;
      floatGemGroup.rotation.y = t * 0.8;
      floatGemGroup.rotation.z = Math.sin(t) * 0.1;

      // 5. Sparkles pulse
      sparkles.forEach((sp, i) => {
        sp.scale.setScalar(0.8 + Math.sin(t * 3 + i) * 0.4);
      });

      renderer.render(scene, camera);
    };

    animate();

    // Resize
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[360px] sm:h-[440px] lg:h-[540px] rounded-3xl overflow-hidden bg-gradient-to-b from-[#F3F8F2] via-white to-[#FFFDF5] border border-emerald-900/10 shadow-[0_20px_50px_rgba(45,90,39,0.08)] select-none">
      {/* 3D Canvas element */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Luxury Glass Floating Badges */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md shadow-md border border-emerald-100 text-xs font-bold text-[#2D5A27]">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
        </span>
        <Sparkles className="w-3.5 h-3.5 text-[#FFB800]" />
        <span>3D Studio Thú Cưng Pet M&M</span>
      </div>

      {/* International Hospital Standard Badge */}
      <div className="absolute top-4 right-4 z-10 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md shadow-sm border border-slate-200/80 text-xs font-semibold text-slate-700">
        <Award className="w-3.5 h-3.5 text-[#FFB800]" />
        <span>Chuẩn Y Khoa Quốc Tế</span>
      </div>

      {/* Floating Pet Care Indicators Bottom Bar */}
      <div className="absolute bottom-4 inset-x-4 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md shadow-md border border-slate-200/80 text-xs font-medium text-slate-700">
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>Corgi & Mèo Shorthair siêu cưng</span>
        </div>

        <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#2D5A27]/90 backdrop-blur-md shadow-md text-white text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-[#FFB800]" />
          <span>100% Không sợ hãi (Fear-Free)</span>
        </div>
      </div>
    </div>
  );
}
