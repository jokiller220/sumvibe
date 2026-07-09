import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBar } from '../components/StatusBar';

const slides = [
  {
    image: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg',
    title: 'Découvrez les meilleurs événements',
    subtitle: 'Concerts, soirées, festivals et bien plus encore près de chez vous.',
    gradient: 'from-violet-900/80 to-[#06060F]',
  },
  {
    image: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg',
    title: 'Réservez en toute simplicité',
    subtitle: 'Achetez vos billets en quelques clics et recevez-les instantanément.',
    gradient: 'from-pink-900/80 to-[#06060F]',
  },
  {
    image: 'https://images.pexels.com/photos/2747446/pexels-photo-2747446.jpeg',
    title: 'Vivez des moments uniques',
    subtitle: 'Plongez à fond et créez des souvenirs inoubliables.',
    gradient: 'from-indigo-900/80 to-[#06060F]',
  },
];

export function OnboardingScreen() {
  const { navigate } = useApp();
  const [step, setStep] = useState(0);
  const slide = slides[step];

  const next = () => {
    if (step < slides.length - 1) setStep(s => s + 1);
    else navigate('home');
  };

  return (
    <div className="absolute inset-0 bg-[#06060F] flex flex-col overflow-hidden">
      <StatusBar />

      {/* Image */}
      <div className="relative flex-1 min-h-0">
        <img
          src={slide.image}
          alt={slide.title}
          className="absolute inset-0 w-full h-full object-cover transition-all duration-500"
        />
        <div className={`absolute inset-0 bg-gradient-to-b ${slide.gradient}`} />
      </div>

      {/* Content */}
      <div className="flex-shrink-0 px-6 pb-10 pt-6 flex flex-col items-center gap-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white leading-tight mb-2">{slide.title}</h2>
          <p className="text-gray-400 text-sm leading-relaxed">{slide.subtitle}</p>
        </div>

        {/* Dots */}
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? 'w-6 bg-violet-500' : 'w-1.5 bg-gray-600'
              }`}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="w-full py-4 bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white font-semibold rounded-2xl transition-colors"
        >
          Suivant
        </button>

        {step < slides.length - 1 && (
          <button
            onClick={() => navigate('home')}
            className="text-gray-500 text-sm"
          >
            Passer
          </button>
        )}
      </div>
    </div>
  );
}
