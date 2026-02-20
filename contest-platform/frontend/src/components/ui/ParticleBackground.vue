<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
}

const canvas = ref<HTMLCanvasElement | null>(null);
const particles = ref<Particle[]>([]);
let animationFrameId: number;
let ctx: CanvasRenderingContext2D | null = null;

const PARTICLE_COUNT = 50;
const CONNECTION_DISTANCE = 150;

const createParticles = (width: number, height: number) => {
  particles.value = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.value.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.2,
    });
  }
};

const updateParticles = (width: number, height: number) => {
  particles.value.forEach(particle => {
    particle.x += particle.vx;
    particle.y += particle.vy;

    // Bounce off edges
    if (particle.x < 0 || particle.x > width) particle.vx *= -1;
    if (particle.y < 0 || particle.y > height) particle.vy *= -1;

    // Keep in bounds
    particle.x = Math.max(0, Math.min(width, particle.x));
    particle.y = Math.max(0, Math.min(height, particle.y));
  });
};

const drawParticles = () => {
  if (!ctx || !canvas.value) return;

  const width = canvas.value.width;
  const height = canvas.value.height;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Draw connections
  ctx.strokeStyle = 'rgba(107, 70, 193, 0.15)'; // brand color
  ctx.lineWidth = 1;

  for (let i = 0; i < particles.value.length; i++) {
    for (let j = i + 1; j < particles.value.length; j++) {
      const dx = particles.value[i].x - particles.value[j].x;
      const dy = particles.value[i].y - particles.value[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < CONNECTION_DISTANCE) {
        const opacity = (1 - distance / CONNECTION_DISTANCE) * 0.3;
        ctx.strokeStyle = `rgba(107, 70, 193, ${opacity})`;
        ctx.beginPath();
        ctx.moveTo(particles.value[i].x, particles.value[i].y);
        ctx.lineTo(particles.value[j].x, particles.value[j].y);
        ctx.stroke();
      }
    }
  }

  // Draw particles
  particles.value.forEach(particle => {
    ctx!.fillStyle = `rgba(107, 70, 193, ${particle.opacity})`;
    ctx!.beginPath();
    ctx!.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    ctx!.fill();
  });
};

const animate = () => {
  if (!canvas.value) return;

  updateParticles(canvas.value.width, canvas.value.height);
  drawParticles();
  animationFrameId = requestAnimationFrame(animate);
};

const handleResize = () => {
  if (!canvas.value) return;

  canvas.value.width = canvas.value.offsetWidth;
  canvas.value.height = canvas.value.offsetHeight;
  createParticles(canvas.value.width, canvas.value.height);
};

onMounted(() => {
  if (!canvas.value) return;

  ctx = canvas.value.getContext('2d');
  if (!ctx) return;

  handleResize();
  animate();

  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  window.removeEventListener('resize', handleResize);
});
</script>

<template>
  <div class="particle-background">
    <canvas ref="canvas" class="particle-canvas"></canvas>
  </div>
</template>

<style scoped>
.particle-background {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.particle-canvas {
  width: 100%;
  height: 100%;
  opacity: 0.6;
}
</style>
