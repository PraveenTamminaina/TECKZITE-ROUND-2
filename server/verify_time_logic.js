// Simulate the time calculation logic from gameRoutes.js

const testLogic = () => {
    console.log("--- Time Logic Simulation ---");
    
    // T = 0 (Start)
    const startTime = Date.now() - 100000; // Started 100 seconds ago
    
    // T = 40s (Finish Game 1)
    const game1FinishTime = startTime + 40000; 
    const game1Duration = (game1FinishTime - startTime) / 1000;
    
    console.log(`Game 1 Duration (calculated at G1 finish): ${game1Duration}s`);
    
    // T = 100s (Finish Game 2 / Now)
    const now = startTime + 100000; 
    
    // Logic from /finish route
    const totalDuration = (now - startTime) / 1000;
    const game2Duration = Math.max(0, totalDuration - game1Duration);
    
    console.log(`Total Duration: ${totalDuration}s`);
    console.log(`Game 2 Duration: ${game2Duration}s`);
    
    if (game1Duration !== game2Duration) {
        console.log("SUCCESS: Times are different.");
    } else {
        console.log("FAILURE: Times are identical.");
    }
};

testLogic();
