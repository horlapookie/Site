import Heroku from 'heroku-client';

const heroku = new Heroku({ token: process.env.HEROKU_API_KEY! });

interface HerokuApp {
  id: string;
  name: string;
  web_url: string;
  created_at: string;
  updated_at: string;
  released_at: string | null;
}

interface HerokuDyno {
  type: string;
  state: string;
  updated_at: string;
}

interface AccountInfo {
  app_limit: number;
  apps_count: number;
}

async function checkAppLimit(): Promise<AccountInfo> {
  try {
    const account = await heroku.get('/account') as any;
    const apps = await heroku.get('/apps') as HerokuApp[];
    
    console.log('\n=== Heroku Account Info ===');
    console.log(`App Limit: ${account.app_limit || 'Unknown'}`);
    console.log(`Current Apps: ${apps.length}`);
    console.log(`Available Slots: ${account.app_limit ? account.app_limit - apps.length : 'Unknown'}`);
    
    return {
      app_limit: account.app_limit || 0,
      apps_count: apps.length
    };
  } catch (error) {
    console.error('Error checking app limit:', error);
    throw error;
  }
}

async function getAppStatus(appName: string): Promise<{ running: boolean; state: string }> {
  try {
    const dynos = await heroku.get(`/apps/${appName}/dynos`) as HerokuDyno[];
    
    if (dynos.length === 0) {
      return { running: false, state: 'no-dynos' };
    }
    
    const runningDynos = dynos.filter(d => d.state === 'up' || d.state === 'starting');
    if (runningDynos.length > 0) {
      return { running: true, state: 'running' };
    }
    
    return { running: false, state: dynos[0]?.state || 'unknown' };
  } catch (error: any) {
    if (error.statusCode === 404) {
      return { running: false, state: 'not-found' };
    }
    return { running: false, state: 'error' };
  }
}

async function findFailedApps() {
  console.log('\n=== Scanning All Apps ===\n');
  
  const apps = await heroku.get('/apps') as HerokuApp[];
  const failedApps: Array<{ name: string; reason: string }> = [];
  
  for (const app of apps) {
    const status = await getAppStatus(app.name);
    
    console.log(`${app.name}: ${status.state}`);
    
    if (!status.running) {
      failedApps.push({
        name: app.name,
        reason: status.state
      });
    }
  }
  
  return failedApps;
}

async function deleteApp(appName: string): Promise<boolean> {
  try {
    await heroku.delete(`/apps/${appName}`);
    console.log(`✓ Deleted: ${appName}`);
    return true;
  } catch (error: any) {
    console.error(`✗ Failed to delete ${appName}:`, error.message);
    return false;
  }
}

async function cleanupFailedApps() {
  console.log('\n🔍 Starting Heroku App Cleanup...\n');
  
  const accountInfo = await checkAppLimit();
  
  if (accountInfo.apps_count >= accountInfo.app_limit) {
    console.log('\n⚠️  You have reached your app limit!');
  }
  
  const failedApps = await findFailedApps();
  
  console.log(`\n\n=== Summary ===`);
  console.log(`Total Apps: ${accountInfo.apps_count}`);
  console.log(`Failed/Not Running: ${failedApps.length}`);
  
  if (failedApps.length === 0) {
    console.log('\n✓ No failed apps to clean up!');
    return;
  }
  
  console.log('\n=== Apps to Delete ===');
  failedApps.forEach(app => {
    console.log(`- ${app.name} (${app.reason})`);
  });
  
  console.log('\n🗑️  Deleting failed apps...\n');
  
  let deletedCount = 0;
  for (const app of failedApps) {
    const success = await deleteApp(app.name);
    if (success) deletedCount++;
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\n✓ Cleanup Complete!`);
  console.log(`Deleted: ${deletedCount}/${failedApps.length} apps`);
  console.log(`New App Count: ${accountInfo.apps_count - deletedCount}/${accountInfo.app_limit}`);
}

cleanupFailedApps().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
