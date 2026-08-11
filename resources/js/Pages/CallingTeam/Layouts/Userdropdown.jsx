import NavLink from "@/Components/NavLink";

export default function UserDropdown({ open }) {
    if (!open) return null;

    return (
        <div className="absolute right-0 z-50 mt-2 w-52 rounded border border-slate-200 bg-white shadow dark:border-slate-700 dark:bg-[#080626]">
            <ul className="py-1">
                <li>
                    <NavLink
                        href={route("callingteam.profile")}
                        className="cursor-pointer px-4 py-2 text-slate-700 hover:bg-gray-100 dark:text-white dark:hover:bg-slate-800"
                    >
                        Profile
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        href={route("callingteam.logout")}
                        method="post"
                        as="button"
                        className="cursor-pointer px-4 py-2 text-slate-700 hover:bg-gray-100 dark:text-white dark:hover:bg-slate-800"
                    >
                        Logout
                    </NavLink>
                </li>
            </ul>
        </div>
    );
}
