import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Location from '../models/Location.js';
import connectDB from '../config/db.js';

dotenv.config();

export const seedLocations = [
  // Hostels
  {
    name: '1.8K Hostel (Mega Hostel)',
    category: 'Hostels',
    lat: 17.9848,
    lng: 79.5325,
    description: 'Mega Hostel (1.8K capacity) for B.Tech senior students with high-speed Wi-Fi and amenities.',
  },
  {
    name: 'Dr. B.R. Ambedkar Learning Centre (ALC)',
    category: 'Departments',
    lat: 17.9835,
    lng: 79.5310,
    description: 'Central lecture hall complex, auditorium, seminar suites, and academic learning centre named after Dr. B.R. Ambedkar.',
  },
  {
    name: 'Hostel A',
    category: 'Hostels',
    lat: 17.9828,
    lng: 79.5332,
    description: 'B.Tech student accommodation block with central courtyard.',
  },
  {
    name: 'Hostel B',
    category: 'Hostels',
    lat: 17.9822,
    lng: 79.5340,
    description: 'Hostel block B near the sports arena and outdoor courts.',
  },
  {
    name: 'Priyadarshini Ladies Hostel (LH)',
    category: 'Hostels',
    lat: 17.9815,
    lng: 79.5265,
    description: 'Secure women residential complex with green courtyards.',
  },
  {
    name: 'Sarojini Ladies Hostel',
    category: 'Hostels',
    lat: 17.9821,
    lng: 79.5270,
    description: 'Ladies hostel block adjacent to LH dining hall.',
  },
  {
    name: 'Vikram Sarabhai PG Hostel',
    category: 'Hostels',
    lat: 17.9842,
    lng: 79.5345,
    description: 'Postgraduate (M.Tech) and Research Scholar residential quarters.',
  },

  // Mess
  {
    name: 'IFC A (International Food Court A)',
    category: 'Mess',
    lat: 17.9840,
    lng: 79.5320,
    description: 'Main dining hall serving vegetarian and non-vegetarian menus.',
  },
  {
    name: 'IFC B (Food Court B)',
    category: 'Mess',
    lat: 17.9843,
    lng: 79.5315,
    description: 'Mess facility catering primarily to 1st & 2nd year students.',
  },
  {
    name: 'IFC C (Food Court C)',
    category: 'Mess',
    lat: 17.9837,
    lng: 79.5328,
    description: 'Dining hall with South & North Indian culinary counters.',
  },
  {
    name: 'Ladies Hostel Mess',
    category: 'Mess',
    lat: 17.9818,
    lng: 79.5268,
    description: 'Dedicated dining hall and breakfast lounge for LH residents.',
  },

  // Academic & Departments
  {
    name: 'Central Building (Admin Block)',
    category: 'Departments',
    lat: 17.9782,
    lng: 79.5318,
    description: 'Director office, Registrar, Dean Academics, and Senate hall.',
  },
  {
    name: 'Central Library',
    category: 'Departments',
    lat: 17.9790,
    lng: 79.5308,
    description: 'State-of-the-art 3-storey digital library with reading halls and e-journals.',
  },
  {
    name: 'Dept of Computer Science & Engineering (CSE)',
    category: 'Departments',
    lat: 17.9775,
    lng: 79.5298,
    description: 'Department of CSE, AI & Data Science labs, and High Performance Computing center.',
  },
  {
    name: 'Dept of Electrical & Electronics Engineering (EEE)',
    category: 'Departments',
    lat: 17.9770,
    lng: 79.5312,
    description: 'EEE department, Smart Grid lab, and Power Electronics facilities.',
  },
  {
    name: 'Dept of Electronics & Communication (ECE)',
    category: 'Departments',
    lat: 17.9780,
    lng: 79.5290,
    description: 'ECE department, VLSI design suite, and IoT development laboratory.',
  },
  {
    name: 'Dept of Mechanical Engineering',
    category: 'Departments',
    lat: 17.9765,
    lng: 79.5325,
    description: 'Mechanical workshop, Robotics research lab, and CAD/CAM center.',
  },
  {
    name: 'Dept of Civil Engineering',
    category: 'Departments',
    lat: 17.9760,
    lng: 79.5310,
    description: 'Civil Engineering department, Geotechnical lab, and Heritage structure.',
  },
  {
    name: 'Dept of Chemical Engineering',
    category: 'Departments',
    lat: 17.9758,
    lng: 79.5332,
    description: 'Chemical process engineering labs and petroleum research center.',
  },
  {
    name: 'Dept of Biotechnology',
    category: 'Departments',
    lat: 17.9752,
    lng: 79.5320,
    description: 'Biotechnology laboratories, genetics suite, and bio-incubation cell.',
  },

  // Others & Landmarks
  {
    name: 'Taza Food Court',
    category: 'Others',
    lat: 17.9796,
    lng: 79.5302,
    description: 'Popular campus cafeteria serving fresh meals, shakes, and beverages.',
  },
  {
    name: 'NITW Main Entrance Gate',
    category: 'Others',
    lat: 17.9750,
    lng: 79.5285,
    description: 'Main Entrance Gate on Kazipet-Warangal Highway with security post.',
  },
  {
    name: 'Student Activity Centre (SAC)',
    category: 'Others',
    lat: 17.9802,
    lng: 79.5330,
    description: 'Hub for student clubs, indoor badminton courts, gym, and music room.',
  },
  {
    name: 'NITW Sports Stadium & Athletics Track',
    category: 'Others',
    lat: 17.9810,
    lng: 79.5350,
    description: 'Multi-purpose stadium, cricket pavilion, and synthetic tennis courts.',
  },
  {
    name: 'Campus Health Centre (Dispensary)',
    category: 'Others',
    lat: 17.9808,
    lng: 79.5295,
    description: '24/7 campus hospital offering medical care, pharmacy, and ambulance.',
  },
  {
    name: 'Innovation Garage (IG)',
    category: 'Others',
    lat: 17.9788,
    lng: 79.5322,
    description: 'Student-run makerspace, 3D printing lab, and startup incubator.',
  },
];

const seedDB = async () => {
  try {
    await connectDB();
    console.log('Clearing existing locations...');
    await Location.deleteMany({});
    console.log('Inserting seed locations...');
    const inserted = await Location.insertMany(seedLocations);
    console.log(`✨ Successfully seeded ${inserted.length} campus locations!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Execute if run directly
if (process.argv[1]?.endsWith('seed.js')) {
  seedDB();
}
