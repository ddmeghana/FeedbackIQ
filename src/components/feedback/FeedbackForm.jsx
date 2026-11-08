import { useState, useRef } from 'react';
import { Send, UserCheck, ShieldCheck } from 'lucide-react';
import RatingSelector from './RatingSelector';
import CharacterCounter from './CharacterCounter';
import SubmissionSuccess from './SubmissionSuccess';
import SubmissionError from './SubmissionError';
import Button from '../ui/Button';
import Select from '../ui/Select';
import Input from '../ui/Input';
import { validateFeedback } from '../../utils/feedbackValidation';
import { submitFeedback } from '../../services/feedbackService';
import { FORM_LIMITS } from '../../config/constants';

export default function FeedbackForm({ products = [] }) {
  // Controlled form state
  const [productId, setProductId] = useState('');
  const [respondentName, setRespondentName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [rating, setRating] = useState(null);
  const [comment, setComment] = useState('');

  // UI state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [serverError, setServerError] = useState(null);

  // Field refs for accessible focus on validation error
  const productRef = useRef(null);
  const commentRef = useRef(null);

  // Handle Anonymous Toggle
  const handleAnonymousToggle = (e) => {
    const checked = e.target.checked;
    setIsAnonymous(checked);
    if (checked) {
      setRespondentName('');
      if (errors.name) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.name;
          return next;
        });
      }
    }
  };

  // Form Reset
  const handleReset = () => {
    setProductId('');
    setRespondentName('');
    setIsAnonymous(false);
    setRating(null);
    setComment('');
    setErrors({});
    setIsSubmitting(false);
    setSubmissionResult(null);
    setServerError(null);
  };

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    // 1. Client-Side Validation
    const validation = validateFeedback(
      {
        productId,
        respondentName,
        isAnonymous,
        rating,
        comment,
      },
      products
    );

    if (!validation.isValid) {
      setErrors(validation.errors);

      // Focus first invalid field
      if (validation.errors.productId && productRef.current) {
        productRef.current.focus();
      } else if (validation.errors.comment && commentRef.current) {
        commentRef.current.focus();
      }
      return;
    }

    // Clear validation errors
    setErrors({});
    setIsSubmitting(true);

    try {
      const selectedProduct = products.find((p) => p.Product_ID === productId);
      const productName = selectedProduct ? selectedProduct.Product_Name : 'Product';

      // 2. Call Submission Service (Abstracted for Phase 6)
      const result = await submitFeedback({
        productId,
        productName,
        respondentName,
        isAnonymous,
        rating,
        comment,
      });

      if (result.success) {
        setSubmissionResult(result.record);
      } else {
        setServerError(result.error || 'Failed to submit feedback.');
      }
    } catch (err) {
      setServerError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If successfully submitted, display confirmation view
  if (submissionResult) {
    return <SubmissionSuccess record={submissionResult} onReset={handleReset} />;
  }

  // Unavailable products fallback
  if (!products || products.length === 0) {
    return (
      <div className="surface-card rounded-2xl p-8 border border-border text-center space-y-3">
        <p className="text-sm font-semibold text-primary">No products currently available</p>
        <p className="text-xs text-muted">
          Feedback submissions are currently closed because no active products were found in the registry.
        </p>
      </div>
    );
  }

  const productOptions = products.map((p) => ({
    value: p.Product_ID,
    label: p.Product_Name,
  }));

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="surface-card rounded-2xl p-6 sm:p-8 border border-border shadow-card-dark space-y-6"
    >
      {/* Submission Error Banner */}
      <SubmissionError
        message={serverError}
        onDismiss={() => setServerError(null)}
      />

      {/* 1. Dynamic Product Selection */}
      <Select
        ref={productRef}
        id="product-selection"
        label="Which product would you like to review?"
        required
        placeholder="Select a product..."
        options={productOptions}
        value={productId}
        onChange={(e) => {
          setProductId(e.target.value);
          if (errors.productId) {
            setErrors((prev) => ({ ...prev, productId: undefined }));
          }
        }}
        error={errors.productId}
        helperText="Choose the specific product or service this feedback applies to."
      />

      {/* 2. Interactive Rating Control */}
      <RatingSelector
        id="experience-rating"
        value={rating}
        required
        onChange={(selectedRating) => {
          setRating(selectedRating);
          if (errors.rating) {
            setErrors((prev) => ({ ...prev, rating: undefined }));
          }
        }}
        error={errors.rating}
      />

      {/* 3. Written Feedback Textarea */}
      <div className="space-y-1.5">
        <label
          htmlFor="feedback-comment"
          className="block text-xs font-medium text-muted uppercase tracking-wider"
        >
          Tell us about your experience <span className="text-red-500">*</span>
        </label>
        <textarea
          ref={commentRef}
          id="feedback-comment"
          rows={4}
          maxLength={FORM_LIMITS.COMMENT_MAX_LENGTH}
          required
          aria-invalid={Boolean(errors.comment)}
          aria-describedby={errors.comment ? 'feedback-comment-error' : 'feedback-comment-counter'}
          value={comment}
          onChange={(e) => {
            setComment(e.target.value);
            if (errors.comment) {
              setErrors((prev) => ({ ...prev, comment: undefined }));
            }
          }}
          placeholder="Share what you liked, what could be improved, or any issues you experienced..."
          className={`w-full px-3.5 py-2.5 rounded-xl text-sm bg-card text-primary border transition-all duration-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-accent ${
            errors.comment ? 'border-red-500 focus-visible:ring-red-500' : 'border-border'
          }`}
        />

        <div id="feedback-comment-counter">
          <CharacterCounter count={comment.length} />
        </div>

        {errors.comment && (
          <p id="feedback-comment-error" className="text-xs text-red-500 font-medium">
            {errors.comment}
          </p>
        )}
      </div>

      {/* 4. Anonymous Submission Toggle & Optional Name */}
      <div className="p-4 rounded-xl bg-canvas/60 border border-border/80 space-y-4">
        <div className="flex items-start gap-3">
          <input
            id="anonymous-toggle"
            type="checkbox"
            checked={isAnonymous}
            onChange={handleAnonymousToggle}
            className="mt-1 w-4 h-4 rounded border-border text-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 cursor-pointer"
          />
          <div className="space-y-0.5">
            <label
              htmlFor="anonymous-toggle"
              className="text-xs font-semibold text-primary cursor-pointer flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-accent" />
              Submit feedback anonymously
            </label>
            <p className="text-[11px] text-muted">
              When checked, your name will be completely omitted from the stored feedback record.
            </p>
          </div>
        </div>

        {/* Optional Name Field (Hidden/Disabled when Anonymous is checked) */}
        {!isAnonymous ? (
          <div className="pt-2 border-t border-border/60 animate-fade-in">
            <Input
              id="respondent-name"
              label="Your name (optional)"
              placeholder="Enter your name (optional)"
              value={respondentName}
              maxLength={FORM_LIMITS.NAME_MAX_LENGTH}
              onChange={(e) => {
                setRespondentName(e.target.value);
                if (errors.name) {
                  setErrors((prev) => ({ ...prev, name: undefined }));
                }
              }}
              error={errors.name}
              helperText="Only provide your name if you are comfortable sharing it with our team."
            />
          </div>
        ) : (
          <div className="pt-1 text-[11px] font-mono text-emerald-500 flex items-center gap-1.5">
            <UserCheck className="w-3 h-3" />
            <span>Anonymous mode active: Name field cleared and disabled.</span>
          </div>
        )}
      </div>

      {/* 5. Submit Button */}
      <div className="pt-2 space-y-3">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          disabled={isSubmitting}
          className="w-full font-bold text-sm tracking-wide"
          rightIcon={<Send className="w-4 h-4" />}
        >
          {isSubmitting ? 'Submitting Feedback...' : 'Submit Feedback'}
        </Button>

        <p className="text-center text-[11px] text-muted font-mono">
          Phase 5 Demo · Responses will connect to Google Sheets in Phase 6
        </p>
      </div>
    </form>
  );
}
