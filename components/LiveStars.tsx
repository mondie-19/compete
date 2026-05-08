"use client";
import React, { useEffect, useRef } from "react";

export default function LiveStars() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let stars: any[] = [];
    let shootingStars: any[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    const initStars = () => {
      stars = [];
      const numStars = Math.floor((canvas.width * canvas.height) / 2000); // More dense
      const colors = ['#ffffff', '#e0f0ff', '#e8d4ff', '#b3d9ff'];
      
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2, // slightly larger max size
          opacity: Math.random(),
          twinkleSpeed: 0.005 + Math.random() * 0.02,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    const drawStars = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw static/twinkling stars
      stars.forEach((star) => {
        star.opacity += star.twinkleSpeed;
        if (star.opacity > 1 || star.opacity < 0.1) {
          star.twinkleSpeed = -star.twinkleSpeed;
        }
        
        // Convert hex to rgba to apply the opacity loop
        ctx.fillStyle = star.color; 
        ctx.globalAlpha = star.opacity;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0; // Reset
      });

      // Handle shooting stars
      // ~1% chance per frame to form a shooting star
      if (Math.random() < 0.01) {
        shootingStars.push({
          x: Math.random() * canvas.width * 1.5, // Start further right to span screen
          y: Math.random() * (canvas.height * 0.3), // Start from the top ~30%
          length: 60 + Math.random() * 80,
          speed: 15 + Math.random() * 20,
          opacity: 1
        });
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        ss.x -= ss.speed;
        // Travel down-left slightly flatter than 45 degrees
        ss.y += ss.speed * 0.6; 
        ss.opacity -= 0.015; // Fade over time

        if (ss.opacity <= 0 || ss.x < -100 || ss.y > canvas.height + 100) {
          shootingStars.splice(i, 1);
          continue;
        }

        // Creating gradient trailing effect
        const grad = ctx.createLinearGradient(ss.x, ss.y, ss.x + ss.length, ss.y - ss.length * 0.6);
        grad.addColorStop(0, `rgba(255, 255, 255, ${ss.opacity})`);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(ss.x + ss.length, ss.y - ss.length * 0.6);
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(drawStars);
    };

    window.addEventListener("resize", resize);
    resize();
    drawStars();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 z-0 h-full w-full pointer-events-none"
    />
  );
}
