/**
 * @legacy MARKETPLACE_LMS — Seeds Course/Lesson + demo teacher. Curriculum seed: scripts/seed-curriculum.ts
 * See docs/AI_FIRST_MIGRATION.md
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../src/models/Course';
import Lesson from '../src/models/Lesson';
import User from '../src/models/User';

dotenv.config();

async function seed() {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) throw new Error("MONGO_URI not found");

    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to DB');

    // 1. Clean existing data (Optional: keeps DB clean while testing)
    await Course.deleteMany({});
    await Lesson.deleteMany({});
    console.log('🧹 Cleared old Courses & Lessons');

    // 2. Find or Create a Teacher
    let teacher = await User.findOne({ email: 'teacher@test.com' });
    if (!teacher) {
      const password = 'password123'; // Simple password for testing
      teacher = await User.create({
        name: 'Dr. Smith',
        email: 'teacher@test.com',
        password: password,
        role: 'Teacher',
      });
      console.log('👨‍🏫 Created Teacher User');
    }

    // 3. Create Courses
    const courses = [
      {
        title: 'Introduction to Algebra',
        description: 'Master the basics of equations and variables.',
        teacherId: teacher._id,
        category: 'Math',
        image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80'
      },
      {
        title: 'Biology 101',
        description: 'Explore the fundamentals of living organisms.',
        teacherId: teacher._id,
        category: 'Science',
        image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80'
      },
      {
        title: 'History of Art',
        description: 'A visual journey through the Renaissance.',
        teacherId: teacher._id,
        category: 'Art',
        image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80'
      }
    ];

    const createdCourses = await Course.insertMany(courses);
    console.log(`📚 Created ${createdCourses.length} courses`);

    // 4. Create Lessons for the first course
    const lessons = [
      { title: 'Variables and Constants', content: 'Content for lesson 1...', courseId: createdCourses[0]._id, order: 1 },
      { title: 'Solving Simple Equations', content: 'Content for lesson 2...', courseId: createdCourses[0]._id, order: 2 },
      { title: 'Quadratic Equations', content: 'Content for lesson 3...', courseId: createdCourses[0]._id, order: 3 }
    ];

    await Lesson.insertMany(lessons);
    console.log(`📝 Created lessons for ${createdCourses[0].title}`);

    console.log('🎉 Seeding complete!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();