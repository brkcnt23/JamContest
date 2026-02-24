import { ref } from 'vue';
import axios from 'axios';

export function useServerTime() {
  const serverOffset = ref(0); // ms cinsinden fark

  async function syncTime() {
    try {
      const localBefore = Date.now();
      const { data } = await axios.get('/api/time');
      const localAfter = Date.now();
      const serverTime = new Date(data.serverTime).getTime();
      const roundTripTime = localAfter - localBefore;
      
      // Average time when server sent response
      serverOffset.value = serverTime - ((localBefore + localAfter) / 2);
    } catch (error) {
      console.warn('Failed to sync server time:', error);
      serverOffset.value = 0;
    }
  }

  function now(): Date {
    return new Date(Date.now() + serverOffset.value);
  }

  function getTime(): number {
    return Date.now() + serverOffset.value;
  }

  return { syncTime, now, getTime, serverOffset };
}
