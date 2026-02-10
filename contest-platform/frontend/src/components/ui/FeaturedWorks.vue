<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Badge from './Badge.vue';
import Button from './Button.vue';
import { ArrowRight } from 'lucide-vue-next';

interface FeaturedWork {
  id: number;
  title: string;
  category: string;
  year: string;
  image: string;
  span?: 'large' | 'wide' | 'tall' | 'default';
}

interface Props {
  works?: FeaturedWork[];
}

const props = withDefaults(defineProps<Props>(), {
  works: () => [
    {
      id: 1,
      title: 'Abstract Dreams',
      category: 'Digital Art',
      year: '2024',
      image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=1000&fit=crop',
      span: 'large',
    },
    {
      id: 2,
      title: 'Urban Symphony',
      category: 'Mixed Media',
      year: '2024',
      image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=1000&fit=crop',
    },
    {
      id: 3,
      title: 'Color Theory',
      category: 'Painting',
      year: '2023',
      image: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800&h=1000&fit=crop',
    },
    {
      id: 4,
      title: 'Ethereal Moments',
      category: 'Photography',
      year: '2023',
      image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=1000&fit=crop',
      span: 'wide',
    },
    {
      id: 5,
      title: 'Neon Nights',
      category: 'Digital Art',
      year: '2024',
      image: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=800&h=1000&fit=crop',
      span: 'tall',
    },
    {
      id: 6,
      title: 'Textured Horizons',
      category: 'Mixed Media',
      year: '2023',
      image: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&h=1000&fit=crop',
    },
  ],
});

const inView = ref<boolean[]>([]);

const getGridClass = (span?: string) => {
  switch (span) {
    case 'large':
      return 'md:col-span-2 md:row-span-2';
    case 'wide':
      return 'md:col-span-2';
    case 'tall':
      return 'md:row-span-2';
    default:
      return '';
  }
};

onMounted(() => {
  inView.value = new Array(props.works.length).fill(false);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.getAttribute('data-index') || '0');
          inView.value[index] = true;
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll('.work-card').forEach((card) => {
    observer.observe(card);
  });

  return () => observer.disconnect();
});
</script>

<template>
  <section class="relative py-24 px-6 bg-[hsl(var(--background))]">
    <div class="max-w-screen-2xl mx-auto">
      <!-- Section Header -->
      <div class="mb-16 text-center">
        <Badge variant="outline" class="mb-4">
          <span class="text-[hsl(var(--muted-foreground))]">Featured Works</span>
        </Badge>
        <h2 class="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-[hsl(var(--foreground))]">
          Selected Projects
        </h2>
        <p class="text-lg text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
          A curated collection of my recent works exploring various mediums and concepts
        </p>
      </div>

      <!-- Masonry Grid Layout -->
      <div class="grid grid-cols-1 md:grid-cols-3 auto-rows-[280px] gap-6">
        <div v-for="(work, index) in works" :key="work.id" :data-index="index"
          class="work-card group cursor-pencil cursor-pointer relative overflow-hidden rounded-xl bg-[hsl(var(--muted))] transition-all duration-500"
          :class="[
            getGridClass(work.span),
            inView[index]
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8'
          ]" :style="{
            transitionDelay: `${index * 100}ms`
          }">
          <img :src="work.image" :alt="work.title"
            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
          <div
            class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
      <div class="mt-16 text-center">
        <Button size="lg" variant="outline" class="group">
          View All Works
          <ArrowRight class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </div>
  </section>
</template>
<style>
.cursor-pencil {
  cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="%23222" d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75zm2.92 2.92l-1.17-1.17 9.19-9.19 1.17 1.17zm13.06-13.06a1.003 1.003 0 0 0-1.42 0l-1.34 1.34 3.75 3.75 1.34-1.34a1.003 1.003 0 0 0 0-1.42l-2.33-2.33z"/></svg>') 4 24, pointer !important;
}
</style>