import { toPng } from 'html-to-image';

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function downloadBracketImage({ container, content, scaleWrapper, width, champion }) {
  if (!container || !content || !scaleWrapper) {
    throw new Error('Bracket not ready for export');
  }

  const saved = {
    containerOverflow: container.style.overflow,
    wrapperWidth: scaleWrapper.style.width,
    wrapperHeight: scaleWrapper.style.height,
    wrapperOverflow: scaleWrapper.style.overflow,
    contentTransform: content.style.transform,
    contentOrigin: content.style.transformOrigin,
    contentHeight: content.style.height,
    contentMinHeight: content.style.minHeight,
  };

  container.style.overflow = 'visible';
  scaleWrapper.style.overflow = 'visible';
  scaleWrapper.style.width = `${width}px`;
  scaleWrapper.style.height = 'auto';
  content.style.transform = 'none';
  content.style.transformOrigin = 'top left';
  content.style.height = 'auto';
  content.style.minHeight = '0';

  await new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });

  const exportWidth = content.scrollWidth;
  const exportHeight = content.scrollHeight;

  try {
    const dataUrl = await toPng(content, {
      width: exportWidth,
      height: exportHeight,
      pixelRatio: 2,
      backgroundColor: '#0c1120',
      cacheBust: true,
    });

    const filename = champion
      ? `world-cup-2026-${slugify(champion.name)}.png`
      : 'world-cup-2026-bracket.png';

    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  } finally {
    container.style.overflow = saved.containerOverflow;
    scaleWrapper.style.width = saved.wrapperWidth;
    scaleWrapper.style.height = saved.wrapperHeight;
    scaleWrapper.style.overflow = saved.wrapperOverflow;
    content.style.transform = saved.contentTransform;
    content.style.transformOrigin = saved.contentOrigin;
    content.style.height = saved.contentHeight;
    content.style.minHeight = saved.contentMinHeight;
  }
}
