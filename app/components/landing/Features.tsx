import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../card'
import { 
  BarChart3, 
  Brain, 
  Calendar, 
  CheckCircle, 
  Clock, 
  FileText, 
  Users, 
  Zap 
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Brain,
      title: "Adaptive Learning Engine",
      description: "Our AI adjusts question difficulty based on your performance, ensuring optimal challenge levels for maximum growth.",
      highlight: "Smart Technology"
    },
    {
      icon: BarChart3,
      title: "Detailed Analytics",
      description: "Track your progress with comprehensive score breakdowns, timing analysis, and performance trends over time.",
      highlight: "Data-Driven Insights"
    },
    {
      icon: Calendar,
      title: "Study Planner",
      description: "Personalized study schedules that fit your timeline and target score, with built-in reminders and milestones.",
      highlight: "Organized Learning"
    },
    {
      icon: FileText,
      title: "Question Review",
      description: "Learn from your mistakes by thouroughly analyzing missed questions, allowing for real growth and accuracy.",
      highlight: "Real Test Experience"
    },
    {
      icon: Clock,
      title: "Timed Practice Sessions",
      description: "Master time management with section-specific practice and pacing strategies for each ACT subject.",
      highlight: "Time Management"
    },
    {
      icon: CheckCircle,
      title: "Instant Feedback",
      description: "Get immediate explanations for every answer, with step-by-step solutions and strategy tips.",
      highlight: "Immediate Learning"
    }
  ];

  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight lg:text-4xl">
            Everything You Need to{" "}
            <span className="bg-linear-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
              Ace the ACT
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive tools and resources designed by test prep experts to maximize your ACT performance.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-lg transition-all duration-300 hover:border-primary/20 hover:scale-105"
            >
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="rounded-lg bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <div className="text-xs font-medium text-secondary uppercase tracking-wide">
                      {feature.highlight}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-4 p-6 rounded-2xl bg-white">
            <Users className="h-8 w-8 text-primary" />
            <div className="text-left">
              <div className="text-2xl font-bold text-foreground">50,000+</div>
              <div className="text-muted-foreground">Students Improved Their Scores</div>
            </div>
            <Zap className="h-8 w-8 text-secondary" />
            <div className="text-left">
              <div className="text-2xl font-bold text-foreground">4.2 Points</div>
              <div className="text-muted-foreground">Average Score Increase</div>
            </div>
          </div>
        </div> */}
      </div>
    </section>
  );
};

export default Features;