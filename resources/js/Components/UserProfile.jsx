import TextSVGImage from "./TextSVGImage";

export default function UserProfile({ user = {}, actionLinks = null }) {
  const getInitials = (name) => {
    if (!name) return '?';
    const names = name.split(' ');
    return names.length > 1
      ? `${names[0][0]}${names[names.length - 1][0]}`
      : names[0][0];
  };

  return (
    <div className="flex items-center gap-4 p-3 bg-white dark:bg-[rgb(8,6,38)] rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 w-full max-w-md">
      <div className="relative flex-shrink-0">
        {user.profile_photo_url ? (
          <img
            className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-700 object-cover shadow"
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
            classes="!w-12 !h-12 rounded-full border-2 border-white dark:border-gray-700 shadow bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold"
          />
        )}
      </div>

      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {user.name || 'Player'}
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
            ({user.gender?.toUpperCase() || 'UNKNOWN'})
          </span>
        </div>

        <div className="mt-1 text-sm text-gray-600 dark:text-gray-300 truncate">
          {user.phone && (
            <span className="flex items-center">
              {user.phone}
            </span>
          )}
        </div>
      </div>

      {actionLinks && (
        <div className="flex-shrink-0">
          {actionLinks}
        </div>
      )}
    </div>
  );
}
