// Quick manual security check for password exposure
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function quickSecurityCheck() {
  console.log("🔍 Quick Security Check - Testing Password Exposure Prevention\n");
  
  try {
    // 1. Create a test user
    console.log("1. Creating test user...");
    const createResponse = await axios.post(`${API_BASE_URL}/api/users`, {
      email: 'security-test@example.com',
      password: 'secretpassword123',
      role: 'user'
    });
    
    console.log("   ✅ User created successfully");
    console.log("   �� Response data:", JSON.stringify(createResponse.data, null, 2));
    
    // Check if password is in response
    if (createResponse.data.password) {
      console.log("   ❌ SECURITY ISSUE: Password found in create response!");
      return;
    } else {
      console.log("   ✅ Password correctly excluded from create response");
    }
    
    const userId = createResponse.data.id;
    
    // 2. Get the user by ID
    console.log("\n2. Getting user by ID...");
    const getResponse = await axios.get(`${API_BASE_URL}/api/users/${userId}`);
    
    console.log("   📋 Response data:", JSON.stringify(getResponse.data, null, 2));
    
    if (getResponse.data.password) {
      console.log("   ❌ SECURITY ISSUE: Password found in get response!");
      return;
    } else {
      console.log("   ✅ Password correctly excluded from get response");
    }
    
    // 3. Lookup por e-mail na URL removido (deve 404)
    console.log("\n3. Verificando que /api/users/email/... não existe...");
    try {
      await axios.get(
        `${API_BASE_URL}/api/users/email/security-test@example.com`,
      );
      console.log("   ❌ SECURITY ISSUE: rota por e-mail ainda exposta!");
      return;
    } catch (err) {
      if (err.response && err.response.status === 404) {
        console.log("   ✅ Rota por e-mail removida (404)");
      } else {
        throw err;
      }
    }
    
    // 4. Get all users
    console.log("\n4. Getting all users...");
    const allUsersResponse = await axios.get(`${API_BASE_URL}/api/users`);
    
    console.log(`   📋 Retrieved ${allUsersResponse.data.length} users`);
    
    // Check if any user has password field
    const hasPasswordInAnyUser = allUsersResponse.data.some(user => user.password);
    if (hasPasswordInAnyUser) {
      console.log("   ❌ SECURITY ISSUE: Password found in get all users response!");
      return;
    } else {
      console.log("   ✅ Password correctly excluded from all users response");
    }
    
    // 5. Update user
    console.log("\n5. Updating user...");
    const updateResponse = await axios.put(`${API_BASE_URL}/api/users/${userId}`, {
      email: 'updated-security-test@example.com',
      password: 'newsecretpassword456',
      role: 'admin'
    });
    
    console.log("   �� Response data:", JSON.stringify(updateResponse.data, null, 2));
    
    if (updateResponse.data.password) {
      console.log("   ❌ SECURITY ISSUE: Password found in update response!");
      return;
    } else {
      console.log("   ✅ Password correctly excluded from update response");
    }
    
    // Clean up
    console.log("\n6. Cleaning up test user...");
    await axios.delete(`${API_BASE_URL}/api/users/${userId}`);
    console.log("   ✅ Test user deleted");
    
    console.log("\n🎉 ALL SECURITY CHECKS PASSED!");
    console.log("🔒 Password fields are correctly excluded from all API responses!");
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    if (error.response) {
      console.error("   Response status:", error.response.status);
      console.error("   Response data:", error.response.data);
    }
  }
}

// Run the check
quickSecurityCheck();
