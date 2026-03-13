# Admin Dashboard Setup Guide

This admin dashboard provides comprehensive appointment booking management for Vegas Estudio.

## Features

- **Booking Status Control**: Toggle availability of appointment slots on/off
- **Appointments Management**: View all upcoming appointments sorted by date and time
- **Filter & Search**: Filter appointments by status (confirmed, completed, cancelled) and date
- **Business Hours**: Display and manage business hours
- **Statistics**: View appointment counts by status
- **Export**: Download appointments as CSV file

## Database Setup

### Step 1: Create Tables in Supabase

Run the following SQL in your Supabase SQL editor:

```sql
-- Create admin_settings table
CREATE TABLE admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_booking_open BOOLEAN DEFAULT true,
  business_hours_start TIME DEFAULT '09:30:00',
  business_hours_end TIME DEFAULT '20:00:00',
  closed_dates TEXT[] DEFAULT ARRAY[]::TEXT[],
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  user_name VARCHAR(255) NOT NULL,
  user_email VARCHAR(255),
  user_phone VARCHAR(20),
  service_ids TEXT[] NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'confirmed',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_date_time ON appointments(appointment_date, appointment_time);

-- Insert default settings
INSERT INTO admin_settings (is_booking_open) VALUES (true);
```

### Step 2: Enable Row-Level Security (RLS)

```sql
-- Enable RLS on tables
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access (adjust email domain as needed)
CREATE POLICY "Admin can view settings" ON admin_settings
  FOR SELECT USING (auth.jwt() ->> 'email' LIKE '%@vegas-estudio.com');

CREATE POLICY "Admin can update settings" ON admin_settings
  FOR UPDATE USING (auth.jwt() ->> 'email' LIKE '%@vegas-estudio.com');

CREATE POLICY "Anyone can view appointments" ON appointments
  FOR SELECT USING (true);

CREATE POLICY "System can insert appointments" ON appointments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can update appointments" ON appointments
  FOR UPDATE USING (auth.jwt() ->> 'email' LIKE '%@vegas-estudio.com');
```

## Environment Variables

Ensure these environment variables are set in your `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Accessing the Admin Dashboard

Navigate to `/admin` to access the dashboard. The page includes:

### 1. **Availability Management Card**
- Current booking status (Open/Closed)
- Toggle button to open/close bookings
- Requires confirmation before changes

### 2. **Statistics Cards**
- Total appointments count
- Business hours display
- Quick status overview

### 3. **Filters Section**
- Filter by appointment status
- Filter by date
- Clear all filters option

### 4. **Appointments Table**
- Complete list of all appointments
- Sortable by date and time
- Status badges with color coding:
  - **Green**: Confirmed
  - **Gray**: Completed
  - **Red**: Cancelled
- Export to CSV button

## API Endpoints

### Appointments API (`/api/appointments`)

**GET** - Fetch appointments
```javascript
GET /api/appointments?status=confirmed&date=2024-12-25
```

**POST** - Create new appointment
```javascript
POST /api/appointments
{
  "user_id": "uuid",
  "user_name": "John Doe",
  "user_email": "john@example.com",
  "user_phone": "+57 300 000 0000",
  "service_ids": ["corte", "barba"],
  "appointment_date": "2024-12-25",
  "appointment_time": "10:30",
  "duration_minutes": 50,
  "notes": "Optional notes"
}
```

**PATCH** - Update appointment
```javascript
PATCH /api/appointments
{
  "id": "appointment-uuid",
  "status": "completed",
  "notes": "Updated notes"
}
```

**DELETE** - Cancel appointment
```javascript
DELETE /api/appointments?id=appointment-uuid
```

### Admin Settings API (`/api/admin/settings`)

**GET** - Fetch settings
```javascript
GET /api/admin/settings
```

**PATCH** - Update settings
```javascript
PATCH /api/admin/settings
{
  "is_booking_open": true,
  "business_hours_start": "09:30",
  "business_hours_end": "20:00",
  "closed_dates": ["2024-12-25", "2024-12-26"]
}
```

## Appointment Statuses

- **confirmed** - Appointment is scheduled and confirmed
- **completed** - Appointment has been completed
- **cancelled** - Appointment was cancelled

## Data Models

### Admin Settings
```typescript
interface AdminSettings {
  id: string
  is_booking_open: boolean
  business_hours_start: string // HH:MM format
  business_hours_end: string // HH:MM format
  closed_dates: string[] // YYYY-MM-DD format
  updated_at: string
  created_at: string
}
```

### Appointment
```typescript
interface Appointment {
  id: string
  user_id?: string
  user_name: string
  user_email?: string
  user_phone: string
  service_ids: string[]
  appointment_date: string // YYYY-MM-DD
  appointment_time: string // HH:MM
  duration_minutes: number
  status: 'confirmed' | 'completed' | 'cancelled'
  notes?: string
  created_at: string
  updated_at: string
}
```

## Security Considerations

1. **Authentication**: Protect the `/admin` route with authentication middleware
2. **Authorization**: Only admins should be able to modify settings
3. **CORS**: Configure CORS appropriately for your domain
4. **Rate Limiting**: Implement rate limiting on API endpoints
5. **Validation**: All inputs are validated on both client and server

## Troubleshooting

### Database Connection Issues
- Verify Supabase credentials are correct
- Check database tables exist
- Ensure RLS policies are configured

### Appointments Not Loading
- Check browser console for API errors
- Verify appointments table exists
- Confirm Supabase service role key has access

### Booking Toggle Not Working
- Ensure admin_settings table has default row
- Check Supabase RLS policies
- Verify service role key permissions

## Future Enhancements

- Admin authentication/login page
- Appointment editing interface
- Email notifications for bookings
- SMS reminders
- Recurring appointment templates
- Staff management
- Service availability scheduling
- Revenue analytics
