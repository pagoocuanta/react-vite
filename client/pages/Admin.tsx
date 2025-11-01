import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Shield,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Eye,
  Settings,
  UserPlus,
  Download,
  Upload,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff';
  position?: string;
  department?: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
  status: 'active' | 'inactive';
}

const mockUsers: AdminUser[] = [
  {
    id: '1',
    name: 'Silver Admin',
    email: 'admin@gruppy.nl',
    role: 'admin',
    position: 'System Administrator',
    department: 'IT',
    phone: '+31 6 12345678',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-16T10:30:00Z',
    last_login: '2024-01-16T10:30:00Z',
    status: 'active'
  },
  {
    id: '2',
    name: 'Emma Jansen',
    email: 'emma@gruppy.nl',
    role: 'staff',
    position: 'Teamleider',
    department: 'Verkoop',
    phone: '+31 6 23456789',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-15T16:20:00Z',
    last_login: '2024-01-16T08:15:00Z',
    status: 'active'
  },
  {
    id: '3',
    name: 'Lars de Vries',
    email: 'lars@gruppy.nl',
    role: 'staff',
    position: 'Kassa Medewerker',
    department: 'Verkoop',
    phone: '+31 6 34567890',
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-14T14:30:00Z',
    last_login: '2024-01-15T17:45:00Z',
    status: 'active'
  },
  {
    id: '4',
    name: 'Sophie Bakker',
    email: 'sophie@gruppy.nl',
    role: 'staff',
    position: 'HR Medewerker',
    department: 'HR',
    phone: '+31 6 45678901',
    created_at: '2024-01-04T00:00:00Z',
    updated_at: '2024-01-10T11:15:00Z',
    last_login: '2024-01-12T09:30:00Z',
    status: 'inactive'
  }
];

