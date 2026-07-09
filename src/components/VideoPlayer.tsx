function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/
  );
  return match ? match[1] : null;
}

export default function VideoPlayer({ url }: { url: string }) {
  const isYouTube = /youtube\.com|youtu\.be/.test(url);
  const isVimeo = /vimeo\.com/.test(url);

  if (isYouTube) {
    const id = extractYouTubeId(url);
    if (id) {
      return (
        <iframe
          className="w-full aspect-video border border-black/10"
          src={`https://www.youtube.com/embed/${id}`}
          title="Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }
  }

  if (isVimeo) {
    const id = url.split("/").filter(Boolean).pop();
    return (
      <iframe
        className="w-full aspect-video border border-black/10"
        src={`https://player.vimeo.com/video/${id}`}
        title="Video"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return <video controls className="w-full border border-black/10" src={url} />;
}
