import * as React from 'react';
import { cn } from '../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    noPadding?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, noPadding, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200',
                    !noPadding && 'p-6',
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';

export default Card;