export default function Admin() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'staff'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff' as 'admin' | 'staff',
    position: '',
    department: '',
    phone: ''
  });

  // Fetch users from API or use mock data
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/users');

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // Transform API data to match AdminUser interface
          const transformedUsers = result.data.map((apiUser: any) => ({
            id: apiUser.id,
            name: apiUser.name,
            email: apiUser.email,
            role: apiUser.role,
            position: apiUser.position || 'Niet opgegeven',
            department: apiUser.department || 'Niet opgegeven',
            phone: apiUser.phone,
            avatar_url: apiUser.avatar_url,
            created_at: apiUser.created_at,
            updated_at: apiUser.updated_at,
            last_login: apiUser.last_sign_in_at || apiUser.updated_at,
            status: 'active' as const // Assume active for now
          }));
          setUsers(transformedUsers);
          console.log('Loaded users from API:', transformedUsers.length);
        } else {
          // Fallback to mock data
          setUsers(mockUsers);
          console.log('Using mock users as fallback');
        }
      } else {
        // Fallback to mock data
        setUsers(mockUsers);
        console.log('API failed, using mock users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      // Fallback to mock data
      setUsers(mockUsers);
      console.log('Error occurred, using mock users');
    } finally {
      setIsLoading(false);
    }
  };

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Redirect non-admin users
  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast({
        title: "Toegang geweigerd",
        description: "Je hebt geen toegang tot het beheerdersdeel.",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Shield className="w-16 h-16 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-semibold text-foreground">Toegang geweigerd</h2>
          <p className="text-muted-foreground">Je hebt geen toegang tot het beheerdersdeel.</p>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast({
        title: "Validatie fout",
        description: "Vul alle verplichte velden in.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Creating user:', newUser.name);
      const response = await fetch('/api/auth/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('User created successfully via API:', result);

        toast({
          title: "Gebruiker aangemaakt",
          description: `${newUser.name} is succesvol toegevoegd. Login met: ${newUser.email}`,
        });

        // Refresh the user list to get the latest data from the database
        await fetchUsers();

        setNewUser({
          name: '',
          email: '',
          password: '',
          role: 'staff',
          position: '',
          department: '',
          phone: ''
        });
        setIsCreateDialogOpen(false);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create user');
      }
    } catch (error: any) {
      console.error('Error creating user:', error);

      // Fallback to demo mode
      const createdUser: AdminUser = {
        id: String(Date.now()),
        ...newUser,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'active' as const
      };

      setUsers(prev => [createdUser, ...prev]);

      toast({
        title: "Gebruiker aangemaakt (Demo)",
        description: `${newUser.name} is toegevoegd. Login met: ${newUser.email}`,
      });

      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'staff',
        position: '',
        department: '',
        phone: ''
      });
      setIsCreateDialogOpen(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    try {
      console.log('Deleting user:', userId);
      const response = await fetch(`/api/auth/user/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Gebruiker verwijderd",
          description: `${userToDelete?.name || 'Gebruiker'} is succesvol verwijderd uit de database.`,
        });

        // Refresh the user list to get the latest data from the database
        await fetchUsers();
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      console.error('Error deleting user:', error);

      // Fallback to demo mode
      setUsers(prev => prev.filter(u => u.id !== userId));

      toast({
        title: "Gebruiker verwijderd (Demo)",
        description: `${userToDelete?.name || 'Gebruiker'} is verwijderd uit de demo lijst.`,
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-gruppy-green/20 text-gruppy-green border-gruppy-green/30'
      : 'bg-red-100 text-red-600 border-red-200';
  };

  const getRoleColor = (role: string) => {
    return role === 'admin'
      ? 'bg-gruppy-orange/20 text-gruppy-orange border-gruppy-orange/30'
      : 'bg-gruppy-blue/20 text-gruppy-blue border-gruppy-blue/30';
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <Shield className="h-8 w-8 text-gruppy-orange" />
            Gebruikersbeheer
          </h1>
          <p className="text-muted-foreground mt-1">
            Beheer alle gebruikersaccounts en rechten
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Vernieuwen
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporteren
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Importeren
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gruppy-orange hover:bg-gruppy-orange/90">
                <UserPlus className="h-4 w-4 mr-2" />
                Nieuwe gebruiker
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Nieuwe gebruiker aanmaken</DialogTitle>
                <DialogDescription>
                  Voer de gegevens in voor de nieuwe gebruiker. Een e-mail met inloggegevens wordt automatisch verstuurd.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Naam *</Label>
                    <Input
                      id="name"
                      value={newUser.name}
                      onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Voor- en achternaam"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="naam@bedrijf.nl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Tijdelijk wachtwoord *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Minimaal 6 karakters"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Rol</Label>
                    <Select value={newUser.role} onValueChange={(value: 'admin' | 'staff') => setNewUser(prev => ({ ...prev, role: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="staff">Medewerker</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefoon</Label>
                    <Input
                      id="phone"
                      value={newUser.phone}
                      onChange={(e) => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+31 6 12345678"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="position">Functie</Label>
                    <Input
                      id="position"
                      value={newUser.position}
                      onChange={(e) => setNewUser(prev => ({ ...prev, position: e.target.value }))}
                      placeholder="Teamleider, Kassa Medewerker, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Afdeling</Label>
                    <Input
                      id="department"
                      value={newUser.department}
                      onChange={(e) => setNewUser(prev => ({ ...prev, department: e.target.value }))}
                      placeholder="Verkoop, HR, IT, etc."
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Annuleren
                </Button>
                <Button onClick={handleCreateUser} className="bg-gruppy-orange hover:bg-gruppy-orange/90">
                  Gebruiker aanmaken
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">Gebruikers</TabsTrigger>
          <TabsTrigger value="settings">Instellingen</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters & Zoeken</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Zoek op naam, e-mail of afdeling..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={roleFilter} onValueChange={(value: any) => setRoleFilter(value)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle rollen</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="staff">Medewerker</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle statussen</SelectItem>
                    <SelectItem value="active">Actief</SelectItem>
                    <SelectItem value="inactive">Inactief</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Gebruikers ({filteredUsers.length})</span>
                <Badge variant="secondary">
                  {users.filter(u => u.status === 'active').length} actief
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center space-y-2">
                    <div className="w-8 h-8 border-2 border-gruppy-orange border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-muted-foreground">Gebruikers laden...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.avatar_url} alt={user.name} />
                        <AvatarFallback className="bg-gruppy-orange text-white">
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-foreground">{user.name}</h3>
                          <Badge className={getRoleColor(user.role)}>
                            {user.role === 'admin' ? 'Admin' : 'Medewerker'}
                          </Badge>
                          <Badge className={getStatusColor(user.status)}>
                            {user.status === 'active' ? 'Actief' : 'Inactief'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </span>
                          {user.department && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {user.department}
                            </span>
                          )}
                          {user.last_login && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Laatst ingelogd: {formatDate(user.last_login)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setSelectedUser(user);
                          setIsViewDialogOpen(true);
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          Bekijken
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Bewerken
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="h-4 w-4 mr-2" />
                          Wachtwoord resetten
                        </DropdownMenuItem>
                        {user.id !== '1' && ( // Don't allow deleting the main admin
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Verwijderen
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Gebruiker verwijderen</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Weet je zeker dat je {user.name} wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuleren</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Verwijderen
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}

                  {filteredUsers.length === 0 && !isLoading && (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">Geen gebruikers gevonden</h3>
                      <p className="text-muted-foreground">Pas je zoekfilters aan of maak een nieuwe gebruiker aan.</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Systeeminstellingen</CardTitle>
              <CardDescription>Beheer algemene systeeminstellingen en configuratie</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Gebruikersinstellingen</h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      Standaard rechten instellen
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Mail className="h-4 w-4 mr-2" />
                      E-mail templates beheren
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Shield className="h-4 w-4 mr-2" />
                      Wachtwoord beleid
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Systeem</h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Backup maken
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Upload className="h-4 w-4 mr-2" />
                      Backup herstellen
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Systeemlogboek
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Detail Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Gebruiker details</DialogTitle>
            <DialogDescription>
              Volledige informatie over {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedUser.avatar_url} alt={selectedUser.name} />
                  <AvatarFallback className="bg-gruppy-orange text-white text-lg">
                    {selectedUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                  <p className="text-muted-foreground">{selectedUser.position}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge className={getRoleColor(selectedUser.role)}>
                      {selectedUser.role === 'admin' ? 'Administrator' : 'Medewerker'}
                    </Badge>
                    <Badge className={getStatusColor(selectedUser.status)}>
                      {selectedUser.status === 'active' ? 'Actief' : 'Inactief'}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">E-mail</Label>
                    <p className="text-foreground">{selectedUser.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Telefoon</Label>
                    <p className="text-foreground">{selectedUser.phone || 'Niet opgegeven'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Afdeling</Label>
                    <p className="text-foreground">{selectedUser.department || 'Niet opgegeven'}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Account aangemaakt</Label>
                    <p className="text-foreground">{formatDate(selectedUser.created_at)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Laatst bijgewerkt</Label>
                    <p className="text-foreground">{formatDate(selectedUser.updated_at)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Laatst ingelogd</Label>
                    <p className="text-foreground">
                      {selectedUser.last_login ? formatDate(selectedUser.last_login) : 'Nog nooit ingelogd'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Sluiten
            </Button>
            <Button className="bg-gruppy-orange hover:bg-gruppy-orange/90">
              Bewerken
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
