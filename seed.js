const mongoose = require('mongoose');

const uri = "mongodb://docappoint:K07f7Kwz2nVzpdTj@ac-ppqx0gr-shard-00-00.9iyx4gw.mongodb.net:27017,ac-ppqx0gr-shard-00-01.9iyx4gw.mongodb.net:27017,ac-ppqx0gr-shard-00-02.9iyx4gw.mongodb.net:27017/docappoint?ssl=true&replicaSet=atlas-mxi3f3-shard-0&authSource=admin&appName=Cluster0";

const doctorsData = [
  {
    id: "d1",
    name: "Dr. Ayesha Rahman",
    specialty: "Cardiologist",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=250&auto=format&fit=crop",
    experience: "10 years",
    availability: ["09:00 AM - 12:00 PM", "04:00 PM - 07:00 PM"],
    description: "Highly experienced cardiologist specializing in heart diseases, preventive care, and patient-centered treatment. Dedicated to providing the best possible care.",
    hospital: "Labaid Cardiac Hospital",
    location: "Dhanmondi, Dhaka",
    fee: 800,
    rating: 4.8,
    reviews: 120
  },
  {
    id: "d2",
    name: "Dr. Syed Hasan",
    specialty: "Neurologist",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=250&auto=format&fit=crop",
    experience: "15 years",
    availability: ["10:00 AM - 01:00 PM", "05:00 PM - 08:00 PM"],
    description: "Expert in treating disorders of the nervous system. Provides comprehensive diagnostic and therapeutic services for neurological conditions.",
    hospital: "Square Hospital",
    location: "Panthapath, Dhaka",
    fee: 1000,
    rating: 4.9,
    reviews: 85
  },
  {
    id: "d3",
    name: "Dr. Farhana Islam",
    specialty: "Dermatologist",
    image: "https://images.unsplash.com/photo-1594824432252-c0e086f6d4d1?q=80&w=250&auto=format&fit=crop",
    experience: "8 years",
    availability: ["11:00 AM - 02:00 PM", "06:00 PM - 09:00 PM"],
    description: "Specializes in diagnosing and treating skin, hair, and nail conditions. Focuses on helping patients achieve healthy, glowing skin.",
    hospital: "Apollo Hospital",
    location: "Bashundhara, Dhaka",
    fee: 700,
    rating: 4.7,
    reviews: 200
  },
  {
    id: "d4",
    name: "Dr. Kamal Hossain",
    specialty: "Orthopedic",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=250&auto=format&fit=crop",
    experience: "12 years",
    availability: ["08:00 AM - 12:00 PM", "03:00 PM - 06:00 PM"],
    description: "Specialized in musculoskeletal system issues, sports injuries, and joint replacement surgeries. Ensures patients regain optimal mobility.",
    hospital: "Ibn Sina Hospital",
    location: "Mirpur, Dhaka",
    fee: 900,
    rating: 4.6,
    reviews: 150
  },
  {
    id: "d5",
    name: "Dr. Nusrat Jahan",
    specialty: "Pediatrician",
    image: "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?q=80&w=250&auto=format&fit=crop",
    experience: "7 years",
    availability: ["09:00 AM - 01:00 PM", "04:00 PM - 08:00 PM"],
    description: "Caring and compassionate pediatrician. Focuses on the physical, emotional, and social health of children from birth to young adulthood.",
    hospital: "United Hospital",
    location: "Gulshan, Dhaka",
    fee: 600,
    rating: 4.9,
    reviews: 310
  },
  {
    id: "d6",
    name: "Dr. Rahman Khan",
    specialty: "General Surgeon",
    image: "https://images.unsplash.com/photo-1537368910025-70280458b4f9?q=80&w=250&auto=format&fit=crop",
    experience: "20 years",
    availability: ["10:00 AM - 02:00 PM", "05:00 PM - 09:00 PM"],
    description: "Highly experienced general surgeon. Provides expert surgical care for a wide range of diseases and conditions.",
    hospital: "BIRDEM General Hospital",
    location: "Shahbag, Dhaka",
    fee: 1200,
    rating: 4.8,
    reviews: 420
  }
];

const Doctor = mongoose.model('Doctor', new mongoose.Schema({}, { strict: false }));

async function seedData() {
    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            family: 4,
        });
        console.log("Connected to MongoDB for seeding...");
        
        // Clear existing just in case
        await Doctor.deleteMany({});
        console.log("Old doctors cleared.");

        // Insert new ones
        await Doctor.insertMany(doctorsData);
        console.log("Doctors inserted successfully!");

        process.exit();
    } catch (err) {
        console.error("Error seeding data:", err);
        process.exit(1);
    }
}

seedData();
