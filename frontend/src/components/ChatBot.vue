<template>
  <div class="chatbot-wrapper">
    <!-- Floating Button -->
    <button class="chatbot-toggle" @click="toggleChat">
      <span v-if="!isOpen">💬</span>
      <span v-else>✕</span>
    </button>

    <!-- Chat Window -->
    <div v-if="isOpen" class="chatbot-window">
      <div class="chatbot-header">
        <h3>Chat Support</h3>
      </div>

      <div class="chatbot-messages" ref="messagesContainer">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="['message', msg.sender]"
        >
          <div class="message-content">
            <span v-html="msg.text"></span>
          </div>
        </div>
      </div>

      <div class="chatbot-input">
        <input
          v-model="userInput"
          @keyup.enter="sendMessage"
          type="text"
          placeholder="Type a message..."
        />
        <button @click="sendMessage">➤</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "ChatBot",
  props: {
    categories: {
      type: Array,
      default: () => [],
    },
    products: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      isOpen: false,
      userInput: "",
      messages: [{ text: "Hi...how to help u", sender: "bot" }],
    };
  },
  methods: {
    toggleChat() {
      this.isOpen = !this.isOpen;
      if (this.isOpen) {
        this.scrollToBottom();
      }
    },
    sendMessage() {
      const text = this.userInput.trim();
      if (!text) return;

      // Add user message
      this.messages.push({ text, sender: "user" });
      this.userInput = "";
      this.scrollToBottom();

      // Process bot response
      this.processResponse(text);
    },
    async processResponse(input) {
      try {
        const res = await axios.post("http://localhost:5000/api/chat/message", {
          message: input,
        });

        if (res.data && res.data.response) {
          this.messages.push({ text: res.data.response, sender: "bot" });
        } else {
          this.messages.push({
            text: "Sorry, I am having trouble connecting to the server.",
            sender: "bot",
          });
        }
      } catch (err) {
        console.error("Chatbot Error:", err);
        this.messages.push({
          text: "Sorry, something went wrong. Please try again later.",
          sender: "bot",
        });
      }

      this.scrollToBottom();
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    },
  },
};
</script>

<style scoped>
.chatbot-wrapper {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  font-family: "Roboto", sans-serif;
}

.chatbot-toggle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #2874f0;
  color: white;
  border: none;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}

.chatbot-toggle:hover {
  transform: scale(1.1);
}

.chatbot-window {
  position: absolute;
  bottom: 80px;
  right: 0;
  width: 300px;
  height: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

.chatbot-header {
  background: #2874f0;
  color: white;
  padding: 15px;
  text-align: center;
}

.chatbot-header h3 {
  margin: 0;
  font-size: 16px;
}

.chatbot-messages {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  background: #f1f3f6;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.message {
  max-width: 80%;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.4;
}

.message.bot {
  align-self: flex-start;
  background: white;
  color: #333;
  border-bottom-left-radius: 2px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.message.user {
  align-self: flex-end;
  background: #2874f0;
  color: white;
  border-bottom-right-radius: 2px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.chatbot-input {
  padding: 10px;
  background: white;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 8px;
}

.chatbot-input input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 20px;
  outline: none;
  font-size: 14px;
}

.chatbot-input button {
  background: #2874f0;
  color: white;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chatbot-input button:hover {
  background: #1e5bbf;
}
</style>
