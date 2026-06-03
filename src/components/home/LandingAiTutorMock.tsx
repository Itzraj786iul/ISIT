'use client';

import { Bot, Send, User } from 'lucide-react';
import { useLandingTutorT } from '@/lib/use-landing-tutor-t';

export default function LandingAiTutorMock() {
  const trMock = useLandingTutorT();

  return (
    <div className="isit-landing-tutor-mock-float mx-auto w-full max-w-[520px]">
      <div className="isit-landing-tutor-mock" aria-hidden>
        <header className="isit-landing-tutor-mock__header">
          <div className="isit-landing-tutor-mock__header-left">
            <div className="isit-landing-tutor-mock__avatar">
              <Bot className="h-5 w-5 text-white" strokeWidth={1.75} aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="isit-landing-tutor-mock__title">{trMock('landingTutorMockName')}</p>
              <p className="isit-landing-tutor-mock__status">{trMock('landingTutorMockStatus')}</p>
            </div>
          </div>
          <span className="isit-landing-tutor-mock__powered">{trMock('landingTutorMockPowered')}</span>
        </header>

        <div className="isit-landing-tutor-mock__chat">
          <div className="isit-landing-tutor-mock__row isit-landing-tutor-mock__row--ai">
            <div className="isit-landing-tutor-mock__msg-avatar" aria-hidden>
              <Bot className="h-3.5 w-3.5 text-white" strokeWidth={1.75} />
            </div>
            <div className="isit-landing-tutor-mock__bubble isit-landing-tutor-mock__bubble--ai">
              {trMock('landingTutorMockGreeting')}
            </div>
          </div>

          <div className="isit-landing-tutor-mock__row isit-landing-tutor-mock__row--user">
            <div className="isit-landing-tutor-mock__bubble isit-landing-tutor-mock__bubble--user">
              {trMock('landingTutorMockUserMsg')}
            </div>
            <div className="isit-landing-tutor-mock__msg-avatar isit-landing-tutor-mock__msg-avatar--user" aria-hidden>
              <User className="h-3.5 w-3.5 text-slate-200" strokeWidth={2} />
            </div>
          </div>

          <div className="isit-landing-tutor-mock__row isit-landing-tutor-mock__row--ai">
            <div className="isit-landing-tutor-mock__msg-avatar" aria-hidden>
              <Bot className="h-3.5 w-3.5 text-white" strokeWidth={1.75} />
            </div>
            <div className="isit-landing-tutor-mock__bubble isit-landing-tutor-mock__bubble--ai isit-landing-tutor-mock__bubble--multiline">
              {trMock('landingTutorMockReply')}
            </div>
          </div>
        </div>

        <footer className="isit-landing-tutor-mock__footer">
          <input
            type="text"
            readOnly
            tabIndex={-1}
            className="isit-landing-tutor-mock__input"
            placeholder={trMock('landingTutorInputPlaceholder')}
            aria-label={trMock('landingTutorInputPlaceholder')}
          />
          <button type="button" tabIndex={-1} className="isit-landing-tutor-mock__send" aria-label={trMock('landingTutorSendAria')}>
            <Send className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
          </button>
        </footer>
      </div>
    </div>
  );
}
