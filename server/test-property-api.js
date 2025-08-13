const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function testPropertyAPI() {
  try {
    console.log('🧪 Testing Property API...\n');

    // Step 1: Login to get auth token
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'Admin@123456',
    });
    const authToken = loginResponse.data.token;
    console.log('✅ Login successful\n');

    // Configure axios with auth header
    const api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    // Step 2: Create a property
    console.log('2️⃣ Creating a new property...');
    const propertyData = {
      name: 'Luxury Beach Villa',
      address: {
        apartmentOrFloorNumber: '5A',
        countryOrRegion: 'UAE',
        city: 'Dubai',
        zipCode: 12345,
        latLong: {
          latitude: 25.2048,
          longitude: 55.2708,
        },
      },
      layout: {
        maximumGuest: 8,
        bathrooms: 3,
        allowChildren: true,
        offerCribs: true,
        propertySizeSqMtr: 250,
        rooms: [
          {
            spaceName: 'Master Bedroom',
            beds: [
              {
                typeOfBed: 'KingBed',
                numberOfBed: 1,
              },
            ],
          },
          {
            spaceName: 'Guest Room 1',
            beds: [
              {
                typeOfBed: 'TwinBed',
                numberOfBed: 2,
              },
            ],
          },
        ],
      },
      amenities: [
        {
          name: 'Swimming Pool',
          category: 'Outdoor',
        },
        {
          name: 'WiFi',
          category: 'Technology',
        },
        {
          name: 'Air Conditioning',
          category: 'Comfort',
        },
      ],
      services: {
        serveBreakfast: true,
        parking: 'YesFree',
        languages: ['English', 'Arabic'],
      },
      rules: {
        smokingAllowed: false,
        partiesOrEventsAllowed: false,
        petsAllowed: 'No',
        checkInCheckout: {
          checkInFrom: '14:00',
          checkInUntil: '22:00',
          checkOutFrom: '08:00',
          checkOutUntil: '12:00',
        },
      },
      photos: [
        {
          url: 'https://example.com/photo1.jpg',
          altText: 'Villa exterior',
          description: 'Beautiful villa exterior with pool',
          tags: ['exterior', 'pool'],
        },
      ],
      bookingType: 'BookInstantly',
      paymentType: 'Online',
      pricing: {
        currency: 'AED',
        ratePerNight: 1500,
        ratePerNightWeekend: 2000,
        discountPercentageForNonRefundableRatePlan: 15,
        discountPercentageForWeeklyRatePlan: 10,
        promotion: {
          type: 'Early Bird',
          percentage: 20,
          description: 'Book 30 days in advance and save 20%',
        },
      },
      cancellation: {
        daysBeforeArrivalFreeToCancel: 7,
        waiveCancellationFeeAccidentalBookings: true,
      },
      aboutTheProperty: 'A luxurious beachfront villa with stunning ocean views',
      aboutTheNeighborhood: 'Located in the heart of Dubai Marina',
      firstDateGuestCanCheckIn: '2024-01-01',
    };

    const createResponse = await api.post('/properties', propertyData);
    const createdProperty = createResponse.data.property;
    console.log('✅ Property created:', createdProperty.propertyId, '\n');

    // Step 3: Get property by ID
    console.log('3️⃣ Fetching property by ID...');
    const getResponse = await api.get(`/properties/${createdProperty.propertyId}`);
    console.log('✅ Property fetched successfully\n');

    // Step 4: Update property basic info
    console.log('4️⃣ Updating property basic info...');
    const updateData = {
      name: 'Premium Beach Villa',
      aboutTheProperty: 'An upgraded luxurious beachfront villa with stunning ocean views',
    };
    await api.put(`/properties/${createdProperty.propertyId}`, updateData);
    console.log('✅ Property updated successfully\n');

    // Step 5: Update property pricing
    console.log('5️⃣ Updating property pricing...');
    const pricingUpdate = {
      currency: 'AED',
      ratePerNight: 1600,
      ratePerNightWeekend: 2100,
    };
    await api.put(`/properties/${createdProperty.propertyId}/pricing`, pricingUpdate);
    console.log('✅ Property pricing updated successfully\n');

    // Step 6: Get all properties for owner
    console.log('6️⃣ Fetching all properties for current user...');
    const myPropertiesResponse = await api.get('/properties/my-properties');
    console.log(`✅ Found ${myPropertiesResponse.data.properties.length} properties\n`);

    // Step 7: Delete property
    console.log('7️⃣ Deleting property...');
    await api.delete(`/properties/${createdProperty.propertyId}`);
    console.log('✅ Property deleted successfully\n');

    console.log('🎉 All Property API tests passed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run the tests
testPropertyAPI();