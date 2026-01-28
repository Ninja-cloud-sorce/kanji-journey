import { motion } from 'framer-motion';

export function Logo({ size = 'default' }: { size?: 'small' | 'default' | 'large' }) {
  const sizes = {
    small: 'text-lg',
    default: 'text-xl',
    large: 'text-2xl',
  };

  return (
    <motion.div 
      className={`flex items-center gap-2 ${sizes[size]}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="font-jp font-medium text-primary">日本語</span>
      <span className="font-light text-muted-foreground">Journey</span>
    </motion.div>
  );
}
