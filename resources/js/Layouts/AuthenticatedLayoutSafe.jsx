// import { useAlerts } from '@/Components/Alerts';
// import ApplicationLogo from '@/Components/ApplicationLogo';
// import Dropdown from '@/Components/Dropdown';
// import { useHelpers } from '@/Components/Helpers';
// import { Link, usePage } from '@inertiajs/react';
// import { useEffect, useState } from 'react';
// import { Toaster } from 'react-hot-toast';
// import { IoMoon, IoSettings, IoCloseSharp } from 'react-icons/io5';
// import { FaChevronDown, FaSun, FaBell } from 'react-icons/fa6';
// import { GiHamburgerMenu } from 'react-icons/gi';
// import Sidebar from '@/Pages/Admin/Layouts/Sidebar';
// import {
//     DropdownMenu,
//     DropdownMenuContent,
//     DropdownMenuItem,
//     DropdownMenuLabel,
//     DropdownMenuSeparator,
//     DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';

// export default function AuthenticatedLayout({ header, children }) {
//     const { hasAnyPermission } = useHelpers();
//     const user = usePage().props.auth.user;
//     const permissions = usePage().props.auth?.permissions ?? [];

//     const { successAlert, errorAlert, warningAlert, infoAlert } = useAlerts();
//     const { flash, errors, messages } = usePage().props;

//     const [sidebarOpen, setSidebarOpen] = useState(false);
//     const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
//     const [openMenu, setOpenMenu] = useState(null);
//     const [isMenuOpen, setIsMenuOpen] = useState(false);

//     const [darkMode, setDarkMode] = useState(() =>
//         localStorage.theme === 'dark' ||
//         (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
//     );

//     function isValidationError(errors) {
//         return errors &&
//             (errors.message === 'Validation failed' ||
//                 errors.message === 'The given data was invalid' ||
//                 Object.values(errors).some(error => Array.isArray(error)));
//     }

//     useEffect(() => {
//         if (errors && !isValidationError(errors)) {
//             Object.entries(errors).forEach(([, value]) => errorAlert(value));
//         }

//         if (flash?.success) successAlert(flash.success);
//         if (flash?.error) errorAlert(flash.error);
//         if (flash?.warning) warningAlert(flash.warning);
//         if (flash?.info) infoAlert(flash.info);

//         if (messages?.envelopes?.length > 0) {
//             messages.envelopes.forEach(({ type, message }) => {
//                 switch (type) {
//                     case 'success': successAlert(message); break;
//                     case 'error': errorAlert(message); break;
//                     case 'warning': warningAlert(message); break;
//                     case 'info': infoAlert(message); break;
//                 }
//             });
//         }
//     }, [messages, flash, errors]);

//     useEffect(() => {
//         const root = window.document.documentElement;
//         if (darkMode) {
//             root.classList.add('dark');
//             localStorage.setItem('theme', 'dark');
//         } else {
//             root.classList.remove('dark');
//             localStorage.setItem('theme', 'light');
//         }
//     }, [darkMode]);

//     const handleMouseEnter = (menu) => setOpenMenu(menu);
//     const handleMouseLeave = () => setOpenMenu(null);
//     const handleToggle = () => setIsMenuOpen(prev => !prev);

//     return (
//         <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
//             {/* Sidebar */}
//             <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

//             {/* Main Content */}
//             <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-[288px]' : 'ml-0'}`}>
//                 <nav className="border-b border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-800 fixed top-0 left-0 right-0 z-50 print:hidden">
//                     <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
//                         <div className="flex h-16 justify-between border-gray-200 dark:border-gray-700">
//                             <div className="flex">
//                                 {/* Sidebar Toggle Button */}
//                                 <button
//                                     onClick={() => setSidebarOpen(!sidebarOpen)}
//                                     className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
//                                 >
//                                     <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//                                     </svg>
//                                 </button>

//                                 <div className="flex shrink-0 items-center">
//                                     <Link href="/dashboard">
//                                         <ApplicationLogo className="block w-auto fill-current text-gray-800 dark:text-gray-200" />
//                                     </Link>
//                                 </div>

//                                 <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
//                                     {/* Commented out NavLinks */}
//                                 </div>
//                             </div>

//                             {/* Top Right Content */}
//                             <div className="hidden sm:ms-6 sm:flex sm:items-center gap-2 relative">
//                                 {/* Bell Icon */}
//                                 <div className='md:block hidden' onMouseEnter={() => handleMouseEnter("bell")} onMouseLeave={handleMouseLeave}>
//                                     <DropdownMenu open={openMenu == "bell"} onOpenChange={() => { }}>
//                                         <DropdownMenuTrigger asChild>
//                                             <button className="flex items-center bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-xl text-xl text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition">
//                                                 <FaBell />
//                                             </button>
//                                         </DropdownMenuTrigger>
//                                         <DropdownMenuContent className="w-48">
//                                             <DropdownMenuLabel>New One...</DropdownMenuLabel>
//                                             <DropdownMenuSeparator />
//                                             <DropdownMenuItem>new login</DropdownMenuItem>
//                                             <DropdownMenuItem>KYC complete</DropdownMenuItem>
//                                             <DropdownMenuItem>Registration was success</DropdownMenuItem>
//                                             <DropdownMenuItem>Delivered</DropdownMenuItem>
//                                         </DropdownMenuContent>
//                                     </DropdownMenu>
//                                 </div>

