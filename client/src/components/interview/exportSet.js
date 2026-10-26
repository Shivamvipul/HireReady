const esc = (s = '') => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function exportSetAsPdf(set, label) {
  const w = window.open('', '_blank');
  if (!w) return false;
  const body = set.questions.map((q) => `
    <section>
      <h3>${q.id}. ${esc(q.question)} <small>(${esc(q.difficulty)})</small></h3>
      <p><b>Answer outline:</b> ${esc(q.answer_outline)}</p>
      ${q.key_points?.length ? `<p><b>Key points:</b></p><ul>${q.key_points.map((k) => `<li>${esc(k)}</li>`).join('')}</ul>` : ''}
      ${q.tips ? `<p><b>Tip:</b> ${esc(q.tips)}</p>` : ''}
      ${q.follow_ups?.length ? `<p><b>Follow-ups:</b> ${q.follow_ups.map(esc).join(' &bull; ')}</p>` : ''}
    </section>`).join('');
  w.document.write(`<!doctype html><title>${esc(label)}</title><style>
    body{font:14px/1.5 Arial,sans-serif;max-width:760px;margin:24px auto;padding:0 16px;color:#111}
    h1{font-size:22px} h3{font-size:15px;margin:0 0 6px} small{color:#666;font-weight:400}
    section{break-inside:avoid;border-bottom:1px solid #ddd;padding:12px 0} p{margin:4px 0} ul{margin:4px 0 4px 18px;padding:0}
  </style><h1>${esc(label)}</h1><p>${esc(set.role)}${set.company ? ' at ' + esc(set.company) : ''} &middot; ${esc(set.level)}</p>${body}
  <p style="color:#888;font-size:12px;margin-top:24px">Made with HireReady AI</p>`);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 400);
  return true;
}
