import os

filepath = 'node_modules/expo-modules-jsi/apple/Sources/ExpoModulesJSI/Utilities/ErrorHandling.swift'
with open(filepath, 'r') as f:
    content = f.read()

# Replace the first function definition
old1 = """@_transparent
internal func forwardingSwiftErrorsToJS(
  runtime: JavaScriptRuntime,
  _ body: () throws -> facebook.jsi.Value
) -> facebook.jsi.Value {"""
new1 = """@_transparent
@JavaScriptActor
internal func forwardingSwiftErrorsToJS(
  runtime: JavaScriptRuntime,
  _ body: @JavaScriptActor () throws -> facebook.jsi.Value
) -> facebook.jsi.Value {"""
content = content.replace(old1, new1)

# Replace the second function definition
old2 = """@_transparent
internal func forwardingSwiftErrorsToJS(
  runtime: JavaScriptRuntime,
  _ body: () throws -> Bool
) -> Bool {"""
new2 = """@_transparent
@JavaScriptActor
internal func forwardingSwiftErrorsToJS(
  runtime: JavaScriptRuntime,
  _ body: @JavaScriptActor () throws -> Bool
) -> Bool {"""
content = content.replace(old2, new2)

with open(filepath, 'w') as f:
    f.write(content)

print("Patched ErrorHandling.swift")
