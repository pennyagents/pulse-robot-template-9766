import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, ArrowRight } from 'lucide-react';
const JobCardHighlight = () => {
  const {
    data: jobCategory
  } = useQuery({
    queryKey: ['job-card-category'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('categories').select('*').ilike('name', '%job card%').eq('is_active', true).single();
      if (error) return null;
      return data;
    }
  });
  if (!jobCategory) return null;
  return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 border-2 border-orange-200">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-300/20 to-orange-400/20"></div>
        
        <div className="relative p-4 sm:p-6 md:p-8 lg:p-12 bg-yellow-100">
          <div className="flex flex-col lg:flex-row items-center gap-6 sm:gap-8">
            <div className="flex-1 text-center lg:text-left w-full">
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-3 sm:mb-4">
                <Star className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500 fill-current" />
                <Badge className="bg-red-600 text-white hover:bg-red-700 text-xs sm:text-sm font-bold px-2 py-1">
                  SPECIAL OFFER
                </Badge>
                <Star className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500 fill-current" />
              </div>
              
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
                {jobCategory.name}
              </h2>
              
              <p className="text-gray-700 mb-4 sm:mb-6 max-w-2xl text-sm sm:text-base font-normal px-2 lg:px-0">
                {jobCategory.description || "Single window registration for all categories! Get access to multiple employment opportunities with one registration."}
              </p>
              
              <div className="flex flex-col items-center justify-center lg:justify-start mb-4 sm:mb-6">
                <Card className="bg-white/90 backdrop-blur-sm border-orange-200 w-full max-w-sm">
                  <CardContent className="p-3 sm:p-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <span className="text-xs sm:text-sm text-gray-600">Regular Fee:</span>
                        <span className="text-base sm:text-lg line-through text-gray-400">₹{jobCategory.actual_fee}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <span className="text-xs sm:text-sm text-gray-600">Offer Price:</span>
                        <span className="text-xl sm:text-2xl font-bold text-green-600">₹{jobCategory.offer_fee}</span>
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-red-600">
                        Save ₹{jobCategory.actual_fee - jobCategory.offer_fee}!
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Link to={`/register/${jobCategory.id}`} className="block w-full max-w-sm mx-auto lg:mx-0">
                <Card className="group cursor-pointer shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 border-2 border-orange-300 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                  <CardContent className="p-4 sm:p-6 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="p-2 bg-white/20 rounded-full">
                        <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-sm sm:text-base lg:text-lg">
                          Register Now - Limited Time
                        </h3>
                        <p className="text-white/90 text-xs sm:text-sm mt-1">
                          Click to secure your spot today!
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
            
            {jobCategory.popup_image_url && <div className="flex-shrink-0 w-full lg:w-auto flex justify-center">
                <div className="relative">
                  <img src={jobCategory.popup_image_url} alt={`${jobCategory.name} offer`} className="w-48 h-48 sm:w-60 sm:h-60 lg:w-72 lg:h-72 object-cover rounded-xl lg:rounded-2xl shadow-2xl border-2 sm:border-4 border-white" />
                  <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 bg-red-500 text-white rounded-full p-2 sm:p-3 shadow-lg animate-pulse">
                    <Star className="h-4 w-4 sm:h-6 sm:w-6 fill-current" />
                  </div>
                </div>
              </div>}
          </div>
        </div>
      </div>
    </div>;
};
export default JobCardHighlight;