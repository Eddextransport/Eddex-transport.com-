import { useRef, useState } from 'react';
import { Camera, Upload, X, Check, ImagePlus } from 'lucide-react';

interface PhotoUploadProps {
  label: string;
  description?: string;
  onPhoto: (dataUrl: string) => void;
  required?: boolean;
}

export function PhotoUpload({ label, description, onPhoto, required }: PhotoUploadProps) {
  const [photo, setPhoto] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPhoto(result);
      onPhoto(result);
    };
    reader.readAsDataURL(file);
  }

  function retake() {
    setPhoto(null);
    onPhoto('');
    if (fileRef.current) fileRef.current.value = '';
    if (cameraRef.current) cameraRef.current.value = '';
  }

  return (
    <div>
      <label className="label-text">
        {label} {required && <span className="text-brand-500">*</span>}
      </label>
      {description && <p className="text-xs text-ink-400 mb-2">{description}</p>}
      {photo ? (
        <div className="relative rounded-xl overflow-hidden border border-ink-600 bg-ink-900 animate-fade-in">
          <img src={photo} alt={label} className="w-full h-44 object-cover" />
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              type="button"
              onClick={retake}
              className="flex items-center justify-center w-8 h-8 bg-black/70 rounded-full text-white hover:bg-black/90 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2.5 py-1 bg-success-500/90 rounded-full">
            <Check size={14} className="text-white" />
            <span className="text-xs text-white font-medium">Foto pran</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 bg-ink-900 border border-ink-600 border-dashed rounded-xl py-6 transition-all active:scale-[0.98] hover:border-brand-500"
          >
            <Camera size={24} className="text-brand-400" />
            <span className="text-xs text-ink-300 font-medium">Pran Foto</span>
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 bg-ink-900 border border-ink-600 border-dashed rounded-xl py-6 transition-all active:scale-[0.98] hover:border-brand-500"
          >
            <ImagePlus size={24} className="text-ink-300" />
            <span className="text-xs text-ink-300 font-medium">Chwazi Fichye</span>
          </button>
        </div>
      )}
      <input ref={cameraRef} type="file" accept="image/*" capture="user" onChange={handleFile} className="hidden" />
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </div>
  );
}
