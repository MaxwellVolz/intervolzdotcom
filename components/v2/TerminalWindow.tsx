import { ReactNode, useState } from 'react';

type Props = {
  title?: string;
  children: ReactNode;
};

export default function TerminalWindow({ title = 'mvolz@intervolz: ~/', children }: Props) {
  const [minimized, setMinimized] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const handleClose = () => {
    if (shaking) return;
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  };

  const handleMinimize = () => setMinimized((m) => !m);
  const handleFullscreen = () => setFullscreen((f) => !f);

  const wrapperClass = [
    'rounded-lg border border-zinc-700 bg-zinc-950 shadow-2xl shadow-emerald-500/10 overflow-hidden',
    shaking ? 'v2-shake' : '',
    fullscreen
      ? 'fixed inset-4 md:inset-8 z-40 flex flex-col'
      : 'relative',
  ].join(' ');

  return (
    <>
      {fullscreen && <div className="fixed inset-0 bg-black/70 z-30" onClick={handleFullscreen} />}
      <div className={wrapperClass}>
        <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border-b border-zinc-800 select-none">
          <button
            type="button"
            onClick={handleClose}
            aria-label="close"
            className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-400 transition-colors"
          />
          <button
            type="button"
            onClick={handleMinimize}
            aria-label="minimize"
            className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-400 transition-colors"
          />
          <button
            type="button"
            onClick={handleFullscreen}
            aria-label="fullscreen"
            className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-400 transition-colors"
          />
          <span className="ml-3 text-xs font-mono text-zinc-400">{title}</span>
        </div>
        {!minimized && (
          <div className={`p-6 md:p-8 font-mono text-sm text-zinc-200 ${fullscreen ? 'overflow-auto flex-1' : ''}`}>
            {children}
          </div>
        )}
      </div>
    </>
  );
}
