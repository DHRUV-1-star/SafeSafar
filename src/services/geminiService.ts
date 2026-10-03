/**
 * Gemini AI Service for SafeSafar AI Companion
 * Integrates Google Gemini API with fallback for AI safety guidance
 */

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

const SYSTEM_INSTRUCTION = `You are SafeSafar AI, an expert, empathetic, and rapid-response safety companion for women and solo travelers.
Your primary role is to give quick, practical, reassuring, and immediate safety guidance.

SafeSafar Key Features you can reference when helpful:
- "Walk Me Home": Real-time live route tracking with trusted contacts/guardians.
- "Shake SOS": Rapid silent emergency alert triggered by shaking the phone.
- "Fake Call": Covert distress trigger during a simulated realistic phone call.
- "Duress PIN (9999)": Decoy screen disguised as a calculator while silently dispatching SOS.
- "Civic Heatmap": Shows crowd-sourced safe zones, lighting score, and safe havens nearby.

Guidance Guidelines:
1. If the user expresses immediate fear or danger (e.g. "I feel followed", "someone is behind me"), lead with IMMEDIATE 1-2-3 actions (e.g. head to crowded lit areas, call someone/speak loudly, arm SOS).
2. If asked about safe routes or navigation, explain factors like street lighting, crowd presence, safe havens, and avoiding dark isolated paths.
3. Keep responses structured, concise, clear, and easy to read on mobile devices.
4. Be supportive, calm, and practical.`;

// List of supported model endpoints to attempt sequentially
const PREFERRED_MODELS = [
  'gemini-flash-latest',
  'gemini-3.5-flash',
  'gemini-3.0-flash',
  'gemini-2.5-flash',
  'gemini-flash-lite-latest',
];

/**
 * Sends a chat message history + user input to Google Gemini API
 */
export async function getGeminiResponse(
  userInput: string,
  history: ChatMessage[] = []
): Promise<string> {
  const apiKey = (import.meta.env.VITE_GEMINI_API_KEY || '').trim();

  // If no API key configured or dummy placeholder string, use intelligent fallback
  if (!apiKey || apiKey === 'your_actual_api_key_here') {
    console.log('[Gemini API] No valid VITE_GEMINI_API_KEY found in .env, using local fallback.');
    return getOfflineFallbackResponse(userInput);
  }

  // Format conversation history for Gemini REST API
  // IMPORTANT: Gemini API requires contents to start with 'user' role and alternate user/model.
  const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

  // Filter out initial assistant greeting if it's the very first message
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

  // Add current user input if the last role wasn't already 'user'
  if (lastRole !== 'user' || contents.length === 0) {
    contents.push({
      role: 'user',
      parts: [{ text: userInput }],
    });
  }

  // Try supported models sequentially until one succeeds
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
            temperature: 0.7,
            maxOutputTokens: 600,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const parts = data?.candidates?.[0]?.content?.parts || [];
        // Extract text from parts (skip empty / non-text parts)
        const textPart = parts.find((p: any) => typeof p.text === 'string' && p.text.trim().length > 0);
        if (textPart && textPart.text) {
          console.log(`[Gemini API] Successfully generated content using model: ${modelName}`);
          return textPart.text.trim();
        }
      } else {
        const errData = await response.json().catch(() => ({}));
        console.warn(`[Gemini API] Model ${modelName} returned status ${response.status}:`, errData);
      }
    } catch (err) {
      console.warn(`[Gemini API] Error contacting model ${modelName}:`, err);
    }
  }

  console.warn('[Gemini API] All models exhausted or unavailable. Falling back to local offline safety advisor.');
  return getOfflineFallbackResponse(userInput);
}

/**
 * Comprehensive offline fallback response generator when offline or API key issue occurs
 */
function getOfflineFallbackResponse(input: string): string {
  const lower = input.toLowerCase();

  if (lower.includes('route') || lower.includes('path') || lower.includes('safer') || lower.includes('navigation') || lower.includes('map') || lower.includes('why')) {
    return `🗺️ **Why One Route is Safer Than Another**:
1. **Street Lighting & Visibility**: Well-lit roads discourage unwanted activity and give you clear visibility of your surroundings.
2. **Pedestrian & Business Activity**: Roads with open shops, cafes, and active foot traffic provide natural safety and bystanders if needed.
3. **Proximity to Safe Havens**: Safe routes prioritize paths passing near police booths, 24/7 hospitals, or verified Safe Havens.
4. **Verified Safety Reports**: SafeSafar evaluates crowd-sourced civic safety reports and lighting scores to rank safer routes.`;
  }

  if (lower.includes('walk') || lower.includes('10pm') || lower.includes('night') || lower.includes('late')) {
    return `🌟 **Walking Home Late Safety Tips**:
1. **Enable Walk Me Home**: Start live GPS monitoring in SafeSafar so guardians follow your journey.
2. **Stick to Well-Lit Main Roads**: Avoid dark alleys, even if it adds 5 minutes to your route.
3. **Stay Alert**: Keep headphones out or at low volume and your phone charged in hand.
4. **Arm Shake SOS**: If anything feels suspicious, a quick phone shake dispatches instant alerts.`;
  }

  if (lower.includes('follow') || lower.includes('danger') || lower.includes('behind me') || lower.includes('scary') || lower.includes('unsafe') || lower.includes('alone')) {
    return `🚨 **IMMEDIATE ACTION IF YOU FEEL UNSAFE OR FOLLOWED**:
1. **Do NOT go straight home**: Change direction immediately toward an open shop, petrol pump, or public area.
2. **Make Noise / Call Someone**: Call a trusted contact or speak loudly: *"I am at Main Street, meet me right now."*
3. **Trigger Silent SOS**: Press SafeSafar Shake SOS or Volume Button trigger right away.
4. **Be Ready to Yell**: If someone approaches, scream loudly to attract immediate crowd attention.`;
  }

  if (lower.includes('cab') || lower.includes('ride') || lower.includes('uber') || lower.includes('auto') || lower.includes('taxi')) {
    return `🚖 **Solo Cab Safety Tips**:
1. **Share Ride Details**: Take a photo of the vehicle plate and share it with your guardians via SafeSafar.
2. **Check Child Locks**: Verify door locks and window controls before getting in.
3. **Sit in the Back Seat**: Sitting behind the driver gives you better visibility and space.
4. **Fake Call / Active Monitoring**: Use SafeSafar's Fake Call feature if the driver makes you uncomfortable.`;
  }

  if (lower.includes('sos') || lower.includes('discreet') || lower.includes('silent') || lower.includes('trigger')) {
    return `🔒 **Discreet SOS Features in SafeSafar**:
1. **Shake SOS**: Rapidly shake your phone to send a silent distress signal with your GPS location.
2. **Duress PIN (9999)**: Enter 9999 on the lock/auth screen to open a Calculator decoy while dispatching alerts.
3. **Fake Call Distress**: Use simulated incoming calls where key spoken phrases secretly activate SOS.
4. **Volume Key Hold**: Hold the volume key for 3 seconds for silent background alerts.`;
  }

  return `💙 **SafeSafar AI Companion**:
I can help with route safety advice, night travel safety, solo commuting, and emergency features like **Walk Me Home**, **Shake SOS**, and **Fake Call**.

Feel free to ask a specific safety question like *"How do I choose a safe route at night?"* or *"What should I do in an emergency?"*`;
}
