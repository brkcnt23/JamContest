<script setup lang="ts">
import { computed } from 'vue';

interface GalleryArtwork {
  title: string;
  url: string;
}

interface Props {
  galleryArtworks?: GalleryArtwork[];
  portfolioLink?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  openLightbox: [artwork: GalleryArtwork]
}>();

// Masonry grid logic
const getAspectRatio = (index: number): string => {
  const patterns = ['wide', 'tall', 'default', 'default', 'wide', 'default', 'tall'];
  return patterns[index % patterns.length];
};

const gridClass = (index: number): string => {
  const ratio = getAspectRatio(index);
  
  switch (ratio) {
    case 'wide':
      return 'col-span-2 row-span-2'; // 2x2
    case 'tall':
      return 'col-span-1 row-span-3'; // 1x3
    default:
      return 'col-span-1 row-span-2'; // 1x2
  }
};
</script>

<template>
  <div class="featured-works">
    <div class="max-w-screen-2xl mx-auto px-6 py-24">
      <!-- Masonry Grid -->
      <div 
        v-if="galleryArtworks && galleryArtworks.length > 0"
        class="masonry-grid"
      >
        <div
          v-for="(artwork, index) in galleryArtworks"
          :key="index"
          :class="['masonry-item', gridClass(index)]"
          @click="emit('openLightbox', artwork)"
        >
          <img
            :src="artwork.url"
            :alt="artwork.title"
            class="masonry-image"
          />
          <div class="masonry-overlay">
            <h3 class="masonry-title">{{ artwork.title }}</h3>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div 
        v-else
        class="empty-state"
      >
        <p class="text-[hsl(var(--muted-foreground))] text-lg">
          No artworks yet
        </p>
      </div>

      <!-- Portfolio Link -->
      <div 
        v-if="portfolioLink"
        class="text-center mt-12"
      >
        <a
          :href="portfolioLink"
          target="_blank"
          rel="noopener noreferrer"
          class="portfolio-link"
        >
          View Full Portfolio →
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.featured-works {
  background: hsl(var(--background));
}

.masonry-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  grid-auto-rows: 160px;
  gap: 1rem;
}

@media (max-width: 768px) {
  .masonry-grid {
    grid-template-columns: 1fr;
    grid-auto-rows: 200px;
  }
  
  .masonry-item {
    grid-column: span 1 !important;
    grid-row: span 2 !important;
  }
}

.masonry-item {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.masonry-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
}

.masonry-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.masonry-item:hover .masonry-image {
  transform: scale(1.05);
}

.masonry-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  display: flex;
  align-items: flex-end;
  padding: 1.5rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.masonry-item:hover .masonry-overlay {
  opacity: 1;
}

.masonry-title {
  color: white;
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
}

.empty-state {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.portfolio-link {
  display: inline-block;
  padding: 0.75rem 2rem;
  background: hsl(var(--brand));
  color: hsl(var(--brand-foreground));
  font-weight: 600;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.2s ease;
}

.portfolio-link:hover {
  background: hsl(var(--brand-dark));
  transform: translateY(-2px);
}
</style>