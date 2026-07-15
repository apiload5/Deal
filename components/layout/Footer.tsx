import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, Building2 } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-white/10 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold gradient-text">Deal.pk</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Pakistan's premier property platform. Find your dream home, 
              sell your property, or connect with trusted agents.
            </p>
            <div className="mt-4 flex gap-3">
              {[
                { icon: Facebook, href: '#' },
                { icon: Twitter, href: '#' },
                { icon: Instagram, href: '#' },
                { icon: Youtube, href: '#' },
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -3 }}
                  className="rounded-full bg-white/5 p-2.5 text-muted-foreground transition-colors hover:bg-orange-500/20 hover:text-orange-500"
                >
                  <social.icon className="h-4 w-4" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="font-semibold mb-4 gradient-text">Quick Links</h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { name: 'Properties', href: '/properties' },
                { name: 'Map View', href: '/map' },
                { name: 'Area Guides', href: '/area-guide' },
                { name: 'Blog', href: '/blog' },
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-muted-foreground transition-colors hover:text-orange-500"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* For Agents */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="font-semibold mb-4 gradient-text">For Agents</h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { name: 'Dashboard', href: '/agent/dashboard' },
                { name: 'Add Property', href: '/agent/properties/new' },
                { name: 'My Deals', href: '/agent/deals' },
                { name: 'Profile Settings', href: '/agent/profile' },
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-muted-foreground transition-colors hover:text-orange-500"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="font-semibold mb-4 gradient-text">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3 text-muted-foreground">
                <Phone className="h-4 w-4 text-orange-500" />
                <span>+92 300 1234567</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-4 w-4 text-orange-500" />
                <span>info@deal.pk</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="h-4 w-4 text-orange-500" />
                <span>Islamabad, Pakistan</span>
              </li>
            </ul>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 border-t border-white/10 pt-8 text-center text-sm text-muted-foreground"
        >
          <p>&copy; {currentYear} Deal.pk. All rights reserved. Made with ❤️ in Pakistan</p>
        </motion.div>
      </div>
    </footer>
  )
}

export default Footer
