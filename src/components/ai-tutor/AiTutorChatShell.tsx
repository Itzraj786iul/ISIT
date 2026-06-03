'use client';

import { type ReactNode, type RefObject } from 'react';
import { Bot, Mic, Play, Send, User, Volume2 } from 'lucide-react';
import { useT } from '@/lib/t';
import { useLandingTutorT } from '@/lib/use-landing-tutor-t';

export type AiTutorChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: number;
  error?: boolean;
  variant?: 'text' | 'audio';
  audioDuration?: string;
  audioCaption?: string;
};

type AiTutorChatShellProps = {
  messages: AiTutorChatMessage[];
  thinking?: boolean;
  inputValue?: string;
  onInputChange?: (value: string) => void;
  onSend?: () => void;
  canSend?: boolean;
  inputPlaceholder?: string;
  scrollRef?: RefObject<HTMLDivElement | null>;
  footerExtra?: ReactNode;
  className?: string;
  readOnlyInput?: boolean;
  live?: boolean;
  marketingMock?: boolean;
};

function TutorAvatar({ size = 'md', square = false }: { size?: 'sm' | 'md'; square?: boolean }) {
  const dim = size === 'sm' ? 'h-6 w-6' : 'h-11 w-11';
  const icon = size === 'sm' ? 'h-3 w-3' : 'h-5 w-5';
  return (
    <div
      className={`isit-ai-tutor-chat__avatar ${dim} ${square ? 'isit-ai-tutor-chat__avatar--square' : ''}`.trim()}
      aria-hidden
    >
      <div className="isit-ai-tutor-chat__avatar-inner">
        <Bot className={`${icon} text-white`} strokeWidth={1.75} />
      </div>
    </div>
  );
}

function UserAvatar() {
  return (
    <div className="isit-ai-tutor-chat__user-avatar" aria-hidden>
      <User className="h-3 w-3 text-slate-200" strokeWidth={2} />
    </div>
  );
}

function AudioBubble({ duration, caption }: { duration: string; caption: string }) {
  return (
    <div className="isit-ai-tutor-chat__audio-block">
      <div className="isit-ai-tutor-chat__audio">
        <button type="button" className="isit-ai-tutor-chat__play" aria-label="Play voice message" tabIndex={-1}>
          <Play className="h-3.5 w-3.5 fill-current" />
        </button>
        <div className="isit-ai-tutor-chat__waveform" aria-hidden>
          {Array.from({ length: 7 }).map((_, i) => (
            <span key={i} className="isit-ai-tutor-chat__wave-bar" />
          ))}
        </div>
        <span className="isit-ai-tutor-chat__audio-time">{duration}</span>
      </div>
      {caption ? (
        <p className="isit-ai-tutor-chat__caption">
          <Volume2 className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
          <span>{caption}</span>
        </p>
      ) : null}
    </div>
  );
}

