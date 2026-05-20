import type { I18nKey } from '@/lib/t';
import type { AiTutorChatMessage } from './AiTutorChatShell';

type Tr = (key: I18nKey) => string;

/** Static homepage demo thread — matches marketing mock design order. */
export function buildAiTutorDemoMessages(tr: Tr): AiTutorChatMessage[] {
  return [
    { id: 'demo-greeting', role: 'assistant', content: tr('landingTutorMockGreeting') },
    {
      id: 'demo-audio',
      role: 'assistant',
      variant: 'audio',
      content: '',
      audioDuration: '0:08',
      audioCaption: tr('landingTutorMockAudioCaption'),
    },
    { id: 'demo-user', role: 'user', content: tr('landingTutorMockUserMsg') },
    { id: 'demo-reply', role: 'assistant', content: tr('landingTutorMockReply') },
  ];
}
