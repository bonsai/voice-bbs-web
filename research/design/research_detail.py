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

# High quality references
urls = [
    ("01", "https://www.google.com/search?q=clubhouse+app+ui+redesign+premium+dark+2024&tbm=isch"),
    ("02", "https://www.google.com/search?q=discord+mobile+ui+voice+channel+bubble+dark+design+premium&tbm=isch"),
    ("03", "https://www.google.com/search?q=space+audio+chat+app+UI+design+liquid+bubble+glassmorphism+premium&tbm=isch"),
    ("04", "https://www.google.com/search?q=voice+chat+app+UI+mobile+dark+mode+best+design+dribbble+2024&tbm=isch"),
    ("05", "https://www.google.com/search?q=thread+chat+bubble+dark+ui+design+glassmorphism+premium+mobile&tbm=isch"),
]

for tag, url in urls:
    send({"jsonrpc":"2.0","id":int(tag),"method":"tools/call","params":{"name":"browser_navigate","arguments":{"url": url}}})
    time.sleep(3)
    send({"jsonrpc":"2.0","id":int(tag)+50,"method":"tools/call","params":{"name":"browser_take_screenshot","arguments":{"type":"png","filename":f"/home/bons/.playwright-mcp/design_{tag}.png","fullPage":False}}})
    print(f"{tag}:", "ok")

proc.terminate()
