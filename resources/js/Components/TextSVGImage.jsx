export default function TextSVGImage({ text, bg = 'currentColor', textColor = 'currentColor', classes = '' }) {
    const getNameInitials = (str) => {
        if (!str || typeof str !== 'string') {
            return 'NaN';
        }
        const words = str.split(' ');
        const initials = words
            .filter((word) => word.length > 0)
            .map((word) => word.charAt(0).toUpperCase())
            .join('');
        return initials;
    };

    return (
        <svg viewBox="0 0 100 100" className={`size-32 text-tk ${classes}`}>
            <rect width="100" height="100" fill={bg} className="dark:fill-[#131836] fill-gray-100" />
            <text
                x="50"
                y="50"
                dominantBaseline="middle"
                textAnchor="middle"
                fill={textColor}
                fontSize="40"
                className="dark:fill-white fill-gray-800"
            >
                {getNameInitials(text).slice(0, 2)}
            </text>
        </svg>
    );
}
