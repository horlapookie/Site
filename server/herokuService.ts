import Heroku from "heroku-client";

export interface DeploymentConfig {
  botNumber: string;
  sessionData: string;
  prefix: string;
  openaiKey?: string;
  geminiKey?: string;
  autoViewMessage: boolean;
  autoViewStatus: boolean;
  autoReactStatus: boolean;
  autoReact: boolean;
  autoTyping: boolean;
  autoRecording: boolean;
}

interface HerokuApiKey {
  key: string;
  name: string;
  index: number;
}

function getHerokuApiKeys(): HerokuApiKey[] {
  const keys: HerokuApiKey[] = [];
  
  if (process.env.HEROKU_API_KEY?.trim()) {
    keys.push({
      key: process.env.HEROKU_API_KEY.trim(),
      name: 'HEROKU_API_KEY',
      index: 1
    });
  }
  
  for (let i = 2; i <= 20; i++) {
    const envKey = `HEROKU_API_KEY_${i}`;
    const keyValue = process.env[envKey]?.trim();
    if (keyValue) {
      keys.push({
        key: keyValue,
        name: envKey,
        index: i
      });
    }
  }
  
  return keys;
}

function getHerokuClient(apiKeyIndex?: number): { client: Heroku; keyInfo: HerokuApiKey } {
  const keys = getHerokuApiKeys();
  
  if (keys.length === 0) {
    throw new Error('No Heroku API keys configured');
  }
  
  let selectedKey: HerokuApiKey;
  
  if (apiKeyIndex !== undefined) {
    selectedKey = keys.find(k => k.index === apiKeyIndex) || keys[0];
  } else {
    const randomIndex = Math.floor(Math.random() * keys.length);
    selectedKey = keys[randomIndex];
  }
  
  return {
    client: new Heroku({ token: selectedKey.key }),
    keyInfo: selectedKey
  };
}

export function getAvailableApiKeys(): { index: number; name: string }[] {
  return getHerokuApiKeys().map(k => ({ index: k.index, name: k.name }));
}

async function createHerokuAppWithKey(appName: string, config: DeploymentConfig, apiKeyIndex: number) {
  const { client: heroku, keyInfo } = getHerokuClient(apiKeyIndex);
  
  const app = await heroku.post("/apps", {
    body: {
      name: appName,
      region: "us",
      stack: "heroku-22",
    },
  });

  await heroku.patch(`/apps/${appName}/config-vars`, {
    body: {
      NODE_ENV: "production",
      BOT_PREFIX: config.prefix,
      BOT_NUMBER: config.botNumber,
      BOT_OWNER_NAME: "Eclipse",
      BOT_NAME: "𝔼𝕔𝕝𝕚𝕡𝕤𝕖 𝕄𝔻",
      BOT_SESSION_DATA: config.sessionData,
      ...(config.openaiKey && { OPENAI_API_KEY: config.openaiKey }),
      ...(config.geminiKey && { GEMINI_API_KEY: config.geminiKey }),
      AUTO_VIEW_MESSAGE: config.autoViewMessage.toString(),
      AUTO_VIEW_STATUS: config.autoViewStatus.toString(),
      AUTO_REACT_STATUS: config.autoReactStatus.toString(),
      AUTO_REACT: config.autoReact.toString(),
      AUTO_STATUS_EMOJI: "❤️",
      AUTO_TYPING: config.autoTyping.toString(),
      AUTO_RECORDING: config.autoRecording.toString(),
    },
  });

  await heroku.put(`/apps/${appName}/buildpack-installations`, {
    body: {
      updates: [
        {
          buildpack: "heroku/nodejs",
        },
      ],
    },
  });

  const build = await heroku.post(`/apps/${appName}/builds`, {
    body: {
      source_blob: {
        url: "https://github.com/horlapookie/Eclipse-MD/tarball/main",
        version: "main",
      },
    },
  });

  return {
    appId: app.id,
    appName: app.name,
    buildId: build.id,
    webUrl: app.web_url,
    apiKeyUsed: keyInfo.index,
  };
}

