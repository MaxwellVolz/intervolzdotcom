#!/bin/bash

# Output file
output_file="zzz_output.md"
> "$output_file"  # clear existing content

# List of files
files=(
  "pages/[slug].tsx"
  "pages/index.tsx"
  "pages/admin.tsx"
  "pages/_app.tsx"
)

# Write each file's path and content in a markdown code block
for file in "${files[@]}"; do
  if [[ -f "$file" ]]; then
    echo "### $file" >> "$output_file"
    echo '```tsx' >> "$output_file"
    cat "$file" >> "$output_file"
    echo '```' >> "$output_file"
    echo "" >> "$output_file"
  else
    echo "### $file (NOT FOUND)" >> "$output_file"
    echo "" >> "$output_file"
  fi
done
