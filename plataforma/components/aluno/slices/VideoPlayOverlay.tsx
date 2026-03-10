"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const VIDEO_ID = "EhjUnJyytZw";
const CONTAINER_W = 950;
const CONTAINER_H = 534;
/* Centro do container na página 1440x900 */
const CONTAINER_CENTER_X = 717.9849;
const CONTAINER_CENTER_Y = 467.8424;

declare global {
  interface Window {
    YT?: {
      Player: new (
        el: HTMLElement,
        opts: {
          videoId: string;
          width?: string | number;
          height?: string | number;
          playerVars?: { autoplay?: number };
          events?: { onStateChange?: (e: { data: number }) => void };
        }
      ) => { destroy: () => void };
      PlayerState?: { ENDED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

/** Overlay central: botão Play Lottie; ao clicar, vídeo em container 950x534 com anchor no centro; centro em (717.98, 467.84) na página 1440x900; fecha ao terminar. */
export function VideoPlayOverlay() {
  const [playing, setPlaying] = useState(false);
  const [apiReady, setApiReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<{ destroy: () => void } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || window.YT) {
      setApiReady(!!window.YT);
      return;
    }
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const first = document.getElementsByTagName("script")[0];
    first?.parentNode?.insertBefore(tag, first);
    window.onYouTubeIframeAPIReady = () => {
      setApiReady(true);
    };
    return () => {
      window.onYouTubeIframeAPIReady = undefined;
    };
  }, []);

  useEffect(() => {
    if (!playing || !apiReady || !containerRef.current || !window.YT) return;

    const player = new window.YT.Player(containerRef.current, {
      videoId: VIDEO_ID,
      width: String(CONTAINER_W),
      height: String(CONTAINER_H),
      playerVars: { autoplay: 1 },
      events: {
        onStateChange(e: { data: number }) {
          if (e.data === window.YT!.PlayerState!.ENDED) {
            setPlaying(false);
          }
        },
      },
    });
    playerRef.current = player as { destroy: () => void };

    return () => {
      try {
        (player as { destroy?: () => void }).destroy?.();
      } catch {
        // ignore
      }
      playerRef.current = null;
    };
  }, [playing, apiReady]);

  const handlePlay = useCallback(() => setPlaying(true), []);

  if (playing) {
    return (
      <div className="absolute inset-0 z-20 bg-black/40">
        <div
          ref={containerRef}
          className="absolute overflow-hidden rounded-lg bg-black"
          style={{
            left: CONTAINER_CENTER_X - 220, /* 220 = largura coluna esquerda em 1440 */
            top: CONTAINER_CENTER_Y,
            width: CONTAINER_W,
            height: CONTAINER_H,
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handlePlay}
      className="absolute inset-0 z-20 flex items-center justify-center outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent"
      aria-label="Reproduzir vídeo"
    >
      <span className="pointer-events-none flex h-32 w-32 shrink-0 items-center justify-center md:h-40 md:w-40">
        <DotLottieReact
          src="/lottie/play-button.lottie"
          loop
          autoplay
          className="h-full w-full"
        />
      </span>
    </button>
  );
}
