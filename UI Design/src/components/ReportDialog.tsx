import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from './ui/button';

interface ReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string, details: string) => void;
  contentType?: 'post' | 'reply';
}

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam or advertising' },
  { value: 'misleading', label: 'Misleading or false information' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'violation', label: 'Community guidelines violation' },
  { value: 'other', label: 'Other' },
];

export function ReportDialog({ isOpen, onClose, onSubmit, contentType = 'post' }: ReportDialogProps) {
  const [selectedReason, setSelectedReason] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    onSubmit(selectedReason, details);
    
    // Reset form
    setSelectedReason('');
    setDetails('');
    setIsSubmitting(false);
    onClose();
  };

  const handleClose = () => {
    setSelectedReason('');
    setDetails('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Report {contentType}</h2>
                <p className="text-sm text-muted-foreground">Help us keep BridgeUS safe</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="rounded-full p-2 hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Reason selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">
              Why are you reporting this {contentType}?
            </label>
            <div className="space-y-2">
              {REPORT_REASONS.map((reason) => (
                <label
                  key={reason.value}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedReason === reason.value
                      ? 'border-[var(--bridge-blue)] bg-[var(--bridge-blue-light)]'
                      : 'border-border hover:border-[var(--bridge-blue)]/30 hover:bg-muted/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="report-reason"
                    value={reason.value}
                    checked={selectedReason === reason.value}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="w-4 h-4 text-[var(--bridge-blue)] focus:ring-[var(--bridge-blue)] focus:ring-2"
                  />
                  <span className="text-sm flex-1">{reason.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Additional details */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Additional details <span className="text-muted-foreground">(optional)</span>
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Please provide any additional context that might help us review this report..."
              className="w-full min-h-[100px] rounded-xl border bg-background p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--bridge-blue)]"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {details.length}/500 characters
            </p>
          </div>

          {/* Info message */}
          <div className="rounded-xl bg-muted/50 border p-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your report will be reviewed by our moderation team. Reports are confidential and the author will not be notified of who reported their content. False reports may result in account restrictions.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 rounded-b-2xl flex gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1 rounded-xl"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedReason || isSubmitting}
            className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </div>
      </div>
    </div>
  );
}