//                                 {/* User Dropdown */}
//                                 <div className="relative ms-3" onMouseEnter={() => handleMouseEnter("icn")} onMouseLeave={handleMouseLeave}>
//                                     <Dropdown open={openMenu == "icn"} onOpenChange={() => { }}>
//                                         <Dropdown.Trigger>
//                                             <span className="inline-flex rounded-md">
//                                                 <button
//                                                     type="button"
//                                                     className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-xl text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition text-gray-800 dark:text-gray-200"
//                                                 >
//                                                     {user.name}
//                                                     <FaChevronDown />
//                                                 </button>
//                                             </span>
//                                         </Dropdown.Trigger>
//                                         <Dropdown.Content>
//                                             <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
//                                         </Dropdown.Content>
//                                     </Dropdown>
//                                 </div>

//                                 {/* Dark/Light Toggle */}
//                                 <button
//                                     onClick={() => setDarkMode(!darkMode)}
//                                     className="md:flex items-center gap-2 bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-xl text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition hidden md:block"
//                                 >
//                                     {darkMode ? (
//                                         <FaSun size={18} className="text-gray-200" />
//                                     ) : (
//                                         <IoMoon size={18} className="text-gray-800" />
//                                     )}
//                                     <span className="text-gray-800 dark:text-gray-100">
//                                         {darkMode ? "Light" : "Dark"}
//                                     </span>
//                                 </button>

//                                 {/* Settings Button */}
//                                 <div className='flex items-center gap-2 bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-xl text-xl text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition cursor-pointer md:block hidden'>
//                                     <IoSettings />
//                                 </div>
//                             </div>

//                             {/* Mobile Menu Button */}
//                             <div className="-me-2 flex items-center sm:hidden gap-2">
//                                 <div className='flex items-center gap-2 bg-gray-200 dark:bg-gray-700 px-1 rounded-xl text-xl text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition cursor-pointer'>
//                                 </div>
//                                 <button
//                                     onClick={() => setShowingNavigationDropdown(previousState => !previousState)}
//                                     className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none dark:text-gray-500 dark:hover:bg-gray-900 dark:hover:text-gray-400 dark:focus:bg-gray-900 dark:focus:text-gray-400"
//                                 >
//                                     <GiHamburgerMenu className='h-6 w-6 text-gray-700 dark:text-gray-200' />
//                                 </button>
//                             </div>
//                         </div>

//                         {/* Mobile Menu Toggle Section */}
//                         <div className='block md:hidden my-4 flex items-center justify-between'>
//                             <button onClick={handleToggle}>
//                                 {isMenuOpen ? <IoCloseSharp className='h-6 w-6 text-gray-700 dark:text-gray-200' /> : <GiHamburgerMenu className='h-6 w-6 text-gray-700 dark:text-gray-200' />}
//                             </button>
//                             <div className='flex items-center gap-2'>
//                                 <button onClick={() => setDarkMode(!darkMode)} className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-xl text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition">
//                                     {darkMode ? (
//                                         <FaSun size={18} className="text-gray-200" />
//                                     ) : (
//                                         <IoMoon size={18} className="text-gray-800" />
//                                     )}
//                                     <span className="text-gray-800 dark:text-gray-100">
//                                         {darkMode ? "Light" : "Dark"}
//                                     </span>
//                                 </button>
//                                 <div className='md:hidden block'>
//                                     <DropdownMenu>
//                                         <DropdownMenuTrigger asChild>
//                                             <button className="flex items-center bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-xl text-xl text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition">
//                                                 <FaBell />
//                                             </button>
//                                         </DropdownMenuTrigger>
//                                         <DropdownMenuContent className="w-48">
//                                             <DropdownMenuLabel>New One...</DropdownMenuLabel>
//                                             <DropdownMenuSeparator />
//                                             <DropdownMenuItem>new login</DropdownMenuItem>
//                                             <DropdownMenuItem>KYC complete</DropdownMenuItem>
//                                             <DropdownMenuItem>Registration was success</DropdownMenuItem>
//                                             <DropdownMenuItem>Delivered</DropdownMenuItem>
//                                         </DropdownMenuContent>
//                                     </DropdownMenu>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Responsive Navigation Dropdown */}
//                     <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden'}>
//                         <div className="space-y-1 pb-3 pt-2">
//                             {/* ResponsiveNavLinks commented out */}
//                         </div>
//                         <div className="border-t border-gray-200 pb-1 pt-4 dark:border-gray-600">
//                             <div className="px-4">
//                                 <div className="text-base font-medium text-gray-800 dark:text-gray-200">
//                                     {user.name}
//                                 </div>
//                                 <div className="text-sm font-medium text-gray-500">
//                                     {user.email}
//                                 </div>
//                             </div>
//                             <div className="mt-3 space-y-1">
//                                 {/* ResponsiveNavLink commented out */}
//                             </div>
//                         </div>
//                     </div>
//                 </nav>

//                 {/* Header Section */}
//                 {header && (
//                     <header className="bg-white shadow dark:bg-gray-800">
//                         <div className="mx-auto max-w-full px-4 py-6 sm:px-6 lg:px-8">
//                             {header}
//                         </div>
//                     </header>
//                 )}

//                 {/* Main Content */}
//                 <main>{children}</main>

//                 {/* Toaster */}
//                 <Toaster
//                     position='top-right'
//                     reverseOrder={false}
//                     gutter={8}
//                 />
//             </div>
//         </div>
//     );
// }
