const API_KEY = "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";
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const generateBtn = document.getElementById('generate-btn');
const moodInput = document.getElementById('mood-input');
const captionResult = document.getElementById('caption-result');
const copyBtn = document.getElementById('copy-btn');

async function generateCaption() {
  const mood = moodInput.value.trim();
  if (!mood) return;

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
        'Authorization': `Bearer ${GROQ_KEY}`
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
          {
            role: 'user',
            content: mood
          }
        ],
        max_tokens: 60,
        temperature: 0.9
      })
    });

    const data = await res.json();
    const caption = data.choices[0].message.content.trim();

    captionResult.innerHTML = `<p class="caption-output">"${caption}"</p>`;
    copyBtn.style.display = 'inline-block';

    copyBtn.onclick = () => {
      navigator.clipboard.writeText(`"${caption}"`);
      copyBtn.textContent = 'Copied! ✓';
      setTimeout(() => copyBtn.textContent = 'Copy Caption ↗', 2000);
    };

  } catch (err) {
    captionResult.innerHTML = `<span class="caption-placeholder">Something went wrong. Try again.</span>`;
  }

  generateBtn.disabled = false;
}

generateBtn.addEventListener('click', generateCaption);
moodInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') generateCaption();
});