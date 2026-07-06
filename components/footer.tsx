// components/footer.tsx
import Link from 'next/link';
import { Facebook, Twitter, Youtube, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Deal.pk</h3>
            <p className="text-sm">
              Pakistan's #1 Real Estate Portal. Find properties for sale and rent across Pakistan with secure deals.
            </p>
            <div className="flex space-x-4 mt-4">
              <Link href="#" className="hover:text-blue-400">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href="#" className="hover:text-blue-400">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="hover:text-blue-400">
                <Instagram className="w-5 h-5" />
              </Link>
              <Link href="#" className="hover:text-blue-400">
                <Youtube className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/properties" className="hover:text-white">Properties</Link></li>
              <li><Link href="/map" className="hover:text-white">Map View</Link></li>
              <li><Link href="/area-guide" className="hover:text-white">Area Guide</Link></li>
              <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">For Agents</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/agent/login" className="hover:text-white">Agent Login</Link></li>
              <li><Link href="/agent/register" className="hover:text-white">Become an Agent</Link></li>
              <li><Link href="/agent/dashboard" className="hover:text-white">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Karachi, Pakistan</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>+92 300 1234567</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>info@deal.pk</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} Deal.pk. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
