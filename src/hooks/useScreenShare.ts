import { useState, useRef, useCallback } from "react";

export function useScreenShare() {
  const [isSharing, setIsSharing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const startSharing = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" } as MediaTrackConstraints,
        audio: false,
      });

      setStream(mediaStream);
      setIsSharing(true);

      // Handle user stopping share via browser UI
      mediaStream.getVideoTracks()[0].addEventListener("ended", () => {
        setIsSharing(false);
        setStream(null);
      });

      return mediaStream;
    } catch (err) {
      console.error("Screen share error:", err);
      setIsSharing(false);
      return null;
    }
  }, []);

  const stopSharing = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsSharing(false);
  }, [stream]);

  return { isSharing, stream, videoRef, startSharing, stopSharing };
}
