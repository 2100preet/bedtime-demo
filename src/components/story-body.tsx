function inline(text: string) {
  const parts = text.split(/(\*[^*]+\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <em key={index} className="text-clay">
          {part.slice(1, -1)}
        </em>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

export function StoryBody({ body }: { body: string }) {
  const paragraphs = body.split(/\n\n+/).filter(Boolean);
  return (
    <div className="space-y-4 text-[1.05rem] leading-8">
      {paragraphs.map((paragraph, index) => (
        <p key={index}>{inline(paragraph)}</p>
      ))}
    </div>
  );
}
