const UserAvatarCard = ({ user }) => {
    if (!user) return null;

    return (
        <div className="flex items-center gap-3">
            <img
                src={user?.profile_photo_url}
                alt={user?.name}
                className="inline-block h-9 w-9 rounded-full object-cover"
            />
            <div className="flex flex-col space-y-1">
                <p className="text-sm text-gray-900 dark:text-white">
                    {user?.name}

                </p>
                <div className="flex items-center space-x-3">
                    <p className="text-sm text-gray-700 dark:text-gray-400">{user?.email}</p>
                <p className="text-sm text-gray-700 dark:text-gray-400">{user?.phone}</p>
                </div>
            </div>
        </div>
    );
};

export default UserAvatarCard;
