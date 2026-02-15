<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { ArrowRight } from 'lucide-vue-next';
import Badge from './Badge.vue';
import Button from './Button.vue';

interface Work {
  id: number;
  title: string;
  category: string;
  year: string;
  image: string;
  span?: 'large' | 'wide' | 'tall' | 'default';
}

interface Props {
  works?: Work[];
  portfolioLink?: string;
  galleryImages?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  works: () => [],
  portfolioLink: '',
  galleryImages: () => [],
});

const isVisible = ref(false);
const imageSpans = ref<Record<number, string>>({});

onMounted(() => {
  setTimeout(() => {
    isVisible.value = true;
  }, 100);
  
  // Calculate aspect ratios for gallery images
  if (props.galleryImages.length > 0) {
    props.galleryImages.forEach((url, index) => {
      const img = new Image();
      img.onload = () => {
        const ratio = img.naturalWidth / img.naturalHeight;
        
        if (ratio > 1.5) {
          imageSpans.value[index] = 'wide'; // Horizontal
        } else if (ratio < 0.7) {
          imageSpans.value[index] = 'tall'; // Vertical
        } else if (ratio > 1.2) {
          imageSpans.value[index] = 'default-wide';
        } else {
          imageSpans.value[index] = 'default'; // Square-ish
        }
      };
      img.src = url;
    });
  }
});

const displayWorks = computed(() => {
  if (props.works && props.works.length > 0) {
    return props.works;
  }
  
  // Convert gallery images to works format
  return props.galleryImages.map((url, index) => ({
    id: index,
    title: `Artwork ${index + 1}`,
    category: 'Gallery',
    year: new Date().getFullYear().toString(),
    image: url,
    span: imageSpans.value[index] as any,
  }));
});

function openPortfolio() {
  if (props.portfolioLink) {
    window.open(props.portfolioLink, '_blank');
  }
}
</script>

<template>
  <section id="portfolio" class="py-24 px-6 bg-[hsl(var(--background))] scroll-mt-20">
    <div class="max-w-screen-2xl mx-auto">
      <div class="text-center mb-16">
        <Badge variant="outline" class="mb-4">
          <span class="text-[hsl(var(--muted-foreground))]">Portfolio</span>
        </Badge>
        <h2 class="text-5xl md:text-6xl font-bold text-[hsl(var(--foreground))] mb-4">
          Featured Works
        </h2>
        <p class="text-lg text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
          A collection of creative projects and artistic expressions
        </p>
      </div>

      <!-- Masonry Grid -->
      <div class="masonry-grid">
        <div
          v-for="(work, index) in displayWorks"
          :key="work.id"
          :class="[
            'masonry-item group relative overflow-hidden rounded-xl cursor-pointer',
            work.span === 'wide' && 'masonry-wide',
            work.span === 'tall' && 'masonry-tall',
            work.span === 'default-wide' && 'masonry-default-wide',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          ]"
          :style="{
            transitionDelay: `${index * 50}ms`
          }"
        >
          <img 
            :src="work.image" 
            :alt="work.title"
            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div class="absolute bottom-0 left-0 right-0 p-6 text-white">
              <Badge class="mb-2 bg-white/20 backdrop-blur-sm text-white border-white/40">
                {{ work.category }}
              </Badge>
              <h3 class="text-2xl font-bold mb-1">{{ work.title }}</h3>
              <p class="text-white/80">{{ work.year }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- View All Button -->
      <div v-if="props.portfolioLink" class="mt-16 text-center">
        <Button size="lg" variant="outline" class="group" @click="openPortfolio">
          View All Works
          <ArrowRight class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.masonry-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  grid-auto-rows: 200px;
  gap: 1rem;
}

.masonry-item {
  transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Default - Square */
.masonry-item {
  grid-row: span 2;
}

/* Wide - Horizontal */
.masonry-wide {
  grid-column: span 2;
  grid-row: span 2;
}

/* Tall - Vertical */
.masonry-tall {
  grid-row: span 3;
}

/* Default Wide - Slightly wider */
.masonry-default-wide {
  grid-column: span 2;
  grid-row: span 1;
}

@media (max-width: 768px) {
  .masonry-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    grid-auto-rows: 180px;
  }
  
  .masonry-wide {
    grid-column: span 1;
  }
}
</style>