// Simple test script for Scribe application
require('dotenv').config({ path: '.env' });

async function testApp() {
  console.log('🧪 Testing Scribe Application Components...\n');

  // Test 1: Environment Variables Check
  console.log('1. Environment Variables:');
  const envVars = [
    { name: 'MONGODB_CONNECTION_STRING', required: true },
    { name: 'GEMINI_API_KEY', required: true },
    { name: 'GITHUB_PAT', required: true },
    { name: 'GITLAB_PAT', required: false }
  ];

  let envOk = true;
  for (const { name, required } of envVars) {
    const value = process.env[name];
    if (value) {
      console.log(`   ✅ ${name}: Set (${value.slice(0, 10)}...)`);
    } else if (required) {
      console.log(`   ❌ ${name}: Missing (required)`);
      envOk = false;
    } else {
      console.log(`   ⚠️  ${name}: Not set (optional)`);
    }
  }
  console.log(`   Environment: ${envOk ? '✅ OK' : '❌ Issues detected'}\n`);

  // Test 2: MongoDB Connection
  console.log('2. Database Connection:');
  try {
    const { default: mongoose } = await import('mongoose');
    const connectionString = process.env.MONGODB_CONNECTION_STRING;
    
    await mongoose.connect(connectionString, {
      serverSelectionTimeoutMS: 5000,
      bufferCommands: false
    });
    
    console.log(`   ✅ MongoDB connected: ${mongoose.connection.readyState === 1 ? 'Ready' : 'Not ready'}`);
    console.log(`   📊 Database: ${mongoose.connection.db.databaseName}`);
    
    await mongoose.disconnect();
    console.log('   ✅ MongoDB disconnected cleanly');
  } catch (error) {
    console.log(`   ❌ MongoDB connection failed: ${error.message}`);
  }
  console.log('');

  // Test 3: URL Validation (Git Service)
  console.log('3. Git Service URL Validation:');
  try {
    const { isValidRepoUrl, getRepoProvider } = await import('./src/services/gitService.js');
    
    const testUrls = [
      'https://github.com/facebook/react',
      'git@github.com:microsoft/vscode.git',
      'https://gitlab.com/gitlab-org/gitlab',
      'invalid-url'
    ];
    
    for (const url of testUrls) {
      const isValid = isValidRepoUrl(url);
      const provider = getRepoProvider(url);
      console.log(`   ${isValid ? '✅' : '❌'} ${url.slice(0, 40)}... → ${provider || 'invalid'}`);
    }
  } catch (error) {
    console.log(`   ❌ Git service test failed: ${error.message}`);
  }
  console.log('');

  // Test 4: LLM Service Configuration
  console.log('4. LLM Service Configuration:');
  try {
    const { validateLLMConfiguration } = await import('./src/services/llmService.js');
    
    const validation = validateLLMConfiguration();
    if (validation.isValid) {
      console.log('   ✅ Gemini AI configuration valid');
    } else {
      console.log(`   ❌ Configuration issue: ${validation.error}`);
    }
  } catch (error) {
    console.log(`   ❌ LLM service test failed: ${error.message}`);
  }
  console.log('');

  // Test 5: Application Server Status
  console.log('5. Application Server:');
  try {
    const response = await fetch('http://localhost:3000', {
      signal: AbortSignal.timeout(5000)
    });
    
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      console.log(`   ✅ Server responding: ${response.status} ${response.statusText}`);
      console.log(`   📄 Content-Type: ${contentType}`);
      
      if (contentType?.includes('text/html')) {
        const html = await response.text();
        const hasCustomContent = html.includes('Scribe') || html.includes('clay-tablet');
        console.log(`   ${hasCustomContent ? '✅' : '⚠️'} Custom content: ${hasCustomContent ? 'Found' : 'Using default template'}`);
      }
    } else {
      console.log(`   ❌ Server error: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log(`   ❌ Server not accessible: ${error.message}`);
  }
  console.log('');

  console.log('🎉 Application testing completed!');
}

// Run the test
testApp().catch(error => {
  console.error('💥 Test failed:', error);
  process.exit(1);
}); 