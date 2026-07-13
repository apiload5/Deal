import Link from 'next/link'
import { Facebook, Twitter, Instagram, Linkedin, Youtube, MapPin, Phone, Mail } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-primary">Deal.pk</h3>
            <p className="text-sm text-muted-foreground">
              Pakistan's #1 real estate platform. Find your dream property today.
            </p>
            <div className="flex space-x-3">
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Youtube className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/properties" className="text-muted-foreground hover:text-primary">
                  Properties
                </Link>
              </li>
              <li>
                <Link href="/map" className="text-muted-foreground hover:text-primary">
                  Map View
                </Link>
              </li>
              <li>
                <Link href="/compare" className="text-muted-foreground hover:text-primary">
                  Compare Properties
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-primary">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="mb-4 font-semibold">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/area-guide/karachi" className="text-muted-foreground hover:text-primary">
                  Karachi Area Guide
                </Link>
              </li>
              <li>
                <Link href="/area-guide/lahore" className="text-muted-foreground hover:text-primary">
                  Lahore Area Guide
                </Link>
              </li>
              <li>
                <Link href="/area-guide/islamabad" className="text-muted-foreground hover:text-primary">
                  Islamabad Area Guide
                </Link>
              </li>
              <li>
                <Link href="/mortgage-calculator" className="text-muted-foreground hover:text-primary">
                  Mortgage Calculator
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 font-semibold">Contact Us</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                123 Main Street, Karachi, Pakistan
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                +92 300 1234567
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                info@deal.pk
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} Deal.pk. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
