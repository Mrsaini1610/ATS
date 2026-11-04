import React, { useEffect } from 'react';
import Header from '@/Components/Layout/Header';
import Footer from '@/Components/Layout/Footer';
import SingleSessionModal from '@/Components/Common/SingleSessionModal';

export default function HomepageLayout({ children, hideFooter = false }) {
    useEffect(() => {
        // Enforce ATS royal blue light theme across candidate portal
        if (typeof window !== 'undefined') {
            document.documentElement.classList.remove('dark');
            if (localStorage.getItem('theme') === 'dark') {
                localStorage.setItem('theme', 'light');
            }
        }
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-[#f8fafc] text-gray-900 antialiased w-full overflow-x-clip">
            <SingleSessionModal />
            <Header />
            <main className="flex-1 flex flex-col w-full">{children}</main>
            {!hideFooter && <Footer />}
        </div>
    );
}