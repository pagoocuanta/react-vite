import { RequestHandler } from "express";
import { Shift, ApiResponse, CreateShiftRequest } from "@shared/api";
import { supabase, handleSupabaseError, createSupabaseResponse } from "../lib/supabase";

// Mock data
let mockShifts: Shift[] = [
  {
    id: '1',
    employeeId: '1',
    employee: 'Emma Jansen',
    date: '2024-01-15',
    startTime: '08:00',
    endTime: '16:00',
    type: 'ochtend',
    location: 'Winkel',
    createdById: '4',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z'
  },
  {
    id: '2',
    employeeId: '2',
    employee: 'Tom de Vries',
    date: '2024-01-15',
    startTime: '14:00',
    endTime: '22:00',
    type: 'avond',
    location: 'Magazijn',
    createdById: '4',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z'
  },
  {
    id: '3',
    employeeId: '3',
    employee: 'Lisa Bakker',
    date: '2024-01-15',
    startTime: '10:00',
    endTime: '18:00',
    type: 'ochtend',
    location: 'Klantenservice',
    createdById: '4',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z'
  },
  {
    id: '4',
    employeeId: '5',
    employee: 'Jij',
    date: '2024-01-15',
    startTime: '08:00',
    endTime: '16:00',
    type: 'ochtend',
    location: 'Kassa',
    createdById: '4',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z'
  },
  {
    id: '5',
    employeeId: '1',
    employee: 'Emma Jansen',
    date: '2024-01-16',
    startTime: '',
    endTime: '',
    type: 'vrij',
    createdById: '4',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z'
  },
  {
    id: '6',
    employeeId: '2',
    employee: 'Tom de Vries',
    date: '2024-01-16',
    startTime: '08:00',
    endTime: '16:00',
    type: 'ochtend',
    location: 'Voorraad',
    createdById: '4',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z'
  }
];

