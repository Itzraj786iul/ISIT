import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function seed() {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) throw new Error('MONGO_URI not found');
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db!;

  // 1. Create Organization
  let org = await db.collection('organizations').findOne({});
  if (!org) {
    const res = await db.collection('organizations').insertOne({
      name: 'ISIT - Indian School of Innovation and Thinking',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    org = { _id: res.insertedId, name: 'ISIT' };
    console.log('Created organization');
  }
  const orgId = org._id;

  // 2. Update all users to have organization_id and hash passwords
  const users = await db.collection('users').find({}).toArray();
  const defaultHash = await bcrypt.hash('P@55w0rd', 10);

  for (const user of users) {
    const update: Record<string, unknown> = {};
    if (!user.organization_id) update.organization_id = orgId;
    if (!user.password_hash || user.password_hash.length === 0) update.password_hash = defaultHash;
    if (Object.keys(update).length > 0) {
      await db.collection('users').updateOne({ _id: user._id }, { $set: update });
      console.log(`Updated user: ${user.email}`);
    }
  }

  // 3. Create student profiles for all students
  const students = await db.collection('users').find({ role: 'Student' }).toArray();
  for (const student of students) {
    const exists = await db.collection('studentprofiles').findOne({ user_id: student._id });
    if (!exists) {
      await db.collection('studentprofiles').insertOne({
        organization_id: orgId,
        user_id: student._id,
        grade: '10',
        board: 'CBSE',
        learning_preferences: {},
        completedLessons: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`Created student profile for: ${student.email}`);
    }
  }

  // 4. Create teacher records
  const teachers = await db.collection('users').find({ role: 'Teacher' }).toArray();
  for (const teacher of teachers) {
    const exists = await db.collection('teachers').findOne({ user_id: teacher._id });
    if (!exists) {
      await db.collection('teachers').insertOne({
        organization_id: orgId,
        user_id: teacher._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`Created teacher record for: ${teacher.email}`);
    }
  }

  // 5. Seed Subjects
  const subjectsData = [
    { name: 'Mathematics', grade: '10', board: 'CBSE', description: 'CBSE Class 10 Mathematics covering algebra, geometry, trigonometry, statistics, and more.', academic_year: '2025-2026', status: 'published' },
    { name: 'Science', grade: '10', board: 'CBSE', description: 'CBSE Class 10 Science covering physics, chemistry, and biology fundamentals.', academic_year: '2025-2026', status: 'published' },
    { name: 'English', grade: '10', board: 'CBSE', description: 'CBSE Class 10 English covering literature, grammar, and writing skills.', academic_year: '2025-2026', status: 'published' },
    { name: 'Social Science', grade: '10', board: 'CBSE', description: 'CBSE Class 10 Social Science covering history, geography, political science, and economics.', academic_year: '2025-2026', status: 'published' },
  ];

  const subjectIds: Record<string, mongoose.Types.ObjectId> = {};
  for (const s of subjectsData) {
    let existing = await db.collection('subjects').findOne({ organization_id: orgId, name: s.name, grade: s.grade });
    if (!existing) {
      const res = await db.collection('subjects').insertOne({
        organization_id: orgId,
        ...s,
        curriculum_version: '1.0',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      subjectIds[s.name] = res.insertedId as unknown as mongoose.Types.ObjectId;
      console.log(`Created subject: ${s.name}`);
    } else {
      subjectIds[s.name] = existing._id as unknown as mongoose.Types.ObjectId;
    }
  }

  // 6. Seed Topics for Mathematics
  const mathTopics = [
    { topic_name: 'Real Numbers', topic_description: 'Euclid\'s division lemma, Fundamental Theorem of Arithmetic, irrational numbers, rational numbers and their decimal expansions.', learning_objectives: ['Understand Euclid\'s division algorithm', 'Apply Fundamental Theorem of Arithmetic', 'Prove irrationality of square roots'], key_concepts: ['HCF', 'LCM', 'Euclid\'s division lemma', 'Irrational numbers'], difficulty_level: 'beginner', estimated_time: 45 },
    { topic_name: 'Polynomials', topic_description: 'Zeros of a polynomial, relationship between zeros and coefficients, division algorithm for polynomials.', learning_objectives: ['Find zeros of quadratic polynomials', 'Understand relationship between zeros and coefficients', 'Apply division algorithm'], key_concepts: ['Linear polynomial', 'Quadratic polynomial', 'Zeros', 'Division algorithm'], difficulty_level: 'intermediate', estimated_time: 50 },
    { topic_name: 'Pair of Linear Equations in Two Variables', topic_description: 'Graphical and algebraic methods to solve pairs of linear equations.', learning_objectives: ['Solve by graphical method', 'Solve by substitution and elimination', 'Identify consistent and inconsistent systems'], key_concepts: ['Substitution method', 'Elimination method', 'Cross-multiplication', 'Consistent systems'], difficulty_level: 'intermediate', estimated_time: 60 },
    { topic_name: 'Quadratic Equations', topic_description: 'Standard form, solution by factorization, completing the square, quadratic formula, and nature of roots.', learning_objectives: ['Solve quadratic equations by factorization', 'Apply the quadratic formula', 'Determine nature of roots using discriminant'], key_concepts: ['Discriminant', 'Factorization', 'Quadratic formula', 'Roots'], difficulty_level: 'intermediate', estimated_time: 55 },
    { topic_name: 'Arithmetic Progressions', topic_description: 'nth term, sum of first n terms of an AP and their applications.', learning_objectives: ['Find nth term of AP', 'Calculate sum of n terms', 'Solve real-life problems using AP'], key_concepts: ['Common difference', 'nth term formula', 'Sum formula', 'Applications of AP'], difficulty_level: 'beginner', estimated_time: 45 },
    { topic_name: 'Triangles', topic_description: 'Similarity of triangles, criteria for similarity, areas of similar triangles, Pythagoras theorem.', learning_objectives: ['Prove similarity using AA, SSS, SAS criteria', 'Calculate areas of similar triangles', 'Apply and prove Pythagoras theorem'], key_concepts: ['Similar triangles', 'BPT', 'Pythagoras theorem', 'Congruence vs similarity'], difficulty_level: 'intermediate', estimated_time: 60 },
    { topic_name: 'Coordinate Geometry', topic_description: 'Distance formula, section formula, area of triangle using coordinates.', learning_objectives: ['Apply distance formula', 'Use section formula', 'Find area of triangle from coordinates'], key_concepts: ['Distance formula', 'Section formula', 'Midpoint', 'Collinear points'], difficulty_level: 'beginner', estimated_time: 40 },
    { topic_name: 'Introduction to Trigonometry', topic_description: 'Trigonometric ratios, ratios of complementary angles, trigonometric identities.', learning_objectives: ['Calculate trigonometric ratios', 'Apply complementary angle relationships', 'Prove trigonometric identities'], key_concepts: ['sin, cos, tan', 'Complementary angles', 'Trigonometric identities', 'Ratios for standard angles'], difficulty_level: 'intermediate', estimated_time: 55 },
    { topic_name: 'Statistics', topic_description: 'Mean, median, and mode of grouped data, cumulative frequency.', learning_objectives: ['Calculate mean of grouped data', 'Find median using cumulative frequency', 'Determine mode from frequency distribution'], key_concepts: ['Grouped data', 'Cumulative frequency', 'Ogive', 'Central tendency'], difficulty_level: 'beginner', estimated_time: 45 },
    { topic_name: 'Probability', topic_description: 'Classical definition, simple problems on single events.', learning_objectives: ['Calculate probability of simple events', 'Understand complementary events', 'Solve problems on coins, dice, and cards'], key_concepts: ['Sample space', 'Events', 'Complementary events', 'Equally likely outcomes'], difficulty_level: 'beginner', estimated_time: 40 },
  ];

  const scienceTopics = [
    { topic_name: 'Chemical Reactions and Equations', topic_description: 'Types of chemical reactions, balancing equations, effects of oxidation and reduction.', learning_objectives: ['Write and balance chemical equations', 'Identify types of reactions', 'Understand oxidation and reduction'], key_concepts: ['Combination', 'Decomposition', 'Displacement', 'Redox reactions'], difficulty_level: 'beginner', estimated_time: 50 },
    { topic_name: 'Acids, Bases and Salts', topic_description: 'Properties, pH scale, preparation of salts, and their uses.', learning_objectives: ['Classify acids and bases', 'Understand pH scale', 'Describe preparation of common salts'], key_concepts: ['Indicators', 'Neutralization', 'pH scale', 'Salt preparation'], difficulty_level: 'beginner', estimated_time: 50 },
    { topic_name: 'Light - Reflection and Refraction', topic_description: 'Laws of reflection, spherical mirrors, refraction, lenses, and lens formula.', learning_objectives: ['Apply laws of reflection', 'Draw ray diagrams for mirrors and lenses', 'Use mirror and lens formulas'], key_concepts: ['Focal length', 'Mirror formula', 'Lens formula', 'Magnification'], difficulty_level: 'intermediate', estimated_time: 60 },
    { topic_name: 'Life Processes', topic_description: 'Nutrition, respiration, transportation, and excretion in organisms.', learning_objectives: ['Explain autotrophic and heterotrophic nutrition', 'Describe respiration process', 'Understand circulatory and excretory systems'], key_concepts: ['Photosynthesis', 'Respiration', 'Blood circulation', 'Nephron'], difficulty_level: 'intermediate', estimated_time: 65 },
    { topic_name: 'Electricity', topic_description: 'Ohm\'s law, resistance, series and parallel circuits, electrical power and energy.', learning_objectives: ['Apply Ohm\'s law', 'Calculate equivalent resistance', 'Compute electrical energy and power'], key_concepts: ['Current', 'Voltage', 'Resistance', 'Ohm\'s law', 'Power'], difficulty_level: 'intermediate', estimated_time: 55 },
  ];

  const topicSets: { subject: string; topics: typeof mathTopics }[] = [
    { subject: 'Mathematics', topics: mathTopics },
    { subject: 'Science', topics: scienceTopics },
  ];

  function toSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  const topicIdMap: Record<string, mongoose.Types.ObjectId> = {};

  for (const { subject, topics } of topicSets) {
    const subjectId = subjectIds[subject];
    for (let i = 0; i < topics.length; i++) {
      const t = topics[i];
      const slug = toSlug(t.topic_name);
      let existing = await db.collection('topics').findOne({ organization_id: orgId, subject_id: subjectId, topic_slug: slug });
      if (!existing) {
        const res = await db.collection('topics').insertOne({
          organization_id: orgId,
          subject_id: subjectId,
          topic_name: t.topic_name,
          topic_slug: slug,
          topic_description: t.topic_description,
          learning_objectives: t.learning_objectives,
          learning_outcomes: [],
          key_concepts: t.key_concepts,
          difficulty_level: t.difficulty_level,
          topic_order: i + 1,
          estimated_time: t.estimated_time,
          academic_year: '2025-2026',
          curriculum_version: '1.0',
          status: 'published',
          is_active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        topicIdMap[t.topic_name] = res.insertedId as unknown as mongoose.Types.ObjectId;
        console.log(`  Created topic: ${t.topic_name}`);
      } else {
        topicIdMap[t.topic_name] = existing._id as unknown as mongoose.Types.ObjectId;
      }
    }
  }

  // 7. Seed Topic Notes
  const notesData: { topicName: string; note_type: string; content_markdown: string }[] = [
    { topicName: 'Real Numbers', note_type: 'summary', content_markdown: `# Real Numbers\n\n## Euclid's Division Lemma\nFor any two positive integers **a** and **b**, there exist unique integers **q** and **r** such that:\n\n**a = bq + r**, where 0 ≤ r < b\n\n## Fundamental Theorem of Arithmetic\nEvery composite number can be expressed as a **product of primes**, and this factorization is **unique** (apart from the order).\n\n## Key Results\n- √2, √3, √5 are **irrational numbers**\n- HCF × LCM = Product of two numbers\n- HCF is always a factor of LCM\n\n## Decimal Expansions\n- **Terminating**: denominator has only 2 and 5 as prime factors\n- **Non-terminating recurring**: denominator has prime factors other than 2 and 5` },
    { topicName: 'Real Numbers', note_type: 'key_points', content_markdown: `# Key Points - Real Numbers\n\n1. Euclid's division algorithm is used to find HCF\n2. HCF(a,b) × LCM(a,b) = a × b\n3. Every composite number = product of primes (unique)\n4. √p is irrational for any prime p\n5. Terminating decimals → denominator = 2ⁿ × 5ᵐ` },
    { topicName: 'Polynomials', note_type: 'summary', content_markdown: `# Polynomials\n\n## Zeros of a Polynomial\nA zero of polynomial p(x) is a value **α** such that p(α) = 0.\n\n## Relationship between Zeros and Coefficients\nFor a quadratic polynomial ax² + bx + c:\n- Sum of zeros (α + β) = **-b/a**\n- Product of zeros (αβ) = **c/a**\n\n## Division Algorithm\nIf p(x) and g(x) are any two polynomials with g(x) ≠ 0, then:\n\n**p(x) = g(x) × q(x) + r(x)**\n\nwhere degree of r(x) < degree of g(x)` },
    { topicName: 'Quadratic Equations', note_type: 'summary', content_markdown: `# Quadratic Equations\n\n## Standard Form\n**ax² + bx + c = 0** where a ≠ 0\n\n## Methods of Solving\n1. **Factorization**: Split middle term\n2. **Completing the square**: Make a perfect square trinomial\n3. **Quadratic Formula**: x = (-b ± √(b²-4ac)) / 2a\n\n## Discriminant (D = b² - 4ac)\n- D > 0: Two distinct real roots\n- D = 0: Two equal real roots\n- D < 0: No real roots\n\n## Important Notes\n- Sum of roots = -b/a\n- Product of roots = c/a` },
    { topicName: 'Chemical Reactions and Equations', note_type: 'summary', content_markdown: `# Chemical Reactions and Equations\n\n## Writing Chemical Equations\nReactants → Products\n\n## Types of Reactions\n1. **Combination**: A + B → AB\n2. **Decomposition**: AB → A + B\n3. **Displacement**: A + BC → AC + B\n4. **Double Displacement**: AB + CD → AD + CB\n5. **Redox**: Oxidation + Reduction together\n\n## Balancing Equations\n- Count atoms on both sides\n- Use coefficients to balance\n- Never change formulas\n\n## Oxidation & Reduction\n- **Oxidation**: Gain of oxygen / Loss of hydrogen\n- **Reduction**: Loss of oxygen / Gain of hydrogen` },
    { topicName: 'Electricity', note_type: 'summary', content_markdown: `# Electricity\n\n## Electric Current\nRate of flow of charge: **I = Q/t** (Amperes)\n\n## Ohm's Law\n**V = IR**\n- V = Potential difference (Volts)\n- I = Current (Amperes)\n- R = Resistance (Ohms)\n\n## Resistance\n- **Series**: R = R₁ + R₂ + R₃\n- **Parallel**: 1/R = 1/R₁ + 1/R₂ + 1/R₃\n\n## Electrical Power & Energy\n- Power: **P = VI = I²R = V²/R** (Watts)\n- Energy: **E = P × t** (Joules)\n- 1 kWh = 3.6 × 10⁶ J` },
  ];

  for (const n of notesData) {
    const topicId = topicIdMap[n.topicName];
    if (!topicId) continue;
    const exists = await db.collection('topic_notes').findOne({ topic_id: topicId, note_type: n.note_type });
    if (!exists) {
      await db.collection('topic_notes').insertOne({
        organization_id: orgId,
        topic_id: topicId,
        grade: '10',
        board: 'CBSE',
        note_type: n.note_type,
        content_markdown: n.content_markdown,
        content_version: '1.0',
        approved: true,
        usage_count: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`  Created note: ${n.topicName} (${n.note_type})`);
    }
  }

  // 8. Seed Questions
  const questionsData: { topicName: string; questions: { question_text: string; options: string[]; correct_answer: string; explanation: string; difficulty_level: string }[] }[] = [
    {
      topicName: 'Real Numbers', questions: [
        { question_text: 'The HCF of 96 and 404 is:', options: ['4', '8', '12', '16'], correct_answer: '4', explanation: '96 = 2⁵ × 3, 404 = 2² × 101. HCF = 2² = 4', difficulty_level: 'beginner' },
        { question_text: 'Which of the following is irrational?', options: ['√4', '√9', '√5', '√16'], correct_answer: '√5', explanation: '√5 cannot be expressed as p/q where p,q are integers', difficulty_level: 'beginner' },
        { question_text: 'The decimal expansion of 17/8 is:', options: ['Terminating', 'Non-terminating recurring', 'Non-terminating non-recurring', 'None of these'], correct_answer: 'Terminating', explanation: '8 = 2³, so denominator has only 2 as prime factor → terminating', difficulty_level: 'beginner' },
        { question_text: 'If HCF(306, 657) = 9, then LCM(306, 657) is:', options: ['22338', '23338', '22__(invalid)', '20000'], correct_answer: '22338', explanation: 'HCF × LCM = 306 × 657, so LCM = (306 × 657)/9 = 22338', difficulty_level: 'intermediate' },
        { question_text: 'The product of a non-zero rational and an irrational number is:', options: ['Always irrational', 'Always rational', 'Sometimes rational', 'One'], correct_answer: 'Always irrational', explanation: 'Product of non-zero rational and irrational is always irrational', difficulty_level: 'beginner' },
      ],
    },
    {
      topicName: 'Polynomials', questions: [
        { question_text: 'The zeros of x² - 5x + 6 are:', options: ['2 and 3', '1 and 6', '-2 and -3', '3 and -2'], correct_answer: '2 and 3', explanation: 'x² - 5x + 6 = (x-2)(x-3), so zeros are 2 and 3', difficulty_level: 'beginner' },
        { question_text: 'If α and β are zeros of 2x² + 5x + 2, then α + β is:', options: ['-5/2', '5/2', '2/5', '-2/5'], correct_answer: '-5/2', explanation: 'Sum of zeros = -b/a = -5/2', difficulty_level: 'intermediate' },
        { question_text: 'A quadratic polynomial whose sum and product of zeros are 0 and √5 respectively is:', options: ['x² + √5', 'x² - √5', 'x² + √5x', 'x² - √5x'], correct_answer: 'x² + √5', explanation: 'p(x) = x² - (sum)x + product = x² - 0·x + √5 = x² + √5', difficulty_level: 'intermediate' },
      ],
    },
    {
      topicName: 'Quadratic Equations', questions: [
        { question_text: 'The roots of x² - 7x + 12 = 0 are:', options: ['3, 4', '2, 6', '1, 12', '-3, -4'], correct_answer: '3, 4', explanation: 'x² - 7x + 12 = (x-3)(x-4) = 0', difficulty_level: 'beginner' },
        { question_text: 'The discriminant of 2x² - 5x + 3 = 0 is:', options: ['1', '-1', '7', '25'], correct_answer: '1', explanation: 'D = b² - 4ac = 25 - 24 = 1', difficulty_level: 'beginner' },
        { question_text: 'If D < 0, then the quadratic equation has:', options: ['No real roots', 'Two equal real roots', 'Two distinct real roots', 'One root'], correct_answer: 'No real roots', explanation: 'When discriminant is negative, roots are imaginary (not real)', difficulty_level: 'beginner' },
        { question_text: 'The nature of roots of x² + 4x + 4 = 0 is:', options: ['Two equal real roots', 'Two distinct real roots', 'No real roots', 'Cannot determine'], correct_answer: 'Two equal real roots', explanation: 'D = 16 - 16 = 0, so two equal real roots (x = -2)', difficulty_level: 'intermediate' },
      ],
    },
    {
      topicName: 'Chemical Reactions and Equations', questions: [
        { question_text: 'Which of the following is a combination reaction?', options: ['2H₂ + O₂ → 2H₂O', 'CaCO₃ → CaO + CO₂', 'Fe + CuSO₄ → FeSO₄ + Cu', 'NaOH + HCl → NaCl + H₂O'], correct_answer: '2H₂ + O₂ → 2H₂O', explanation: 'Two substances combine to form a single product', difficulty_level: 'beginner' },
        { question_text: 'Rusting of iron involves:', options: ['Oxidation', 'Reduction', 'Neither', 'Both'], correct_answer: 'Oxidation', explanation: 'Iron gains oxygen (is oxidized) to form iron oxide (rust)', difficulty_level: 'beginner' },
        { question_text: 'When a magnesium ribbon burns in air, the product formed is:', options: ['MgO', 'Mg₂O₃', 'Mg₂O', 'MgO₂'], correct_answer: 'MgO', explanation: '2Mg + O₂ → 2MgO (Magnesium oxide)', difficulty_level: 'beginner' },
      ],
    },
    {
      topicName: 'Electricity', questions: [
        { question_text: 'According to Ohm\'s law, V = ?', options: ['IR', 'I/R', 'R/I', 'I²R'], correct_answer: 'IR', explanation: 'Ohm\'s law states that V = IR', difficulty_level: 'beginner' },
        { question_text: 'Three resistors of 2Ω each connected in series give a total resistance of:', options: ['6Ω', '2Ω', '0.67Ω', '3Ω'], correct_answer: '6Ω', explanation: 'In series: R = R₁ + R₂ + R₃ = 2 + 2 + 2 = 6Ω', difficulty_level: 'beginner' },
        { question_text: '1 kWh equals:', options: ['3.6 × 10⁶ J', '3.6 × 10³ J', '3.6 × 10⁹ J', '3.6 J'], correct_answer: '3.6 × 10⁶ J', explanation: '1 kWh = 1000W × 3600s = 3,600,000 J = 3.6 × 10⁶ J', difficulty_level: 'beginner' },
        { question_text: 'If the current through a resistor is doubled, the heat produced will be:', options: ['4 times', '2 times', 'Half', 'Same'], correct_answer: '4 times', explanation: 'H = I²Rt, so if I doubles, H becomes (2I)²Rt = 4I²Rt', difficulty_level: 'intermediate' },
      ],
    },
  ];

  for (const qSet of questionsData) {
    const topicId = topicIdMap[qSet.topicName];
    if (!topicId) continue;
    const existingCount = await db.collection('topic_question_bank').countDocuments({ topic_id: topicId });
    if (existingCount === 0) {
      const docs = qSet.questions.map((q) => ({
        organization_id: orgId,
        topic_id: topicId,
        difficulty_level: q.difficulty_level,
        question_text: q.question_text,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        approved: true,
        usage_count: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      await db.collection('topic_question_bank').insertMany(docs);
      console.log(`  Created ${docs.length} questions for: ${qSet.topicName}`);
    }
  }

  // 9. Seed Videos (YouTube embeds for educational content)
  const videosData: { topicName: string; title: string; video_url: string; duration_seconds: number }[] = [
    { topicName: 'Real Numbers', title: 'Real Numbers - Full Chapter', video_url: 'https://www.youtube.com/embed/sMBCYPHIarI', duration_seconds: 2400 },
    { topicName: 'Polynomials', title: 'Polynomials - Class 10 CBSE', video_url: 'https://www.youtube.com/embed/HKGFkiRUFU0', duration_seconds: 1800 },
    { topicName: 'Quadratic Equations', title: 'Quadratic Equations Explained', video_url: 'https://www.youtube.com/embed/IFKql63u5Ks', duration_seconds: 2100 },
    { topicName: 'Arithmetic Progressions', title: 'AP - Complete Chapter', video_url: 'https://www.youtube.com/embed/x03BvBJlj1Y', duration_seconds: 1950 },
    { topicName: 'Chemical Reactions and Equations', title: 'Chemical Reactions - Full Chapter', video_url: 'https://www.youtube.com/embed/eOXTliL-gNw', duration_seconds: 2700 },
    { topicName: 'Electricity', title: 'Electricity - Complete CBSE', video_url: 'https://www.youtube.com/embed/mc979OhitAg', duration_seconds: 2400 },
  ];

  const teacherUser = await db.collection('users').findOne({ role: 'Teacher' });
  for (const v of videosData) {
    const topicId = topicIdMap[v.topicName];
    if (!topicId) continue;
    const exists = await db.collection('videos').findOne({ topic_id: topicId });
    if (!exists) {
      await db.collection('videos').insertOne({
        organization_id: orgId,
        topic_id: topicId,
        title: v.title,
        description: `Video lecture covering ${v.topicName}`,
        video_url: v.video_url,
        thumbnail_url: '',
        duration_seconds: v.duration_seconds,
        grade: '10',
        board: 'CBSE',
        status: 'ready',
        uploaded_by_teacher_id: teacherUser?._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`  Created video: ${v.title}`);
    }
  }

  console.log('\nSeeding complete!');
  await mongoose.disconnect();
}

seed().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
