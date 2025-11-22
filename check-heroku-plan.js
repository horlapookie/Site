import Heroku from "heroku-client";

const heroku = new Heroku({ token: process.env.HEROKU_API_KEY?.trim() });

async function checkHerokuPlan() {
  try {
    console.log("🔍 Checking Heroku account information...\n");

    const account = await heroku.get("/account");
    console.log("📧 Account Email:", account.email);
    console.log("👤 Account ID:", account.id);
    console.log("✅ Verified:", account.verified ? "Yes" : "No");
    console.log("\n" + "=".repeat(60) + "\n");

    const apps = await heroku.get("/apps");
    console.log(`📱 Total Apps Deployed: ${apps.length}\n`);

    if (apps.length === 0) {
      console.log("ℹ️  No apps currently deployed.");
      return;
    }

    for (const app of apps) {
      console.log(`\n🤖 App: ${app.name}`);
      console.log(`   URL: ${app.web_url}`);
      console.log(`   Region: ${app.region.name}`);
      console.log(`   Stack: ${app.stack.name}`);
      
      try {
        const formations = await heroku.get(`/apps/${app.name}/formation`);
        
        if (formations.length > 0) {
          console.log(`   📊 Dyno Information:`);
          formations.forEach(formation => {
            console.log(`      Type: ${formation.type}`);
            console.log(`      Size: ${formation.size} ${getSizeDescription(formation.size)}`);
            console.log(`      Quantity: ${formation.quantity}`);
            console.log(`      💰 Cost: ${getCostEstimate(formation.size, formation.quantity)}`);
          });
        } else {
          console.log(`   ⚠️  No dynos configured`);
        }
      } catch (error) {
        console.log(`   ❌ Error checking dynos: ${error.message}`);
      }
      
      console.log(`   ${"-".repeat(50)}`);
    }

    console.log("\n" + "=".repeat(60));
    console.log("\n📋 PLAN SUMMARY:");
    console.log("=".repeat(60));
    
    const allFormations = [];
    for (const app of apps) {
      try {
        const formations = await heroku.get(`/apps/${app.name}/formation`);
        allFormations.push(...formations);
      } catch (error) {
        // Skip apps with errors
      }
    }

    const dynoTypes = [...new Set(allFormations.map(f => f.size))];
    
    if (dynoTypes.length > 0) {
      console.log("\n🎯 Dyno Types in Use:");
      dynoTypes.forEach(type => {
        const info = getSleepInfo(type);
        console.log(`\n   ${type}:`);
        console.log(`   ${info}`);
      });
    }

  } catch (error) {
    console.error("\n❌ Error:", error.message);
    if (error.statusCode === 401) {
      console.error("\n🔑 Authentication failed. Please check your HEROKU_API_KEY.");
    }
  }
}

function getSizeDescription(size) {
  const descriptions = {
    'eco': '(Eco - Sleeps after 30min inactivity)',
    'basic': '(Basic - Always on)',
    'standard-1x': '(Standard 1X - Always on)',
    'standard-2x': '(Standard 2X - Always on)',
    'performance-m': '(Performance M)',
    'performance-l': '(Performance L)',
  };
  return descriptions[size.toLowerCase()] || '';
}

function getCostEstimate(size, quantity) {
  const costs = {
    'eco': '$5/month (1000 shared hours pool)',
    'basic': `$7/dyno/month × ${quantity} = $${7 * quantity}/month`,
    'standard-1x': `$25/dyno/month × ${quantity} = $${25 * quantity}/month`,
    'standard-2x': `$50/dyno/month × ${quantity} = $${50 * quantity}/month`,
  };
  return costs[size.toLowerCase()] || 'Custom pricing';
}

function getSleepInfo(size) {
  const sleepInfo = {
    'eco': '💤 SLEEPS after 30 minutes of inactivity\n   ⏰ Wake-up time: 5-10 seconds\n   💡 1000 shared hours/month across all Eco dynos\n   ⚠️  Your auto-monitor (runs every 10min) will keep bots awake!',
    'basic': '✅ NEVER SLEEPS - Always running 24/7\n   💰 Billed per-second at $0.01/hour ($7/month max)\n   🔒 Good for bots that need constant uptime',
    'standard-1x': '✅ NEVER SLEEPS - Always running 24/7\n   💰 $25/month per dyno\n   🚀 Can scale horizontally',
  };
  return sleepInfo[size.toLowerCase()] || 'Check Heroku dashboard for details';
}

checkHerokuPlan();
