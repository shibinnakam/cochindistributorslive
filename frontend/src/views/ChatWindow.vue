<template>
  <div class="chat-container">
    <div class="chat-sidebar">
      <div class="chat-header">
        <h3>💬 Messages</h3>
        <span v-if="unreadCount > 0" class="unread-badge">{{
          unreadCount
        }}</span>
      </div>

      <div class="search-box">
        <input
          type="text"
          placeholder="Search contacts..."
          class="search-input"
        />
      </div>

      <div class="chat-list">
        <div
          v-for="contact in contacts"
          :key="contact.email"
          @click="selectContact(contact)"
          :class="[
            'chat-item',
            {
              active:
                selectedContact && selectedContact.email === contact.email,
            },
          ]"
        >
          <div class="chat-item-avatar">
            <img
              :src="
                contact.profilePhoto
                  ? apiBase + contact.profilePhoto
                  : defaultAvatar
              "
              :alt="contact.name"
              class="avatar-img"
            />
            <span v-if="contact.isAdmin" class="admin-badge">A</span>
            <span class="online-indicator"></span>
          </div>
          <div class="chat-item-content">
            <div class="chat-item-name">{{ contact.name }}</div>
            <div v-if="contact.unreadCount > 0" class="unread-indicator">
              {{ contact.unreadCount }} new
            </div>
            <div v-else class="last-message">Online now</div>
          </div>
          <span v-if="contact.unreadCount > 0" class="unread-dot"></span>
        </div>

        <div v-if="contacts.length === 0" class="no-contacts">
          No contacts available
        </div>
      </div>
    </div>

    <div class="chat-main">
      <div v-if="selectedContact" class="chat-window">
        <div class="chat-header-window">
          <img
            :src="
              selectedContact.profilePhoto
                ? apiBase + selectedContact.profilePhoto
                : defaultAvatar
            "
            :alt="selectedContact.name"
            class="header-avatar"
          />
          <div class="header-info">
            <h4>{{ selectedContact.name }}</h4>
            <span v-if="selectedContact.isAdmin" class="admin-label"
              >Administrator</span
            >
          </div>
        </div>

        <div class="messages-container" ref="messagesContainer">
          <div
            v-for="msg in messages"
            :key="msg._id"
            :class="[
              'message-wrapper',
              {
                sent: msg.senderEmail === userEmail,
                received: msg.senderEmail !== userEmail,
              },
            ]"
            @mouseenter="hoveredMessageId = msg._id"
            @mouseleave="hoveredMessageId = null"
          >
            <div class="message" :class="{ deleted: isMessageDeleted(msg) }">
              <div
                v-if="isMessageDeleted(msg)"
                class="message-content deleted-text"
              >
                This message was deleted
              </div>
              <div v-else class="message-content">{{ msg.message }}</div>
              <div class="message-footer">
                <span class="message-time">{{
                  formatTime(msg.timestamp)
                }}</span>
                <span
                  v-if="msg.senderEmail === userEmail && !isMessageDeleted(msg)"
                  class="checkmark"
                  >✓✓</span
                >
              </div>
            </div>

            <div
              v-if="
                hoveredMessageId === msg._id &&
                msg.senderEmail === userEmail &&
                !isMessageDeleted(msg)
              "
              class="message-actions"
            >
              <button
                @click="deleteMessageForMe(msg._id)"
                class="delete-btn"
                title="Delete"
              >
                🗑️
              </button>
              <button
                @click="showDeleteMenu(msg._id)"
                class="more-btn"
                title="More options"
              >
                ⋮
              </button>
            </div>

            <div
              v-if="deleteMenuId === msg._id && msg.senderEmail === userEmail"
              class="delete-menu"
            >
              <button
                @click="deleteMessageForEveryone(msg._id)"
                class="delete-option"
              >
                Delete for everyone
              </button>
              <button @click="deleteMenuId = null" class="delete-option">
                Cancel
              </button>
            </div>
          </div>

          <div v-if="messages.length === 0" class="no-messages">
            <span class="empty-emoji">👋</span>
            <p>Start a conversation</p>
          </div>
        </div>

        <div class="chat-input-area">
          <input
            v-model="newMessage"
            @keyup.enter="sendMessage"
            type="text"
            placeholder="Type your message..."
            class="message-input"
          />
          <button
            @click="sendMessage"
            :disabled="!newMessage.trim() || sending"
            class="send-btn"
          >
            <span v-if="!sending">📤</span>
            <span v-else>⏳</span>
          </button>
        </div>
      </div>

      <div v-else class="no-contact-selected">
        <div class="empty-state">
          <span class="empty-icon">💬</span>
          <h3>Select a contact to start chatting</h3>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "ChatWindow",
  data() {
    return {
      contacts: [],
      selectedContact: null,
      messages: [],
      newMessage: "",
      loading: false,
      sending: false,
      userEmail: "",
      apiBase: "http://localhost:5000",
      defaultAvatar: "/default-avatar.png",
      unreadCount: 0,
      refreshInterval: null,
      hoveredMessageId: null,
      deleteMenuId: null,
    };
  },
  computed: {
    token() {
      return localStorage.getItem("token");
    },
  },
  mounted() {
    const user = JSON.parse(localStorage.getItem("user"));
    this.userEmail = user?.email || "";

    this.fetchContacts();
    this.fetchUnreadCount();

    this.refreshInterval = setInterval(() => {
      if (this.selectedContact) {
        this.fetchMessages();
      }
      this.fetchUnreadCount();
    }, 2000);
  },
  beforeUnmount() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  },
  methods: {
    async fetchContacts() {
      try {
        const res = await axios.get("http://localhost:5000/api/messages/list", {
          headers: { Authorization: `Bearer ${this.token}` },
        });

        if (res.data.success) {
          this.contacts = res.data.data;
        }
      } catch (err) {
        console.error("Error fetching contacts:", err);
      }
    },
    async fetchMessages() {
      if (!this.selectedContact) return;

      try {
        const res = await axios.get(
          `http://localhost:5000/api/messages/conversation/${this.selectedContact.email}`,
          { headers: { Authorization: `Bearer ${this.token}` } }
        );

        if (res.data.success) {
          this.messages = res.data.data;
          this.$nextTick(() => {
            const container = this.$refs.messagesContainer;
            if (container) {
              container.scrollTop = container.scrollHeight;
            }
          });
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    },
    async sendMessage() {
      if (!this.newMessage.trim() || !this.selectedContact) return;

      this.sending = true;
      try {
        const res = await axios.post(
          "http://localhost:5000/api/messages/send",
          {
            receiverEmail: this.selectedContact.email,
            message: this.newMessage,
          },
          { headers: { Authorization: `Bearer ${this.token}` } }
        );

        if (res.status === 201) {
          this.newMessage = "";
          await this.fetchMessages();
        }
      } catch (err) {
        console.error("Error sending message:", err);
      } finally {
        this.sending = false;
      }
    },
    selectContact(contact) {
      this.selectedContact = contact;
      this.fetchMessages();
    },
    async fetchUnreadCount() {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/messages/unread-count",
          {
            headers: { Authorization: `Bearer ${this.token}` },
          }
        );

        if (res.data.success) {
          this.unreadCount = res.data.unreadCount;
        }
      } catch (err) {
        console.error("Error fetching unread count:", err);
      }
    },
    formatTime(timestamp) {
      const date = new Date(timestamp);
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    },
    isMessageDeleted(msg) {
      return (
        msg.deletedForEveryone ||
        (msg.deletedBy && msg.deletedBy.includes(this.userEmail))
      );
    },
    showDeleteMenu(messageId) {
      this.deleteMenuId = this.deleteMenuId === messageId ? null : messageId;
    },
    async deleteMessageForMe(messageId) {
      try {
        await axios.delete(`http://localhost:5000/api/messages/${messageId}`, {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        await this.fetchMessages();
        this.hoveredMessageId = null;
      } catch (err) {
        console.error("Error deleting message:", err);
      }
    },
    async deleteMessageForEveryone(messageId) {
      try {
        await axios.delete(
          `http://localhost:5000/api/messages/${messageId}/everyone`,
          { headers: { Authorization: `Bearer ${this.token}` } }
        );
        await this.fetchMessages();
        this.deleteMenuId = null;
        this.hoveredMessageId = null;
      } catch (err) {
        console.error("Error deleting message for everyone:", err);
      }
    },
  },
};
</script>

<style scoped>
.chat-container {
  display: flex;
  height: 100%;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.12);
}

