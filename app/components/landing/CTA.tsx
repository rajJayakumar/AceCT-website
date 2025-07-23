import Link from 'next/link';
import { Button } from '../button'
import { ArrowRight, Star } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-20 bg-linear-to-r from-blue-500 to-indigo-500 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"7\" cy=\"7\" r=\"1\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"
      }}></div>
      <div className="container mx-auto px-4 relative">
        <div className="text-center">
          <div className="inline-flex items-center space-x-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="ml-2 text-white/90 font-medium">Rated 4.9/5 by students</span>
          </div>
          
          <h2 className="text-3xl font-bold text-white lg:text-5xl mb-6">
            Ready to Boost Your ACT Score?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of students who have improved their scores with AceCT. 
            Start your personalized practice today, without spending a penny.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={"/dashboard"}>
            <Button 
              variant="secondary" 
              size="lg" 
              className="text-lg px-8 py-4 bg-white text-primary hover:bg-white/90"
            >
              Start Free Practice
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            </Link>
            {/* <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-4 border-white/30 text-white hover:bg-white/10"
            >
              Schedule Demo
            </Button> */}
          </div>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">100% Free</div>
              <div className="text-white/80">Always & Forever</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">No Credit Card</div>
              <div className="text-white/80">Ever Required</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">Premium Features</div>
              <div className="text-white/80">Full Access</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;