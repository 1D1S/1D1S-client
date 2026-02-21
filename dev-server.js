const { exec } = require('child_process');
const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');
const next = require('next');
const { parse } = require('url');

const dev = process.env.NODE_ENV !== 'production';
const requestedProtocol = process.env.LOCAL_ALIAS_PROTOCOL || 'https';
const localAliasHost =
  process.env.LOCAL_ALIAS_HOST || 'local.1day1streak.com';
const bindHost = process.env.LOCAL_BIND_HOST;
const isMac = process.platform === 'darwin';
const isWindows = process.platform === 'win32';
const strictHttps = process.env.LOCAL_ALIAS_HTTPS_STRICT === 'true';
const allowInsecureTls = process.env.LOCAL_ALLOW_INSECURE_TLS === 'true';

const keyPath =
  process.env.LOCAL_SSL_KEY_PATH || '_wildcard.1day1streak.com-key.pem';
const certPath =
  process.env.LOCAL_SSL_CERT_PATH || '_wildcard.1day1streak.com.pem';
const resolvedKeyPath = path.resolve(process.cwd(), keyPath);
const resolvedCertPath = path.resolve(process.cwd(), certPath);

function hasHttpsCertFiles() {
  return fs.existsSync(resolvedKeyPath) && fs.existsSync(resolvedCertPath);
}

const shouldUseHttps =
  requestedProtocol === 'https' ? hasHttpsCertFiles() : false;

if (requestedProtocol === 'https' && !shouldUseHttps) {
  const message = [
    'HTTPS 인증서 파일을 찾지 못했습니다.',
    `LOCAL_SSL_KEY_PATH=${resolvedKeyPath}`,
    `LOCAL_SSL_CERT_PATH=${resolvedCertPath}`,
  ].join('\n');

  if (strictHttps) {
    throw new Error(message);
  }

  console.warn(message);
  console.warn(
    'LOCAL_ALIAS_PROTOCOL=http 으로 fallback 합니다. ' +
      'HTTPS가 필요하면 인증서를 추가하거나 경로를 지정해주세요.'
  );
}

const protocol = shouldUseHttps ? 'https' : 'http';
const defaultPort = shouldUseHttps ? 443 : 3000;
const port = Number(process.env.LOCAL_ALIAS_PORT || process.env.PORT || defaultPort);
const localUrl =
  port === (shouldUseHttps ? 443 : 80)
    ? `${protocol}://${localAliasHost}`
    : `${protocol}://${localAliasHost}:${port}`;

if (dev) {
  // NOTE: 자체 인증서 백엔드 호출이 필요할 때만 수동으로 허용
  if (allowInsecureTls) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }
  // Turbopack 비활성화 (로컬 alias 환경 안정화 목적)
  process.env.TURBOPACK = '0';
}

const app = next({
  dev,
  hostname: localAliasHost,
  port,
  turbopack: false,
});
const handle = app.getRequestHandler();

function getListenArgs() {
  const defaultHost = isMac ? undefined : isWindows ? undefined : '127.0.0.1';

  if (bindHost === 'none') {
    return [port];
  }

  const host = bindHost || defaultHost;
  return host ? [port, host] : [port];
}

function getHttpsOptions() {
  return {
    key: fs.readFileSync(resolvedKeyPath),
    cert: fs.readFileSync(resolvedCertPath),
  };
}

function openBrowser(url) {
  if (process.env.LOCAL_ALIAS_OPEN_BROWSER === 'false') {
    return;
  }

  const openCommand = isMac ? 'open' : isWindows ? 'start' : 'xdg-open';
  exec(`${openCommand} "${url}"`);
}

app
  .prepare()
  .then(() => {
    const requestHandler = async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (error) {
        console.error('Error occurred handling', req.url, error);
        res.statusCode = 500;
        res.end('internal server error');
      }
    };

    const server = shouldUseHttps
      ? https.createServer(getHttpsOptions(), requestHandler)
      : http.createServer(requestHandler);

    server.listen(...getListenArgs(), (error) => {
      if (error) {
        throw error;
      }

      console.log('============================================');
      console.log('Local alias server is ready.');
      console.log(`URL: ${localUrl}`);
      console.log(`Protocol: ${protocol.toUpperCase()}`);
      console.log(`Host: ${localAliasHost}`);
      console.log(`Port: ${port}`);
      console.log('============================================');

      openBrowser(localUrl);
    });
  })
  .catch((error) => {
    console.error('Failed to start local alias server:', error);
    process.exit(1);
  });
