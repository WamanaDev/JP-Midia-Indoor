"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";

interface ThreeBadgeProps {
  size?: number;
  color?: number;
  accent?: number;
  geometry?: "icosahedron" | "torus";
}

/**
 * Small decorative rotating 3D badge, meant to sit behind a normal React
 * text overlay (the clock digits / temperature stay as plain <span>s so
 * they remain crisp and, later, portable to React Native <Text>).
 *
 * Only core THREE APIs are used here (Scene, PerspectiveCamera, Mesh,
 * Material, Light) with no browser-only tricks (no CanvasTexture built
 * from `document.createElement`). The only web-specific piece is how the
 * <canvas> and renderer are created below — swap that block for
 * `expo-gl`'s `<GLView onContextCreate>` + `expo-three`'s `Renderer` in
 * the React Native app and the rest of this file (scene, mesh, GSAP
 * rotation) carries over unchanged.
 */
export function ThreeBadge({
  size = 72,
  color = 0x3b82f6,
  accent = 0xfacc15,
  geometry = "icosahedron",
}: ThreeBadgeProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10);
    camera.position.z = 3.2;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const meshGeometry =
      geometry === "torus"
        ? new THREE.TorusGeometry(0.9, 0.32, 32, 64)
        : new THREE.IcosahedronGeometry(1.1, 0);

    const material = new THREE.MeshStandardMaterial({
      color,
      emissive: accent,
      emissiveIntensity: 0.15,
      roughness: 0.35,
      metalness: 0.4,
      flatShading: geometry !== "torus",
    });

    const mesh = new THREE.Mesh(meshGeometry, material);
    scene.add(mesh);

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const key = new THREE.DirectionalLight(accent, 1.1);
    key.position.set(2, 2, 3);
    scene.add(key);

    let frameId = 0;
    const tween = prefersReducedMotion
      ? null
      : gsap.to(mesh.rotation, {
          y: `+=${Math.PI * 2}`,
          x: `+=${Math.PI * 0.6}`,
          duration: 12,
          repeat: -1,
          ease: "none",
        });

    function animate() {
      frameId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      tween?.kill();
      meshGeometry.dispose();
      material.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [size, color, accent, geometry]);

  return (
    <div
      ref={containerRef}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}
