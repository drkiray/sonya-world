import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Sparkles } from 'lucide-react';
import { useUi } from '../state/AppContext';
import { addCustomPet } from '../services/store';
import { RARITY_COLORS, RARITY_LABELS } from '../components/art';
import { Button, Card } from '../components/ui';
import { RARITIES, type Rarity } from '../types';
import { cn } from '../lib/cn';

// Сжатие фото до dataURL (макс. 640px), чтобы IndexedDB не раздувался
function readPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, 640 / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function AddPet() {
  const navigate = useNavigate();
  const { toast } = useUi();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [rarity, setRarity] = useState<Rarity>('Обычная');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!name.trim()) {
      toast('Придумай имя питомцу!', 'error');
      return;
    }
    setBusy(true);
    try {
      const pet = await addCustomPet({
        name: name.trim(),
        rarity,
        description: description.trim() || 'Питомец, придуманный Соней.',
        imageUrl: null,
        artSeed: Math.floor(Math.random() * 1000),
        photo,
      });
      toast('Новый питомец поселился в мире!', 'success');
      navigate(`/collection/${pet.id}`);
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Не получилось сохранить', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-mist pb-6">
      <header className="flex items-center gap-3 rounded-b-[2rem] bg-gradient-to-b from-night to-[#35285E] px-4 pb-5 pt-4 text-white">
        <button onClick={() => navigate(-1)} className="rounded-full bg-white/15 p-2" aria-label="Назад">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-black">Новый мой питомец</h1>
          <p className="text-xs font-bold text-white/60">Свои питомцы живут отдельно от энциклопедии</p>
        </div>
      </header>

      <main className="space-y-3 px-4 pt-4">
        <Card className="flex flex-col items-center gap-3 p-4">
          <button
            onClick={() => fileRef.current?.click()}
            className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-dashed border-grape/40 bg-grape/5 active:scale-95 transition"
            aria-label="Загрузить фотографию"
          >
            {photo ? (
              <img src={photo} alt="Фото питомца" className="h-full w-full object-cover" />
            ) : (
              <Camera size={32} className="text-grape" />
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) setPhoto(await readPhoto(f));
            }}
          />
          <p className="text-xs font-bold text-ink/50">Фотография питомца (необязательно)</p>
        </Card>

        <Card className="space-y-3 p-4">
          <label className="block">
            <span className="text-xs font-black uppercase tracking-wide text-ink/40">Имя питомца *</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например, Пушок-звезда"
              className="mt-1 w-full rounded-2xl border-2 border-ink/10 bg-mist px-3 py-2.5 text-sm font-semibold outline-none focus:border-grape"
            />
          </label>

          <div>
            <span className="text-xs font-black uppercase tracking-wide text-ink/40">Редкость</span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {RARITIES.map((r) => {
                const rc = RARITY_COLORS[r];
                return (
                  <button
                    key={r}
                    onClick={() => setRarity(r)}
                    className={cn(
                      'rounded-full border-2 px-3 py-1.5 text-xs font-black transition active:scale-95',
                      rarity === r ? 'text-white shadow-card' : 'bg-white',
                    )}
                    style={
                      rarity === r
                        ? { background: rc.main, borderColor: rc.main }
                        : { borderColor: rc.ring, color: rc.text }
                    }
                  >
                    {RARITY_LABELS[r]}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="block">
            <span className="text-xs font-black uppercase tracking-wide text-ink/40">Описание</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Кто это? Откуда прилетел? Что любит?"
              className="mt-1 w-full resize-none rounded-2xl border-2 border-ink/10 bg-mist px-3 py-2.5 text-sm font-semibold outline-none focus:border-grape"
            />
          </label>

        </Card>

        <Button size="lg" className="w-full" onClick={submit} disabled={busy}>
          <Sparkles size={18} /> {busy ? 'Сохраняем…' : 'Поселить питомца в мире'}
        </Button>
      </main>
    </div>
  );
}
