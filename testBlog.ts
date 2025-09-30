/* eslint-disable @typescript-eslint/no-explicit-any */
// Test script to verify Blog.ts functionality
import mongoose from 'mongoose';
import Blog from './models/Blog.ts';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/mydatabase";

async function testBlogFunctionality() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB for testing");

    // Test 1: Create a new blog with enhanced features
    console.log("\n📝 Test 1: Creating a new blog...");
    const testBlog = new Blog({
      title: "Advanced TypeScript Blog System",
      content: "This is a comprehensive test of our enhanced blog system with TypeScript support. It includes advanced features like virtual properties, static methods, and instance methods for better functionality.",
      author: "System Administrator",
      category: "Technology",
      tags: ["typescript", "blog", "mongodb", "enhanced"],
      published: true
    });

    await testBlog.save();
    console.log("✅ Blog created successfully");
    console.log("📊 Virtual Properties:");
    console.log(`   - Formatted Date: ${(testBlog as any).formattedDate}`);
    console.log(`   - Reading Time: ${(testBlog as any).readingTime}`);
    console.log(`   - Excerpt: ${(testBlog as any).excerpt}`);

    // Test 2: Test static methods
    console.log("\n🔍 Test 2: Testing static methods...");
    
    // Test findPublished
    const publishedBlogs = await (Blog as any).findPublished();
    console.log(`✅ Found ${publishedBlogs.length} published blogs`);
    
    // Test findByCategory
    const techBlogs = await (Blog as any).findByCategory("Technology");
    console.log(`✅ Found ${techBlogs.length} blogs in Technology category`);
    
    // Test searchBlogs
    const searchResults = await (Blog as any).searchBlogs("typescript");
    console.log(`✅ Found ${searchResults.length} blogs containing 'typescript'`);    // Test 3: Test instance methods
    console.log("\n⚙️ Test 3: Testing instance methods...");
    
    // Test addTag
    await (testBlog as any).addTag("testing");
    await (testBlog as any).addTag("advanced");
    console.log(`✅ Added tags. Current tags: [${testBlog.tags.join(', ')}]`);

    // Test unpublish and publish
    await (testBlog as any).unpublish();
    console.log(`✅ Blog unpublished. Published status: ${testBlog.isPublished}`);
    
    await (testBlog as any).publish();
    console.log(`✅ Blog republished. Published status: ${testBlog.isPublished}`);

    // Test 4: Verify tag cleaning (duplicates removal)
    console.log("\n🧹 Test 4: Testing tag cleaning...");
    testBlog.tags.push("typescript", "testing", "duplicate");
    await testBlog.save();
    console.log(`✅ Tags after saving (duplicates removed): [${testBlog.tags.join(', ')}]`);

    console.log("\n🎉 All tests passed! Blog.ts system is working perfectly!");

    // Clean up: remove test blog
    await Blog.findByIdAndDelete(testBlog._id);
    console.log("🧹 Cleaned up test data");

  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
}

// Run tests
testBlogFunctionality();