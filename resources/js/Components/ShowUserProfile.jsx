import TextSVGImage from "./TextSVGImage";

export default function ShowUserProfile({ user = {}, actionLinks = null }) {
  return (
    <div className="flex items-center gap-1">
      {user.profile_photo_url ? (
        <img
          className="w-8 h-8 min-w-8 min-h-8 rounded-full border-2 border-gray-200 dark:border-gray-600 object-cover"
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
          text={user.name || '?'}
          classes="!w-8 !h-8 rounded-full border-2 border-gray-200 dark:border-gray-600"
        />
      )}
    </div>
  );
}
