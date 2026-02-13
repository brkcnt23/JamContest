<template>
	<div class="contests-page">
		<h1 class="text-2xl font-bold mb-4">Active Contests</h1>
		<div v-if="loading">Loading...</div>
		<div v-else-if="contests.length === 0">No contests found.</div>
		<div v-else>
			<ul>
				<li v-for="contest in contests" :key="contest.id">
					<router-link :to="`/contests/${contest.slug}`">{{ contest.title }}</router-link>
				</li>
			</ul>
		</div>
	</div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
const contests = ref<any[]>([]);
const loading = ref(true);
onMounted(async () => {
	try {
		const { data } = await axios.get('/api/contests');
		contests.value = data;
	} finally {
		loading.value = false;
	}
});
</script>
