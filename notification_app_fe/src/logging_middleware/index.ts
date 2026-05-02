import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'http://20.207.122.201/evaluation-service';

type Stack = 'backend' | 'frontend';
type Level = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
type BackendPackage = 'cache' | 'controller' | 'cron_job' | 'db' | 'domain' | 'handler' | 'repository' | 'route' | 'service';
type FrontendPackage = 'api' | 'component' | 'hook' | 'page' | 'state' | 'style';
type SharedPackage = 'auth' | 'config' | 'middleware' | 'utils';
type Package = BackendPackage | FrontendPackage | SharedPackage;

interface TokenCache {
  token: string;
  expiresAt: number;
}

let cachedToken: TokenCache | null = null;

async function getAuthToken(): Promise<string> {
  const now = Date.now() / 1000;

  if (cachedToken && cachedToken.expiresAt > now + 60) {
    return cachedToken.token;
  }

  try {
    const response = await axios.post(`${BASE_URL}/auth`, {
      email: process.env.EMAIL,
      name: process.env.NAME,
      rollNo: process.env.ROLL_NO,
      accessCode: process.env.ACCESS_CODE,
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
    });

    // expires_in from this server is an absolute Unix timestamp (seconds), not a duration
    const expiresAt = response.data.expires_in;
    cachedToken = {
      token: response.data.access_token,
      expiresAt,
    };

    return response.data.access_token;
  } catch (error) {
    throw new Error(`Authentication failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function Log(
  stack: Stack,
  level: Level,
  pkg: Package,
  message: string
): Promise<void> {
  try {
    const validStacks: Stack[] = ['backend', 'frontend'];
    const validLevels: Level[] = ['debug', 'info', 'warn', 'error', 'fatal'];
    const validBackendPackages: BackendPackage[] = ['cache', 'controller', 'cron_job', 'db', 'domain', 'handler', 'repository', 'route', 'service'];
    const validFrontendPackages: FrontendPackage[] = ['api', 'component', 'hook', 'page', 'state', 'style'];
    const validSharedPackages: SharedPackage[] = ['auth', 'config', 'middleware', 'utils'];

    if (!validStacks.includes(stack)) {
      throw new Error(`Invalid stack: ${stack}. Must be 'backend' or 'frontend'`);
    }

    if (!validLevels.includes(level)) {
      throw new Error(`Invalid level: ${level}. Must be one of: ${validLevels.join(', ')}`);
    }

    const allowedPackages = [
      ...validSharedPackages,
      ...(stack === 'backend' ? validBackendPackages : validFrontendPackages),
    ];

    if (!allowedPackages.includes(pkg as any)) {
      throw new Error(`Invalid package for ${stack}: ${pkg}`);
    }

    const token = await getAuthToken();

    const payload = {
      stack,
      level,
      package: pkg,
      message,
    };

    await axios.post(`${BASE_URL}/logs`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (_error) {
    // Logging must never crash the application
  }
}

export default { Log };
