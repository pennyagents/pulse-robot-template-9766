import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, AlertTriangle, PartyPopper } from 'lucide-react';
interface Category {
  id: string;
  name: string;
  description: string | null;
  warning_message: string | null;
  actual_fee: number;
  offer_fee: number;
  popup_image_url: string | null;
  qr_image_url: string | null;
}
interface Panchayath {
  id: string;
  name: string;
  district: string;
}
interface RegistrationData {
  name: string;
  address: string;
  mobile_number: string;
  panchayath_id: string;
  ward: string;
  agent_pro: string;
  category_id: string;
  fee_paid: number;
  customer_id: string;
  preference: string;
}

// Job Card preference options as provided by the user
const JOB_CARD_PREFERENCES = [{
  value: 'farmelife',
  label: 'Farmelife (കന്നുകാലി വളർത്തൽ)'
}, {
  value: 'foodelife',
  label: 'Foodelife (അച്ചാർ പോലുള്ള ഭക്ഷ്യോത്പന്നങ്ങൾ)'
}, {
  value: 'organelife',
  label: 'Organelife (കഷിക പദ്ധതികൾ)'
}, {
  value: 'entrelife',
  label: 'Entrelife (തയ്യൽ പോലുള്ള കൈതൊഴിലുകൽ)'
}, {
  value: 'no',
  label: 'No (പ്രത്യേകം ഇല്ല)'
}];
const RegistrationPage = () => {
  const {
    categoryId
  } = useParams<{
    categoryId: string;
  }>();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [generatedCustomerId, setGeneratedCustomerId] = useState('');
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [showCongratulationsDialog, setShowCongratulationsDialog] = useState(false);
  const [warningAcknowledged, setWarningAcknowledged] = useState(false);
  const [congratulationsAcknowledged, setCongratulationsAcknowledged] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    mobile_number: '',
    panchayath_id: '',
    ward: '',
    agent_pro: '',
    preference: ''
  });
  const {
    data: category,
    isLoading: categoryLoading
  } = useQuery({
    queryKey: ['category', categoryId],
    queryFn: async () => {
      if (!categoryId) throw new Error('Category ID is required');
      const {
        data,
        error
      } = await supabase.from('categories').select('*').eq('id', categoryId).single();
      if (error) throw error;
      return data;
    },
    enabled: !!categoryId
  });
  const {
    data: panchayaths
  } = useQuery({
    queryKey: ['panchayaths'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('panchayaths').select('*').order('name');
      if (error) throw error;
      return data as Panchayath[];
    }
  });

  // Show appropriate dialog when category loads
  useEffect(() => {
    if (category) {
      const isJobCardCategory = category.name.toLowerCase().includes('job card');
      if (isJobCardCategory && !congratulationsAcknowledged) {
        console.log('Showing congratulations dialog for job card category');
        setShowCongratulationsDialog(true);
      } else if (!isJobCardCategory && category.warning_message && category.warning_message.trim() !== '' && !warningAcknowledged) {
        console.log('Category warning message:', category.warning_message);
        setShowWarningDialog(true);
      }
    }
  }, [category, warningAcknowledged, congratulationsAcknowledged]);
  const handleWarningAccept = () => {
    setShowWarningDialog(false);
    setWarningAcknowledged(true);
  };
  const handleWarningCancel = () => {
    setShowWarningDialog(false);
    navigate('/categories');
  };
  const handleCongratulationsAccept = () => {
    setShowCongratulationsDialog(false);
    setCongratulationsAcknowledged(true);
  };
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.address || !formData.mobile_number || !formData.ward || !categoryId || !category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const registrationData: RegistrationData = {
        name: formData.name,
        address: formData.address,
        mobile_number: formData.mobile_number,
        panchayath_id: formData.panchayath_id || '',
        ward: formData.ward,
        agent_pro: formData.agent_pro || '',
        category_id: categoryId,
        fee_paid: category.offer_fee,
        customer_id: 'ESEP' + formData.mobile_number + formData.name.charAt(0).toUpperCase(),
        preference: formData.preference
      };
      const {
        data,
        error
      } = await supabase.from('registrations').insert(registrationData).select().single();
      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Mobile Number Already Registered",
            description: "This mobile number is already registered. Please use a different number.",
            variant: "destructive"
          });
        } else {
          throw error;
        }
        return;
      }
      setGeneratedCustomerId(data.customer_id);
      setShowSuccess(true);
      toast({
        title: "Registration Successful!",
        description: `Your Customer ID is: ${data.customer_id}`
      });
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: "There was an error processing your registration. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  if (categoryLoading) {
    return <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>;
  }
  if (!category) {
    return <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center text-red-600">
            Category not found. Please go back and select a valid category.
          </div>
        </div>
      </div>;
  }
  const isJobCardCategory = category.name.toLowerCase().includes('job card');

  // Show congratulations dialog for job card categories
  if (isJobCardCategory && !congratulationsAcknowledged) {
    return <div className="min-h-screen bg-gray-50">
        <Navbar />
        <AlertDialog open={showCongratulationsDialog} onOpenChange={setShowCongratulationsDialog}>
          <AlertDialogContent className="my-0 mx-0 px-0 py-0">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-green-600">
                <PartyPopper className="h-5 w-5 text-green-600" />
                Congratulations! 🎉
              </AlertDialogTitle>
              <AlertDialogDescription className="whitespace-pre-wrap text-center mx-[20px]">🎉 നിങ്ങൾ ജോബ് കാർഡ് തിരഞ്ഞെടുത്തതിന് നന്ദി! 🎉 ജോബ് കാർഡിന്റെ ആനുകൂല്യങ്ങൾ: ▫️ ഇത് ഒരു സ്പെഷ്യൽ ഡിസ്കൗണ്ട് കാർഡ് ആണ് ▫️ ഇത് ഒരു പ്രിവിലേജ് കാർഡ് ആണ് ▫️ ഇത് ഒരു ഫ്രീഡം കാർഡ് ആണ് ▫️ ഇത് ഒരു ലോൺ കാർഡ് ആണ് ▫️ ഇത് ഒരു ഇൻവെസ്റ്റ്മെന്റ് കാർഡ് ആണ്...
🎉കൂടുതൽ വിവരങ്ങൾക്ക് നിങ്ങളുടെ ഏജൻ്റ് മാരുമായി ബന്ധപെടുക🎉</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={handleCongratulationsAccept} className="text-white bg-green-600 hover:bg-green-700">
                രജിസ്ട്രേഷൻ തുടരുക
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>;
  }

  // Show warning dialog for non-job card categories that have warning messages
  if (!isJobCardCategory && category.warning_message && category.warning_message.trim() !== '' && !warningAcknowledged) {
    return <div className="min-h-screen bg-gray-50">
        <Navbar />
        <AlertDialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
          <AlertDialogContent className="my-0 mx-0 px-0 py-0">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Warning
              </AlertDialogTitle>
              <AlertDialogDescription className="whitespace-pre-wrap text-center mx-[20px]">
                {category.warning_message}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleWarningCancel} className="text-sm text-red-600 bg-yellow-300 hover:bg-yellow-200">മറ്റേതെങ്കിലും രജിസ്ട്രേഷൻ</AlertDialogCancel>
              <AlertDialogAction onClick={handleWarningAccept} className="text-lime-50 text-xs text-center mx-0 my-0 px-0 py-0 rounded-md font-medium bg-blue-800 hover:bg-blue-700">സ്വയംതൊഴിൽ വേണ്ട, മുന്നോട്ട് പോകാം</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>;
  }
  if (showSuccess) {
    return <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Card className="text-center max-w-4xl mx-auto">
            <CardContent className="pt-8 bg-teal-100">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Registration Successful!</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
                {/* Registration Details */}
                <div className="space-y-4 text-left">
                  <div className="flex justify-between">
                    <span className="font-semibold">Customer ID:</span>
                    <span className="font-mono text-sm text-rose-600">{generatedCustomerId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Category:</span>
                    <span>{category.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Fee Paid:</span>
                    <span>₹{category.offer_fee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Status:</span>
                    <span>Pending Approval</span>
                  </div>
                </div>

                {/* QR Code */}
                {category.qr_image_url && <div className="flex flex-col items-center">
                    <div className="bg-teal-600 p-4 rounded-lg relative">
                      <img src={category.qr_image_url} alt="QR Code" className="w-48 h-48 object-contain bg-white p-2 rounded" />
                      <Button size="sm" className="absolute top-2 right-2 bg-black text-white hover:bg-gray-800" onClick={() => {
                    const link = document.createElement('a');
                    link.href = category.qr_image_url!;
                    link.download = `qr-code-${generatedCustomerId}.png`;
                    link.click();
                  }}>
                        DOWNLOAD ⬇
                      </Button>
                    </div>
                  </div>}
              </div>

              <p className="text-gray-600 mb-6">Please save your Customer ID for future reference. You can check your application status using your mobile number and Customer ID.</p>
              
              <Button onClick={() => navigate('/status')} className="w-full max-w-md mx-auto bg-gray-800 hover:bg-gray-900">
                Check Status
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Registration Form</h1>
          <p className="text-gray-600">Please fill in your details for {category.name}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Registration Form */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="name">Full Name * / പൂർണ്ണ നാമം *</Label>
                    <Input id="name" value={formData.name} onChange={e => handleInputChange('name', e.target.value)} placeholder="Enter your full name / നിങ്ങളുടെ പൂർണ്ണ നാമം നൽകുക" required />
                  </div>

                  <div>
                    <Label htmlFor="mobile">Mobile Number * / മൊബൈൽ നമ്പർ *</Label>
                    <Input id="mobile" type="tel" value={formData.mobile_number} onChange={e => handleInputChange('mobile_number', e.target.value)} placeholder="Enter 10-digit mobile number / 10 അക്ക മൊബൈൽ നമ്പർ നൽകുക" pattern="[0-9]{10}" required />
                  </div>

                  <div>
                    <Label htmlFor="address">Address * / വിലാസം *</Label>
                    <Textarea id="address" value={formData.address} onChange={e => handleInputChange('address', e.target.value)} placeholder="Enter your complete address / നിങ്ങളുടെ പൂർണ്ണ വിലാസം നൽകുക" required />
                  </div>

                  <div>
                    <Label htmlFor="panchayath">Panchayath / പഞ്ചായത്ത്</Label>
                    <Select value={formData.panchayath_id} onValueChange={value => handleInputChange('panchayath_id', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Panchayath / പഞ്ചായത്ത് തിരഞ്ഞെടുക്കുക" />
                      </SelectTrigger>
                      <SelectContent className="bg-white z-50">
                        {panchayaths?.map(panchayath => <SelectItem key={panchayath.id} value={panchayath.id}>
                            {panchayath.name} - {panchayath.district}
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="ward">Ward * / വാർഡ് *</Label>
                    <Input id="ward" value={formData.ward} onChange={e => handleInputChange('ward', e.target.value)} placeholder="Enter ward number/name / വാർഡ് നമ്പർ/പേര് നൽകുക" required />
                  </div>

                  <div>
                    <Label htmlFor="agent">Agent / P.R.O / ഏജന്റ് / പി.ആർ.ഒ</Label>
                    <Input id="agent" value={formData.agent_pro} onChange={e => handleInputChange('agent_pro', e.target.value)} placeholder="Enter agent or PRO name (optional) / ഏജന്റ് അല്ലെങ്കിൽ പിആർഒ പേര് (ഓപ്ഷണൽ)" />
                  </div>

                  {isJobCardCategory && <div>
                      <Label htmlFor="preference">Preference / മുൻഗണന</Label>
                      <Select value={formData.preference} onValueChange={value => handleInputChange('preference', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your preference for job card / ജോബ് കാർഡിനുള്ള നിങ്ങളുടെ മുൻഗണന തിരഞ്ഞെടുക്കുക" />
                        </SelectTrigger>
                        <SelectContent className="bg-white z-50 max-h-80">
                          {JOB_CARD_PREFERENCES.map(option => <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>}

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                    {isSubmitting ? <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Processing...
                      </> : 'Submit Registration'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Category Summary */}
          <div className="order-1 lg:order-2">
            <Card className="lg:sticky lg:top-24">
              <CardHeader>
                <CardTitle>Registration Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{category.name}</h3>
                  {category.description && <p className="text-sm text-gray-600 mt-1">{category.description}</p>}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Regular Fee:</span>
                    <span className="line-through text-gray-400">₹{category.actual_fee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Offer Price:</span>
                    <span className="font-bold text-green-600">₹{category.offer_fee}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold">You Save:</span>
                    <span className="font-bold text-red-600">₹{category.actual_fee - category.offer_fee}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>;
};
export default RegistrationPage;