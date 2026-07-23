interface Props {
  text: string;
}

export default function SayingBanner({ text }: Props) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 animate-banner-slide">
      <div className="px-5 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 shadow-xl text-white font-semibold text-sm sm:text-base whitespace-nowrap">
        {text}
      </div>
    </div>
  );
}