.chat-sidebar {
  width: 340px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  min-height: 500px;
}

.chat-header {
  padding: 18px 16px;
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.15);
}

.chat-header h3 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: white;
  letter-spacing: -0.5px;
}

.unread-badge {
  background: #ef4444;
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.search-box {
  padding: 12px 12px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
}

.search-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  font-size: 13px;
  background: #f8fafc;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #2563eb;
  background: white;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.chat-list {
  flex: 1;
  overflow-y: auto;
}

.chat-list::-webkit-scrollbar {
  width: 6px;
}

.chat-list::-webkit-scrollbar-track {
  background: transparent;
}

.chat-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.chat-list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.chat-item {
  display: flex;
  align-items: center;
  padding: 12px 12px;
  cursor: pointer;
  transition: all 0.25s ease;
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
  position: relative;
}

.chat-item:hover {
  background: rgba(37, 99, 235, 0.05);
}

.chat-item.active {
  background: linear-gradient(
    90deg,
    rgba(37, 99, 235, 0.1) 0%,
    transparent 100%
  );
  border-left: 4px solid #2563eb;
  padding-left: 8px;
}

.chat-item-avatar {
  position: relative;
  margin-right: 12px;
  flex-shrink: 0;
}

.avatar-img {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.online-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 14px;
  height: 14px;
  background: #10b981;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 0 0 1px #e2e8f0;
}

.admin-badge {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 22px;
  height: 22px;
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  border: 3px solid white;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
}

.chat-item-content {
  flex: 1;
  min-width: 0;
}

.chat-item-name {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.unread-indicator {
  font-size: 12px;
  color: #2563eb;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.last-message {
  font-size: 12px;
  color: #94a3b8;
}

.unread-dot {
  width: 12px;
  height: 12px;
  background: #ef4444;
  border-radius: 50%;
  margin-left: 8px;
  flex-shrink: 0;
  box-shadow: 0 0 0 2px white;
}

.no-contacts {
  padding: 32px 24px;
  text-align: center;
  color: #94a3b8;
  font-size: 14px;
  line-height: 1.6;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
}

.chat-window {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-header-window {
  padding: 14px 20px;
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.15);
}

.header-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.header-info {
  flex: 1;
}

.header-info h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: white;
}

.admin-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  opacity: 0.9;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  background-image: linear-gradient(
    45deg,
    transparent 48%,
    rgba(37, 99, 235, 0.02) 49%,
    rgba(37, 99, 235, 0.02) 51%,
    transparent 52%
  );
  background-size: 60px 60px;
}

