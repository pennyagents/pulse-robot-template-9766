import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Users, Grid3X3, MapPin, Bell, Shield, BarChart3, Settings, Wallet } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import RegistrationsManagement from '@/components/admin/RegistrationsManagement';
import CategoriesManagement from '@/components/admin/CategoriesManagement';
import PanchayathsManagement from '@/components/admin/PanchayathsManagement';
import AnnouncementsManagement from '@/components/admin/AnnouncementsManagement';
import AdminManagement from '@/components/admin/AdminManagement';
import AdminPermissionsManagement from '@/components/admin/AdminPermissionsManagement';
import ReportsManagement from '@/components/admin/ReportsManagement';
import UtilitiesManagement from '@/components/admin/UtilitiesManagement';
import AccountsManagement from '@/components/admin/AccountsManagement';
import PendingRegistrationsPopup from '@/components/admin/PendingRegistrationsPopup';
import ExpiredRegistrationsNotification from '@/components/admin/ExpiredRegistrationsNotification';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [adminSession, setAdminSession] = useState(null);
  const [activeTab, setActiveTab] = useState('registrations');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminSession = () => {
      const session = localStorage.getItem('adminSession');
      if (!session) {
        navigate('/admin/login');
        return;
      }
      try {
        const sessionData = JSON.parse(session);
        // Check if session exists and has required fields
        if (sessionData && sessionData.username && sessionData.role) {
          setAdminSession(sessionData);
        } else {
          localStorage.removeItem('adminSession');
          navigate('/admin/login');
        }
      } catch (error) {
        console.error('Invalid session data:', error);
        localStorage.removeItem('adminSession');
        navigate('/admin/login');
      } finally {
        setIsLoading(false);
      }
    };
    checkAdminSession();
  }, [navigate]);

  // Fetch admin permissions from database - temporarily disabled until types are updated
  const adminPermissions: any[] = [];

  const handleLogout = () => {
    localStorage.removeItem('adminSession');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out."
    });
    navigate('/admin/login');
  };

  const getPermissionsForModule = (module: string) => {
    // Super admins have access to everything
    if (adminSession?.role === 'super_admin') {
      return {
        canRead: true,
        canWrite: true,
        canDelete: true
      };
    }
    
    if (!adminPermissions) return {
      canRead: false,
      canWrite: false,
      canDelete: false
    };
    const modulePermissions = adminPermissions.filter(p => p.module === module);
    return {
      canRead: modulePermissions.some(p => p.permission_type === 'read'),
      canWrite: modulePermissions.some(p => p.permission_type === 'write'),
      canDelete: modulePermissions.some(p => p.permission_type === 'delete')
    };
  };

  const getRolePermissions = (role: string, adminId: string) => {
    console.log('Getting permissions for role:', role, 'adminId:', adminId);
    console.log('Admin permissions from DB:', adminPermissions);

    // Super admins always have all permissions
    if (role === 'super_admin') {
      const superAdminPerms = {
        canRead: true,
        canWrite: true,
        canDelete: true,
        canManageAdmins: true
      };
      console.log('Super admin permissions:', superAdminPerms);
      return superAdminPerms;
    }

    // For other roles, check database permissions first
    if (adminPermissions && adminPermissions.length > 0) {
      const hasReadPermission = adminPermissions.some(p => p.permission_type === 'read');
      const hasWritePermission = adminPermissions.some(p => p.permission_type === 'write');
      const hasDeletePermission = adminPermissions.some(p => p.permission_type === 'delete');
      const hasAdminManagePermission = adminPermissions.some(p => p.module === 'admin_users' && (p.permission_type === 'write' || p.permission_type === 'read'));
      const dbPerms = {
        canRead: hasReadPermission,
        canWrite: hasWritePermission,
        canDelete: hasDeletePermission,
        canManageAdmins: hasAdminManagePermission
      };
      console.log('Database permissions:', dbPerms);
      return dbPerms;
    }

    // Fallback to default role-based permissions if no database permissions found
    console.log('No database permissions found, using fallback for role:', role);
    switch (role) {
      case 'local_admin':
        return {
          canRead: true,
          canWrite: true,
          canDelete: false,
          canManageAdmins: false
        };
      case 'user_admin':
        return {
          canRead: true,
          canWrite: false,
          canDelete: false,
          canManageAdmins: false
        };
      default:
        return {
          canRead: false,
          canWrite: false,
          canDelete: false,
          canManageAdmins: false
        };
    }
  };

  if (isLoading || !adminSession) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>;
  }

  if (!adminSession) {
    return null;
  }

  const permissions = adminSession ? getRolePermissions(adminSession.role, adminSession.id) : {
    canRead: false,
    canWrite: false,
    canDelete: false,
    canManageAdmins: false
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Pending Registrations Popup */}
      <PendingRegistrationsPopup 
        adminSession={adminSession} 
        onNavigateToRegistrations={() => setActiveTab('registrations')}
      />
      
      {/* Admin Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">
                Welcome back, <span className="font-semibold">{adminSession.username}</span>
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {adminSession.role.replace('_', ' ').toUpperCase()}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ExpiredRegistrationsNotification adminSession={adminSession} />
              <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2 bg-red-400 hover:bg-red-300">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {adminSession.role === 'user_admin' ? (
            // User admin only sees registrations
            <div className="mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex">
                  <button className="bg-white border-b-2 border-blue-500 text-blue-600 py-4 px-6 text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Registrations
                  </button>
                </nav>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 mb-6">
                {getPermissionsForModule('registrations').canRead && <button onClick={() => setActiveTab('registrations')} className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all ${activeTab === 'registrations' ? 'bg-primary text-primary-foreground border-primary shadow-lg' : 'bg-card hover:bg-accent border-border hover:shadow-md'}`}>
                    <Users className="h-5 w-5" />
                    <span className="text-xs font-medium text-center">Registrations</span>
                  </button>}
                {getPermissionsForModule('categories').canRead && <button onClick={() => setActiveTab('categories')} className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all ${activeTab === 'categories' ? 'bg-primary text-primary-foreground border-primary shadow-lg' : 'bg-card hover:bg-accent border-border hover:shadow-md'}`}>
                    <Grid3X3 className="h-5 w-5" />
                    <span className="text-xs font-medium text-center">Categories</span>
                  </button>}
                {getPermissionsForModule('panchayaths').canRead && <button onClick={() => setActiveTab('panchayaths')} className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all ${activeTab === 'panchayaths' ? 'bg-primary text-primary-foreground border-primary shadow-lg' : 'bg-card hover:bg-accent border-border hover:shadow-md'}`}>
                    <MapPin className="h-5 w-5" />
                    <span className="text-xs font-medium text-center">Panchayaths</span>
                  </button>}
                {getPermissionsForModule('announcements').canRead && <button onClick={() => setActiveTab('announcements')} className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all ${activeTab === 'announcements' ? 'bg-primary text-primary-foreground border-primary shadow-lg' : 'bg-card hover:bg-accent border-border hover:shadow-md'}`}>
                    <Bell className="h-5 w-5" />
                    <span className="text-xs font-medium text-center">Announcements</span>
                  </button>}
                {getPermissionsForModule('utilities').canRead && <button onClick={() => setActiveTab('utilities')} className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all ${activeTab === 'utilities' ? 'bg-primary text-primary-foreground border-primary shadow-lg' : 'bg-card hover:bg-accent border-border hover:shadow-md'}`}>
                    <Settings className="h-5 w-5" />
                    <span className="text-xs font-medium text-center">Utilities</span>
                  </button>}
                {getPermissionsForModule('accounts').canRead && <button onClick={() => setActiveTab('accounts')} className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all ${activeTab === 'accounts' ? 'bg-primary text-primary-foreground border-primary shadow-lg' : 'bg-card hover:bg-accent border-border hover:shadow-md'}`}>
                    <Wallet className="h-5 w-5" />
                    <span className="text-xs font-medium text-center">Accounts</span>
                  </button>}
                {getPermissionsForModule('reports').canRead && <button onClick={() => setActiveTab('reports')} className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all ${activeTab === 'reports' ? 'bg-primary text-primary-foreground border-primary shadow-lg' : 'bg-card hover:bg-accent border-border hover:shadow-md'}`}>
                    <BarChart3 className="h-5 w-5" />
                    <span className="text-xs font-medium text-center">Reports</span>
                  </button>}
                {permissions.canManageAdmins && <button onClick={() => setActiveTab('admins')} className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all ${activeTab === 'admins' ? 'bg-primary text-primary-foreground border-primary shadow-lg' : 'bg-card hover:bg-accent border-border hover:shadow-md'}`}>
                    <Shield className="h-5 w-5" />
                    <span className="text-xs font-medium text-center">Admin Control</span>
                  </button>}
              </div>
            </div>
          )}

          {adminSession.role === 'user_admin' ? (
            // User admin only sees registrations
            <RegistrationsManagement permissions={permissions} />
          ) : (
            <>
              {getPermissionsForModule('registrations').canRead && <TabsContent value="registrations">
                  <RegistrationsManagement permissions={permissions} />
                </TabsContent>}

              {getPermissionsForModule('categories').canRead && <TabsContent value="categories">
                  <CategoriesManagement permissions={permissions} />
                </TabsContent>}

              {getPermissionsForModule('panchayaths').canRead && <TabsContent value="panchayaths">
                  <PanchayathsManagement permissions={permissions} />
                </TabsContent>}

              {getPermissionsForModule('announcements').canRead && <TabsContent value="announcements">
                  <AnnouncementsManagement permissions={permissions} />
                </TabsContent>}

              {getPermissionsForModule('utilities').canRead && <TabsContent value="utilities">
                  <UtilitiesManagement />
                </TabsContent>}

              {getPermissionsForModule('accounts').canRead && <TabsContent value="accounts">
                  <AccountsManagement permissions={permissions} />
                </TabsContent>}

              {getPermissionsForModule('reports').canRead && <TabsContent value="reports">
                  <ReportsManagement permissions={permissions} />
                </TabsContent>}

              {permissions.canManageAdmins && <TabsContent value="admins">
                  <div className="space-y-6">
                    <AdminManagement permissions={permissions} />
                    <AdminPermissionsManagement permissions={permissions} />
                  </div>
                </TabsContent>}
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
