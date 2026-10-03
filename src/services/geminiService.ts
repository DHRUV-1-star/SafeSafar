/**
 * Gemini AI Service for SafeSafar AI Companion
 * Optimized for Ultra-Low Latency (~1-2 second rapid response in emergencies)
 */

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

// Compact system instruction for minimal token processing latency
const SYSTEM_INSTRUCTION = `You are SafeSafar AI, an ultra-fast emergency safety companion for women and solo travelers.
Give immediate, concise, highly actionable safety steps.

Reference SafeSafar features when helpful:
- "Walk Me Home": Live GPS tracking.
- "Shake SOS": Silent phone shake alert.
- "Fake Call": Distract & covert SOS trigger.
- "Duress PIN (9999)": Decoy screen & alert.

Rules:
1. Be direct, clear, and reassuring. Use short bullet points.
2. Keep responses brief (100-200 words max) so they load instantly.`;

// Ultra-fast Flash-Lite models prioritized first for ~1.5 sec latency
const PREFERRED_MODELS = [
  'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite',
  'gemini-3.6-flash',
  'gemini-flash-latest',
];

/**
 * Sends a chat message history + user input to Google Gemini API
 */
export async function getGeminiResponse(
  userInput: string,
  history: ChatMessage[] = []
): Promise<string> {
  const apiKey = (import.meta.env.VITE_GEMINI_API_KEY || '').trim();

  // If no API key configured or dummy placeholder string, use instant local fallback
  if (!apiKey || apiKey === 'your_actual_api_key_here') {
    return getOfflineFallbackResponse(userInput);
  }

  // Format conversation history for Gemini REST API
  // Filter out initial assistant greeting so payload starts with 'user'
  const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

  const historyToProcess = history.filter((msg, idx) => {
    if (idx === 0 && msg.role === 'assistant') return false;
    return true;
  });

  let lastRole: string | null = null;
  for (const msg of historyToProcess) {
    const role = msg.role === 'assistant' ? 'model' : 'user';
    if (role !== lastRole) {
      contents.push({
        role: role,
        parts: [{ text: msg.text }],
      });
      lastRole = role;
    }
  }

  if (lastRole !== 'user' || contents.length === 0) {
    contents.push({
      role: 'user',
      parts: [{ text: userInput }],
    });
  }

  // Try ultra-fast models sequentially
  for (const modelName of PREFERRED_MODELS) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: SYSTEM_INSTRUCTION }],
          },
          contents: contents,
          generationConfig: {
            temperature: 0.2, // Low temperature for fastest sampling & deterministic responses
            maxOutputTokens: 300, // Reduced max tokens for ~1.5s response time
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const parts = data?.candidates?.[0]?.content?.parts || [];
        const textPart = parts.find((p: any) => typeof p.text === 'string' && p.text.trim().length > 0);
        if (textPart && textPart.text) {
          console.log(`[Gemini API] Fast response delivered via model: ${modelName}`);
          return textPart.text.trim();
        }
      }
    } catch (err) {
      console.warn(`[Gemini API] Speed bypass for model ${modelName}:`, err);
    }
  }

  return getOfflineFallbackResponse(userInput);
}

/**
 * Instant local fallback response generator (0ms latency)
 */
function getOfflineFallbackResponse(input: string): string {
  const lower = input.toLowerCase();

  if (lower.includes('route') || lower.includes('path') || lower.includes('safer') || lower.includes('navigation') || lower.includes('map') || lower.includes('why')) {
    return `🗺️ **Why One Route is Safer Than Another**:
1. **Street Lighting & Visibility**: Well-lit main roads discourage threats and give clear visibility.
2. **Crowd & Business Activity**: Open shops and foot traffic provide natural safety and bystanders.
3. **Safe Havens Nearby**: Safe routes pass near police booths, 24/7 hospitals, or verified Safe Havens.
4. **Civic Reports**: SafeSafar uses crowd-sourced lighting and safety scores.`;
  }

  if (lower.includes('walk') || lower.includes('10pm') || lower.includes('night') || lower.includes('late')) {
    return `🌟 **Walking Home Late Safety Tips**:
1. **Enable Walk Me Home**: Start live GPS monitoring so guardians track your move.
2. **Stick to Well-Lit Main Roads**: Avoid dark alleys even if longer.
3. **Stay Alert**: Keep phone charged in hand and headphones low.
4. **Arm Shake SOS**: A quick phone shake dispatches instant alerts.`;
  }

  if (lower.includes('follow') || lower.includes('danger') || lower.includes('behind me') || lower.includes('scary') || lower.includes('unsafe') || lower.includes('alone')) {
    return `🚨 **IMMEDIATE ACTION IF YOU FEEL UNSAFE OR FOLLOWED**:
1. **Do NOT go straight home**: Change direction toward an open shop, petrol pump, or public area.
2. **Make Noise / Call Someone**: Call a contact and speak loudly: *"I am at Main Street, meet me now."*
3. **Trigger Silent SOS**: Shake your phone or press Volume Key in SafeSafar.
4. **Be Ready to Yell**: If approached, shout loudly to attract immediate crowd attention.`;
  }

  if (lower.includes('cab') || lower.includes('ride') || lower.includes('uber') || lower.includes('auto') || lower.includes('taxi')) {
    return `🚖 **Solo Cab Safety Tips**:
1. **Share Ride Details**: Photo/number plate sent to guardians via SafeSafar.
2. **Check Child Locks**: Verify window & door controls before leaving.
3. **Sit in Back Seat**: Behind the driver for safety and space.
4. **Fake Call**: Use SafeSafar Fake Call if uncomfortable.`;
  }

  if (lower.includes('sos') || lower.includes('discreet') || lower.includes('silent') || lower.includes('trigger')) {
    return `🔒 **Discreet SOS Features in SafeSafar**:
1. **Shake SOS**: Shake phone for silent emergency alert with GPS.
2. **Duress PIN (9999)**: Calculator decoy screen + hidden alert.
3. **Fake Call Distress**: Simulated call where key phrases activate SOS.
4. **Volume Key Hold**: 3-second hold for silent background alert.`;
  }

  return `💙 **SafeSafar AI Companion**:
I am here to give quick safety guidance. Ask me about safe routes, handling scary situations, or emergency triggers (**Walk Me Home**, **Shake SOS**, **Fake Call**).`;
}
