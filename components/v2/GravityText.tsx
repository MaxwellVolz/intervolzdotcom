import { useEffect, useRef } from 'react';

type Props = {
  text: string;
  radius?: number;
  strength?: number;
  jitter?: number;
  className?: string;
};

/**
 * GravityText — per-character DOM spans displaced by a circular cursor field.
 * Each char inside the radius is pushed radially outward; lerp smoothing
 * gives it a soft spring-back when the cursor leaves.
 */
export default function GravityText({
  text,
  radius = 140,
  strength = 0.7,
  jitter = 0,
  className = '',
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: -99999, y: -99999 });

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    type Char = {
      el: HTMLSpanElement;
      baseX: number;
      baseY: number;
      dx: number;
      dy: number;
    };

    const spans = Array.from(root.querySelectorAll<HTMLSpanElement>('span[data-char]'));
    let chars: Char[] = [];

    const recompute = () => {
      chars = spans.map((el) => {
        el.style.transform = '';
        const r = el.getBoundingClientRect();
        return {
          el,
          baseX: r.left + r.width / 2,
          baseY: r.top + r.height / 2,
          dx: 0,
          dy: 0,
        };
      });
    };
    recompute();

    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      mouse.current.x = t.clientX;
      mouse.current.y = t.clientY;
    };
    const onLeave = () => {
      mouse.current.x = -99999;
      mouse.current.y = -99999;
    };

    let raf = 0;
    const tick = () => {
      const mx = mouse.current.x;
      const my = mouse.current.y;
      for (const c of chars) {
        const ddx = c.baseX - mx;
        const ddy = c.baseY - my;
        const dist = Math.hypot(ddx, ddy);
        let tx = 0;
        let ty = 0;
        if (dist < radius && dist > 0.01) {
          const force = ((radius - dist) / radius) * strength * radius;
          tx = (ddx / dist) * force;
          ty = (ddy / dist) * force;
        }
        // critically-damped-ish lerp toward gravity target
        c.dx += (tx - c.dx) * 0.2;
        c.dy += (ty - c.dy) * 0.2;
        // additive per-frame jitter on top of the smoothed displacement
        const jx = (Math.random() - 0.5) * jitter * 2;
        const jy = (Math.random() - 0.5) * jitter * 2;
        c.el.style.transform = `translate(${(c.dx + jx).toFixed(2)}px, ${(c.dy + jy).toFixed(2)}px)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onTouch, { passive: true });
    window.addEventListener('mouseout', onLeave);
    window.addEventListener('resize', recompute);
    window.addEventListener('scroll', recompute, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onTouch);
      window.removeEventListener('mouseout', onLeave);
      window.removeEventListener('resize', recompute);
      window.removeEventListener('scroll', recompute);
    };
  }, [text, radius, strength, jitter]);

  return (
    <div ref={ref} className={className} aria-label={text}>
      {text.split('').map((c, i) => (
        <span
          key={i}
          data-char
          style={{ display: 'inline-block', willChange: 'transform' }}
        >
          {c === ' ' ? '\u00A0' : c}
        </span>
      ))}
    </div>
  );
}
