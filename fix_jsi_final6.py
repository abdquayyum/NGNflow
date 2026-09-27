import os
import re
import shutil
import subprocess

cxx_dir = "node_modules/expo-modules-jsi/apple/Sources/ExpoModulesJSI-Cxx"
swift_dir = "node_modules/expo-modules-jsi/apple/Sources"

# Reset patches
subprocess.run("rm -rf patches/expo-modules-jsi+57.1.1.patch", shell=True)
subprocess.run("rm -rf node_modules/expo-modules-jsi", shell=True)
subprocess.run("npm install expo-modules-jsi@57.1.1", shell=True)

# Package.swift fix (IMPORTANT)
pkg_path = "node_modules/expo-modules-jsi/apple/Package.swift"
with open(pkg_path, "r") as f:
    pkg = f.read()
pkg = pkg.replace("swift-tools-version: 6.2", "swift-tools-version: 6.0")
with open(pkg_path, "w") as f:
    f.write(pkg)

# 1. Rename namespace in C++ files and inject factory functions
for root, _, files in os.walk(cxx_dir):
    for file in files:
        if file.endswith((".h", ".cpp")):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()
            
            # replace `namespace expo {` -> `namespace expo_jsi {`
            content = content.replace("namespace expo {", "namespace expo_jsi {")
            # replace `} // namespace expo` -> `} // namespace expo_jsi`
            content = content.replace("} // namespace expo", "} // namespace expo_jsi")
            # replace `expo::` -> `expo_jsi::`
            content = content.replace("expo::", "expo_jsi::")
            
            if "RuntimeScheduler.h" in filepath:
                # Remove invalid SWIFT_RETURNS_RETAINED
                content = content.replace("SWIFT_RETURNS_RETAINED RuntimeScheduler", "RuntimeScheduler")
                
                # Add factory functions
                factories = """
namespace expo_jsi {
  inline RuntimeScheduler* createRuntimeScheduler(void *scheduler, RuntimeScheduler::ScheduleFn fn) {
    return new RuntimeScheduler(scheduler, fn);
  }
  inline RuntimeScheduler* createRuntimeScheduler() {
    return new RuntimeScheduler();
  }
}
"""
                content += factories
            
            if "HostFunctionClosure.h" in filepath:
                # Add factory functions
                factories = """
namespace expo_jsi {
  inline HostFunctionClosure* createHostFunctionClosure(HostFunctionClosure::Context context, HostFunctionClosure::Closure closure, HostFunctionClosure::Deallocator deallocator) {
    return new HostFunctionClosure(context, closure, deallocator);
  }
}
"""
                content += factories

            with open(filepath, 'w') as f:
                f.write(content)

# 2. Fix Swift files
for root, _, files in os.walk(swift_dir):
    for file in files:
        if file.endswith(".swift"):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()

            # Fix weak let -> weak var
            content = content.replace("weak let ", "weak var ")

            # Replace `ExpoModulesJSI_Cxx.expo.` -> `expo_jsi.`
            content = content.replace("ExpoModulesJSI_Cxx.expo.", "expo_jsi.")
            
            # Replace `expo.` -> `expo_jsi.` (just in case)
            content = re.sub(r'(?<![a-zA-Z0-9_.\-])expo\.', 'expo_jsi.', content)
            
            # Fix module visibility for C++ types
            content = content.replace("internal import ExpoModulesJSI_Cxx", "public import ExpoModulesJSI_Cxx")
            
            # Fix JavaScriptPromise.swift longLivedState
            if "JavaScriptPromise.swift" in filepath:
                content = content.replace(
                    "private let longLivedState = LongLivedState()",
                    "private let longLivedState: LongLivedState"
                )
                content = content.replace(
                    "public init(_ runtime: JavaScriptRuntime, _ object: consuming JavaScriptObject) throws {\n    self.runtime = runtime",
                    "public init(_ runtime: JavaScriptRuntime, _ object: consuming JavaScriptObject) throws {\n    self.longLivedState = LongLivedState()\n    self.runtime = runtime"
                )
                content = content.replace(
                    "public init(_ runtime: JavaScriptRuntime) throws {\n    self.runtime = runtime",
                    "public init(_ runtime: JavaScriptRuntime) throws {\n    self.longLivedState = LongLivedState()\n    self.runtime = runtime"
                )

            # Fix regex literal and syntax errors in JavaScriptRuntime.swift
            if "JavaScriptRuntime.swift" in filepath:
                content = content.replace(
                    "/^[a-zA-Z_$][a-zA-Z0-9_$]*$/",
                    'try! Regex("^[a-zA-Z_$][a-zA-Z0-9_$]*$")'
                )
                content = content.replace(
                    "_ arguments: consuming JavaScriptValuesBuffer,\n    ) async throws -> JavaScriptValue",
                    "_ arguments: consuming JavaScriptValuesBuffer\n    ) async throws -> JavaScriptValue"
                )
                # Fix vector push_back by consuming
                content = content.replace(
                    "vector.push_back(consuming: propNameId)",
                    "vector.push_back(consume propNameId)"
                )
                # Migrate to C++ factory functions
                content = content.replace(
                    "expo_jsi.RuntimeScheduler(",
                    "expo_jsi.createRuntimeScheduler("
                )
                content = content.replace(
                    "expo_jsi.HostFunctionClosure(",
                    "expo_jsi.createHostFunctionClosure("
                )
                
            # Rewrite Task+immediate.swift completely
            if "Task+immediate.swift" in filepath:
                content = """// swift-format-ignore-file: AlwaysUseLowerCamelCase

extension Task where Failure == any Error {
  @discardableResult
  public static func immediate_polyfill(
    name: String? = nil,
    priority: TaskPriority? = nil,
    @_inheritActorContext @_implicitSelfCapture operation: sending @escaping @isolated(any) () async throws -> Success
  ) -> Task<Success, any Error> {
    return Task(priority: priority ?? .high, operation: operation)
  }
}
"""

            # Fix Sendable warnings
            if "weak var runtime" in content:
                if "Sendable {" in content and "@unchecked" not in content:
                    content = content.replace("Sendable {", "@unchecked Sendable {")
                elif re.search(r'class\s+JavaScript[a-zA-Z0-9_]+.*\{', content) and "@unchecked" not in content:
                    content = re.sub(
                        r'(class\s+JavaScript[a-zA-Z0-9_]+[^{]*)(\s*\{)',
                        r'\1, @unchecked Sendable \2',
                        content,
                        count=1
                    )

            with open(filepath, 'w') as f:
                f.write(content)

subprocess.run("npx patch-package expo-modules-jsi", shell=True)
