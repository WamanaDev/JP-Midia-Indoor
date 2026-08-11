"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

function makeDotTexture() {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.4, "rgba(255,255,255,0.6)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Ambient "network of screens" backdrop for the hero: a field of glowing
 * nodes with lines drawn between nearby ones, slowly drifting and easing
 * toward the pointer. Pauses off-screen and respects reduced-motion.
 */
export function NetworkBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const isSmall = window.innerWidth < 768;
    const NODE_COUNT = isSmall ? 60 : 130;
    const LINK_DISTANCE = 3.2;
    const COLORS = [0x3b82f6, 0xfacc15, 0x60a5fa];

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      100,
    );
    camera.position.z = 14;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "low-power",
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // Nodes
    const positions = new Float32Array(NODE_COUNT * 3);
    const colors = new Float32Array(NODE_COUNT * 3);
    const velocities: THREE.Vector3[] = [];
    const color = new THREE.Color();

    for (let i = 0; i < NODE_COUNT; i++) {
      const x = (Math.random() - 0.5) * 22;
      const y = (Math.random() - 0.5) * 14;
      const z = (Math.random() - 0.5) * 10;
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      color.set(COLORS[i % COLORS.length]);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      velocities.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.004,
          (Math.random() - 0.5) * 0.004,
          (Math.random() - 0.5) * 0.004,
        ),
      );
    }

    const pointsGeometry = new THREE.BufferGeometry();
    pointsGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );
    pointsGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const dotTexture = makeDotTexture();
    const pointsMaterial = new THREE.PointsMaterial({
      size: 0.34,
      map: dotTexture,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(pointsGeometry, pointsMaterial);
    group.add(points);

    // Links (rebuilt each frame from current positions)
    const linkGeometry = new THREE.BufferGeometry();
    const maxLinks = NODE_COUNT * 6;
    const linkPositions = new Float32Array(maxLinks * 2 * 3);
    linkGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(linkPositions, 3),
    );
    const linkMaterial = new THREE.LineBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
    });
    const links = new THREE.LineSegments(linkGeometry, linkMaterial);
    group.add(links);

    function updateLinks() {
      const pos = pointsGeometry.attributes.position
        .array as Float32Array;
      let linkIndex = 0;
      for (let i = 0; i < NODE_COUNT && linkIndex < maxLinks; i++) {
        const ax = pos[i * 3];
        const ay = pos[i * 3 + 1];
        const az = pos[i * 3 + 2];
        for (let j = i + 1; j < NODE_COUNT && linkIndex < maxLinks; j++) {
          const bx = pos[j * 3];
          const by = pos[j * 3 + 1];
          const bz = pos[j * 3 + 2];
          const dx = ax - bx;
          const dy = ay - by;
          const dz = az - bz;
          const distSq = dx * dx + dy * dy + dz * dz;
          if (distSq < LINK_DISTANCE * LINK_DISTANCE) {
            const base = linkIndex * 6;
            linkPositions[base] = ax;
            linkPositions[base + 1] = ay;
            linkPositions[base + 2] = az;
            linkPositions[base + 3] = bx;
            linkPositions[base + 4] = by;
            linkPositions[base + 5] = bz;
            linkIndex++;
          }
        }
      }
      linkGeometry.setDrawRange(0, linkIndex * 2);
      linkGeometry.attributes.position.needsUpdate = true;
    }

    updateLinks();

    // Pointer parallax
    const pointer = { x: 0, y: 0 };
    const targetRotation = { x: 0, y: 0 };
    function handlePointerMove(event: PointerEvent) {
      const rect = container!.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    }
    window.addEventListener("pointermove", handlePointerMove);

    // Visibility pause
    let isVisible = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 },
    );
    observer.observe(container);

    let frameId = 0;
    let frameCount = 0;
    const clock = new THREE.Clock();

    function animate() {
      frameId = requestAnimationFrame(animate);
      if (!isVisible) return;

      const delta = clock.getDelta();
      frameCount++;

      if (!prefersReducedMotion) {
        const pos = pointsGeometry.attributes.position
          .array as Float32Array;
        for (let i = 0; i < NODE_COUNT; i++) {
          pos[i * 3] += velocities[i].x;
          pos[i * 3 + 1] += velocities[i].y;
          pos[i * 3 + 2] += velocities[i].z;

          if (Math.abs(pos[i * 3]) > 11) velocities[i].x *= -1;
          if (Math.abs(pos[i * 3 + 1]) > 7) velocities[i].y *= -1;
          if (Math.abs(pos[i * 3 + 2]) > 5) velocities[i].z *= -1;
        }
        pointsGeometry.attributes.position.needsUpdate = true;

        // Recomputing every frame is wasteful for a static-ish backdrop.
        if (frameCount % 3 === 0) updateLinks();

        targetRotation.x = pointer.y * 0.15;
        targetRotation.y = pointer.x * 0.25;
        group.rotation.x += (targetRotation.x - group.rotation.x) * 0.02;
        group.rotation.y +=
          (targetRotation.y - group.rotation.y + delta * 0.03) * 0.02;
      }

      renderer.render(scene, camera);
    }
    animate();

    function handleResize() {
      const width = container!.clientWidth;
      const height = container!.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
      pointsGeometry.dispose();
      pointsMaterial.dispose();
      linkGeometry.dispose();
      linkMaterial.dispose();
      dotTexture.dispose();
      renderer.dispose();
      container!.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
