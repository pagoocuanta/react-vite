import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Users, User, Download, Upload, Plus, Filter, Clock, MapPin, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { NewShiftModal } from '@/components/NewShiftModal';
import { handleAPICall } from '@/lib/api';
import type { Shift } from '@shared/api';

interface WeekData {
  weekNumber: number;
  startDate: Date;
  shifts: { [date: string]: Shift[] };
}

// ID mapping to match database UUIDs with frontend IDs
const uuidToIdMap: { [key: string]: string } = {
  '550e8400-e29b-41d4-a716-446655440001': '1',
  '550e8400-e29b-41d4-a716-446655440002': '2',
  '550e8400-e29b-41d4-a716-446655440003': '3',
  '550e8400-e29b-41d4-a716-446655440004': '4',
  '550e8400-e29b-41d4-a716-446655440005': '5'
};

// API functions
const fetchShifts = async (startDate: string, endDate: string): Promise<Shift[]> => {
  try {
    const response = await fetch(`/api/schedule?startDate=${startDate}&endDate=${endDate}`);
    if (response.ok) {
      const result = await response.json();
      return result.success ? result.data : [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching shifts:', error);
    return [];
  }
};

const fetchUsers = async (): Promise<any[]> => {
  try {
    const response = await fetch('/api/users');
    if (response.ok) {
      const result = await response.json();
      return result.success ? result.data : [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

const mockEmployees = [
  { id: '1', name: 'Emma Jansen', role: 'Kassa', avatar: 'EJ' },
  { id: '2', name: 'Tom de Vries', role: 'Voorraad', avatar: 'TV' },
  { id: '3', name: 'Lisa Bakker', role: 'Klantenservice', avatar: 'LB' },
  { id: '4', name: 'Sarah Meijer', role: 'Kassa', avatar: 'SM' },
  { id: '5', name: 'Mike Johnson', role: 'Manager', avatar: 'MJ' },
  { id: '6', name: 'Anna van der Berg', role: 'HR', avatar: 'AB' },
  { id: '7', name: 'Jij', role: 'Kassa', avatar: 'JL' }, // Current user
];

const shiftTypes = {
  ochtend: { 
    label: 'Ochtend', 
    color: 'bg-gruppy-blue text-white', 
    lightColor: 'bg-gruppy-blue-light text-gruppy-blue',
    icon: '🌅'
  },
  avond: { 
    label: 'Avond', 
    color: 'bg-gruppy-orange text-white', 
    lightColor: 'bg-gruppy-orange-light text-gruppy-orange',
    icon: '🌆'
  },
  vrij: { 
    label: 'Vrij', 
    color: 'bg-gray-400 text-white', 
    lightColor: 'bg-gray-100 text-gray-600',
    icon: '🏠'
  },
  ziek: { 
    label: 'Ziek', 
    color: 'bg-red-500 text-white', 
    lightColor: 'bg-red-100 text-red-600',
    icon: '🤒'
  },
  vakantie: { 
    label: 'Vakantie', 
    color: 'bg-gruppy-green text-white', 
    lightColor: 'bg-gruppy-green-light text-gruppy-green',
    icon: '🏖️'
  },
};

const getCurrentWeek = (): WeekData => {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - today.getDay() + 1);
  
  return {
    weekNumber: Math.ceil(((today.getTime() - new Date(today.getFullYear(), 0, 1).getTime()) / 86400000 + 1) / 7),
    startDate: monday,
    shifts: generateMockShifts(monday),
  };
};

const generateMockShifts = (startDate: Date): { [date: string]: Shift[] } => {
  const shifts: { [date: string]: Shift[] } = {};
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const dateKey = date.toISOString().split('T')[0];
    
    shifts[dateKey] = mockEmployees.map((employee) => {
      // Generate realistic shifts
      const rand = Math.random();
      
      if (i >= 5) { // Weekend
        if (rand < 0.3) {
          return {
            id: `${employee.id}-${dateKey}`,
            employee: employee.name,
            role: employee.role,
            startTime: '10:00',
            endTime: '18:00',
            type: rand < 0.15 ? 'ochtend' : 'avond',
            location: 'Winkel'
          };
        } else if (rand < 0.4) {
          return {
            id: `${employee.id}-${dateKey}`,
            employee: employee.name,
            role: employee.role,
            startTime: '',
            endTime: '',
            type: 'vakantie',
          };
        } else {
          return {
            id: `${employee.id}-${dateKey}`,
            employee: employee.name,
            role: employee.role,
            startTime: '',
            endTime: '',
            type: 'vrij',
          };
        }
      } else { // Weekdays
        if (rand < 0.1) {
          return {
            id: `${employee.id}-${dateKey}`,
            employee: employee.name,
            role: employee.role,
            startTime: '',
            endTime: '',
            type: rand < 0.05 ? 'ziek' : 'vakantie',
          };
        } else if (rand < 0.15) {
          return {
            id: `${employee.id}-${dateKey}`,
            employee: employee.name,
            role: employee.role,
            startTime: '',
            endTime: '',
            type: 'vrij',
          };
        } else if (rand < 0.6) {
          return {
            id: `${employee.id}-${dateKey}`,
            employee: employee.name,
            role: employee.role,
            startTime: '08:00',
            endTime: '16:00',
            type: 'ochtend',
            location: 'Winkel'
          };
        } else {
          return {
            id: `${employee.id}-${dateKey}`,
            employee: employee.name,
            role: employee.role,
            startTime: '14:00',
            endTime: '22:00',
            type: 'avond',
            location: 'Winkel'
          };
        }
      }
    });
  }
  
  return shifts;
};

export default function Schedule() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();

  const [currentWeek, setCurrentWeek] = useState<WeekData>(() => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    return {
      weekNumber: Math.ceil(((today.getTime() - new Date(today.getFullYear(), 0, 1).getTime()) / 86400000 + 1) / 7),
      startDate: monday,
      shifts: {}
    };
  });

  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showTeamView, setShowTeamView] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [selectedShiftType, setSelectedShiftType] = useState<string>('all');
  const [showNewShiftModal, setShowNewShiftModal] = useState(false);

  // Load week data from API
  const loadWeekData = async (startDate: Date) => {
    setIsLoading(true);
    try {
      // Calculate week end date
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);

      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      // Fetch shifts for the week
      let shiftsData = await fetchShifts(startDateStr, endDateStr);

      // Apply role-based filtering for shifts
      if (user?.role !== 'admin') {
        // Staff users only see their own shifts
        shiftsData = shiftsData.filter(shift => {
          const employeeId = shift.employeeId;
          const mappedEmployeeId = uuidToIdMap[employeeId] || employeeId;
          return mappedEmployeeId === user.id || employeeId === user.id;
        });
        console.log(`Staff user ${user?.name}: filtered to ${shiftsData.length} personal shifts`);
      } else {
        console.log(`Admin user: showing all ${shiftsData.length} shifts`);
      }

      // Fetch users to get names
      const usersData = await fetchUsers();
      console.log('Schedule: Fetched users:', usersData);
      console.log('Schedule: Fetched shifts:', shiftsData);

      // Group shifts by date
      const shiftsByDate: { [date: string]: Shift[] } = {};

      // Initialize empty arrays for each day
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dateKey = date.toISOString().split('T')[0];
        shiftsByDate[dateKey] = [];
      }

      // Add shifts with employee names
      shiftsData.forEach(shift => {
        // Map UUID employee ID to simple ID for matching with users
        const employeeId = shift.employeeId;
        const mappedEmployeeId = uuidToIdMap[employeeId] || employeeId;

        // Find employee by matching the mapped ID
        const employee = usersData.find(u => u.id === mappedEmployeeId);
        const enhancedShift = {
          ...shift,
          employee: employee?.name || shift.employee || `User ${employeeId}`,
        };

        console.log('Shift employee mapping:', {
          originalId: employeeId,
          mappedId: mappedEmployeeId,
          foundEmployee: employee?.name,
          shiftEmployee: shift.employee
        });

        if (shiftsByDate[shift.date]) {
          shiftsByDate[shift.date].push(enhancedShift);
        }
      });

      // Update employees list based on role
      if (usersData.length > 0) {
        let formattedEmployees = usersData.map(user => ({
          id: user.id,
          name: user.name,
          role: user.position || user.role || 'Medewerker',
          avatar: user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
        }));

        // For staff users, only show themselves in the employee list
        if (user?.role !== 'admin') {
          formattedEmployees = formattedEmployees.filter(emp => emp.id === user.id);
          setShowTeamView(false); // Force personal view for staff
        }

        setEmployees(formattedEmployees);
      }

      // If no shifts found, generate some demo shifts
      if (shiftsData.length === 0) {
        console.log('No shifts found in database, using fallback mock data');
        const mockShifts = generateMockShifts(startDate);
        setCurrentWeek(prev => ({
          ...prev,
          shifts: mockShifts
        }));
      } else {
        setCurrentWeek(prev => ({
          ...prev,
          shifts: shiftsByDate
        }));
      }

      setDataLoaded(true);
    } catch (error) {
      console.error('Error loading week data:', error);
      toast({
        title: "Fout bij laden rooster",
        description: "Kon roostergegevens niet laden. Toont demo data.",
        variant: "destructive",
      });

      // Fallback to mock data
      const mockShifts = generateMockShifts(startDate);
      setCurrentWeek(prev => ({
        ...prev,
        shifts: mockShifts
      }));
      setEmployees(mockEmployees);
      setDataLoaded(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Create new shift
  const createNewShift = async (shiftData: {
    employeeId: string;
    date: string;
    startTime?: string;
    endTime?: string;
    type: 'ochtend' | 'avond' | 'vrij' | 'ziek' | 'vakantie';
    location?: string;
    notes?: string;
  }) => {
    try {
      // Create via API
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId: shiftData.employeeId,
          date: shiftData.date,
          startTime: shiftData.startTime,
          endTime: shiftData.endTime,
          type: shiftData.type,
          location: shiftData.location,
          notes: shiftData.notes,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create shift');
      }

      toast({
        title: "Shift aangemaakt",
        description: `Shift voor ${shiftData.date} succesvol aangemaakt.`,
      });

      // Reload the current week data to show the new shift
      await loadWeekData(currentWeek.startDate);

      console.log('Shift created successfully:', result.data);
    } catch (error) {
      console.error('Failed to create shift:', error);
      toast({
        title: "Fout bij aanmaken shift",
        description: "Kon shift niet aanmaken. Probeer het opnieuw.",
        variant: "destructive",
      });
    }
  };

  // Load data when component mounts or week changes
  useEffect(() => {
    loadWeekData(currentWeek.startDate);
  }, []);

  const getDaysOfWeek = (startDate: Date) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const navigateWeek = async (direction: 'prev' | 'next') => {
    const newStartDate = new Date(currentWeek.startDate);
    newStartDate.setDate(newStartDate.getDate() + (direction === 'next' ? 7 : -7));

    const newWeekNumber = currentWeek.weekNumber + (direction === 'next' ? 1 : -1);

    setDataLoaded(false);
    setCurrentWeek(prev => ({
      ...prev,
      weekNumber: newWeekNumber,
      startDate: newStartDate,
    }));

    await loadWeekData(newStartDate);
  };

  const getShiftsForDay = (date: Date, employee?: string) => {
    const dateKey = date.toISOString().split('T')[0];
    const dayShifts = currentWeek.shifts[dateKey] || [];
    
    if (employee && employee !== 'all') {
      return dayShifts.filter(shift => shift.employee === employee);
    }
    
    return dayShifts;
  };

  const getFilteredEmployees = () => {
    if (!showTeamView) {
      // Personal view - show only current user
      return employees.filter(emp => emp.id === user?.id);
    }

    if (selectedEmployee === 'all') {
      return employees;
    }

    return employees.filter(emp => emp.name === selectedEmployee);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('nl-NL', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const daysOfWeek = getDaysOfWeek(currentWeek.startDate);
  const filteredEmployees = getFilteredEmployees();

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {t('nav.schedule')}
            </h1>
            {user && (
              <Badge
                className={`${user.role === 'admin'
                  ? 'bg-gruppy-orange/20 text-gruppy-orange border-gruppy-orange/30'
                  : 'bg-gruppy-blue/20 text-gruppy-blue border-gruppy-blue/30'
                }`}
              >
                {user.role === 'admin' ? 'Team rooster' : 'Mijn rooster'}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">
            Week {currentWeek.weekNumber} • {formatDate(currentWeek.startDate)} - {formatDate(daysOfWeek[6])}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Team View Toggle - Only for admins */}
          {user?.role === 'admin' && (
            <div className="flex items-center space-x-2">
              <Switch
                id="team-view"
                checked={showTeamView}
                onCheckedChange={setShowTeamView}
              />
              <Label htmlFor="team-view" className="text-sm">
                Team overzicht
              </Label>
            </div>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setDataLoaded(false);
              loadWeekData(currentWeek.startDate);
            }}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Vernieuwen
          </Button>

          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          {/* New Shift Button - Only for admins */}
          {user?.role === 'admin' && (
            <Button
              size="sm"
              className="bg-gruppy-orange hover:bg-gruppy-orange/90"
              onClick={() => setShowNewShiftModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nieuwe shift
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filters:</span>
        </div>
        
        {/* Employee Filter */}
        {showTeamView && (
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="px-3 py-1 rounded-lg border border-border bg-background text-sm"
          >
            <option value="all">Alle medewerkers</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.name}>{emp.name}</option>
            ))}
          </select>
        )}
        
        {/* Shift Type Filter */}
        <div className="flex gap-2">
          <Button
            variant={selectedShiftType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedShiftType('all')}
            className={selectedShiftType === 'all' ? 'bg-gruppy-orange hover:bg-gruppy-orange/90' : ''}
          >
            Alle shifts
          </Button>
          {Object.entries(shiftTypes).map(([type, config]) => (
            <Button
              key={type}
              variant={selectedShiftType === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedShiftType(type)}
              className={cn(
                "text-xs",
                selectedShiftType === type && config.color
              )}
            >
              {config.icon} {config.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          onClick={() => navigateWeek('prev')}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Vorige week
        </Button>
        
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground">
            Week {currentWeek.weekNumber}
          </h2>
          <p className="text-sm text-muted-foreground">
            {currentWeek.startDate.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        
        <Button
          variant="outline"
          onClick={() => navigateWeek('next')}
          className="flex items-center gap-2"
        >
          Volgende week
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-8 border-b border-border bg-muted/30">
          <div className="p-4 text-sm font-medium text-muted-foreground">
            Medewerker
          </div>
          {daysOfWeek.map((day, index) => (
            <div
              key={index}
              className={cn(
                "p-4 text-center text-sm font-medium",
                day.toDateString() === new Date().toDateString()
                  ? "bg-gruppy-orange text-white"
                  : "text-foreground"
              )}
            >
              <div className="font-semibold">
                {day.toLocaleDateString('nl-NL', { weekday: 'short' })}
              </div>
              <div className="text-xs opacity-75">
                {day.getDate()}/{day.getMonth() + 1}
              </div>
            </div>
          ))}
        </div>

        {/* Schedule Rows */}
        <div className="divide-y divide-border">
          {!dataLoaded || isLoading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, index) => (
              <div key={`skeleton-${index}`} className="grid grid-cols-8 min-h-[80px]">
                {/* Employee Info Skeleton */}
                <div className="p-4 flex items-center gap-3 bg-muted/10">
                  <div className="w-8 h-8 bg-muted rounded-full animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse w-20"></div>
                    <div className="h-3 bg-muted rounded animate-pulse w-16"></div>
                  </div>
                </div>
                {/* Daily Shifts Skeleton */}
                {Array.from({ length: 7 }).map((_, dayIndex) => (
                  <div key={dayIndex} className="p-2 border-l border-border min-h-[80px] flex items-center justify-center">
                    <div className="w-full h-12 bg-muted rounded-lg animate-pulse"></div>
                  </div>
                ))}
              </div>
            ))
          ) : (
            filteredEmployees.map((employee) => (
              <div key={employee.id} className="grid grid-cols-8 min-h-[80px]">
                {/* Employee Info */}
                <div className="p-4 flex items-center gap-3 bg-muted/10">
                  <div className="w-8 h-8 bg-gradient-to-br from-gruppy-blue to-gruppy-purple rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {employee.avatar}
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground text-sm">{employee.name}</h3>
                    <p className="text-xs text-muted-foreground">{employee.role}</p>
                  </div>
                </div>

                {/* Daily Shifts */}
                {daysOfWeek.map((day, dayIndex) => {
                  const shifts = getShiftsForDay(day, employee.name);
                  const shift = shifts[0]; // Assuming one shift per employee per day

                  return (
                    <div key={dayIndex} className="p-2 border-l border-border min-h-[80px] flex items-center justify-center">
                      {shift && (selectedShiftType === 'all' || selectedShiftType === shift.type) ? (
                        <div className={cn(
                          "w-full rounded-lg p-2 text-xs text-center transition-all duration-200 hover:scale-105 cursor-pointer",
                          shiftTypes[shift.type].color
                        )}>
                          <div className="font-medium mb-1">
                            {shiftTypes[shift.type].icon} {shiftTypes[shift.type].label}
                          </div>
                          {shift.startTime && shift.endTime && (
                            <div className="flex items-center justify-center gap-1 text-xs opacity-90">
                              <Clock className="h-3 w-3" />
                              {shift.startTime}-{shift.endTime}
                            </div>
                          )}
                          {shift.location && (
                            <div className="flex items-center justify-center gap-1 text-xs opacity-75 mt-1">
                              <MapPin className="h-3 w-3" />
                              {shift.location}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-muted-foreground text-xs">-</div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {Object.entries(shiftTypes).map(([type, config]) => {
          const count = Object.values(currentWeek.shifts)
            .flat()
            .filter(shift => shift.type === type).length;
          
          return (
            <div key={type} className="bg-card rounded-xl p-4 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <div className={cn("w-3 h-3 rounded-full", config.color)}></div>
                <span className="text-sm font-medium text-foreground">{config.label}</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{count}</div>
              <div className="text-xs text-muted-foreground">Deze week</div>
            </div>
          );
        })}
      </div>

      {/* New Shift Modal */}
      <NewShiftModal
        isOpen={showNewShiftModal}
        onClose={() => setShowNewShiftModal(false)}
        onSubmit={createNewShift}
        teamMembers={employees}
      />
    </div>
  );
}
