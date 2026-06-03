import type { AiTutorChatMessage } from './AiTutorChatShell';
import type { LandingTutorMockKey } from '@/lib/use-landing-tutor-t';

type Tr = (key: LandingTutorMockKey) => string;

/** Static homepage demo thread — matches marketing mock design order. */
export function buildAiTutorDemoMessages(tr: Tr): AiTutorChatMessage[] {
  return [
    { id: 'demo-greeting', role: 'assistant', content: tr('landingTutorMockGreeting') },
    { id: 'demo-user', role: 'user', content: tr('landingTutorMockUserMsg') },
    { id: 'demo-reply', role: 'assistant', content: tr('landingTutorMockReply') },
  ];
}
