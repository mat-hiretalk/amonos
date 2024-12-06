import { Button } from "./ui/button";

export default function Hero() {
  return (
    <div className="relative h-[600px] flex items-center justify-center">
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage: "url('/casino-floor.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-black/50 z-0" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Track, Reward, and Manage Player Experiences in Real-Time.
        </h1>
        <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto">
          Streamline your casino operations with advanced player tracking, 
          comprehensive loyalty programs, and powerful real-time analytics.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" className="bg-primary hover:bg-primary/90">
            Get Started
          </Button>
          <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white">
            Request a Demo
          </Button>
        </div>
      </div>
    </div>
  );
}
