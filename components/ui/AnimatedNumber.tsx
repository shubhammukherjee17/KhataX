'use client';

import NumberFlow from '@number-flow/react';

type AnimatedNumberProps = {
  value: number;
  format?: 'currency' | 'decimal';
  className?: string;
};

export function AnimatedNumber({ value, format = 'decimal', className }: AnimatedNumberProps) {
  return (
    <NumberFlow 
      value={value} 
      className={className}
      format={
        format === 'currency' 
          ? { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 2 } 
          : { minimumFractionDigits: 0, maximumFractionDigits: 2 }
      } 
    />
  );
}
