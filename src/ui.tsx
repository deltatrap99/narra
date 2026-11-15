import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

export function Modal({ title, children, onClose, wide = false }: { title: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current; const previous = document.activeElement as HTMLElement | null;
    dialog?.showModal(); const old = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = old; previous?.focus(); };
  }, []);
  return <dialog ref={ref} className={`modal ${wide ? 'modal-wide' : ''}`} onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) { const r = e.currentTarget.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) onClose(); } }}>
    <div className="modal-head"><h2>{title}</h2><button className="icon-button" aria-label="Close dialog" onClick={onClose}><X size={22} /></button></div>{children}
  </dialog>;
}
export function Art({ name, className = '' }: { name: string; className?: string }) { return <img className={`art ${className}`} src={`/assets/${name}.webp`} alt="" draggable={false} />; }
export function Avatar({ className = '', name = 'Camila' }: { className?: string; name?: string }) { const asset = ['Skye', 'Henry', 'Camila', 'Dwayne'].includes(name) ? name.toLowerCase() : 'camila'; return <img src={`/assets/${asset}.webp`} alt={name} className={`avatar ${className}`} />; }
export function Empty({ title, children }: { title: string; children: ReactNode }) { return <div className="empty-state"><div className="empty-symbol">✧</div><h3>{title}</h3><p className="muted">{children}</p></div>; }
