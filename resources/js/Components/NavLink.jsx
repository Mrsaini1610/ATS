import React from 'react';
import { Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    // Separate icon (first child) from text (remaining children)
    const childrenArray = React.Children.toArray(children);
    const icon = childrenArray[0];
    const text = childrenArray.slice(1);

    return (
        <Link
            {...props}
            className={
                'group flex items-center gap-[10px] relative pb-[10px] ' +
                (active
                    ? 'text-[#5246E6] font-[600] '
                    : ' text-[16px] font-[600] text-[#727272] hover:text-[#5246E6]') +
                className
            }
        >
            {icon}
            <span className="max-w-0 overflow-hidden group-hover:max-w-[200px] transition-all duration-300 whitespace-nowrap opacity-0 group-hover:opacity-100">
                {text}
            </span>
        </Link>
    );
}
