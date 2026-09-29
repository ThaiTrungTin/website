'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface SloganAura3DProps {
  className?: string;
}

export default function SloganAura3D({ className = '' }: SloganAura3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 600;
    let height = container.clientHeight || 400;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 24;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // transparent background
    container.appendChild(renderer.domElement);

    // 2. Generate soft radial particle texture with canvas
    const createParticleTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.25, 'rgba(255, 235, 180, 0.85)');
        gradient.addColorStop(0.6, 'rgba(100, 200, 120, 0.35)');
        gradient.addColorStop(1, 'rgba(45, 90, 39, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(32, 32, 32, 0, Math.PI * 2);
        ctx.fill();
      }
      return new THREE.CanvasTexture(canvas);
    };

    const particleTexture = createParticleTexture();

    // 3. Particle System Data
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 45 : 95;

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const basePositions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);
    const speeds = new Float32Array(particleCount);
    const phases = new Float32Array(particleCount);

    // Brand color palette (Emerald green, gold, warm white)
    const colorPalette = [
      new THREE.Color(0xffb800), // Gold
      new THREE.Color(0xffd54f), // Warm Amber
      new THREE.Color(0x2d5a27), // Deep Emerald
      new THREE.Color(0x52b788), // Bright Emerald
      new THREE.Color(0xffffff), // Luminous White
    ];

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      // Spread across the slogan area in an elliptical aura
      const radiusX = (Math.random() - 0.5) * 22;
      const radiusY = (Math.random() - 0.5) * 11;
      const radiusZ = (Math.random() - 0.5) * 6;

      positions[i3] = radiusX;
      positions[i3 + 1] = radiusY;
      positions[i3 + 2] = radiusZ;

      basePositions[i3] = radiusX;
      basePositions[i3 + 1] = radiusY;
      basePositions[i3 + 2] = radiusZ;

      const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i3] = col.r;
      colors[i3 + 1] = col.g;
      colors[i3 + 2] = col.b;

      scales[i] = 0.5 + Math.random() * 1.6;
      speeds[i] = 0.3 + Math.random() * 0.8;
      phases[i] = Math.random() * Math.PI * 2;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: isMobile ? 1.6 : 2.2,
      map: particleTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      depthWrite: false,
      opacity: 0.75,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // 4. Subtle connecting constellation lines between near particles
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x52b788,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const maxLines = 60;
    const linePositions = new Float32Array(maxLines * 6);
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    // 5. Mouse Interaction Tracking
    let targetMouseX = 0;
    let targetMouseY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetMouseX = x * 14;
      targetMouseY = -y * 8;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // 6. Responsive Resize
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 600;
      height = container.clientHeight || 400;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // 7. Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    // Intro entrance progress (0 to 1)
    let entranceProgress = 0;

    let isVisible = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const wasVisible = isVisible;
        isVisible = entry.isIntersecting;
        if (isVisible && !wasVisible) {
          animId = requestAnimationFrame(animate);
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    const animate = () => {
      if (!isVisible) {
        animId = 0;
        return;
      }
      animId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth entrance expansion
      if (entranceProgress < 1) {
        entranceProgress = Math.min(1, entranceProgress + 0.015);
      }

      // Smooth mouse follow
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      const posAttr = geometry.attributes.position as THREE.BufferAttribute;
      const currentPos = posAttr.array as Float32Array;

      let lineIndex = 0;
      const linePos = lineGeometry.attributes.position.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const speed = speeds[i];
        const phase = phases[i];

        // Harmonic orbital float + gentle breathing wave
        const floatX = Math.sin(elapsedTime * speed + phase) * 0.7;
        const floatY = Math.cos(elapsedTime * (speed * 0.8) + phase) * 0.6;
        const floatZ = Math.sin(elapsedTime * (speed * 0.5) + phase) * 0.5;

        // Base target position scaled by entrance progress
        let tx = basePositions[i3] * entranceProgress + floatX;
        let ty = basePositions[i3 + 1] * entranceProgress + floatY;
        let tz = basePositions[i3 + 2] + floatZ;

        // Interactive mouse attraction / gentle repulse wave
        const dx = tx - mouseX;
        const dy = ty - mouseY;
        const distSq = dx * dx + dy * dy;

        if (distSq < 36 && distSq > 0.01) {
          const force = (1 - Math.sqrt(distSq) / 6) * 1.2;
          tx += dx * force * 0.35;
          ty += dy * force * 0.35;
        }

        currentPos[i3] = tx;
        currentPos[i3 + 1] = ty;
        currentPos[i3 + 2] = tz;

        // Find close neighbors to draw subtle constellation lines
        if (lineIndex < maxLines && i < 30) {
          for (let j = i + 1; j < 30 && lineIndex < maxLines; j++) {
            const j3 = j * 3;
            const ndx = currentPos[i3] - currentPos[j3];
            const ndy = currentPos[i3 + 1] - currentPos[j3 + 1];
            const ndz = currentPos[i3 + 2] - currentPos[j3 + 2];
            const dist = Math.sqrt(ndx * ndx + ndy * ndy + ndz * ndz);

            if (dist < 4.2) {
              const lIdx = lineIndex * 6;
              linePos[lIdx] = currentPos[i3];
              linePos[lIdx + 1] = currentPos[i3 + 1];
              linePos[lIdx + 2] = currentPos[i3 + 2];

              linePos[lIdx + 3] = currentPos[j3];
              linePos[lIdx + 4] = currentPos[j3 + 1];
              linePos[lIdx + 5] = currentPos[j3 + 2];
              lineIndex++;
            }
          }
        }
      }

      // Clear remaining line slots
      for (let l = lineIndex * 6; l < maxLines * 6; l++) {
        linePos[l] = 0;
      }

      posAttr.needsUpdate = true;
      lineGeometry.attributes.position.needsUpdate = true;

      // Gentle global rotation
      particles.rotation.z = Math.sin(elapsedTime * 0.08) * 0.04;
      particles.rotation.y = Math.sin(elapsedTime * 0.05) * 0.06;

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    // 8. Cleanup
    return () => {
      observer.disconnect();
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      geometry.dispose();
      material.dispose();
      particleTexture.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none z-10 ${className}`}
      aria-hidden="true"
    />
  );
}
