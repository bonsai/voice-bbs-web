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

# Search for top voice messaging UI designs
queries = [
    ("01", "site:dribbble.com \"voice chat\" OR \"voice message\" OR \"audio chat\" app dark UI premium 2024"),
    ("02", "site:behance.net voice messaging app UI design dark glassmorphism"),
    ("03", "site:figma.com \"voice chat\" OR \"audio\" app UI kit dark mode premium"),
    ("04", "clubhouse app UI redesign mobile dark mode bubble"),
    ("05", "space audio social app UI design 2024 premium dark"),
]

for tag, q in queries:
    url = f"https://www.google.com/search?q={q.replace(' ', '+')}&tbm=isch"
    send({"jsonrpc":"2.0","id":int(tag),"method":"tools/call","params":{"name":"browser_navigate","arguments":{"url": url}}})
    time.sleep(3)
    send({"jsonrpc":"2.0","id":int(tag)+50,"method":"tools/call","params":{"name":"browser_take_screenshot","arguments":{"type":"png","filename":f"/home/bons/.playwright-mcp/voice_ui_{tag}.png","fullPage":False}}})
    print(f"{tag}:", "ok")

proc.terminate()
