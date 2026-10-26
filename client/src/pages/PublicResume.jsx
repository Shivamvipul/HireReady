import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { resumes } from '../api';
import ScaledPreview from '../templates/ScaledPreview';
import { templates } from '../templates/catalog';
import { defaultSettings, emptyData, mergeContact } from '../templates/data';
import { ErrorState, Skeleton } from '../components/ui';
import { errMsg } from '../utils/cn';

export default function PublicResume() {
  const { slug } = useParams();
  const [r, setR] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => { resumes.getPublic(slug).then(setR).catch((e) => setErr(errMsg(e))); }, [slug]);
  useEffect(() => { if (r) document.title = `${r.data?.contact?.name || 'Resume'} | HireReady AI`; }, [r]);

  if (err) return <div className="mx-auto max-w-md p-6"><ErrorState message={err} /><p className="mt-4 text-center text-sm"><Link className="text-accent underline" to="/">Go to HireReady AI</Link></p></div>;
  if (!r) return <div className="mx-auto max-w-3xl p-6"><Skeleton className="h-[80vh]" /></div>;
  const tpl = templates.find((t) => t.id === r.templateId) || templates[0];
  const data = { ...emptyData(), ...r.data, contact: mergeContact(r.data?.contact || {}) };
  return (
    <main className="min-h-screen bg-ink px-3 py-6">
      <div className="mx-auto max-w-[794px] overflow-hidden rounded-lg bg-white shadow-2xl">
        <ScaledPreview tpl={tpl} data={data} settings={{ ...defaultSettings(), ...r.settings }} photo={tpl.tags.photo ? r.photoUrl : undefined} />
      </div>
    </main>
  );
}
