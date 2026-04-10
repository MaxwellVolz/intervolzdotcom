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

const GLITCH_CHARS = '!@#$%^&*<>?/\\|=+-_~░▒▓█';

function GlitchLine({ text }: { text: string }) {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (!text) {
      setDisplay('');
      return;
    }
    const start = performance.now();
    const duration = 180;
    let raf = 0;
    const tick = (now: number) => {
      const t = (now - start) / duration;
      if (t >= 1) {
        setDisplay(text);
        return;
      }
      const settled = Math.floor(text.length * t);
      let out = '';
      for (let i = 0; i < text.length; i++) {
        if (i < settled || text[i] === ' ') {
          out += text[i];
        } else {
          out += GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        }
      }
      setDisplay(out);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text]);

  return <>{display || '\u00A0'}</>;
}

type Props = { onComplete: () => void; skip: boolean };

export default function BootSequence({ onComplete, skip }: Props) {
  const [lines, setLines] = useState<string[]>([]);
  const [showLogo, setShowLogo] = useState(false);
  const doneRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gravRootRef = useRef<HTMLDivElement>(null);

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

  // gravity force-push loop on boot lines
  useEffect(() => {
    const root = gravRootRef.current;
    if (!root) return;

    type Cached = { baseX: number; baseY: number; dx: number; dy: number };
    const cache = new Map<HTMLElement, Cached>();
    const mouse = { x: -99999, y: -99999 };
    const radius = 200;
    const strength = 0.45;

    const recompute = () => {
      const els = Array.from(root.querySelectorAll<HTMLElement>('[data-grav]'));
      const seen = new Set<HTMLElement>();
      els.forEach((el) => {
        seen.add(el);
        if (!cache.has(el)) {
          el.style.transform = '';
          const r = el.getBoundingClientRect();
          cache.set(el, {
            baseX: r.left + r.width / 2,
            baseY: r.top + r.height / 2,
            dx: 0,
            dy: 0,
          });
        }
      });
      for (const k of Array.from(cache.keys())) {
        if (!seen.has(k)) cache.delete(k);
      }
    };
    recompute();

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      mouse.x = t.clientX;
      mouse.y = t.clientY;
    };
    const onLeave = () => {
      mouse.x = -99999;
      mouse.y = -99999;
    };
    const onResize = () => {
      cache.clear();
      recompute();
    };

    const mo = new MutationObserver(() => recompute());
    mo.observe(root, { childList: true, subtree: true });

    let raf = 0;
    const tick = () => {
      cache.forEach((c, el) => {
        const ddx = c.baseX - mouse.x;
        const ddy = c.baseY - mouse.y;
        const dist = Math.hypot(ddx, ddy);
        let tx = 0;
        let ty = 0;
        if (dist < radius && dist > 0.01) {
          const force = ((radius - dist) / radius) * strength * radius;
          tx = (ddx / dist) * force;
          ty = (ddy / dist) * force;
        }
        c.dx += (tx - c.dx) * 0.2;
        c.dy += (ty - c.dy) * 0.2;
        el.style.transform = `translate(${c.dx.toFixed(2)}px, ${c.dy.toFixed(2)}px)`;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onTouch, { passive: true });
    window.addEventListener('mouseout', onLeave);
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onTouch);
      window.removeEventListener('mouseout', onLeave);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize);
    };
  }, []);

  useEffect(() => {
    const handler = () => finish();
    const t = setTimeout(() => {
      window.addEventListener('keydown', handler);
      window.addEventListener('click', handler);
      window.addEventListener('touchstart', handler, { passive: true });
    }, 200);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', handler);
      window.removeEventListener('click', handler);
      window.removeEventListener('touchstart', handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black text-green-400 font-mono overflow-hidden">
      <div
        ref={gravRootRef}
        className="absolute inset-0 p-6 md:p-10 text-xs md:text-sm leading-relaxed overflow-auto"
        style={{
          textShadow: showLogo
            ? 'none'
            : '0.6px 0 rgba(255,0,64,0.55), -0.6px 0 rgba(0,255,247,0.55)',
        }}
      >
        <div data-grav className="inline-block border border-green-500 px-4 py-2 mb-6 text-green-300" style={{ willChange: 'transform' }}>
          🤙 Welcome to InterVolz.com!
        </div>
        {lines.map((line, idx) => (
          <div key={idx} data-grav className="whitespace-pre" style={{ willChange: 'transform' }}>
            <GlitchLine text={line} />
          </div>
        ))}
        {showLogo && (
          <>
            <pre className="mt-6 text-emerald-300 text-[7px] sm:text-[10px] md:text-xs leading-tight !bg-transparent !p-0 !rounded-none">
              {INTERVOLZ_LOGO}
            </pre>
            <div className="mt-6 text-xs md:text-sm text-green-500 animate-pulse">
              press any key to continue...
            </div>
          </>
        )}
      </div>
      {/* CRT scanline overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to bottom, rgba(0,0,0,0) 0, rgba(0,0,0,0) 2px, rgba(0,0,0,0.18) 2px, rgba(0,0,0,0.18) 3px)',
          mixBlendMode: 'multiply',
        }}
      />
    </div>
  );
}
