import Hero from "@/components/hero";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChartBar, Clock, Gift, Table, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />

      {/* Key Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Clock className="w-8 h-8" />}
              title="Real-Time Player Tracking"
              description="Keep track of all players in real-time across multiple tables"
            />
            <FeatureCard
              icon={<ChartBar className="w-8 h-8" />}
              title="Comprehensive Reporting"
              description="Generate detailed reports for managerial insights"
            />
            <FeatureCard
              icon={<Table className="w-8 h-8" />}
              title="Flexible Rating Management"
              description="Easy access to active rating slips for viewing and editing"
            />
            <FeatureCard
              icon={<Gift className="w-8 h-8" />}
              title="Loyalty Program Integration"
              description="Reward players based on their activities and improve engagement"
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Amonos?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <BenefitCard
              icon={<Users className="w-12 h-12" />}
              title="Improved Operational Efficiency"
              description="Streamline your operations with automated player tracking and management systems"
            />
            <BenefitCard
              icon={<Gift className="w-12 h-12" />}
              title="Better Player Experience"
              description="Deliver personalized rewards and services to enhance player satisfaction"
            />
            <BenefitCard
              icon={<ChartBar className="w-12 h-12" />}
              title="Enhanced Data Visibility"
              description="Access comprehensive reports and player histories for informed decision-making"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="p-6 text-center hover:shadow-lg transition-shadow">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </Card>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <Card className="p-6 text-center">
      <h3 className="text-4xl font-bold mb-2">{value}</h3>
      <p className="text-gray-600">{title}</p>
    </Card>
  );
}

function BenefitCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
