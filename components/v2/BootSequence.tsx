import { useEffect, useState, useRef } from 'react';
import { INTERVOLZ_LOGO } from '@/lib/logo';

const BOOT_LINES: { delay: number; text: string }[] = [
  { delay: 80,  text: '[  OK  ] Reached target Local File Systems.' },
  { delay: 120, text: '[  OK  ] Mounting /content/posts ...' },
  { delay: 90,  text: '[  OK  ] Started MDX kernel module.' },
  { delay: 110, text: '[  OK  ] Loading remark/rehype pipeline ...' },
  { delay: 70,  text: '[  OK  ] Started tailwind daemon.' },
  { delay: 100, text: '[  OK  ] Reached target Network is Online.' },
  { delay: 90,  text: '[  OK  ] Started OpenAI inference shim.' },
  { delay: 130, text: '[  OK  ] Started intervolz.service' },
  { delay: 60,  text: '' },
  { delay: 40,  text: 'intervolz login: mvolz' },
  { delay: 200, text: 'Last login: just now on tty1' },
  { delay: 80,  text: '' },
];

type Props = { onComplete: () => void; skip: boolean };

export default function BootSequence({ onComplete, skip }: Props) {
  const [lines, setLines] = useState<string[]>([]);
  const [showLogo, setShowLogo] = useState(false);
  const doneRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    onComplete();
  };

  useEffect(() => {
    if (skip) {
      finish();
      return;
    }

    let i = 0;
    const tick = () => {
      if (doneRef.current) return;
      const entry = BOOT_LINES[i];
      if (!entry) {
        setShowLogo(true);
        timerRef.current = setTimeout(() => {
          if (doneRef.current) return;
          finish();
        }, 900);
        return;
      }
      setLines((prev) => [...prev, entry.text]);
      i += 1;
      timerRef.current = setTimeout(tick, entry.delay);
    };
    tick();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip]);

  // any-key / click skip — bound after first paint
  useEffect(() => {
    const handler = () => finish();
    const t = setTimeout(() => {
      window.addEventListener('keydown', handler);
      window.addEventListener('click', handler);
    }, 200);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', handler);
      window.removeEventListener('click', handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black text-green-400 font-mono overflow-hidden">
      <div className="absolute inset-0 p-6 md:p-10 text-xs md:text-sm leading-relaxed">
        {lines.map((line, idx) => (
          <div key={idx} className="whitespace-pre">
            {line || '\u00A0'}
          </div>
        ))}
        {showLogo && (
          <pre className="mt-6 text-emerald-300 text-[7px] sm:text-[10px] md:text-xs leading-tight animate-pulse">
            {INTERVOLZ_LOGO}
          </pre>
        )}
      </div>
      <div className="absolute bottom-4 right-6 text-[10px] text-green-700">
        press any key to skip
      </div>
    </div>
  );
}
