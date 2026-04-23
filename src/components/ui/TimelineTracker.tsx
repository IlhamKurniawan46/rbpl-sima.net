import { Check, Clock, Loader2, XCircle } from 'lucide-react';

interface TimelineStep {
  label: string;
  status: 'completed' | 'active' | 'pending' | 'failed';
  timestamp?: string;
}

interface TimelineTrackerProps {
  steps: TimelineStep[];
}

const STEP_ICONS = {
  completed: Check,
  active: Loader2,
  pending: Clock,
  failed: XCircle,
};

const STEP_COLORS = {
  completed: 'bg-green-500 text-white',
  active: 'bg-maroon-600 text-white',
  pending: 'bg-gray-200 text-gray-400',
  failed: 'bg-red-500 text-white',
};

const LINE_COLORS = {
  completed: 'bg-green-500',
  active: 'bg-maroon-600',
  pending: 'bg-gray-200',
  failed: 'bg-red-500',
};

export default function TimelineTracker({ steps }: TimelineTrackerProps) {
  return (
    <div className="space-y-0">
      {steps.map((step, idx) => {
        const Icon = STEP_ICONS[step.status];
        const isLast = idx === steps.length - 1;
        return (
          <div key={idx} className="flex gap-3">
            {/* Icon column */}
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${STEP_COLORS[step.status]}`}>
                <Icon size={16} className={step.status === 'active' ? 'animate-spin' : ''} />
              </div>
              {!isLast && (
                <div className={`w-0.5 flex-1 min-h-[24px] ${LINE_COLORS[step.status]}`} />
              )}
            </div>
            {/* Content */}
            <div className="pb-4 pt-1">
              <p className={`text-sm font-semibold ${step.status === 'pending' ? 'text-gray-400' : 'text-text-heading'}`}>
                {step.label}
              </p>
              {step.timestamp && (
                <p className="text-xs text-text-muted mt-0.5">{step.timestamp}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
