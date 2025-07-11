import { useState, useEffect } from 'react';

export const useImagePreloader = (imageUrl: string) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const img = new Image();
    
    img.onload = () => {
      setIsLoaded(true);
      setIsLoading(false);
    };
    
    img.onerror = () => {
      setError('Failed to load image');
      setIsLoading(false);
    };
    
    img.src = imageUrl;
    
    // Cleanup function
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageUrl]);

  return { isLoaded, isLoading, error };
};