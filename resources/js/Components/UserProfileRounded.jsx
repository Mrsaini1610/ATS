import TextSVGImage from "./TextSVGImage";

export default function UserProfileRounded({ user = {}, className = "" }) {
    const getInitials = (name) => {
        if (!name) return '?';
        const names = name.split(' ');
        return names.length > 1
            ? `${names[0][0]}${names[names.length - 1][0]}`
            : names[0][0];
    };

    return (
        <div className={`flex flex-col items-center text-center p-6 rounded-lg bg-white dark:bg-gray-800  ${className}`}>
            <div className="relative mb-4">
                {user.profile_photo_url ? (
                    <img
                        className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-700 object-cover shadow-lg"
                        src={user.profile_photo_url}
                        alt={user.name || 'User Avatar'}
                        onError={(e) => {
                            e.target.style.display = 'none';
                            if (e.target.nextElementSibling) {
                                e.target.nextElementSibling.style.display = 'block';
                            }
                        }}
                    />
                ) : (
                    <TextSVGImage
                        text={getInitials(user.name)}
                        classes="!w-20 !h-20 rounded-full border-4 border-white dark:border-gray-700 shadow-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-2xl"
                    />
                )}
            </div>
            <div className="w-full">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {user.name || 'User'}
                </h3>

                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-2">
                    <span>({user.gender?.toUpperCase() || 'UNKNOWN'})</span>
                </div>

                {user.phone && (
                    <div className="flex items-center justify-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>{user.phone}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
