"""Optional Python static-file server for the CivicTrust frontend."""

import http.server
import socketserver
import os
import sys
from urllib.parse import urlsplit

PORT = 3000
DIRECTORY = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'frontend')
SHARED_DIRECTORY = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'shared')

class CivicTrustHTTPHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def translate_path(self, path):
        requested_path = urlsplit(path).path
        if requested_path.startswith('/shared/'):
            relative_path = requested_path[len('/shared/'):].replace('/', os.sep)
            shared_path = os.path.abspath(os.path.join(SHARED_DIRECTORY, relative_path))
            if os.path.commonpath([SHARED_DIRECTORY, shared_path]) != SHARED_DIRECTORY:
                return os.path.join(SHARED_DIRECTORY, '__not_found__')
            return shared_path
        return super().translate_path(path)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('X-Content-Type-Options', 'nosniff')
        super().end_headers()

    def do_GET(self):
        # Serve the frontend entry point for root path or SPA routes.
        if self.path == '/' or self.path == '':
            self.path = '/index.html'
        return super().do_GET()

if __name__ == '__main__':
    os.chdir(DIRECTORY)
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('127.0.0.1', PORT), CivicTrustHTTPHandler) as httpd:
        print("=" * 54)
        print("  CIVICTRUST AI — PYTHON LOCAL SERVER RUNNING")
        print(f"  Local URL: http://127.0.0.1:{PORT}")
        print("=" * 54)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")
            httpd.server_close()
            sys.exit(0)
