import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Blog from './models/Blog.ts';

// Load environment variables
dotenv.config();

const MONGO_URI: string = process.env.MONGO_URI || "mongodb://localhost:27017/mydatabase";

interface BlogData {
  title: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  isPublished: boolean;
}

// Sample blog data - 15 blog posts
const sampleBlogs: BlogData[] = [
  {
    title: "Getting Started with React Development",
    content: "React is a powerful JavaScript library for building user interfaces. In this comprehensive guide, we'll explore the fundamentals of React and how to get started with your first component. We'll cover JSX syntax, component lifecycle, and state management to help you build modern web applications.",
    author: "John Doe",
    category: "Web Development",
    tags: ["React", "JavaScript", "Frontend"],
    isPublished: true
  },
  {
    title: "Understanding TypeScript for Better Code",
    content: "TypeScript adds static typing to JavaScript, making your code more robust and maintainable. Learn how TypeScript can improve your development workflow by catching errors at compile time, providing better IDE support, and making your code more self-documenting.",
    author: "Jane Smith",
    category: "Programming",
    tags: ["TypeScript", "JavaScript", "Development"],
    isPublished: true
  },
  {
    title: "Modern CSS Techniques and Best Practices",
    content: "Explore modern CSS features like Grid, Flexbox, and custom properties. These techniques will help you create responsive and beautiful web layouts. We'll also cover CSS-in-JS solutions and how to organize your styles for maintainable projects.",
    author: "Alex Johnson",
    category: "Web Design",
    tags: ["CSS", "Frontend", "Design"],
    isPublished: true
  },
  {
    title: "Node.js Performance Optimization Tips",
    content: "Learn how to optimize your Node.js applications for better performance. We'll cover memory management, event loop optimization, caching strategies, and profiling tools that will help you build faster backend services.",
    author: "Sarah Wilson",
    category: "Backend Development",
    tags: ["Node.js", "Performance", "Backend"],
    isPublished: true
  },
  {
    title: "Database Design Best Practices",
    content: "Good database design is crucial for scalable applications. This article covers normalization, indexing strategies, query optimization, and choosing the right database for your project needs.",
    author: "Mike Brown",
    category: "Database",
    tags: ["Database", "SQL", "NoSQL", "Design"],
    isPublished: true
  },
  {
    title: "Microservices Architecture Patterns",
    content: "Explore microservices architecture patterns and learn how to break down monolithic applications into manageable, scalable services. We'll discuss service communication, data consistency, and deployment strategies.",
    author: "Emily Davis",
    category: "Architecture",
    tags: ["Microservices", "Architecture", "Scalability"],
    isPublished: true
  },
  {
    title: "API Security Best Practices",
    content: "Secure your APIs with these essential security practices. Learn about authentication, authorization, rate limiting, input validation, and how to protect against common vulnerabilities like injection attacks.",
    author: "Chris Lee",
    category: "Security",
    tags: ["API", "Security", "Authentication"],
    isPublished: true
  },
  {
    title: "DevOps and CI/CD Pipeline Setup",
    content: "Streamline your development workflow with continuous integration and deployment. This guide covers setting up automated testing, deployment pipelines, and monitoring for reliable software delivery.",
    author: "David Kim",
    category: "DevOps",
    tags: ["DevOps", "CI/CD", "Automation"],
    isPublished: true
  },
  {
    title: "Cloud Computing Fundamentals",
    content: "Understanding cloud computing concepts is essential for modern development. Learn about different cloud service models, serverless computing, and how to choose the right cloud provider for your needs.",
    author: "Lisa Chen",
    category: "Cloud Computing",
    tags: ["Cloud", "AWS", "Serverless"],
    isPublished: true
  },
  {
    title: "Mobile App Development with React Native",
    content: "Build cross-platform mobile applications using React Native. This tutorial covers navigation, state management, native modules, and performance optimization for mobile apps.",
    author: "Tom Wilson",
    category: "Mobile Development",
    tags: ["React Native", "Mobile", "Cross-platform"],
    isPublished: true
  },
  {
    title: "Machine Learning for Web Developers",
    content: "Introduction to machine learning concepts for web developers. Learn how to integrate ML models into web applications, work with TensorFlow.js, and build intelligent user experiences.",
    author: "Anna Rodriguez",
    category: "Machine Learning",
    tags: ["ML", "AI", "TensorFlow", "JavaScript"],
    isPublished: true
  },
  {
    title: "GraphQL vs REST: Choosing the Right API",
    content: "Compare GraphQL and REST APIs to determine which is best for your project. We'll explore the advantages and disadvantages of each approach and provide practical implementation examples.",
    author: "Robert Taylor",
    category: "API Development",
    tags: ["GraphQL", "REST", "API"],
    isPublished: true
  },
  {
    title: "Testing Strategies for Modern Web Apps",
    content: "Comprehensive guide to testing modern web applications. Learn about unit testing, integration testing, end-to-end testing, and the tools that make testing efficient and reliable.",
    author: "Jennifer White",
    category: "Testing",
    tags: ["Testing", "Jest", "Cypress", "Quality"],
    isPublished: true
  },
  {
    title: "Web Performance Optimization Techniques",
    content: "Improve your website's loading speed and user experience with these performance optimization techniques. Cover image optimization, code splitting, caching, and Core Web Vitals.",
    author: "Kevin Martinez",
    category: "Performance",
    tags: ["Performance", "Optimization", "Web Vitals"],
    isPublished: true
  },
  {
    title: "Building Accessible Web Applications",
    content: "Create inclusive web experiences by implementing accessibility best practices. Learn about ARIA labels, keyboard navigation, screen reader compatibility, and testing for accessibility.",
    author: "Maria Garcia",
    category: "Accessibility",
    tags: ["Accessibility", "A11y", "Inclusive Design"],
    isPublished: true
  }
];

const seedBlogs = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing blogs
    await Blog.deleteMany({});
    console.log('🗑️ Cleared existing blogs');

    // Insert new blogs
    const insertedBlogs = await Blog.insertMany(sampleBlogs);
    console.log(`🎉 Successfully seeded ${insertedBlogs.length} blog posts`);

    // Display seeded blogs
    console.log('\n📚 Seeded Blog Posts:');
    insertedBlogs.forEach((blog, index) => {
      console.log(`${index + 1}. ${blog.title} by ${blog.author} (${blog.category})`);
    });

  } catch (error) {
    console.error('❌ Error seeding blogs:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the script
seedBlogs();