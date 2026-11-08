import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import Button from './Button';
import { cn } from '../../lib/utils';

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className = '',
  maxWidth = 'max-w-lg',
}) {
  const modalRef = useRef(null);
  const previouslyFocusedElement = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Save previous focus
    previouslyFocusedElement.current = document.activeElement;

    // Prevent background scrolling
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus the modal
    if (modalRef.current) {
      modalRef.current.focus();
    }

    // Escape key handler
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = origOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      // Restore focus
      if (previouslyFocusedElement.current && previouslyFocusedElement.current.focus) {
        previouslyFocusedElement.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-desc' : undefined}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Content */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={cn(
          'relative w-full surface-card rounded-2xl shadow-card-dark p-6 z-10 animate-fade-in border border-border focus:outline-none',
          maxWidth,
          className
        )}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            {title && (
              <h2 id="modal-title" className="text-lg font-semibold text-primary">
                {title}
              </h2>
            )}
            {description && (
              <p id="modal-desc" className="text-sm text-muted mt-1">
                {description}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close modal"
            className="text-muted hover:text-primary shrink-0"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
}
