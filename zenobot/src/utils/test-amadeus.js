const Amadeus = require("amadeus");

// Create a simple test function
async function testAmedeusConnection() {
  try {
    console.log("Starting Amadeus SDK test...");

    // Initialize the SDK
    const amadeus = new Amadeus({
      clientId: "iJgTBaG9JGsDBKizdaAGQt78XMShknnE",
      clientSecret: "l8SrWekAECO0wSaN",
    });

    console.log("Amadeus object created:", amadeus ? "Success" : "Failed");
    console.log("Amadeus shopping:", amadeus.shopping ? "Exists" : "Missing");
    console.log(
      "Amadeus hotel offers:",
      amadeus.shopping.hotelOffers ? "Exists" : "Missing"
    );

    // Try a simple API call - just a city search to test the connection
    console.log("Attempting simple API call...");
    const response = await amadeus.referenceData.locations.get({
      keyword: "LON",
      subType: "CITY",
    });

    console.log("API call successful!");
    console.log("Response status:", response.statusCode);
    console.log(
      "First result:",
      response.data[0] ? response.data[0].name : "No results"
    );

    return "Test completed successfully";
  } catch (error) {
    console.error("Test failed with error:", error);
    return `Test failed: ${error.message}`;
  }
}

// Run the test
testAmedeusConnection().then((result) => {
  console.log("\nFinal result:", result);
});
