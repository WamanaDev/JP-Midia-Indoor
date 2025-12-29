type NewsItem = {
  title: string;
  description: string;
  link: string;
  image?: string;
  source: string;
};

interface MetropoleProps {
  item: NewsItem;
}

export function G1({ item }: MetropoleProps) {
  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl text-white animate-fade">
      {/* Imagem de fundo */}
      {item.image && (
        <img
          src={item.image}
          srcSet={`
    ${item.image} 640w,
    ${item.image} 1024w,
    ${item.image} 1600w
  `}
          sizes="(max-width: 768px) 100vw, 1600px"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Overlay escuro com gradiente */}
      <div className="tracking-tight absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />

      {/* Conteúdo */}
      <div className="relative z-20 flex flex-col justify-end h-full p-8 max-w-full pb-15">
        {/* Badge / logo (opcional) */}
        <div className="mb-4">
          <span className="inline-block rounded bg-red-600/70 px-3 py-1 text-lg font-semibold uppercase tracking-wide">
            {item.source}
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
          {item.title}
        </h1>

        <p className="text-lg md:text-xl text-white/80 line-clamp-3">
          {item.description}
        </p>
      </div>
    </div>
  );
}
