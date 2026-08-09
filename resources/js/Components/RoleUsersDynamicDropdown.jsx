import { usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useHelpers } from './Helpers';

export default function RoleUsersDynamicDropdown() {
    const { toSlug } = useHelpers();
    const user = usePage().props.auth.user;
    const [roles, setRoles] = useState([]);


    const getDesignationsUsersType = () => {
        axios
            .get(route("common.get.designation.users.type", { branch_id: user?.branch_id }))
            .then((resp) => {
                setRoles(resp?.data || []);
            })
            .catch((err) => {
                console.error('Failed to fetch roles:', err);
            });
    };

    useEffect(() => {
        if (user?.branch_id) {
            getDesignationsUsersType();
        }
    }, [user?.branch_id]);

    return (
        <div className="relative group inline-block text-left">
            <button
                type="button"
                className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none dark:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
            >
                Users
                <svg
                    className="-me-0.5 ms-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>

            <div className="absolute z-50 hidden w-40 rounded-md shadow-lg group-hover:block bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                    {roles.length > 0 ? (
                        roles.map((role) => (
                            <a
                                key={role.id}
                                href={route('user.by.role', { role: toSlug(role.name) })}
                                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                {role.name.split('-')[0]}
                            </a>
                        ))
                    ) : (
                        <div className="px-4 py-2 text-sm text-gray-400">No roles found</div>
                    )}
                </div>
            </div>
        </div>
    );
}
