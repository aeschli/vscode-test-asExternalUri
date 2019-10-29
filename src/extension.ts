import * as vscode from 'vscode';
import * as https from 'https';
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';

const HTTPS_PORT = 3000;

const HTTP_PORT = 3001;

export function activate(context: vscode.ExtensionContext) {

  startServer(HTTPS_PORT, HTTP_PORT);

  const disposable = vscode.commands.registerCommand('test.asExternalUri', async () => {
    const response = await vscode.window.showInputBox({
      prompt: 'Enter uri to resolve',
      value: 'http://localhost:3000'
    });

    if (!response) {
      return
    }

    const resolved = await vscode.env.asExternalUri(vscode.Uri.parse(response));
    vscode.env.openExternal(vscode.Uri.parse(response));

    vscode.window.showInformationMessage(`Resolved to: ${resolved} on client and copied to clipboard`);
    vscode.env.clipboard.writeText('Foo' + resolved.toString());
  });
  context.subscriptions.push(disposable);

  vscode.window.registerUriHandler({
    handleUri: (uri: vscode.Uri) => {
      vscode.window.showInformationMessage('I got called');
    }
  })



function startServer(httpsPort: number, httpPort: number) {
  const options = {
    key: fs.readFileSync(path.join(__dirname, '..', '..', 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '..', '..', 'cert.pem'))
  };
  const httpsServer = https.createServer(options, (req, res) => {
    res.end('Hello world!');
  });
  httpsServer.on('clientError', (err, socket) => {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
  });
  httpsServer.listen(httpsPort);

  const server = http.createServer((req, res) => {
    res.end('Hello world!');
  });
  server.on('clientError', (err, socket) => {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
  });
  server.listen(httpPort);
  vscode.window.showInformationMessage(`Started local http server: ${httpPort}, https server: ${httpsPort}, vscode url: ${vscode.env.uriScheme}://${'bierner.test-asexternaliri'}/'}}`);
}

}