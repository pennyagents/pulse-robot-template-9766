
import React from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Users, Award, Lightbulb } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About ESEP Portal</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Empowering entrepreneurs and fostering self-employment opportunities through 
            a comprehensive registration and management platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <Target className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                To provide a seamless, efficient, and transparent platform for self-employment 
                registration, helping individuals start their entrepreneurial journey with ease 
                and support from government and private initiatives.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Lightbulb className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Our Vision</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                To become the leading platform for self-employment registration in the region, 
                fostering economic growth, reducing unemployment, and supporting the development 
                of a thriving entrepreneurial ecosystem.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle>Easy Registration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Simple, user-friendly registration process with multiple self-employment categories 
                  to choose from based on your interests and skills.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Award className="h-8 w-8 text-red-600 mb-2" />
                <CardTitle>Real-time Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Track your application status in real-time with unique customer ID and 
                  receive instant updates on approval status.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Target className="h-8 w-8 text-indigo-600 mb-2" />
                <CardTitle>Administrative Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Comprehensive admin panel for efficient management of registrations, 
                  categories, and announcements with role-based access control.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Available Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Business Categories:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Pennyekart Free Registration</li>
                  <li>• Pennyekart Paid Registration</li>
                  <li>• Farmelife - Agricultural ventures</li>
                  <li>• Organelife - Organic products</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Specialized Programs:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Foodelife - Food & catering services</li>
                  <li>• Entrelife - General entrepreneurship</li>
                  <li>• Job Card (Special) - Employment schemes</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
          <p className="text-gray-600 mb-2">
            For support or inquiries, please contact our administration team.
          </p>
          <p className="text-gray-600">
            Email: support@esep-portal.gov.in | Phone: +91-XXXXX-XXXXX
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
