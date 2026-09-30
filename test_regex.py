import re
texts = [
    "public final class JavaScriptError: Error, Sendable {",
    "public final class JavaScriptValue: JavaScriptType, Equatable, Escapable {",
    "public final class JavaScriptPropNameID: JavaScriptType {\n"
]
for content in texts:
    if "Sendable {" in content and "@unchecked" not in content:
        content = content.replace("Sendable {", "@unchecked Sendable {")
    elif re.search(r'class\s+JavaScript[a-zA-Z0-9_]+.*\{', content) and "@unchecked" not in content:
        content = re.sub(
            r'(class\s+JavaScript[a-zA-Z0-9_]+[^{]*)(\s*\{)',
            r'\1, @unchecked Sendable\2',
            content,
            count=1
        )
    print(repr(content))
