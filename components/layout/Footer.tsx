import Link from 'next/link';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Company Info */}
          <div>
            <h3 className="mb-4 text-xl font-bold">
              <span className="text-primary">deal</span>
              <span className="text-secondary">.online</span>
            </h3>
            <p className="text-gray-400">
              Pakistan's leading real estate platform. Find your dream property today.
            </p>
            <div className="mt-4 flex gap-4">
              <Link href="#" className="text-gray-400 hover:text-white">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                <Youtube className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/properties" className="hover:text-white">
                  Properties
                </Link>
              </li>
              <li>
                <Link href="/agents" className="hover:text-white">
                  Agents
                </Link>
              </li>
              <li>
                <Link href="/add-property" className="hover:text-white">
                  Add Property
                </Link>
              </li>
              <li>
                <Link href="/premium" className="hover:text-white">
                  Premium Listings
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-4 font-semibold">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/faq" className="hover:text-white">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 font-semibold">Contact</h4>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+92 300 1234567</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>info@deal.online</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4" />
                <span>Islamabad, Pakistan</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} deal.online. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
