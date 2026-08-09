import { FaUsers, FaRegAddressCard } from "react-icons/fa";
import { useHelpers } from "../Helpers";

const roleIcons = {
    "branch owner": <FaUsers className="text-blue-600 dark:text-blue-400" />,
    "user-rhcba": (
        <FaRegAddressCard className="text-green-600 dark:text-green-400" />
    ),
    // Add other role icon mappings if needed
};

export default function StateCards({ getUsersData }) {
    const {
        capitalizeWords,
        replaceUnderscoreWithSpace,
        replaceDashcoreWithSpace,
        hasPermission,
    } = useHelpers();

    return (
        <>
            {getUsersData.map((item, idx) => (
                <div
                    key={idx}
                    className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 flex items-center justify-between"
                >
                    <div>
                        <h3 className="text-sm text-gray-600 dark:text-gray-300">
                            {capitalizeWords(
                                replaceDashcoreWithSpace(item?.role)
                            )}
                        </h3>
                        <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                            {item?.count}
                        </p>
                    </div>
                    <div className="text-3xl">
                        {roleIcons[item.role.toLowerCase()] || (
                            <FaUsers className="text-gray-400" />
                        )}
                    </div>
                </div>
            ))}
        </>
    );
}
