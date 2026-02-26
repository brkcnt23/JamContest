import { ref, onUnmounted } from 'vue';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/auth';

let socket: Socket | null = null;
const connected = ref(false);

export function useSocket() {
  const authStore = useAuthStore();

  function connect() {
    if (socket?.connected) return;
    socket = io('/messages', {
      auth: { token: authStore.token },
      transports: ['websocket'],
    });
    socket.on('connect', () => { connected.value = true; });
    socket.on('disconnect', () => { connected.value = false; });
  }

  function disconnect() {
    socket?.disconnect();
    socket = null;
    connected.value = false;
  }

  function joinConversation(convId: string) {
    socket?.emit('join_conversation', convId);
  }

  function leaveConversation(convId: string) {
    socket?.emit('leave_conversation', convId);
  }

  function sendMessage(conversationId: string, body: string) {
    socket?.emit('send_message', { conversationId, body });
  }

  function on(event: string, cb: (...args: any[]) => void) {
    socket?.on(event, cb);
  }

  function off(event: string, cb: (...args: any[]) => void) {
    socket?.off(event, cb);
  }

  return { connected, connect, disconnect, joinConversation, leaveConversation, sendMessage, on, off };
}
