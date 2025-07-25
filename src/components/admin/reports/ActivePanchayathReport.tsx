
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, Star } from 'lucide-react';

interface PanchayathGrade {
  id: string;
  name: string;
  district: string;
  totalRegistrations: number;
  freeRegistrations: number;
  paidRegistrations: number;
  totalRevenue: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D';
  gradeColor: string;
  gradeIcon: React.ReactNode;
}

const ActivePanchayathReport = () => {
  const { data: panchayathGrades, isLoading } = useQuery({
    queryKey: ['active-panchayath-report'],
    queryFn: async () => {
      // Get all panchayaths with their registration data
      const { data: panchayaths, error: panchayathError } = await supabase
        .from('panchayaths')
        .select(`
          id,
          name,
          district,
          registrations!inner(
            id,
            fee_paid,
            status,
            created_at
          )
        `);

      if (panchayathError) throw panchayathError;

      // Process data to calculate grades
      const gradesData: PanchayathGrade[] = panchayaths.map((panchayath: any) => {
        const registrations = panchayath.registrations || [];
        const totalRegistrations = registrations.length;
        const freeRegistrations = registrations.filter((r: any) => !r.fee_paid || r.fee_paid === 0).length;
        const paidRegistrations = registrations.filter((r: any) => r.fee_paid && r.fee_paid > 0).length;
        const totalRevenue = registrations.reduce((sum: number, r: any) => sum + (r.fee_paid || 0), 0);

        // Calculate grade based on total registrations and revenue
        let grade: PanchayathGrade['grade'];
        let gradeColor: string;
        let gradeIcon: React.ReactNode;

        if (totalRegistrations >= 100 && totalRevenue >= 50000) {
          grade = 'A+';
          gradeColor = 'bg-green-500';
          gradeIcon = <Trophy className="h-4 w-4" />;
        } else if (totalRegistrations >= 75 && totalRevenue >= 35000) {
          grade = 'A';
          gradeColor = 'bg-green-400';
          gradeIcon = <Medal className="h-4 w-4" />;
        } else if (totalRegistrations >= 50 && totalRevenue >= 25000) {
          grade = 'B+';
          gradeColor = 'bg-blue-500';
          gradeIcon = <Award className="h-4 w-4" />;
        } else if (totalRegistrations >= 30 && totalRevenue >= 15000) {
          grade = 'B';
          gradeColor = 'bg-blue-400';
          gradeIcon = <Star className="h-4 w-4" />;
        } else if (totalRegistrations >= 20 && totalRevenue >= 10000) {
          grade = 'C+';
          gradeColor = 'bg-yellow-500';
          gradeIcon = <Star className="h-4 w-4" />;
        } else if (totalRegistrations >= 10 && totalRevenue >= 5000) {
          grade = 'C';
          gradeColor = 'bg-yellow-400';
          gradeIcon = <Star className="h-4 w-4" />;
        } else {
          grade = 'D';
          gradeColor = 'bg-red-400';
          gradeIcon = <Star className="h-4 w-4" />;
        }

        return {
          id: panchayath.id,
          name: panchayath.name,
          district: panchayath.district,
          totalRegistrations,
          freeRegistrations,
          paidRegistrations,
          totalRevenue,
          grade,
          gradeColor,
          gradeIcon
        };
      });

      // Sort by grade (A+ first, then A, B+, etc.)
      const gradeOrder = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D'];
      return gradesData.sort((a, b) => {
        const aIndex = gradeOrder.indexOf(a.grade);
        const bIndex = gradeOrder.indexOf(b.grade);
        if (aIndex !== bIndex) return aIndex - bIndex;
        // If same grade, sort by total registrations descending
        return b.totalRegistrations - a.totalRegistrations;
      });
    }
  });

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Grading Criteria */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-2">Grading Criteria:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <Trophy className="h-3 w-3 text-green-500" />
            <span>A+: 100+ reg, ₹50k+ revenue</span>
          </div>
          <div className="flex items-center gap-1">
            <Medal className="h-3 w-3 text-green-400" />
            <span>A: 75+ reg, ₹35k+ revenue</span>
          </div>
          <div className="flex items-center gap-1">
            <Award className="h-3 w-3 text-blue-500" />
            <span>B+: 50+ reg, ₹25k+ revenue</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-blue-400" />
            <span>B: 30+ reg, ₹15k+ revenue</span>
          </div>
        </div>
      </div>

      {/* Report Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-200 px-4 py-2 text-left">Rank</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Grade</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Panchayath</th>
              <th className="border border-gray-200 px-4 py-2 text-left">District</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Total Reg.</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Free Reg.</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Paid Reg.</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {panchayathGrades?.map((panchayath, index) => (
              <tr key={panchayath.id} className="hover:bg-gray-50">
                <td className="border border-gray-200 px-4 py-2 text-center font-semibold">
                  {index + 1}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  <Badge className={`${panchayath.gradeColor} text-white flex items-center gap-1 w-fit`}>
                    {panchayath.gradeIcon}
                    {panchayath.grade}
                  </Badge>
                </td>
                <td className="border border-gray-200 px-4 py-2 font-medium">
                  {panchayath.name}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  {panchayath.district}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-semibold">
                    {panchayath.totalRegistrations}
                  </span>
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm">
                    {panchayath.freeRegistrations}
                  </span>
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                    {panchayath.paidRegistrations}
                  </span>
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  <span className="font-semibold text-green-600">
                    ₹{panchayath.totalRevenue.toLocaleString('en-IN')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!panchayathGrades || panchayathGrades.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No panchayath data available for grading.
        </div>
      )}
    </div>
  );
};

export default ActivePanchayathReport;
