import { MdEmail, MdVerified, MdOutlinePhone, MdWhatsapp, MdOutlineSecurity, MdDeleteForever } from 'react-icons/md';
import { FaUserAlt } from 'react-icons/fa';
import { BsShieldFillCheck, BsShieldSlash } from 'react-icons/bs';
import { AiOutlineUser } from 'react-icons/ai';
import { formatDistanceToNow } from 'date-fns';
import { GoUnverified } from "react-icons/go";

export default function UserProfileCard() {
    const user = {
        name: 'Udit Singh',
        email: 'udit@example.com',
        emailVerified: true,
        phone: '+91 9876543210',
        whatsapp: '+91 9876543210',
        role: 'Admin',
        photo: 'https://randomuser.me/api/portraits/men/32.jpg',
        kycStatus: 'Verified',
        createdAt: new Date('2023-01-15T09:30:00'),
        updatedAt: new Date('2024-06-01T12:45:00'),
        deletedAt: null, // or use a date to simulate soft delete
    };

    return (
        <div className=" w-full  bg-white dark:bg-gray-800 rounded-xl flex-col flex items-start gap-6 transition-all duration-300">
            <div className='flex flex-col w-full'>
                <h2 className="text-lg text-start font-medium text-gray-900 dark:text-gray-100">
                    Profile Information
                </h2>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    All information about your profile are as below.
                </p>
            </div>



            <div className='w-full flex-wrap flex items-center justify-between flex-col md:flex-row '>

                <img
                    src={user.photo}
                    alt="User Profile"
                    className="w-80 h-80 object-cover shadow-lg"
                />

                <div className=" flex-1  space-y-3 text-gray-800 dark:text-gray-100 w-full md:px-10 py-5 gap-2">
                    <div className="flex items-center justify-between dark:bg-gray-600 bg-gray-200 py-2 px-4 rounded-sm ">
                        <h2 className="md:text-2xl text-lg font-bold flex items-center gap-2"><FaUserAlt /> {user.name}</h2>
                        <span className="px-3 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                            {user.role}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-2xl dark:bg-gray-600 bg-gray-200 py-2 px-4 rounded-sm">
                        <MdEmail className="md:text-2xl text-lg" />
                        {user.email}
                        {user.emailVerified ? (
                            <MdVerified className="text-green-600" title="Verified Email" />
                        ) : (
                            <MdVerified className="text-gray-400" title="Unverified Email" />
                        )}
                    </div>

                    <div className="flex items-center gap-2 md:text-2xl text-lg dark:bg-gray-600 bg-gray-200 py-2 px-4 rounded-sm">
                        <MdOutlinePhone className="text-lg" />
                        {user.phone} <GoUnverified className="text-red-400" title="Unverified Email" />
                    </div>

                    <div className="flex items-center gap-2 md:text-2xl text-lg dark:bg-gray-600 bg-gray-200 py-2 px-4 rounded-sm">
                        <MdWhatsapp className="text-lg text-green-600" />
                        {user.whatsapp}
                    </div>

                    <div className="flex items-center gap-2 md:text-2xl text-lg dark:bg-gray-600 bg-gray-200 py-2 px-4 rounded-sm">
                        {user.kycStatus === 'Verified' ? (
                            <>
                                <BsShieldFillCheck className="text-green-500" />
                                <span>KYC Verified</span>
                            </>
                        ) : (
                            <>
                                <BsShieldSlash className="text-red-500" />
                                <span>KYC Pending</span>
                            </>
                        )}
                    </div>

                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 flex justify-between items-center space-y-1 dark:bg-gray-600 bg-gray-200 py-2 px-4 rounded-sm">
                        <div>Created: {formatDistanceToNow(user.createdAt)} ago</div>
                        <div>Updated: {formatDistanceToNow(user.updatedAt)} ago</div>
                        {user.deletedAt && (
                            <div className="flex items-center gap-1 text-red-600">
                                <MdDeleteForever />
                                Deleted: {formatDistanceToNow(user.deletedAt)} ago
                            </div>
                        )}
                    </div>
                </div>
            </div>


        </div>
    );
}
