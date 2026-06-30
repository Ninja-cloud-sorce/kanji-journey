import { motion } from 'framer-motion';
import { ExternalLink, FileText, CheckCircle2 } from 'lucide-react';

const STEPS = [
  'Create or log in to your local JLPT registration account.',
  'Select test date, level, and your preferred test center.',
  'Fill personal details exactly as shown on your identification.',
  'Upload required photo and verify all fields before payment.',
  'Complete payment and keep your confirmation number safely stored.',
];

export function RegistrationGuide() {
  return (
    <div className="min-h-screen pt-24 pb-24 px-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg md:max-w-2xl xl:max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-light text-foreground mb-2">JLPT Exam Registration Guide</h1>
          <p className="text-muted-foreground">
            Short walkthrough to help you complete the official registration form correctly.
          </p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Before You Start</p>
              <p className="text-sm text-muted-foreground mt-1">
                Keep your passport/ID, a valid photo, and payment method ready. Form fields are strict and
                mismatches can cause exam-admit issues.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {STEPS.map((step, idx) => (
            <div key={idx} className="glass-card-subtle p-4 rounded-xl flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
              <p className="text-sm text-foreground">{idx + 1}. {step}</p>
            </div>
          ))}
        </div>

        <div className="glass-card p-5 space-y-3">
          <p className="text-sm text-muted-foreground">
            Visual guide placeholders are ready. You can replace these with screenshots from your local
            registration portal flow.
          </p>
          <div className="grid grid-cols-3 gap-2">
            <div className="h-16 rounded-lg bg-secondary" />
            <div className="h-16 rounded-lg bg-secondary" />
            <div className="h-16 rounded-lg bg-secondary" />
          </div>
        </div>

        <a
          href="https://www.jlpt.jp/e/"
          target="_blank"
          rel="noreferrer"
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2"
        >
          <span>Apply for JLPT Exam</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </motion.div>
    </div>
  );
}