export default function AiTutorChatShell({
  messages,
  thinking = false,
  inputValue = '',
  onInputChange,
  onSend,
  canSend = false,
  inputPlaceholder,
  scrollRef,
  footerExtra,
  className = '',
  readOnlyInput = false,
  live = false,
  marketingMock = false,
}: AiTutorChatShellProps) {
  const tr = useT();
  const trMock = useLandingTutorT();
  const placeholder = inputPlaceholder ?? tr('aiTutorPlaceholderAsk');
  const shellClass = [
    'isit-ai-tutor-chat',
    live ? 'isit-ai-tutor-chat--live' : '',
    marketingMock ? 'isit-ai-tutor-chat--marketing' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={shellClass}>
      <header className="isit-ai-tutor-chat__header">
        <div className="isit-ai-tutor-chat__header-left">
          <TutorAvatar square={marketingMock} />
          <div className="min-w-0">
            <p className="isit-ai-tutor-chat__title">{trMock('landingTutorMockName')}</p>
            <p
              className={`isit-ai-tutor-chat__status ${marketingMock ? 'isit-ai-tutor-chat__status--online' : ''}`.trim()}
            >
              {trMock('landingTutorMockStatus')}
            </p>
          </div>
        </div>
        <div className="isit-ai-tutor-chat__badges">
          <span
            className={
              marketingMock ? 'isit-ai-tutor-chat__powered-label' : 'isit-ai-tutor-chat__badge'
            }
          >
            {trMock('landingTutorMockPowered')}
          </span>
          {!marketingMock ? (
            <span className="isit-ai-tutor-chat__badge isit-ai-tutor-chat__badge--live">
              {trMock('landingTutorMockVoiceMode')}
            </span>
          ) : null}
        </div>
      </header>

      <div ref={scrollRef} className="isit-ai-tutor-chat__body">
        <div className="isit-ai-tutor-chat__messages">
          {messages.map((m) =>
            m.role === 'user' ? (
              <div key={m.id} className="isit-ai-tutor-chat__row isit-ai-tutor-chat__row--user">
                <div
                  className={`isit-ai-tutor-chat__bubble isit-ai-tutor-chat__bubble--user ${m.error ? 'isit-ai-tutor-chat__bubble--error' : ''}`}
                >
                  {m.content}
                  {m.createdAt ? (
                    <p className="isit-ai-tutor-chat__time">
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  ) : null}
                </div>
                {marketingMock ? <UserAvatar /> : null}
              </div>
            ) : (
              <div key={m.id} className="isit-ai-tutor-chat__row">
                <div className="isit-ai-tutor-chat__row-avatar" aria-hidden>
                  <Bot className="h-3 w-3 text-cyan-100" strokeWidth={1.75} />
                </div>
                <div
                  className={`isit-ai-tutor-chat__bubble isit-ai-tutor-chat__bubble--ai ${m.error ? 'isit-ai-tutor-chat__bubble--error' : ''}`}
                >
                  {m.variant === 'audio' ? (
                    <AudioBubble duration={m.audioDuration ?? '0:08'} caption={m.audioCaption ?? ''} />
                  ) : (
                    m.content
                  )}
                  {m.createdAt && m.variant !== 'audio' ? (
                    <p className="isit-ai-tutor-chat__time">
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  ) : null}
                </div>
              </div>
            )
          )}
          {thinking ? (
            <div className="isit-ai-tutor-chat__row">
              <div className="isit-ai-tutor-chat__row-avatar" aria-hidden>
                <Bot className="h-3 w-3 text-cyan-100" strokeWidth={1.75} />
              </div>
              <div className="isit-ai-tutor-chat__thinking">
                <Bot className="h-3.5 w-3.5 text-cyan-400" />
                {tr('aiTutorThinking')}
              </div>
            </div>
          ) : null}
        </div>
        {footerExtra}
      </div>

      <footer className="isit-ai-tutor-chat__footer">
        <div className="isit-ai-tutor-chat__footer-row">
          {!marketingMock ? (
            <button
              type="button"
              className="isit-ai-tutor-chat__mic"
              disabled={readOnlyInput}
              aria-label={trMock('landingTutorMicAria')}
              title={readOnlyInput ? undefined : trMock('landingTutorMicHint')}
            >
              <Mic className="h-4 w-4" />
            </button>
          ) : null}
          <input
            type="text"
            value={inputValue}
            readOnly={readOnlyInput}
            onChange={readOnlyInput ? undefined : (e) => onInputChange?.(e.target.value)}
            onKeyDown={
              readOnlyInput
                ? undefined
                : (e) => {
                    if (e.key === 'Enter' && canSend) onSend?.();
                  }
            }
            placeholder={readOnlyInput ? trMock('landingTutorInputPlaceholder') : placeholder}
            className="isit-ai-tutor-chat__input"
            aria-label={readOnlyInput ? trMock('landingTutorInputPlaceholder') : placeholder}
          />
          <button
            type="button"
            onClick={onSend}
            disabled={!canSend || readOnlyInput}
            className="isit-ai-tutor-chat__send"
            aria-label={trMock('landingTutorSendAria')}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </footer>
    </div>
  );
}
