// autohub/backend/scripts/seedListings.js
const Listing = require('../models/Listing');

const listings = [
    // Featured Cars
    {
      id: 'f1',
      userId: 13,
      title: '1969 Ford Mustang Fastback',
      description: 'Iconic classic muscle car, meticulously restored with a powerful V8 engine. A true head-turner.',
      price: 1315578.75,
      category: 'Car',
      condition: 'Restored',
      year: 1969,
      make: 'Ford',
      model: 'Mustang Fastback',
      mileage: '',
      location: 'Cape Town, South Africa',
      imageUrls: JSON.stringify(['https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?q=80&w=1600&auto=format&fit=crop'])
    },
    {
      id: 'civic-2020-type-r',
      userId: 14,
      title: '2020 Honda Civic Type R',
      description: 'This meticulously maintained 2020 Honda Civic Type R is a true enthusiast\'s dream, boasting high-performance modifications.',
      price: 745494.63,
      category: 'Car',
      condition: 'Used',
      year: 2020,
      make: 'Honda',
      model: 'Civic Type R',
      mileage: '',
      location: 'Cape Town, South Africa',
      imageUrls: JSON.stringify(['https://images.unsplash.com/photo-1606665813985-1dbd8f7f6b31?q=80&w=1600&auto=format&fit=crop'])
    },
    {
      id: 'f2',
      userId: 15,
      title: 'Jeep Wrangler Rubicon Unlimited',
      description: 'Fully outfitted off-road beast. Ready for any adventure.',
      price: 857757.35,
      category: 'Car',
      condition: 'New',
      year: 2023,
      make: 'Jeep',
      model: 'Wrangler Rubicon Unlimited',
      mileage: '',
      location: 'Pretoria, South Africa',
      imageUrls: JSON.stringify(['https://images.unsplash.com/photo-1519638399535-1b036603ac77?q=80&w=1600&auto=format&fit=crop'])
    },
    {
      id: 'f3',
      userId: 16,
      title: 'Audi R8 V10 plus',
      description: 'Every supercar detail engineered for maximum excitement.',
      price: 1719022.90,
      category: 'Car',
      condition: 'New',
      year: 2022,
      make: 'Audi',
      model: 'R8 V10 plus',
      mileage: '',
      location: 'Western Cape, South Africa',
      imageUrls: JSON.stringify(['https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1600&auto=format&fit=crop'])
    },
  {
    userId: 1,
    title: 'Forged Alloy Racing Wheels (Set of 4)',
    description: 'High-performance forged alloy wheels for track and street use.',
    price: 49114.94,
    category: 'Wheels',
    condition: 'New',
    year: 2023,
    make: '',
    model: '',
    mileage: '',
    location: 'Cape Town, South Africa',
    imageUrls: JSON.stringify(['https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?q=80&w=1600&auto=format&fit=crop'])
  },
  {
    userId: 2,
    title: 'Recaro Sportster CS Seats (Pair)',
    description: 'Premium racing seats for maximum comfort and support.',
    price: 26311.58,
    category: 'Seats',
    condition: 'Used - Excellent',
    year: 2022,
    make: '',
    model: '',
    mileage: '',
    location: 'Durban, South Africa',
    imageUrls: JSON.stringify(['https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=1600&auto=format&fit=crop'])
  },
  {
    userId: 3,
    title: 'Garrett GT35R Turbo Kit',
    description: 'Complete turbo kit for high boost applications.',
    price: 21049.26,
    category: 'Turbo',
    condition: 'Used - Good',
    year: 2021,
    make: '',
    model: '',
    mileage: '',
    location: 'Pretoria, South Africa',
    imageUrls: JSON.stringify(['https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=1600&auto=format&fit=crop'])
  },
  {
    userId: 4,
    title: 'Audi S5 OEM Headlights (Pair)',
    description: 'Genuine Audi S5 headlights, perfect for replacements.',
    price: 16664.00,
    category: 'Lighting',
    condition: 'New',
    year: 2022,
    make: 'Audi',
    model: 'S5',
    mileage: '',
    location: 'Johannesburg, South Africa',
    imageUrls: JSON.stringify(['https://images.unsplash.com/photo-1519638399535-1b036603ac77?q=80&w=1600&auto=format&fit=crop'])
  },
  {
    userId: 5,
    title: 'Borla Cat-Back Exhaust System',
    description: 'Performance exhaust for improved sound and power.',
    price: 780,
    category: 'Exhaust',
    condition: 'Used - Minor Scratches',
    year: 2020,
    make: 'Borla',
    model: '',
    mileage: '',
    location: 'Seattle, WA',
    imageUrls: JSON.stringify(['https://images.unsplash.com/photo-1511394181419-16f2bb1b0a42?q=80&w=1600&auto=format&fit=crop'])
  },
  {
    userId: 6,
    title: 'Carbon Fiber Rear Spoiler',
    description: 'Lightweight carbon fiber spoiler for improved aerodynamics.',
    price: 7839.47,
    category: 'Spoiler',
    condition: 'New',
    year: 2023,
    make: '',
    model: '',
    mileage: '',
    location: 'Western Cape, South Africa',
    imageUrls: JSON.stringify(['https://images.unsplash.com/photo-1523986371872-9d3ba2e2f642?q=80&w=1600&auto=format&fit=crop'])
  },
  {
    userId: 7,
    title: 'Brembo GT Brake Kit Front',
    description: 'High-performance Brembo brake kit for front axle.',
    price: 56131.36,
    category: 'Brakes',
    condition: 'Used - Good',
    year: 2021,
    make: 'Brembo',
    model: 'GT',
    mileage: '',
    location: 'Johannesburg, South Africa',
    imageUrls: JSON.stringify(['https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1600&auto=format&fit=crop'])
  },
  {
    userId: 8,
    title: 'Ohlins Road & Track Coilovers',
    description: 'Premium coilovers for street and track performance.',
    price: 36836.21,
    category: 'Suspension',
    condition: 'New',
    year: 2023,
    make: 'Ohlins',
    model: '',
    mileage: '',
    location: 'Pretoria, South Africa',
    imageUrls: JSON.stringify(['https://images.unsplash.com/photo-1519638399535-1b036603ac77?q=80&w=1600&auto=format&fit=crop'])
  },
  {
    userId: 9,
    title: 'MOMO Racing Steering Wheel',
    description: 'Classic MOMO racing wheel for motorsport applications.',
    price: 300,
    category: 'Steering',
    condition: 'New',
    year: 2022,
    make: 'MOMO',
    model: '',
    mileage: '',
    location: 'Dallas, TX',
    imageUrls: JSON.stringify(['https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?q=80&w=1600&auto=format&fit=crop'])
  },
  {
    userId: 10,
    title: 'Haltech Elite 2500 ECU',
    description: 'Advanced engine management system for custom builds.',
    price: 31573.89,
    category: 'ECU',
    condition: 'New',
    year: 2023,
    make: 'Haltech',
    model: 'Elite 2500',
    mileage: '',
    location: 'N/A',
    imageUrls: JSON.stringify(['https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=1600&auto=format&fit=crop'])
  },
  {
    userId: 11,
    title: 'BlackVue DR900X Plus Dashcam',
    description: '4K dashcam for high-quality video recording.',
    price: 6139.37,
    category: 'Dashcam',
    condition: 'New',
    year: 2023,
    make: 'BlackVue',
    model: 'DR900X Plus',
    mileage: '',
    location: 'Pretoria, South Africa',
    imageUrls: JSON.stringify(['https://images.unsplash.com/photo-1523986371872-9d3ba2e2f642?q=80&w=1600&auto=format&fit=crop'])
  },
  {
    userId: 12,
    title: 'JL Audio 12W6v3 Subwoofer',
    description: 'Powerful subwoofer for deep bass in your car audio system.',
    price: 10254.63,
    category: 'Audio',
    condition: 'New',
    year: 2023,
    make: 'JL Audio',
    model: '12W6v3',
    mileage: '',
    location: 'Western Cape, South Africa',
    imageUrls: JSON.stringify(['https://images.unsplash.com/photo-1511394181419-16f2bb1b0a42?q=80&w=1600&auto=format&fit=crop'])
  }
];

listings.forEach((listing) => {
  Listing.create(listing, (err, result) => {
    if (err) {
      console.error('Error inserting listing:', listing.title, err);
    } else {
      console.log('Inserted listing:', listing.title);
    }
  });
});