export async function createHerokuApp(appName: string, config: DeploymentConfig, apiKeyIndex?: number) {
  const keys = getHerokuApiKeys();
  
  if (keys.length === 0) {
    throw new Error('No Heroku API keys configured. Please add at least one HEROKU_API_KEY.');
  }

  const startIndex = apiKeyIndex !== undefined ? apiKeyIndex : 1;
  const errors: { key: number; error: string }[] = [];

  for (let i = 0; i < keys.length; i++) {
    const currentKeyIndex = (startIndex + i - 1) % keys.length + 1;
    const key = keys.find(k => k.index === currentKeyIndex);
    
    if (!key) continue;

    try {
      console.log(`Attempting deployment with Heroku API key ${key.index} (${key.name})`);
      const result = await createHerokuAppWithKey(appName, config, currentKeyIndex);
      console.log(`Successfully deployed with API key ${key.index}`);
      return result;
    } catch (error: any) {
      const errorMsg = error.message || 'Unknown error';
      console.error(`Deployment failed with API key ${key.index}: ${errorMsg}`);
      
      errors.push({ key: key.index, error: errorMsg });

      if (error.statusCode === 422 && error.body?.id === 'verification_required') {
        console.log(`API key ${key.index} requires verification. Trying next key...`);
        continue;
      }
      
      if (error.statusCode === 402) {
        console.log(`API key ${key.index} account suspended/payment required. Trying next key...`);
        continue;
      }

      if (error.statusCode === 404) {
        console.log(`API key ${key.index} not found. Trying next key...`);
        continue;
      }

      if (i < keys.length - 1) {
        console.log(`API key ${key.index} failed. Trying next key...`);
        continue;
      }
    }
  }

  const errorSummary = errors.map(e => `Key ${e.key}: ${e.error}`).join(' | ');
  throw new Error(`All ${keys.length} Heroku API keys failed. Errors: ${errorSummary}`);
}

export async function getAppLogs(appName: string, lines: number = 100, apiKeyIndex?: number) {
  const { client: heroku } = getHerokuClient(apiKeyIndex);
  
  try {
    const logSession = await heroku.post(`/apps/${appName}/log-sessions`, {
      body: {
        lines,
        tail: false,
      },
    });

    const response = await fetch(logSession.logplex_url);
    const logs = await response.text();
    return logs;
  } catch (error: any) {
    console.error("Error fetching logs:", error);
    throw new Error(`Failed to fetch logs: ${error.message}`);
  }
}

export async function updateHerokuApp(appName: string, config: DeploymentConfig, apiKeyIndex?: number) {
  const keys = getHerokuApiKeys();
  const errors: { key: number; error: string }[] = [];

  for (const key of keys) {
    try {
      console.log(`Attempting update with API key ${key.index}`);
      const { client: heroku } = getHerokuClient(key.index);
      
      await heroku.patch(`/apps/${appName}/config-vars`, {
        body: {
          NODE_ENV: "production",
          BOT_PREFIX: config.prefix,
          BOT_NUMBER: config.botNumber,
          BOT_OWNER_NAME: "Eclipse",
          BOT_NAME: "𝔼𝕔𝕝𝕚𝕡𝕤𝕖 𝕄𝔻",
          BOT_SESSION_DATA: config.sessionData,
          ...(config.openaiKey && { OPENAI_API_KEY: config.openaiKey }),
          ...(config.geminiKey && { GEMINI_API_KEY: config.geminiKey }),
          AUTO_VIEW_MESSAGE: config.autoViewMessage.toString(),
          AUTO_VIEW_STATUS: config.autoViewStatus.toString(),
          AUTO_REACT_STATUS: config.autoReactStatus.toString(),
          AUTO_REACT: config.autoReact.toString(),
          AUTO_STATUS_EMOJI: "❤️",
          AUTO_TYPING: config.autoTyping.toString(),
          AUTO_RECORDING: config.autoRecording.toString(),
        },
      });

      await heroku.delete(`/apps/${appName}/dynos`);
      console.log(`Successfully updated app with API key ${key.index}`);

      return {
        success: true,
        message: "Bot configuration updated and restarted successfully",
      };
    } catch (error: any) {
      const errorMsg = error.message || 'Unknown error';
      console.error(`Update failed with API key ${key.index}: ${errorMsg}`);
      errors.push({ key: key.index, error: errorMsg });
    }
  }

  throw new Error(`Failed to update Heroku app with all API keys: ${errors.map(e => `Key ${e.key}: ${e.error}`).join(' | ')}`);
}

export async function restartApp(appName: string, apiKeyIndex?: number) {
  const keys = getHerokuApiKeys();
  const errors: { key: number; error: string }[] = [];

  for (const key of keys) {
    try {
      console.log(`Attempting restart with API key ${key.index}`);
      const { client: heroku } = getHerokuClient(key.index);
      await heroku.delete(`/apps/${appName}/dynos`);
      console.log(`Successfully restarted app with API key ${key.index}`);
      return { success: true };
    } catch (error: any) {
      const errorMsg = error.message || 'Unknown error';
      console.error(`Restart failed with API key ${key.index}: ${errorMsg}`);
      errors.push({ key: key.index, error: errorMsg });
    }
  }

  throw new Error(`Failed to restart app with all API keys: ${errors.map(e => `Key ${e.key}: ${e.error}`).join(' | ')}`);
}

