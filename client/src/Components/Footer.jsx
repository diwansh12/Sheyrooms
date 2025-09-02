// components/Footer.jsx
import React from 'react';

const Footer = () => {
  const footerSections = [
    {
      title: 'Product',
      links: [
        { name: 'Search stays', href: '#' },
        { name: 'Popular destinations', href: '#' },
        { name: 'Mobile app', href: '#' },
        { name: 'Gift cards', href: '#' }
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'About us', href: '#' },
        { name: 'Careers', href: '#' },
        { name: 'Press', href: '#' },
        { name: 'Blog', href: '#' }
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Help center', href: '#' },
        { name: 'Contact us', href: '#' },
        { name: 'Safety', href: '#' },
        { name: 'Trust & safety', href: '#' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy policy', href: '#' },
        { name: 'Terms of service', href: '#' },
        { name: 'Cookie policy', href: '#' },
        { name: 'Accessibility', href: '#' }
      ]
    }
  ];

  const socialLinks = [
    { icon: 'fab fa-facebook', href: '#' },
    { icon: 'fab fa-twitter', href: '#' },
    { icon: 'fab fa-instagram', href: '#' },
    { icon: 'fab fa-linkedin', href: '#' }
  ];

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-2 text-gray-300">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="hover:text-white transition-colors">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <h2 className="text-2xl font-bold">SheyRooms</h2>
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <a 
                    key={index} 
                    href={social.href} 
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <i className={social.icon}></i>
                  </a>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select className="bg-gray-800 text-white border-gray-700 rounded-md text-sm">
                <option>English (US)</option>
                <option>Español</option>
                <option>Français</option>
              </select>
              <select className="bg-gray-800 text-white border-gray-700 rounded-md text-sm">
                <option>USD</option>
                <option>EUR</option>
                <option>INR</option>
              </select>
            </div>
          </div>
          <div className="text-center text-gray-400 text-sm mt-4">
            © 2025 SheyRooms. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
