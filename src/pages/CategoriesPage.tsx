import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Phone, Mail, MapPin, Sparkles, Star, Crown } from 'lucide-react';
const CategoriesPage = () => {
  const {
    data: categories,
    isLoading,
    error
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('categories').select('*').eq('is_active', true).order('name');
      if (error) throw error;

      // Reorder categories in the specified order
      const categoryOrder = ['Pennyekart Free Registration', 'Pennyekart Paid Registration', 'Farmelife', 'Organelife', 'Foodelife', 'Entrelife', 'Job Card'];
      return data?.sort((a, b) => {
        const aIndex = categoryOrder.indexOf(a.name);
        const bIndex = categoryOrder.indexOf(b.name);
        return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
      }) || [];
    }
  });
  const getCardGradient = (index: number, isHighlighted?: boolean) => {
    if (isHighlighted) {
      return 'from-yellow-400 via-yellow-500 to-yellow-600';
    }
    const gradients = ['from-blue-500 to-purple-600', 'from-green-500 to-teal-600', 'from-pink-500 to-rose-600', 'from-orange-500 to-red-600', 'from-indigo-500 to-blue-600', 'from-purple-500 to-pink-600', 'from-teal-500 to-green-600'];
    return gradients[index % gradients.length];
  };
  const getCategoryLogo = (categoryName: string, isHighlighted?: boolean) => {
    const logoMap: {
      [key: string]: string;
    } = {
      'Pennyekart Free Registration': '/lovable-uploads/2f3ab11d-f683-42be-a94b-69644f18db08.png',
      'Pennyekart Paid Registration': '/lovable-uploads/2f3ab11d-f683-42be-a94b-69644f18db08.png',
      'Farmelife': '/lovable-uploads/ea1aea54-6535-4308-b2f7-fc4ce9f476e8.png',
      'Organelife': '/lovable-uploads/17e9aae4-3476-40e1-a553-cff559b81cbe.png',
      'Foodelife': '/lovable-uploads/67cb945b-d9cd-4023-9b98-3ad092f86195.png',
      'Entrelife': '/lovable-uploads/91538157-882e-42fd-b645-446ed5cebe6e.png'
    };
    const logoUrl = logoMap[categoryName];
    if (logoUrl) {
      return <img src={logoUrl} alt={`${categoryName} logo`} className="h-8 w-8 object-contain bg-white/20 rounded p-1" />;
    }

    // Fallback to crown icon for categories without specific logos
    return <Crown className="h-6 w-6 text-white" />;
  };
  const isJobCard = (categoryName: string) => {
    return categoryName.toLowerCase().includes('job card');
  };
  if (isLoading) {
    return <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      </div>;
  }
  if (error) {
    return <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center text-red-600">
            Error loading categories. Please try again later.
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">സ്വയം തൊഴിൽ വിഭാഗങ്ങൾ</h1>
          <p className="text-gray-600 text-base">താങ്കൾക്ക് ആവശ്യമായ സ്വയംതൊഴിൽ മേഖല ഏതാണെന്ന് ഇവിടെനിന്ന് തിരഞ്ഞെടുക്കുക. ശ്രദ്ധിക്കുക സ്വയംതൊഴിൽ പദ്ധതികളുടെ നടത്തിപ്പ് സുഖമമാക്കാൻ വേണ്ടി പദ്ധതികളെ വിവിധ വിഭാഗങ്ങൾ ആക്കി തരാം തിരിച്ചിരിക്കുന്നു. നിങ്ങളുടെ അഭിരുചി അനുസരിച്ച് നിങ്ങൾക്ക് അവ ഓരോന്നും തിരഞ്ഞെടുക്കാവുന്നതാണ്. എന്നാൽ ഏതെങ്കിലും സാഹചര്യത്തിൽ നിങ്ങൾക്ക് ഒന്നിൽ കൂടുതൽ മേഖലകളിലേക്ക് അപേക്ഷിക്കണം എന്നുണ്ടെങ്കിൽ അതിനുള്ള  മാർഗ്ഗമാണ് ജോബ് കാർഡ്. ജോബ് കാർഡിലേക്ക് രജിസ്റ്റർ ചെയ്താൽ നിങ്ങൾക്ക് ഭാവിയിൽ ഏതിലേക്ക് വേണമെങ്കിലും അധിക ഫീസ് ഇല്ലാതെ തന്നെ അപേക്ഷിക്കാവുന്നതാണ് അതല്ല ഏതെങ്കിലും ഒന്നിലേക്ക് മാത്രം അപേക്ഷിക്കാനും അതുമല്ലെങ്കിൽ സ്വയംതൊഴിൽ പദ്ധതികളുടെ ഭാഗമാകാതെ തന്നെ ഒരു സാധാരണ ഉപഭോക്താവായി മാത്രം രജിസ്റ്റർ ചെയ്യാവുന്നതുമാണ്. താങ്കൾക്ക് അനുയോജ്യമായ വിഭാകാം രജിസ്റ്റർ ചെയ്യാവുന്നതാണ് 15 ദിവസത്തിനുള്ളിൽ പണം നൽകി റജിസ്ട്രേഷൻ ഉറപ്പ് വരുത്തിയാൽ മതി.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories?.map((category, index) => <Card key={category.id} className={`relative overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-xl ${category.is_highlighted ? 'ring-4 ring-yellow-400 ring-opacity-50' : ''} ${isJobCard(category.name) ? 'ring-4 ring-yellow-400 ring-opacity-60' : ''}`}>
              {/* Golden Sparkles for Job Card */}
              {isJobCard(category.name) && <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <span className="absolute top-4 left-4 text-yellow-400 text-lg animate-pulse">✨</span>
                  <span className="absolute top-8 right-6 text-yellow-500 text-sm animate-bounce">⭐</span>
                  <span className="absolute bottom-16 left-8 text-amber-400 text-base animate-pulse" style={{
              animationDelay: '1s'
            }}>✨</span>
                  <span className="absolute bottom-8 right-4 text-yellow-400 text-xs animate-bounce" style={{
              animationDelay: '0.5s'
            }}>💫</span>
                </div>}

              {/* Gradient Header */}
              <div className={`h-20 bg-gradient-to-r ${isJobCard(category.name) ? 'from-yellow-400 via-amber-500 to-yellow-600' : getCardGradient(index, category.is_highlighted)} relative ${category.is_highlighted ? 'animate-pulse' : ''} ${isJobCard(category.name) ? 'animate-pulse' : ''}`}>
                <div className="absolute top-4 left-4 flex items-center space-x-2">
                  {getCategoryLogo(category.name, category.is_highlighted)}
                  {category.is_highlighted && <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm animate-bounce">
                      Featured
                    </Badge>}
                  {isJobCard(category.name) && <Badge className="bg-gradient-to-r from-yellow-300 to-amber-300 text-yellow-900 border-yellow-400 font-bold animate-pulse">
                      SPECIAL ⭐
                    </Badge>}
                  {category.offer_fee === 0 && <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                      Free
                    </Badge>}
                </div>
              </div>
              
              <CardHeader className="pb-4 pt-6">
                <CardTitle className={`text-xl font-bold ${category.is_highlighted ? 'text-yellow-600' : isJobCard(category.name) ? 'text-amber-600' : 'text-gray-900'}`}>
                  {category.name}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Description Section */}
                <div className={`p-4 rounded-lg ${isJobCard(category.name) ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200' : 'bg-gray-50'}`}>
                  <h4 className="font-semibold text-gray-800 mb-2">Description</h4>
                  <p className="text-sm text-gray-600">
                    {category.description || 'Registration service for your business needs.'}
                  </p>
                </div>
                
                {/* Fee Details Section */}
                <div className="flex justify-between items-center">
                  <div className="text-center flex-1">
                    <p className="text-sm text-gray-500 mb-1">Regular Fee</p>
                    <p className="text-2xl font-bold text-gray-400 line-through">
                      ₹{category.actual_fee}
                    </p>
                  </div>
                  
                  <div className="text-center flex-1">
                    <p className="text-sm text-gray-500 mb-1">Offer Price</p>
                    <p className={`text-3xl font-bold bg-gradient-to-r ${isJobCard(category.name) ? 'from-yellow-500 to-amber-600' : getCardGradient(index, category.is_highlighted)} bg-clip-text text-transparent`}>
                      ₹{category.offer_fee}
                    </p>
                  </div>
                </div>

                <div className={`space-y-2 p-4 rounded-lg ${isJobCard(category.name) ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200' : 'bg-gray-50'}`}>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">You Save:</span>
                    <span className="font-bold text-red-600">
                      ₹{category.actual_fee - category.offer_fee}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount:</span>
                    <span className="font-bold text-red-600">
                      {category.actual_fee > 0 ? Math.round((category.actual_fee - category.offer_fee) / category.actual_fee * 100) : 0}% OFF
                    </span>
                  </div>
                </div>

                <Link to={`/register/${category.id}`} className="block">
                  <Button className={`w-full bg-gradient-to-r ${isJobCard(category.name) ? 'from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 shadow-lg shadow-yellow-200' : getCardGradient(index, category.is_highlighted)} hover:opacity-90 text-white py-3 text-lg font-semibold border-0 shadow-lg ${category.is_highlighted ? 'animate-pulse' : ''} ${isJobCard(category.name) ? 'animate-pulse' : ''}`}>
                    {isJobCard(category.name) ? '⭐ Register Now ⭐' : 'Register Now'}
                  </Button>
                </Link>
              </CardContent>
            </Card>)}
        </div>

        {(!categories || categories.length === 0) && <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No categories available at the moment.</p>
          </div>}
      </div>

      {/* Contact Us Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16 mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Need Help?</h2>
            <p className="text-lg text-purple-100">
              Contact us for registration assistance and support
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <Phone className="h-12 w-12 mx-auto mb-4 text-purple-200" />
              <h3 className="text-xl font-semibold mb-2">Phone Support</h3>
              <p className="text-purple-100">+91 7025715877</p>
              <p className="text-purple-100">Mon-Fri, 9AM-6PM</p>
            </div>
            
            <div className="text-center">
              <Mail className="h-12 w-12 mx-auto mb-4 text-purple-200" />
              <h3 className="text-xl font-semibold mb-2">Email Support</h3>
              <p className="text-purple-100">teamelifesociety@gmail.com</p>
              <p className="text-purple-100">We'll respond within 24 hours</p>
            </div>
            
            <div className="text-center">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-purple-200" />
              <h3 className="text-xl font-semibold mb-2">Office Address</h3>
              <p className="text-purple-100">ESEP Office, forza mall tirur</p>
              <p className="text-purple-100">Kerala, India - 676101</p>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default CategoriesPage;