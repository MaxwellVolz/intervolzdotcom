const HN_API = 'https://hacker-news.firebaseio.com/v0';

async function fetchTopStories(limit = 10) {
  console.log('fetching HN stories...');
  const ids = await fetch(`${HN_API}/topstories.json`).then(r => r.json());
  const topIds = ids.slice(0, limit);
  return Promise.all(
    topIds.map(id =>
      fetch(`${HN_API}/item/${id}.json`).then(r => r.json())
    )
  );
}

export async function HNtoCanvas(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!;
  
  // Flip canvas to match MonitorDisplay orientation
  // ctx.save();
  // ctx.translate(0, canvas.height);
  // ctx.scale(1, -1);

  // Clear area
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#FF6600';
  ctx.fillRect(10, 5, 480, 40);

  ctx.font = '32px monospace';
  ctx.fillStyle = 'black';
  ctx.fillText(`[LIVE] Hacker News`, 20, 33);

  const stories = await fetchTopStories(10);

  stories.forEach((story, i) => {
    const y = 70 + i * 44;

    ctx.font = '14px monospace';
    ctx.fillStyle = 'black';
    ctx.fillText(`${i + 1}. ${story.title}`, 20, y);

    console.log(`${i + 1}. ${story.title}`)

    ctx.font = '12px monospace';
    ctx.fillStyle = 'gray';
    ctx.fillText(`▲ ${story.score} points`, 20, y + 18);
  });

  // ctx.restore(); // restore transform
}