.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.messages-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.message-wrapper {
  display: flex;
  margin: 4px 0;
}

.message-wrapper.sent {
  justify-content: flex-end;
}

.message-wrapper.received {
  justify-content: flex-start;
}

.message {
  display: flex;
  flex-direction: column;
  max-width: 65%;
}

.message-content {
  padding: 10px 16px;
  border-radius: 18px;
  word-wrap: break-word;
  font-size: 15px;
  line-height: 1.4;
  font-weight: 500;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-wrapper.sent .message-content {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  color: white;
  border-bottom-right-radius: 6px;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
}

.message-wrapper.received .message-content {
  background: white;
  color: #1e293b;
  border: 1px solid #e2e8f0;
  border-bottom-left-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.message-footer {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  padding: 0 4px;
}

.message-time {
  font-size: 12px;
  opacity: 0.7;
}

.message-wrapper.sent .message-time {
  color: #94a3b8;
  text-align: right;
}

.message-wrapper.received .message-time {
  color: #94a3b8;
}

.checkmark {
  font-size: 12px;
  color: #10b981;
}

.deleted-text {
  font-style: italic;
  opacity: 0.6;
}

.message.deleted .message-footer {
  display: none;
}

.message-actions {
  display: flex;
  gap: 4px;
  align-items: center;
  margin-left: 8px;
  animation: slideIn 0.2s ease;
}

.delete-btn,
.more-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  padding: 4px 6px;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  transform: scale(1.1);
}

.more-btn:hover {
  background: rgba(37, 99, 235, 0.1);
  transform: scale(1.1);
}

.delete-menu {
  position: absolute;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;
  min-width: 200px;
  animation: slideIn 0.2s ease;
}

.delete-option {
  width: 100%;
  padding: 10px 14px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
  color: #1e293b;
  transition: all 0.2s ease;
  text-align: left;
}

.delete-option:first-child {
  color: #ef4444;
  font-weight: 500;
}

.delete-option:hover {
  background: #f1f5f9;
}

.delete-option:first-child:hover {
  background: rgba(239, 68, 68, 0.1);
}

.message-wrapper {
  position: relative;
}

.no-messages {
  text-align: center;
  color: #94a3b8;
  padding: 60px 20px;
  font-size: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-emoji {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
  animation: wave 2s ease-in-out infinite;
}

@keyframes wave {
  0%,
  100% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(20deg);
  }
}

.no-messages p {
  margin: 0;
  font-weight: 500;
}

.chat-input-area {
  padding: 14px 16px;
  border-top: 1px solid #e2e8f0;
  background: white;
  display: flex;
  gap: 8px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}

.message-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  font-size: 15px;
  transition: all 0.2s ease;
  background: #f8fafc;
  color: #1e293b;
}

.message-input::placeholder {
  color: #94a3b8;
}

.message-input:focus {
  outline: none;
  border-color: #2563eb;
  background: white;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.send-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  border: none;
  color: white;
  cursor: pointer;
  font-size: 20px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.08);
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.3);
}

.send-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: scale(1);
}

.no-contact-selected {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.empty-state {
  text-align: center;
}

.empty-icon {
  font-size: 72px;
  display: block;
  margin-bottom: 20px;
}

.empty-state h3 {
  margin: 0;
  color: #94a3b8;
  font-size: 18px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .chat-container {
    min-height: 400px;
  }

  .chat-sidebar {
    width: 100%;
  }

  .chat-main {
    display: none;
  }

  .chat-item.active ~ .chat-main {
    display: flex;
  }

  .message-wrapper .message {
    max-width: 85%;
  }
}
</style>
