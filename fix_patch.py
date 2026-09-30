import re

with open('patches/expo-modules-core+57.0.19.patch', 'r') as f:
    patch = f.read()

# 1. Remove the entire diff chunk for SwiftUIHostingView.swift
patch = re.sub(r'diff --git a/node_modules/expo-modules-core/ios/Core/Views/SwiftUI/SwiftUIHostingView.swift.*?diff --git', 'diff --git', patch, flags=re.DOTALL)

# 2. In SwiftUIVirtualView.swift, we want to REMOVE the modifications we made (so it stays at its original @MainActor state).
# But instead of parsing the diff manually, let's just REPLACE the SwiftUIVirtualView diff block entirely!
patch = re.sub(r'diff --git a/node_modules/expo-modules-core/ios/Core/Views/SwiftUI/SwiftUIVirtualView.swift.*?diff --git', 'diff --git', patch, flags=re.DOTALL)

# 3. Same for ViewDefinition.swift (which removed @MainActor AnyArgument)
patch = re.sub(r'diff --git a/node_modules/expo-modules-core/ios/Core/Views/ViewDefinition.swift.*?diff --git', 'diff --git', patch, flags=re.DOTALL)

# Now, we need to ADD a NEW diff chunk for SwiftUIHostingView.swift that changes `AnyExpoSwiftUIHostingView` to `@preconcurrency AnyExpoSwiftUIHostingView` in the class definition of `HostingView`.
# Wait! `HostingView` is defined as:
# `public final class HostingView<Props: ViewProps, ContentView: View<Props>>: ExpoView, @MainActor AnyExpoSwiftUIHostingView`
# We want to change it to:
# `public final class HostingView<Props: ViewProps, ContentView: View<Props>>: ExpoView, @preconcurrency AnyExpoSwiftUIHostingView`

new_chunk = """diff --git a/node_modules/expo-modules-core/ios/Core/Views/SwiftUI/SwiftUIHostingView.swift b/node_modules/expo-modules-core/ios/Core/Views/SwiftUI/SwiftUIHostingView.swift
index cdaa69f..xxxxxxx 100644
--- a/node_modules/expo-modules-core/ios/Core/Views/SwiftUI/SwiftUIHostingView.swift
+++ b/node_modules/expo-modules-core/ios/Core/Views/SwiftUI/SwiftUIHostingView.swift
@@ -42,7 +42,7 @@ extension ExpoSwiftUI {
   /**
    A hosting view that renders a SwiftUI view inside the UIKit view hierarchy.
    */
-  public final class HostingView<Props: ViewProps, ContentView: View<Props>>: ExpoView, @MainActor AnyExpoSwiftUIHostingView {
+  public final class HostingView<Props: ViewProps, ContentView: View<Props>>: ExpoView, @preconcurrency AnyExpoSwiftUIHostingView {
     /**
      Props object that stores all the props for this particular view.
      It's an environment object that is observed by the content view.
"""

patch = patch + "\n" + new_chunk

with open('patches/expo-modules-core+57.0.19.patch', 'w') as f:
    f.write(patch)
