<template>
	<div class="home">
		<h1>Contest Platform</h1>
		<div v-if="loading">Loading...</div>
		<div v-else-if="error" class="error">{{ error }}</div>
		<div v-else class="success">
			✅ Backend connected!
			<pre>{{ status }}</pre>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';

const loading = ref(true);
const error = ref('');
const status = ref<any>(null);

onMounted(async () => {
	try {
		const response = await axios.get('/api/health');
		status.value = response.data;
	} catch (e: any) {
		error.value = e.message;
	} finally {
		loading.value = false;
	}
});
</script>

<style scoped>
.home {
	max-width: 600px;
	margin: 50px auto;
	text-align: center;
	font-family: Arial, sans-serif;
}
h1 {
	color: #2c3e50;
}
.error {
	color: red;
	padding: 20px;
	background: #ffebee;
	border-radius: 8px;
}
.success {
	color: green;
	padding: 20px;
	background: #e8f5e9;
	border-radius: 8px;
}
pre {
	text-align: left;
	background: #f5f5f5;
	padding: 10px;
	border-radius: 4px;
}
</style>
