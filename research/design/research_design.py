import subprocess, json, time, urllib.parse

proc = subprocess.Popen(
    ["/home/bons/.nvm/versions/node/v24.15.0/bin/node",
     "/home/bons/.nvm/versions/node/v24.15.0/lib/node_modules/@playwright/mcp/cli.js",
     "--browser", "msedge",
     "--executable-path", "/usr/bin/microsoft-edge"],
    stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True
)

def send(req):
    proc.stdin.write(json.dumps(req) + "\n")
    proc.stdin.flush()
    return proc.stdout.readline()

send({"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"pi","version":"1.0"}}})

queries = [
    'site:dribbble.com voice chat bubble UI design',
    'site:behance.net social audio app UI',
    'site:figma.com voice messaging interface',
]

for i, q in enumerate(queries, 2):
    url = f"https://www.google.com/search?q={urllib.parse.quote(q)}&tbm=isch"
    send({"jsonrpc":"2.0","id":i,"method":"tools/call","params":{"name":"browser_navigate","arguments":{"url": url}}})
    time.sleep(3)
    resp = send({"jsonrpc":"2.0","id":i+100,"method":"tools/call","params":{"name":"browser_take_screenshot","arguments":{"type":"png","filename":f"/home/bons/.playwright-mcp/research_{i-2}.png","fullPage":False}}})
    print(f"q{i-2}:", resp.strip()[:100])

proc.terminate()
