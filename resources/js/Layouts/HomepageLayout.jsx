import Header from '@/Components/Layout/Header';
import Footer from '@/Components/Layout/Footer';

export default function HomepageLayout({ children,    hideFooter = false, }) {
    return (
        <div className="min-h-screen bg-background text-foreground antialiased">
            <Header />
            <main>{children}</main>
              {!hideFooter && <Footer />}
        </div>
    );
}