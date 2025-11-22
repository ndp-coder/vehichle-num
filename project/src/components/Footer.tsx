export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-screen-xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="text-xs font-semibold text-gray-900 mb-3 tracking-wide">Services</h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li><a href="#" className="hover:text-gray-900 transition-colors">VIN Lookup</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Plate Search</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Vehicle History</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-900 mb-3 tracking-wide">Support</h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li><a href="#" className="hover:text-gray-900 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">API Documentation</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-900 mb-3 tracking-wide">Company</h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li><a href="#" className="hover:text-gray-900 transition-colors">About</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Press</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-gray-900 mb-3 tracking-wide">Legal</h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li><a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Data Usage</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-xs text-gray-500">
              Copyright © 2025 VehicleIQ. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>United States</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
