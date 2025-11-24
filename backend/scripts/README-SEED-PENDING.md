# Seed Pending Vehicles for Presentation

This script adds mock vehicles to the database in **pending** status, ready for admin approval.

## Quick Start

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Run the seed script:**
   ```bash
   npm run seed:pending
   ```

   Or directly with ts-node:
   ```bash
   npx ts-node scripts/seed-pending-vehicles.ts
   ```

## What This Script Does

- Creates **8 mock vehicles** in `pending` status
- Uses an existing host user (or creates a demo host if none exists)
- Vehicles include:
  - Toyota Corolla Cross (SUV)
  - BMW 3 Series (Luxury)
  - Ford Ranger (Truck)
  - Mercedes-Benz C-Class (Luxury)
  - Volkswagen Polo (Car)
  - Toyota Hilux (Truck)
  - Audi Q5 (SUV)
  - Hyundai Tucson (SUV)

## Workflow for Presentation

1. **Run the seed script** to add pending vehicles
2. **Log in as admin** in the frontend
3. **Go to Admin Dashboard** - you'll see all pending vehicles
4. **Approve vehicles** - click approve on each vehicle
5. **After approval:**
   - Vehicles status changes to `approved`
   - `is_available` is set to `true`
   - Vehicles appear in search results
   - Renters can now book these vehicles

## Vehicle Details

All vehicles include:
- Make, model, year
- Price per day (R350 - R1500)
- City location (Cape Town, Johannesburg, Durban, etc.)
- Features (AC, Bluetooth, GPS, etc.)
- Images (using Unsplash URLs)
- Fuel type, transmission, seats, mileage

## Database Status

- **Status**: `pending` (waiting for approval)
- **Approved**: `false`
- **is_available**: `false` (until approved)

## Notes

- The script will not create duplicate vehicles if run multiple times
- If no host user exists, a demo host will be created automatically
- All vehicles are set to `pending` status for admin approval workflow demonstration







