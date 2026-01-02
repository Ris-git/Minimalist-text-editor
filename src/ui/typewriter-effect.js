"use client";

export function TypewriterEffectSmooth({ words }) {
  return (
    <div className="typewriter-container">
      {words.map((word, index) => (
        <span key={index} className={`typewriter-word ${word.className || ''}`}>
          {word.text}
        </span>
      ))}
    </div>
  );
}
