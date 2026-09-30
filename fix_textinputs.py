import os
import glob
import re

screens_dir = "screens"
for filepath in glob.glob(os.path.join(screens_dir, "*.js")):
    with open(filepath, "r") as f:
        content = f.read()
    
    # We want to ensure that style={{ lineHeight: undefined }} is at the very end of TextInput,
    # or just add it if it's missing, but it's easier to just do a regex replace or add it to className?
    # Actually, NativeWind allows you to disable line heights by not using the text-Xl classes, 
    # but we need the font size. 
    # A better way is to explicitly append `style={[{ lineHeight: undefined }, ... ]}` but that's hard to parse.
    
    # Let's just find `<TextInput` and replace any `style={{...}}` with nothing, 
    # and then append a unified style at the end before `/>` or `>`.
    pass
