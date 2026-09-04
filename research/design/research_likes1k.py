import subprocess, json, time

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

# Dribbble direct search with high likes
urls = [
    ("01", "https://dribbble.com/search/voice%20chat"),
    ("02", "https://dribbble.com/search/chat%20bubble"),
]

for tag, url in urls:
    send({"jsonrpc":"2.0","id":int(tag),"method":"tools/call","params":{"name":"browser_navigate","arguments":{"url": url}}})
    time.sleep(4)
    send({"jsonrpc":"2.0","id":int(tag)+50,"method":"tools/call","params":{"name":"browser_take_screenshot","arguments":{"type":"png","filename":f"/home/bons/.playwright-mcp/dribbble_{tag}.png","fullPage":True}}})
    print(f"{tag}:", "ok")

proc.terminate()
