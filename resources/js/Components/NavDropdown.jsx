import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/Components/ui/dropdown-menu";
import { Link } from "@inertiajs/react";
import { useState } from "react";

export default function NavDropdown({ label = "More", items = [] }) {
    const [openMenu, setOpenMenu] = useState(false);

    const handleMouseEnter = () => setOpenMenu(true);
    const handleMouseLeave = () => setOpenMenu(false);

    return (
        <div
            className="relative inline-block"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <DropdownMenu open={openMenu} onOpenChange={() => { }}>
                <DropdownMenuTrigger asChild>
                    <button
                        className={
                            'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ' +
                            (openMenu
                                ? 'border-indigo-400 text-gray-900 focus:border-indigo-700 dark:border-indigo-600 dark:text-gray-100'
                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 focus:border-gray-300 focus:text-gray-700 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:text-gray-300 dark:focus:border-gray-700 dark:focus:text-gray-300')
                        }
                    >
                        {label}
                    </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-48 absolute left-0 top-full mt-2 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md">
                    <DropdownMenuSeparator />
                    {items.map((item, index) => (
                        <DropdownMenuItem key={index}>
                            {item.route ? (
                                <Link
                                    href={route(item.route)}
                                    className="w-full block text-sm text-gray-700 dark:text-gray-200 px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <span className="w-full block text-sm text-gray-400 dark:text-gray-500 px-2 py-1 cursor-not-allowed">
                                    {item.label}
                                </span>
                            )}
                        </DropdownMenuItem>
                    ))}

                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
