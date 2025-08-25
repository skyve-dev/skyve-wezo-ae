import React, { useEffect, useState, useRef, useCallback } from 'react';

interface ScrollbarOverlayProps {
  className?: string;
  hideDelay?: number;
  minHeight?: number;
  trackColor?: string;
  thumbColor?: string;
  thumbHoverColor?: string;
}

const ScrollbarOverlay: React.FC<ScrollbarOverlayProps> = ({
  className = '',
  hideDelay = 1000,
  minHeight = 30,
  trackColor = 'rgba(0, 0, 0, 0.05)',
  thumbColor = 'rgba(0, 0, 0, 0.2)',
  thumbHoverColor = 'rgba(0, 0, 0, 0.4)',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [thumbHeight, setThumbHeight] = useState(0);
  const [thumbTop, setThumbTop] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const scrollbarRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<number>();
  const dragStartY = useRef(0);
  const dragStartScrollY = useRef(0);

  const calculateThumbDimensions = useCallback(() => {
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;
    
    if (scrollHeight <= clientHeight) {
      setThumbHeight(0);
      return;
    }

    const scrollRatio = clientHeight / scrollHeight;
    const calculatedHeight = Math.max(scrollRatio * clientHeight, minHeight);
    setThumbHeight(calculatedHeight);

    const scrollTop = window.scrollY;
    const maxScrollTop = scrollHeight - clientHeight;
    const scrollProgress = scrollTop / maxScrollTop;
    const maxThumbTop = clientHeight - calculatedHeight;
    const calculatedTop = scrollProgress * maxThumbTop;
    
    setThumbTop(calculatedTop);
  }, [minHeight]);

  const showScrollbar = useCallback(() => {
    setIsVisible(true);
    
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    
    if (!isHovering && !isDragging) {
      hideTimeoutRef.current = window.setTimeout(() => {
        setIsVisible(false);
      }, hideDelay);
    }
  }, [hideDelay, isHovering, isDragging]);

  const handleScroll = useCallback(() => {
    calculateThumbDimensions();
    showScrollbar();
  }, [calculateThumbDimensions, showScrollbar]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartY.current = e.clientY;
    dragStartScrollY.current = window.scrollY;
    document.body.style.userSelect = 'none';
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const deltaY = e.clientY - dragStartY.current;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;
    const maxScrollTop = scrollHeight - clientHeight;
    const scrollDelta = (deltaY / clientHeight) * scrollHeight;
    
    const newScrollY = Math.max(0, Math.min(maxScrollTop, dragStartScrollY.current + scrollDelta));
    window.scrollTo({top:newScrollY,behavior:'instant'})
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    document.body.style.userSelect = '';
    
    if (!isHovering) {
      hideTimeoutRef.current = window.setTimeout(() => {
        setIsVisible(false);
      }, hideDelay);
    }
  }, [hideDelay, isHovering]);

  const handleTrackClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === thumbRef.current || thumbRef.current?.contains(e.target as Node)) {
      return;
    }

    const rect = scrollbarRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clickY = e.clientY - rect.top;
    const clientHeight = window.innerHeight;
    const scrollHeight = document.documentElement.scrollHeight;
    const targetScrollY = (clickY / clientHeight) * scrollHeight;
    
    window.scrollTo({
      top: targetScrollY,
      behavior: 'smooth'
    });
  }, []);

  useEffect(() => {
    calculateThumbDimensions();
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', calculateThumbDimensions);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', calculateThumbDimensions);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [handleScroll, calculateThumbDimensions]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  if (thumbHeight === 0) {
    return null;
  }

  return (
    <div
      ref={scrollbarRef}
      className={`scrollbar-overlay ${className}`}
      onMouseEnter={() => {
        setIsHovering(true);
        setIsVisible(true);
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }
      }}
      onMouseLeave={() => {
        setIsHovering(false);
        if (!isDragging) {
          hideTimeoutRef.current = window.setTimeout(() => {
            setIsVisible(false);
          }, hideDelay);
        }
      }}
      onClick={handleTrackClick}
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '12px',
        height: '100vh',
        backgroundColor: trackColor,
        zIndex: 9999,
        opacity: isVisible || isDragging ? 1 : 0,
        transition: 'opacity 0.3s ease',
        cursor: 'pointer',
        display: 'none',
      }}
    >
      <div
        ref={thumbRef}
        className="scrollbar-thumb"
        onMouseDown={handleMouseDown}
        style={{
          position: 'absolute',
          top: `${thumbTop}px`,
          right: '2px',
          width: '8px',
          height: `${thumbHeight}px`,
          backgroundColor: isHovering || isDragging ? thumbHoverColor : thumbColor,
          borderRadius: '4px',
          transition: 'background-color 0.2s ease',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      />
      
      <style>{`
        @media (min-width: 768px) {
          .scrollbar-overlay {
            display: block !important;
          }
        }
        
        /* Hide native scrollbar */
        @media (min-width: 768px) {
          html {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          
          html::-webkit-scrollbar {
            display: none;
            width: 0;
            height: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default ScrollbarOverlay;