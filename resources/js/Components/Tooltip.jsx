export default function Tooltip({targetEl, title, classes = ''}) {
    return (
        <div id={targetEl} role="tooltip" className={'absolute z-30 invisible inline-block px-3 py-2 text-sm font-medium text-gray-800 dark:text-gray-200 transition-opacity duration-300 bg-gray-300 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-600 '+classes}>
            {title}
            <div className="tooltip-arrow" data-popper-arrow></div>
        </div>
    )
}
