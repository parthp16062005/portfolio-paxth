const API_KEY = "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";
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

// ── CAPTION ELEMENTS ──
const generateBtn   = document.getElementById('generate-btn');
const moodInput     = document.getElementById('mood-input');
const captionResult = document.getElementById('caption-result');
const copyBtn       = document.getElementById('copy-btn');

// ── CHAT ELEMENTS ──
const chatSendBtn  = document.getElementById('chat-send-btn');
const chatInput    = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');

// ── AI TABS ──
document.querySelectorAll('.ai-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.ai-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.ai-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
  });
});

// ── CAPTION GENERATOR ──
async function generateCaption() {
  const mood = moodInput.value.trim();
  if (!mood) {
    moodInput.style.borderColor = 'rgba(201,169,110,0.6)';
    setTimeout(() => moodInput.style.borderColor = '', 1000);
    return;
  }

  generateBtn.disabled = true;
  copyBtn.style.display = 'none';

  captionResult.innerHTML = `
    <div class="caption-loading">
      <span></span><span></span><span></span>
    </div>`;

  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `You are a poetic, cinematic caption writer for a photography and filmmaking portfolio called "paxth.jpg".
Generate ONE short, evocative caption (max 15 words) based on the mood or scene given.
The caption should feel like a film quote or poetic frame description — raw, emotional, beautiful.
Return ONLY the caption text, nothing else. No quotes, no explanation.`
          },
          { role: 'user', content: mood }
        ],
        max_tokens: 60,
        temperature: 0.9
      })
    });

    const data = await res.json();
    const caption = data.choices[0].message.content.trim();

    // animate caption in
    captionResult.innerHTML = `<p class="caption-output" style="opacity:0;transform:translateY(10px);transition:all 0.5s ease">"${caption}"</p>`;
    requestAnimationFrame(() => {
      const el = captionResult.querySelector('.caption-output');
      if (el) { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; }
    });

    copyBtn.style.display = 'inline-block';
    copyBtn.textContent = 'Copy Caption ↗';

    copyBtn.onclick = () => {
      navigator.clipboard.writeText(`"${caption}"`);
      copyBtn.textContent = '✓ Copied';
      copyBtn.style.color = '#4ade80';
      setTimeout(() => {
        copyBtn.textContent = 'Copy Caption ↗';
        copyBtn.style.color = '';
      }, 2000);
    };

  } catch (err) {
    captionResult.innerHTML = `<span class="caption-placeholder">Something went wrong — try again.</span>`;
  }

  generateBtn.disabled = false;
}

generateBtn.addEventListener('click', generateCaption);
moodInput.addEventListener('keydown', e => { if (e.key === 'Enter') generateCaption(); });

// ── CHAT BOT ──
const chatHistory = [
  {
    role: 'system',
    content: `You are the AI assistant for Parth's creative portfolio "paxth.jpg". 
Parth is a photographer and filmmaker based in India. He specializes in cinematic portraits, street photography, short films, brand videos, reels, and post-production (color grading, editing, sound design).
He has 4+ years of experience, 120+ projects, and has worked across 3 countries.
Contact: cineluxe1606@gmail.com | +91 8999507026 | @paxth.jpg on Instagram.
Answer questions about his work, style, services, pricing approach, and availability.
Keep replies concise, warm, and slightly poetic — matching the brand tone.
Never make up specific project names or client names.`
  }
];

function appendMessage(role, text) {
  const div = document.createElement('div');
  div.classList.add('chat-msg', role);
  div.innerHTML = `<span>${text}</span>`;
  div.style.opacity = '0';
  div.style.transform = 'translateY(8px)';
  div.style.transition = 'all 0.4s ease';
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  requestAnimationFrame(() => {
    div.style.opacity = '1';
    div.style.transform = 'translateY(0)';
  });
}

function appendTyping() {
  const div = document.createElement('div');
  div.classList.add('chat-msg', 'bot');
  div.id = 'typing-indicator';
  div.innerHTML = `<span><div class="caption-loading" style="padding:0"><span></span><span></span><span></span></div></span>`;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendChat() {
  const text = chatInput.value.trim();
  if (!text) return;

  appendMessage('user', text);
  chatHistory.push({ role: 'user', content: text });
  chatInput.value = '';
  chatSendBtn.disabled = true;
  appendTyping();

  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: chatHistory,
        max_tokens: 200,
        temperature: 0.75
      })
    });

    const data = await res.json();
    const reply = data.choices[0].message.content.trim();
    chatHistory.push({ role: 'assistant', content: reply });

    document.getElementById('typing-indicator')?.remove();
    appendMessage('bot', reply);

  } catch (err) {
    document.getElementById('typing-indicator')?.remove();
    appendMessage('bot', 'Something went wrong — please try again. ✦');
  }

  chatSendBtn.disabled = false;
  chatInput.focus();
}

chatSendBtn.addEventListener('click', sendChat);
chatInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendChat(); });