// Generate mock shifts for a week
function generateWeekShifts(startDate: string): Shift[] {
  const employees = [
    { id: '1', name: 'Emma Jansen' },
    { id: '2', name: 'Tom de Vries' },
    { id: '3', name: 'Lisa Bakker' },
    { id: '4', name: 'Mike Johnson' },
    { id: '5', name: 'Jij' }
  ];
  
  const shifts: Shift[] = [];
  const start = new Date(startDate);
  
  for (let day = 0; day < 7; day++) {
    const date = new Date(start);
    date.setDate(start.getDate() + day);
    const dateStr = date.toISOString().split('T')[0];
    
    employees.forEach(emp => {
      const rand = Math.random();
      let shift: Shift;
      
      if (day >= 5) { // Weekend
        if (rand < 0.7) {
          shift = {
            id: `${emp.id}-${dateStr}`,
            employeeId: emp.id,
            employee: emp.name,
            date: dateStr,
            startTime: '',
            endTime: '',
            type: 'vrij',
            createdById: '4',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        } else {
          shift = {
            id: `${emp.id}-${dateStr}`,
            employeeId: emp.id,
            employee: emp.name,
            date: dateStr,
            startTime: '10:00',
            endTime: '18:00',
            type: rand < 0.85 ? 'ochtend' : 'avond',
            location: 'Winkel',
            createdById: '4',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        }
      } else { // Weekdays
        if (rand < 0.1) {
          shift = {
            id: `${emp.id}-${dateStr}`,
            employeeId: emp.id,
            employee: emp.name,
            date: dateStr,
            startTime: '',
            endTime: '',
            type: rand < 0.05 ? 'ziek' : 'vakantie',
            createdById: '4',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        } else if (rand < 0.6) {
          shift = {
            id: `${emp.id}-${dateStr}`,
            employeeId: emp.id,
            employee: emp.name,
            date: dateStr,
            startTime: '08:00',
            endTime: '16:00',
            type: 'ochtend',
            location: 'Winkel',
            createdById: '4',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        } else {
          shift = {
            id: `${emp.id}-${dateStr}`,
            employeeId: emp.id,
            employee: emp.name,
            date: dateStr,
            startTime: '14:00',
            endTime: '22:00',
            type: 'avond',
            location: 'Winkel',
            createdById: '4',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        }
      }
      
      shifts.push(shift);
    });
  }
  
  return shifts;
}

// Get shifts for a date range
export const getShifts: RequestHandler = async (req, res) => {
  try {
    const { startDate, endDate, employeeId } = req.query;

    let query = supabase
      .from('shifts')
      .select(`
        *,
        employee:users!shifts_employee_id_fkey(id, name),
        created_by:users!shifts_created_by_id_fkey(id, name)
      `)
      .order('date', { ascending: true });

    // Apply date filters
    if (startDate) {
      query = query.gte('date', startDate);
    }

    if (endDate) {
      query = query.lte('date', endDate);
    }

    if (employeeId && employeeId !== 'all') {
      // Map simple ID to UUID if needed
      const userIdMap: { [key: string]: string } = {
        '1': '550e8400-e29b-41d4-a716-446655440001',
        '2': '550e8400-e29b-41d4-a716-446655440002',
        '3': '550e8400-e29b-41d4-a716-446655440003',
        '4': '550e8400-e29b-41d4-a716-446655440004',
        '5': '550e8400-e29b-41d4-a716-446655440005'
      };
      const mappedEmployeeId = userIdMap[employeeId as string] || employeeId;
      query = query.eq('employee_id', mappedEmployeeId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error fetching shifts:', error);
      // Fallback to mock data
      let filteredShifts = [...mockShifts];

      // If no shifts exist for the requested date range, generate them
      if (startDate && !mockShifts.some(s => s.date >= startDate)) {
        const generatedShifts = generateWeekShifts(startDate as string);
        mockShifts.push(...generatedShifts);
        filteredShifts = [...mockShifts];
      }

      // Apply filters
      if (startDate) {
        filteredShifts = filteredShifts.filter(shift => shift.date >= startDate);
      }

      if (endDate) {
        filteredShifts = filteredShifts.filter(shift => shift.date <= endDate);
      }

      if (employeeId && employeeId !== 'all') {
        filteredShifts = filteredShifts.filter(shift => shift.employeeId === employeeId);
      }

      return res.json({
        success: true,
        data: filteredShifts
      });
    }

    // Transform Supabase data to frontend format
    const reverseUserIdMap: { [key: string]: string } = {
      '550e8400-e29b-41d4-a716-446655440001': '1',
      '550e8400-e29b-41d4-a716-446655440002': '2',
      '550e8400-e29b-41d4-a716-446655440003': '3',
      '550e8400-e29b-41d4-a716-446655440004': '4',
      '550e8400-e29b-41d4-a716-446655440005': '5'
    };

    const transformedShifts: Shift[] = data?.map(shift => ({
      id: shift.id,
      employeeId: reverseUserIdMap[shift.employee_id] || shift.employee_id,
      employee: shift.employee?.name || 'Unknown',
      date: shift.date,
      startTime: shift.start_time || '',
      endTime: shift.end_time || '',
      type: shift.type,
      location: shift.location || undefined,
      notes: shift.notes || undefined,
      createdById: reverseUserIdMap[shift.created_by_id] || shift.created_by_id,
      createdAt: shift.created_at,
      updatedAt: shift.updated_at
    })) || [];

    console.log(`Fetched ${transformedShifts.length} shifts from database`);

    // If no shifts found and startDate provided, generate some mock data as fallback
    if (transformedShifts.length === 0 && startDate) {
      console.log('No shifts found in database, generating mock data');
      const generatedShifts = generateWeekShifts(startDate as string);
      return res.json({
        success: true,
        data: generatedShifts
      });
    }

    res.json(createSupabaseResponse(transformedShifts));
  } catch (error) {
    console.error('Unexpected error fetching shifts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch shifts',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get shift by ID
export const getShiftById: RequestHandler = (req, res) => {
  const { id } = req.params;
  const shift = mockShifts.find(s => s.id === id);
  
  if (!shift) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Shift not found'
    };
    return res.status(404).json(response);
  }

  const response: ApiResponse<Shift> = {
    success: true,
    data: shift
  };
  res.json(response);
};

// Create new shift
export const createShift: RequestHandler = async (req, res) => {
  try {
    console.log('Creating shift with data:', req.body);
    const shiftData: CreateShiftRequest = req.body;

    // Validate required fields
    if (!shiftData.employeeId || !shiftData.date || !shiftData.type) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: employeeId, date, and type'
      });
    }

    // Map simple user ID to UUID if needed
    const userIdMap: { [key: string]: string } = {
      '1': '550e8400-e29b-41d4-a716-446655440001',
      '2': '550e8400-e29b-41d4-a716-446655440002',
      '3': '550e8400-e29b-41d4-a716-446655440003',
      '4': '550e8400-e29b-41d4-a716-446655440004',
      '5': '550e8400-e29b-41d4-a716-446655440005'
    };

    const employeeId = userIdMap[shiftData.employeeId] || shiftData.employeeId;
    console.log('Mapped employeeId:', { original: shiftData.employeeId, mapped: employeeId });

    // Check if employee exists
    const { data: employeeExists, error: employeeError } = await supabase
      .from('users')
      .select('id, name')
      .eq('id', employeeId)
      .single();

    if (employeeError || !employeeExists) {
      console.error('Employee not found:', employeeError);
      return res.status(400).json({
        success: false,
        error: `Employee with ID ${employeeId} not found in database`
      });
    }

    console.log('Found employee:', employeeExists);

    // Get first admin user as creator, or fallback to the employee
    let creatorId = employeeId;
    const { data: adminUser } = await supabase
      .from('users')
      .select('id, name')
      .eq('role', 'admin')
      .limit(1)
      .single();

    if (adminUser) {
      creatorId = adminUser.id;
      console.log('Using admin as creator:', adminUser);
    } else {
      console.log('No admin found, using employee as creator:', employeeExists);
    }

    const insertData = {
      employee_id: employeeId,
      date: shiftData.date,
      start_time: shiftData.startTime || null,
      end_time: shiftData.endTime || null,
      type: shiftData.type,
      location: shiftData.location || null,
      notes: shiftData.notes || null,
      created_by_id: creatorId
    };

    console.log('Inserting shift data:', insertData);

    const { data, error } = await supabase
      .from('shifts')
      .insert(insertData)
      .select(`
        *,
        employee:users!shifts_employee_id_fkey(id, name),
        created_by:users!shifts_created_by_id_fkey(id, name)
      `)
      .single();

    if (error) {
      console.error('Supabase error creating shift:', error);

      // Fallback to creating mock shift
      const mockShift: Shift = {
        id: Date.now().toString(),
        employeeId: shiftData.employeeId,
        employee: employeeExists?.name || 'Unknown',
        date: shiftData.date,
        startTime: shiftData.startTime || '',
        endTime: shiftData.endTime || '',
        type: shiftData.type,
        location: shiftData.location,
        notes: shiftData.notes,
        createdById: '4',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      mockShifts.push(mockShift);

      return res.status(201).json({
        success: true,
        data: mockShift,
        message: 'Shift created successfully (using fallback)'
      });
    }

    // Reverse map UUID to simple ID for frontend compatibility
    const reverseUserIdMap: { [key: string]: string } = {
      '550e8400-e29b-41d4-a716-446655440001': '1',
      '550e8400-e29b-41d4-a716-446655440002': '2',
      '550e8400-e29b-41d4-a716-446655440003': '3',
      '550e8400-e29b-41d4-a716-446655440004': '4',
      '550e8400-e29b-41d4-a716-446655440005': '5'
    };

    const transformedShift: Shift = {
      id: data.id,
      employeeId: reverseUserIdMap[data.employee_id] || data.employee_id,
      employee: data.employee?.name || 'Unknown',
      date: data.date,
      startTime: data.start_time || '',
      endTime: data.end_time || '',
      type: data.type,
      location: data.location || undefined,
      notes: data.notes || undefined,
      createdById: reverseUserIdMap[data.created_by_id] || data.created_by_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };

    res.status(201).json(createSupabaseResponse(transformedShift, 'Shift created successfully'));
  } catch (error) {
    console.error('Unexpected error creating shift:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create shift',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update shift
export const updateShift: RequestHandler = (req, res) => {
  const { id } = req.params;
  const updates: Partial<CreateShiftRequest> = req.body;
  
  const shiftIndex = mockShifts.findIndex(s => s.id === id);
  
  if (shiftIndex === -1) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Shift not found'
    };
    return res.status(404).json(response);
  }

  // Update shift
  mockShifts[shiftIndex] = {
    ...mockShifts[shiftIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  const response: ApiResponse<Shift> = {
    success: true,
    data: mockShifts[shiftIndex],
    message: 'Shift updated successfully'
  };
  res.json(response);
};

// Delete shift
export const deleteShift: RequestHandler = (req, res) => {
  const { id } = req.params;
  
  const shiftIndex = mockShifts.findIndex(s => s.id === id);
  
  if (shiftIndex === -1) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Shift not found'
    };
    return res.status(404).json(response);
  }

  mockShifts.splice(shiftIndex, 1);

  const response: ApiResponse<null> = {
    success: true,
    message: 'Shift deleted successfully'
  };
  res.json(response);
};

// Get my schedule (current user's shifts)
export const getMySchedule: RequestHandler = (req, res) => {
  const { startDate, endDate } = req.query;
  const currentUserId = '5'; // Mock current user
  
  let myShifts = mockShifts.filter(shift => shift.employeeId === currentUserId);
  
  // Apply date filters
  if (startDate) {
    myShifts = myShifts.filter(shift => shift.date >= startDate);
  }
  
  if (endDate) {
    myShifts = myShifts.filter(shift => shift.date <= endDate);
  }
  
  // Sort by date
  myShifts.sort((a, b) => a.date.localeCompare(b.date));
  
  const response: ApiResponse<Shift[]> = {
    success: true,
    data: myShifts
  };
  
  res.json(response);
};