export async function pauseApp(appName: string, apiKeyIndex?: number) {
  const keys = getHerokuApiKeys();
  const errors: { key: number; error: string }[] = [];

  for (const key of keys) {
    try {
      console.log(`Attempting pause with API key ${key.index}`);
      const { client: heroku } = getHerokuClient(key.index);
      await heroku.patch(`/apps/${appName}/formation/web`, {
        body: {
          quantity: 0
        }
      });
      console.log(`Successfully paused app with API key ${key.index}`);
      return { success: true, message: "Bot paused successfully" };
    } catch (error: any) {
      const errorMsg = error.message || 'Unknown error';
      console.error(`Pause failed with API key ${key.index}: ${errorMsg}`);
      errors.push({ key: key.index, error: errorMsg });
    }
  }

  throw new Error(`Failed to pause app with all API keys: ${errors.map(e => `Key ${e.key}: ${e.error}`).join(' | ')}`);
}

export async function resumeApp(appName: string, apiKeyIndex?: number) {
  const keys = getHerokuApiKeys();
  const errors: { key: number; error: string }[] = [];

  for (const key of keys) {
    try {
      console.log(`Attempting resume with API key ${key.index}`);
      const { client: heroku } = getHerokuClient(key.index);
      await heroku.patch(`/apps/${appName}/formation/web`, {
        body: {
          quantity: 1
        }
      });
      console.log(`Successfully resumed app with API key ${key.index}`);
      return { success: true, message: "Bot resumed successfully" };
    } catch (error: any) {
      const errorMsg = error.message || 'Unknown error';
      console.error(`Resume failed with API key ${key.index}: ${errorMsg}`);
      errors.push({ key: key.index, error: errorMsg });
    }
  }

  throw new Error(`Failed to resume app with all API keys: ${errors.map(e => `Key ${e.key}: ${e.error}`).join(' | ')}`);
}

export async function deleteApp(appName: string, apiKeyIndex?: number) {
  const keys = getHerokuApiKeys();
  const errors: { key: number; error: string }[] = [];

  for (const key of keys) {
    try {
      console.log(`Attempting delete with API key ${key.index}`);
      const { client: heroku } = getHerokuClient(key.index);
      await heroku.delete(`/apps/${appName}`);
      console.log(`Successfully deleted app with API key ${key.index}`);
      return { success: true };
    } catch (error: any) {
      const errorMsg = error.message || 'Unknown error';
      console.error(`Delete failed with API key ${key.index}: ${errorMsg}`);
      errors.push({ key: key.index, error: errorMsg });
    }
  }

  throw new Error(`Failed to delete app with all API keys: ${errors.map(e => `Key ${e.key}: ${e.error}`).join(' | ')}`);
}

export async function getAppInfo(appName: string, apiKeyIndex?: number) {
  const keys = getHerokuApiKeys();
  const errors: { key: number; error: string }[] = [];

  for (const key of keys) {
    try {
      console.log(`Attempting getAppInfo with API key ${key.index}`);
      const { client: heroku } = getHerokuClient(key.index);
      const app = await heroku.get(`/apps/${appName}`);
      console.log(`Successfully retrieved app info with API key ${key.index}`);
      return app;
    } catch (error: any) {
      const errorMsg = error.message || 'Unknown error';
      console.error(`getAppInfo failed with API key ${key.index}: ${errorMsg}`);
      errors.push({ key: key.index, error: errorMsg });
    }
  }

  throw new Error(`Failed to get app info with all API keys: ${errors.map(e => `Key ${e.key}: ${e.error}`).join(' | ')}`);
}

export async function tryAllApiKeys<T>(
  operation: (apiKeyIndex: number) => Promise<T>,
  appName: string
): Promise<T> {
  const keys = getHerokuApiKeys();
  let lastError: Error | null = null;
  
  for (const key of keys) {
    try {
      return await operation(key.index);
    } catch (error: any) {
      console.log(`API key ${key.name} failed for ${appName}: ${error.message}`);
      lastError = error;
      continue;
    }
  }
  
  throw lastError || new Error('All API keys failed');
}
