// Speech Synthesis for Turn-by-Turn Safe Navigation Guidance
export function speakInstruction(text: string): void {
  if (!('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    utterance.volume = 0.9;
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis error:', err);
  }
}

// Voice Trigger Word Listener (e.g. "reach soon", "help", "bachao")
type VoiceCallback = (transcript: string) => void;

interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export class VoiceTriggerDetector {
  private recognition: any = null;
  private isListening: boolean = false;
  private onTriggerCallback: VoiceCallback | null = null;
  private triggerKeywords: string[] = ['reach soon', 'traffic', 'red', 'help', 'bachao', 'emergency'];

  constructor(onTrigger: VoiceCallback) {
    this.onTriggerCallback = onTrigger;
    const win = window as unknown as IWindow;
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (SpeechRec) {
      try {
        this.recognition = new SpeechRec();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-IN';

        this.recognition.onresult = (event: any) => {
          let fullText = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            fullText += event.results[i][0].transcript.toLowerCase();
          }
          for (const kw of this.triggerKeywords) {
            if (fullText.includes(kw)) {
              if (this.onTriggerCallback) {
                this.onTriggerCallback(kw);
              }
              break;
            }
          }
        };

        this.recognition.onerror = () => {
          // Silent catch
        };
      } catch {
        this.recognition = null;
      }
    }
  }

  public start(): boolean {
    if (this.recognition && !this.isListening) {
      try {
        this.recognition.start();
        this.isListening = true;
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }

  public stop(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
        this.isListening = false;
      } catch {
        // Silent catch
      }
    }
  }

  public getSupported(): boolean {
    return !!this.recognition;
  }
}
