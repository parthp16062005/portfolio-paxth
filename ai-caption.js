const GROQ_KEY = "csk-6ynvw43eh9mtfhwy24x92dd8dx26mmmd54t986hnv6n8txfh";
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

// ── ELEMENTS ──
const generateBtn   = document.getElementById('generate-btn');
const moodInput     = document.getElementById('mood-input');
const captionResult = document.getElementById('caption-result');
const copyBtn       = document.getElementById('copy-btn');
const imageUpload   = document.getElementById('image-upload');
const imagePreview  = document.getElementById('image-preview');
const previewWrap   = document.getElementById('image-preview-wrap');
const uploadText    = document.getElementById('upload-text');
const removeBtn     = document.getElementById('remove-image');

let uploadedBase64   = null;
let uploadedMimeType = null;

// ── IMAGE UPLOAD ──
imageUpload.addEventListener('change', () => {
  const file = imageUpload.files[0];
  if (!file) return;
  uploadedMimeType = file.type;
  const reader = new FileReader();
  reader.onload = e => {
    uploadedBase64            = e.target.result.split(',')[1];
    document.getElementById('image-preview').src = e.target.result;
    document.getElementById('image-preview-wrap').style.display = 'flex';
    document.getElementById('upload-placeholder').style.display = 'none';
  };
  reader.readAsDataURL(file);
});

removeBtn.addEventListener('click', () => {
  uploadedBase64            = null;
  uploadedMimeType          = null;
  imageUpload.value         = '';
  imagePreview.src          = '';
  previewWrap.style.display = 'none';
  uploadText.textContent    = 'Upload a photo for AI analysis';
});

// ── GENERATE CAPTION ──
async function generateCaption() {
  const mood = moodInput.value.trim();
  if (!mood && !uploadedBase64) {
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
    let caption = '';

    if (uploadedBase64) {
      // image → Groq Vision
      const res = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_KEY}`
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-4-scout-17b-16e-instruct',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${uploadedMimeType};base64,${uploadedBase64}`
                  }
                },
                {
                  type: 'text',
                  text: `You are a poetic cinematic caption writer for a photography portfolio called "paxth.jpg".
Analyse this photo and write ONE short evocative caption (max 15 words).
The caption should feel like a film quote — raw, emotional, beautiful.
${mood ? `Also consider this mood: ${mood}` : ''}
Return ONLY the caption. No quotes, no explanation.`
                }
              ]
            }
          ],
          max_tokens: 60,
          temperature: 0.9
        })
      });
      const data = await res.json();
      caption = data.choices[0].message.content.trim();

    } else {
      // text only → Groq
      const res = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'system',
              content: `You are a poetic cinematic caption writer for "paxth.jpg" photography portfolio.
Generate ONE short evocative caption (max 15 words) based on the mood given.
Feel like a film quote — raw, emotional, beautiful.
Return ONLY the caption. No quotes, no explanation.`
            },
            { role: 'user', content: mood }
          ],
          max_tokens: 60,
          temperature: 0.9
        })
      });
      const data = await res.json();
      caption = data.choices[0].message.content.trim();
    }

    captionResult.innerHTML = `<p class="caption-output" style="opacity:0;transform:translateY(10px);transition:all 0.5s ease">"${caption}"</p>`;
    requestAnimationFrame(() => {
      const el = captionResult.querySelector('.caption-output');
      if (el) { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; }
    });

    copyBtn.style.display = 'inline-block';
    copyBtn.textContent   = 'Copy Caption ↗';
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
    console.error(err);
  }

  generateBtn.disabled = false;
}

generateBtn.addEventListener('click', generateCaption);
moodInput.addEventListener('keydown', e => { if (e.key === 'Enter') generateCaption(); });
// ── MODE SWITCHER ──
function switchMode(mode) {
  document.querySelectorAll('.caption-mode').forEach(m => m.classList.remove('active'));
  document.querySelectorAll('.caption-section').forEach(s => s.classList.add('hidden'));
  document.getElementById(`mode-${mode}`).classList.add('active');
  document.getElementById(`section-${mode}`).classList.remove('hidden');
}

// ── HINT FILLER ──
function fillHint(el) {
  document.getElementById('mood-input').value = el.textContent;
  document.getElementById('mood-input').focus();
}

// ── REMOVE IMAGE ──
function removeImage() {
  uploadedBase64            = null;
  uploadedMimeType          = null;
  document.getElementById('image-upload').value = '';
  document.getElementById('image-preview').src  = '';
  document.getElementById('image-preview-wrap').style.display = 'none';
  document.getElementById('upload-placeholder').style.display = 'flex';
}

// ── IMAGE GENERATE BUTTON ──
const generateImageBtn = document.getElementById('generate-image-btn');
if (generateImageBtn) {
  generateImageBtn.addEventListener('click', () => {
    const imageMood = document.getElementById('image-mood-input').value.trim();
    if (imageMood) moodInput.value = imageMood;
    generateCaption();
  });
}

// ── AI TABS ──
document.querySelectorAll('.ai-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.ai-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.ai-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
  });
});

// ── CHAT BOT ──
const chatSendBtn  = document.getElementById('chat-send-btn');
const chatInput    = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');

const chatHistory = [
  {
    role: 'system',
    content: `You are the AI assistant for Parth's creative portfolio "paxth.jpg".
Parth is a photographer and filmmaker based in India. He specializes in cinematic portraits, street photography, short films, brand videos, reels, and post-production.
Contact: cineluxe1606@gmail.com | +91 8999507026 | @paxth.jpg on Instagram.
Answer questions about his work, style, services, and availability.
Keep replies concise, warm, and slightly poetic.`
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
        'Authorization': `Bearer ${GROQ_KEY}`
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
