import { GraduationCap, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                AceCT
              </span>
            </div>
            <p className="text-muted-foreground mb-4 max-w-md">
              Empowering students to achieve their highest ACT scores through personalized practice, 
              comprehensive analytics, and proven test strategies.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>support@acect.com</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Practice Tests</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Study Plans</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Progress Analytics</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Question Bank</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; 2024 AceCT. All rights reserved. Built for student success.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;