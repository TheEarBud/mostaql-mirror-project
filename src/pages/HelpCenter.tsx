
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const HelpCenter = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
            <p className="text-xl text-gray-600">Find answers to commonly asked questions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card>
              <CardHeader>
                <CardTitle>For Clients</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Learn how to post projects, find freelancers, and manage your work.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>For Freelancers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Discover how to find projects, submit proposals, and get paid.</p>
              </CardContent>
            </Card>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How do I post a project?</AccordionTrigger>
              <AccordionContent>
                To post a project, sign up as a client, click "Post Project" in the navigation, fill out the project details including title, description, budget, and required skills, then submit for review.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>How do I find freelancers?</AccordionTrigger>
              <AccordionContent>
                Visit the "Find Freelancers" page to browse available freelancers. You can filter by skills, location, and other criteria to find the perfect match for your project.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>How does payment work?</AccordionTrigger>
              <AccordionContent>
                Payments are secured through our escrow system. Clients pay upfront, funds are held securely, and released to freelancers upon project completion and approval.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>How do I submit a proposal?</AccordionTrigger>
              <AccordionContent>
                As a freelancer, browse available projects, click on one that interests you, and submit a proposal with your cover letter, proposed budget, and delivery timeline.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger>What fees do you charge?</AccordionTrigger>
              <AccordionContent>
                We charge a small service fee to maintain the platform and ensure secure transactions. Detailed fee information is available in your account dashboard.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HelpCenter;
