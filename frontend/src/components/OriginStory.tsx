import React from 'react';
import OriginStoryTimeline from './OriginStoryTimeline';

interface OriginStoryProps {
  journey: any[]; // raw journey data
}

export default function OriginStory({ journey }: OriginStoryProps) {
  return (
    <section className="glass-card" style={{ marginBottom: 'var(--space-xl)' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: 'var(--space-md)' }}>
        Origin Story
      </h3>
      <OriginStoryTimeline journey={journey} />
    </section>
  );
}
