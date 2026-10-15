import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { upload } from '../../api';
import { Button, Modal } from '../ui';
import { errMsg } from '../../utils/cn';

const S = 260; // preview size
const OUT = 400; // exported size

export default function PhotoCropper({ open, onClose, onDone }) {
  const [img, setImg] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [ox, setOx] = useState(0);
  const [oy, setOy] = useState(0);
  const [busy, setBusy] = useState(false);
  const canvas = useRef();

  const draw = (c, size) => {
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, size, size);
    if (!img) return;
    const k = size / S;
    const base = Math.max(S / img.width, S / img.height) * zoom;
    const w = img.width * base; const h = img.height * base;
    const x = (S - w) / 2 + (ox / 100) * (w - S) / 2;
    const y = (S - h) / 2 + (oy / 100) * (h - S) / 2;
    ctx.drawImage(img, x * k, y * k, w * k, h * k);
  };
  useEffect(() => { if (canvas.current) draw(canvas.current, S); });
  useEffect(() => { if (!open) { setImg(null); setZoom(1); setOx(0); setOy(0); } }, [open]);

  const pick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/^image\/(jpeg|png|webp)$/.test(f.type)) return toast.error('Use a JPG, PNG or WebP image.');
    const url = URL.createObjectURL(f);
    const i = new Image();
    i.onload = () => { setImg(i); URL.revokeObjectURL(url); };
    i.onerror = () => toast.error('That image could not be opened.');
    i.src = url;
  };

  const save = async () => {
    setBusy(true);
    try {
      const out = document.createElement('canvas'); out.width = OUT; out.height = OUT;
      draw(out, OUT);
      const blob = await new Promise((r) => out.toBlob(r, 'image/jpeg', 0.85));
      const { url } = await upload.photo(blob);
      onDone(url); toast.success('Photo added'); onClose();
    } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add profile photo">
      <div className="space-y-4">
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={pick} aria-label="Choose photo" className="input" />
        {img && (
          <>
            <canvas ref={canvas} width={S} height={S} className="mx-auto rounded-xl border border-line" aria-label="Crop preview" />
            <label className="label">Zoom<input type="range" min="1" max="3" step="0.05" value={zoom} onChange={(e) => setZoom(+e.target.value)} className="w-full accent-accent" /></label>
            <label className="label">Move left / right<input type="range" min="-100" max="100" value={ox} onChange={(e) => setOx(+e.target.value)} className="w-full accent-accent" /></label>
            <label className="label">Move up / down<input type="range" min="-100" max="100" value={oy} onChange={(e) => setOy(+e.target.value)} className="w-full accent-accent" /></label>
          </>
        )}
        <div className="flex justify-end gap-2"><Button variant="ghost" onClick={onClose}>Cancel</Button><Button disabled={!img} loading={busy} onClick={save}>Save photo</Button></div>
      </div>
    </Modal>
  );
}
