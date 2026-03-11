import React from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { base44 } from "@/api/base44Client";

export default function MediaUploader({ canUpload = false, onUploaded }) {
  const [file, setFile] = React.useState(null);
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState('');

  const handleUpload = async () => {
    if (!file || !canUpload) return;
    setUploading(true); setError(''); setProgress(10);
    try {
      // Pre-validate client-side (additional checks happen server-side)
      const allowed = ['image/jpeg','image/png','image/webp','video/mp4','video/webm'];
      if (!allowed.includes(file.type)) throw new Error('Unsupported type');

      // Extra rules for video: <=15s and <=720p + poster
      if (file.type.startsWith('video/')) {
        const metaOk = await new Promise((resolve) => {
          const v = document.createElement('video');
          v.preload = 'metadata';
          v.onloadedmetadata = async () => {
            const tooLong = v.duration > 15.05;
            const tooBig = Math.max(v.videoWidth, v.videoHeight) > 720;
            resolve(!tooLong && !tooBig);
          };
          v.src = URL.createObjectURL(file);
        });
        if (!metaOk) throw new Error('Video must be <=15s and max 720p');

        // Capture poster at 0.5s
        await new Promise((resolve) => setTimeout(resolve, 50));
        const v2 = document.createElement('video');
        v2.src = URL.createObjectURL(file);
        await v2.play().catch(()=>{});
        v2.currentTime = 0.5;
        await new Promise((r)=> v2.onseeked = r);
        const c = document.createElement('canvas');
        c.width = Math.min(1280, v2.videoWidth); c.height = Math.round(c.width * (v2.videoHeight / v2.videoWidth));
        const ctx = c.getContext('2d');
        ctx.drawImage(v2, 0, 0, c.width, c.height);
        const posterBlob = await new Promise((res)=> c.toBlob(res, 'image/webp', 0.9));
        if (posterBlob) { await base44.integrations.Core.UploadFile({ file: new File([posterBlob], 'video-poster.webp', { type: 'image/webp' }) }); }
      }

      setProgress(30);
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      setProgress(60);

      const { data } = await base44.functions.invoke('registerMediaAsset', {
        fileUri: file_uri,
        originalName: file.name
      });
      setProgress(100);
      onUploaded && onUploaded(data.asset);
      setFile(null);
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'Upload failed');
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 500);
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-center gap-3">
        <input type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" onChange={(e) => setFile(e.target.files?.[0] || null)} disabled={!canUpload || uploading} />
        <Button onClick={handleUpload} disabled={!file || !canUpload || uploading} className="bg-[#d62020] hover:bg-[#b91818]">Hochladen</Button>
      </div>
      {uploading && <div className="mt-3"><Progress value={progress} /></div>}
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      {!canUpload && <p className="text-sm text-slate-500 mt-2">Nur für Abonnenten · Upgrade erforderlich</p>}
    </div>
  );
}