import Link from 'next/link';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100">
        {/* Global Navbar */}
        <nav className="border-b border-gray-800 bg-gray-950/80 sticky top-0 backdrop-blur-md z-50">
          <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center h-16 space-x-8">
            <div className="font-black text-xl text-white tracking-tighter">
              MOCK<span className="text-indigo-500">AUCTION</span>
            </div>
            <div className="flex space-x-6 text-sm font-semibold text-gray-400">
              <Link href="/" className="hover:text-white transition-colors">Dashboard</Link>
              <Link href="/auction" className="hover:text-white transition-colors">Sold Players</Link>
            </div>
          </div>
        </nav>
        
        {children}
      </body>
    </html>
  );
}