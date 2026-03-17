import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseKey)

// Admin settings
export async function getAdminSettings() {
  try {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('*')
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching admin settings:', error)
    return null
  }
}

export async function updateBookingStatus(isOpen: boolean) {
  try {
    const { data, error } = await supabase
      .from('admin_settings')
      .update({ is_booking_open: isOpen, updated_at: new Date().toISOString() })
      .eq('id', (await getAdminSettings())?.id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating booking status:', error)
    return null
  }
}

// Appointments
export async function getAppointments(filter?: { status?: string; date?: string }) {
  try {
    let query = supabase.from('appointments').select('*')

    if (filter?.status) {
      query = query.eq('status', filter.status)
    }
    if (filter?.date) {
      query = query.eq('appointment_date', filter.date)
    }

    const { data, error } = await query
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching appointments:', error)
    return []
  }
}

export async function createAppointment(appointmentData: {
  user_id?: string
  user_name: string
  user_email?: string
  user_phone: string
  service_ids: string[]
  appointment_date: string
  appointment_time: string
  duration_minutes: number
  notes?: string
}) {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .insert([appointmentData])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating appointment:', error)
    return null
  }
}

export async function updateAppointment(
  id: string,
  updates: {
    status?: string
    notes?: string
    appointment_date?: string
    appointment_time?: string
  }
) {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating appointment:', error)
    return null
  }
}

export async function deleteAppointment(id: string) {
  try {
    const { error } = await supabase.from('appointments').delete().eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting appointment:', error)
    return false
  }
}

// Business hours
export async function updateBusinessHours(
  startTime: string,
  endTime: string
) {
  try {
    const settings = await getAdminSettings()
    if (!settings) return null

    const { data, error } = await supabase
      .from('admin_settings')
      .update({
        business_hours_start: startTime,
        business_hours_end: endTime,
        updated_at: new Date().toISOString(),
      })
      .eq('id', settings.id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating business hours:', error)
    return null
  }
}

// Closed dates
export async function addClosedDate(date: string) {
  try {
    const settings = await getAdminSettings()
    if (!settings) return null

    const closedDates = settings.closed_dates || []
    if (!closedDates.includes(date)) {
      closedDates.push(date)
    }

    const { data, error } = await supabase
      .from('admin_settings')
      .update({ closed_dates: closedDates, updated_at: new Date().toISOString() })
      .eq('id', settings.id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error adding closed date:', error)
    return null
  }
}

export async function removeClosedDate(date: string) {
  try {
    const settings = await getAdminSettings()
    if (!settings) return null

    const closedDates = (settings.closed_dates || []).filter((d: string) => d !== date)

    const { data, error } = await supabase
      .from('admin_settings')
      .update({ closed_dates: closedDates, updated_at: new Date().toISOString() })
      .eq('id', settings.id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error removing closed date:', error)
    return null
  }
}
export async function uploadServiceImage(file: File): Promise<string | null> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('vegas_token') : null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

    console.log('[supabase] uploading file via backend bridge:', fileName);

    // Convert file to base64
    const base64Content = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result.split(',')[1]); // Extract base64 part
        } else {
          reject(new Error('Failed to convert file to string'));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const res = await fetch(`${apiUrl}/admin/services/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        fileName,
        fileType: file.type,
        content: base64Content
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || 'Failed to upload image via backend');
    }

    const { publicUrl } = await res.json();
    return publicUrl;
  } catch (error) {
    console.error('Error uploading service image:', error)
    return null
  }
}
