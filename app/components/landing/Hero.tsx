import Link from 'next/link';
import { Button } from '../button'
import { ArrowRight, BookOpen, Target, TrendingUp } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-linear-to-r from-blue-500/10 to-indigo-500/10 py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <div className="animate-fade-in-up">
            <h1 className="text-4xl font-bold tracking-tight text-foreground lg:text-6xl">
              Ace the ACT with{" "}
              <span className="bg-linear-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                Confidence
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground lg:text-xl">
              Personalized practice questions, detailed analytics, and proven strategies to boost your ACT score.
              Join thousands of students who achieved their dream scores - all for completely free.
            </p>
          </div>
          
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href={"/dashboard"}>
            <Button variant="hero" size="lg" className="text-lg px-8 py-4 bg-linear-to-r from-blue-500 to-indigo-500 text-white">
              Practice Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            </Link>
            {/* <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-primary text-primary">
              View Sample Questions
            </Button> */}
          </div>
          
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center p-6 rounded-lg bg-card text-card-foreground animate-float group hover:shadow-lg transition-all duration-300 hover:border-primary/20 hover:scale-105">
              <div className="mb-4 rounded-full bg-primary/10 p-3">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Adaptive Practice</h3>
              <p className="mt-2 text-muted-foreground text-center">
                Questions that adapt to your skill level for maximum improvement
              </p>
            </div>
            
            <div className="flex flex-col items-center p-6 rounded-lg bg-card text-card-foreground animate-float group hover:shadow-lg transition-all duration-300 hover:border-primary/20 hover:scale-105" style={{ animationDelay: '0.2s' }}>
              <div className="mb-4 rounded-full bg-secondary/10 p-3">
                <Target className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold">Accurate Questions</h3>
              <p className="mt-2 text-muted-foreground text-center">
                1000+ expert-reviewed questions that feel like the real thing
              </p>
            </div>
            
            <div className="flex flex-col items-center p-6 rounded-lg bg-card text-card-foreground animate-float group hover:shadow-lg transition-all duration-300 hover:border-primary/20 hover:scale-105" style={{ animationDelay: '0.4s' }}>
              <div className="mb-4 rounded-full bg-primary/10 p-3">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Progress Tracking</h3>
              <p className="mt-2 text-muted-foreground text-center">
                Detailed insights into your strengths and areas for improvement
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;