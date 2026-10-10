import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidViewerProps {
  chart: string;
}

export const MermaidViewer: React.FC<MermaidViewerProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'neutral',
      themeVariables: {
        primaryColor: '#E0F2FE',
        primaryTextColor: '#0369A1',
        primaryBorderColor: '#38BDF8',
        lineColor: '#0284C7',
        secondaryColor: '#F0F9FF',
        tertiaryColor: '#FFFFFF',
      },
      securityLevel: 'loose',
    });

    let isMounted = true;
    const renderDiagram = async () => {
      try {
        const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
        // Clean chart input
        const cleanChart = chart.trim();
        const { svg } = await mermaid.render(id, cleanChart);
        if (isMounted) {
          setSvgContent(svg);
          setRenderError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn('Mermaid rendering issue:', err);
          setRenderError('Could not render graphic diagram. Showing text representation.');
        }
      }
    };

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [chart]);

  if (renderError) {
    return (
      <div className="my-4 p-4 rounded-xl bg-sky-50 border border-sky-100 font-mono text-xs text-sky-900 overflow-x-auto">
        <div className="font-semibold text-sky-700 mb-2">Diagram Outline:</div>
        <pre className="whitespace-pre-wrap">{chart}</pre>
      </div>
    );
  }

  return (
    <div className="my-6 p-4 rounded-2xl bg-white border border-crypton-100 shadow-sm flex flex-col items-center overflow-x-auto">
      <div className="text-xs font-semibold text-crypton-600 mb-3 uppercase tracking-wider self-start flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-crypton-400 animate-pulse"></span>
        Architecture & Flow Visualizer
      </div>
      <div
        ref={containerRef}
        className="w-full flex justify-center [&>svg]:max-w-full [&>svg]:h-auto"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    </div>
  );
};
