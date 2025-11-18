import Heroku from "heroku-client";

const heroku = new Heroku({ token: process.env.HEROKU_API_KEY?.trim() });

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

export async function createHerokuApp(appName: string, config: DeploymentConfig) {
  try {
    // Create the app in personal account
    const app = await heroku.post("/apps", {
      body: {
        name: appName,
        region: "us",
        stack: "heroku-22",
      },
    });

    // Set config vars (environment variables)
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

    // Add buildpack
    await heroku.put(`/apps/${appName}/buildpack-installations`, {
      body: {
        updates: [
          {
            buildpack: "heroku/nodejs",
          },
        ],
      },
    });

    // Create build from GitHub repo
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
    };
  } catch (error: any) {
    console.error("Heroku deployment error:", error);
    
    // Check for specific Heroku errors
    if (error.statusCode === 422 && error.body?.id === 'verification_required') {
      throw new Error('Heroku account verification required. Please add payment information at https://heroku.com/verify');
    }
    
    throw new Error(`Failed to deploy to Heroku: ${error.message}`);
  }
}

export async function getAppLogs(appName: string, lines: number = 100) {
  try {
    const logSession = await heroku.post(`/apps/${appName}/log-sessions`, {
      body: {
        lines,
        tail: false,
      },
    });

    // Fetch logs from the logplex URL
    const response = await fetch(logSession.logplex_url);
    const logs = await response.text();
    return logs;
  } catch (error: any) {
    console.error("Error fetching logs:", error);
    throw new Error(`Failed to fetch logs: ${error.message}`);
  }
}

export async function restartApp(appName: string) {
  try {
    await heroku.delete(`/apps/${appName}/dynos`);
    return { success: true };
  } catch (error: any) {
    console.error("Error restarting app:", error);
    throw new Error(`Failed to restart app: ${error.message}`);
  }
}

export async function deleteApp(appName: string) {
  try {
    await heroku.delete(`/apps/${appName}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting app:", error);
    throw new Error(`Failed to delete app: ${error.message}`);
  }
}

export async function getAppInfo(appName: string) {
  try {
    const app = await heroku.get(`/apps/${appName}`);
    return app;
  } catch (error: any) {
    console.error("Error getting app info:", error);
    throw new Error(`Failed to get app info: ${error.message}`);
  }
}
