import json

with open("app.json", "r") as f:
    app_data = json.load(f)

plugins = app_data["expo"].get("plugins", [])

# Check if expo-build-properties is already in plugins
found = False
for i, p in enumerate(plugins):
    if isinstance(p, list) and p[0] == "expo-build-properties":
        if "ios" not in p[1]:
            p[1]["ios"] = {}
        p[1]["ios"]["usePrecompiledModules"] = False
        found = True
        break
    elif p == "expo-build-properties":
        plugins[i] = ["expo-build-properties", {"ios": {"usePrecompiledModules": False}}]
        found = True
        break

if not found:
    plugins.append([
        "expo-build-properties",
        {
            "ios": {
                "usePrecompiledModules": False
            }
        }
    ])

app_data["expo"]["plugins"] = plugins

with open("app.json", "w") as f:
    json.dump(app_data, f, indent=2)

