const API_BASE = 'http://127.0.0.1:3001/api';

export const ApiClient = {
  async getAllMemories() {
    const res = await fetch(`${API_BASE}/memory`);
    if (!res.ok) throw new Error('API Error');
    return res.json();
  },

  async saveMemory(type: string, key: string, value: string) {
    const res = await fetch(`${API_BASE}/memory/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, key, value })
    });
    if (!res.ok) throw new Error('API Error');
    return res.json();
  },

  async deleteMemory(type: string, key: string) {
    const res = await fetch(`${API_BASE}/memory/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, key })
    });
    if (!res.ok) throw new Error('API Error');
    return res.json();
  },

  async getChatSessions() {
    const res = await fetch(`${API_BASE}/chat/sessions`);
    if (!res.ok) throw new Error('API Error');
    return res.json();
  },

  async createChatSession() {
    const res = await fetch(`${API_BASE}/chat/session`, { method: 'POST' });
    if (!res.ok) throw new Error('API Error');
    return res.json();
  },

  async deleteChatSession(id: string) {
    const res = await fetch(`${API_BASE}/chat/session/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('API Error');
    return res.json();
  },

  async chat(text: string, sessionId?: string) {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, sessionId })
    });
    if (!res.ok) throw new Error('API Error');
    return res.json();
  },

  async compareDocuments(doc1: any, doc2: any) {
    const res = await fetch(`${API_BASE}/document/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doc1, doc2 })
    });
    if (!res.ok) throw new Error('API Error');
    return res.json();
  },

  async uploadDocument(file: File, action?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (action) {
      formData.append('action', action);
    }
    const res = await fetch(`${API_BASE}/document/upload`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('API Error');
    return res.json();
  },

  async generateFsd(requirements: string) {
    const res = await fetch(`${API_BASE}/generate-fsd`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requirements })
    });
    if (!res.ok) throw new Error('API Error');
    return res.json();
  },

  async buildProjectLocal(blueprint: any) {
    const res = await fetch(`${API_BASE}/project/build-local`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blueprint })
    });
    if (!res.ok) throw new Error('API Error');
    return res.json();
  },

  async generateMockup(title: string, components: string[]) {
    const res = await fetch(`${API_BASE}/generate-mockup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, components })
    });
    if (!res.ok) throw new Error('API Error');
    return res.json();
  },

  async deployToGithub(blueprint: any, token: string) {
    const res = await fetch(`${API_BASE}/project/deploy-github`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blueprint, token })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'API Error');
    }
    return res.json();
  }
};
