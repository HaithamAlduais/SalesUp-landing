# -*- coding: utf-8 -*-
"""Direct client for the Figma Dev Mode MCP server (Streamable HTTP).
Usage:
  python figma_mcp.py <tool> <nodeId> [outfile]
Tools: get_metadata | get_design_context | get_screenshot | get_variable_defs
"""
import json
import sys
import urllib.request

BASE = "http://127.0.0.1:3845/mcp"


def post(payload, session=None):
    req = urllib.request.Request(BASE, method="POST")
    req.add_header("Content-Type", "application/json")
    req.add_header("Accept", "application/json, text/event-stream")
    if session:
        req.add_header("Mcp-Session-Id", session)
    body = json.dumps(payload).encode()
    resp = urllib.request.urlopen(req, body, timeout=420)
    sid = resp.headers.get("Mcp-Session-Id", session)
    raw = resp.read().decode("utf-8", "replace")
    if raw.lstrip().startswith("{"):
        return sid, json.loads(raw)
    # The Figma server sends one SSE event whose data contains RAW
    # newlines (spec-violating): take everything after the first
    # `data:` and parse leniently.
    idx = raw.find("data:")
    if idx == -1:
        return sid, None
    payload = raw[idx + 5 :].strip()
    try:
        return sid, json.loads(payload, strict=False)
    except json.JSONDecodeError:
        return sid, None


def call(tool, args):
    sid, _ = post({
        "jsonrpc": "2.0", "id": 1, "method": "initialize",
        "params": {"protocolVersion": "2024-11-05", "capabilities": {},
                   "clientInfo": {"name": "cc", "version": "1"}},
    })
    post_notify(sid)
    _, result = post({
        "jsonrpc": "2.0", "id": 2, "method": "tools/call",
        "params": {"name": tool, "arguments": args},
    }, sid)
    return result


def post_notify(sid):
    req = urllib.request.Request(BASE, method="POST")
    req.add_header("Content-Type", "application/json")
    req.add_header("Accept", "application/json, text/event-stream")
    req.add_header("Mcp-Session-Id", sid)
    body = json.dumps({"jsonrpc": "2.0", "method": "notifications/initialized"}).encode()
    try:
        urllib.request.urlopen(req, body, timeout=30).read()
    except Exception:
        pass


if __name__ == "__main__":
    tool, node = sys.argv[1], sys.argv[2]
    out = sys.argv[3] if len(sys.argv) > 3 else None
    res = call(tool, {"nodeId": node, "clientFrameworks": "react", "clientLanguages": "typescript"})
    if res is None:
        print("NO RESPONSE")
        sys.exit(1)
    content = res.get("result", {}).get("content", [])
    images = [c for c in content if c.get("type") == "image"]
    if images and out:
        import base64
        open(out, "wb").write(base64.b64decode(images[0].get("data", "")))
        print(f"wrote {out} (image)")
        sys.exit(0)
    text = "\n".join(c.get("text", "") for c in content if c.get("type") == "text")
    if not text and content:
        text = json.dumps(content)[:2000]
    if out:
        open(out, "w", encoding="utf-8").write(text)
        print(f"wrote {out} ({len(text)} chars)")
    else:
        sys.stdout.buffer.write(text.encode("utf-8"))
