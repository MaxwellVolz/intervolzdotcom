# The Perfect Circle - Deployment Instructions

## Static Export Built Successfully

The game has been built as a static export and is ready to deploy to `intervolz.com/theperfectcircle`.

## Deployment Steps

1. **Copy the contents of the `out/` folder** to your web server's public directory at `/theperfectcircle/`

   ```bash
   # From your server's public directory:
   cp -r /path/to/theperfectcircle/out/* /path/to/public/theperfectcircle/
   ```

2. **Ensure the directory structure** on your server looks like this:
   ```
   public/
   └── theperfectcircle/
       ├── index.html
       ├── _next/
       ├── 404.html
       └── ... (all other files from out/)
   ```

3. **The game will be accessible at:**
   - Main game: `https://intervolz.com/theperfectcircle/`

## Configuration Details

- **Base Path:** `/theperfectcircle`
- **Output Type:** Static export (no server required)
- **Build Output:** `out/` folder
- **Game Features:** Touch & mouse drawing, 5-second timer, score tracking

## Web Server Configuration

### Apache (.htaccess)
If using Apache, you may need to add this to your `.htaccess` file in the `/theperfectcircle/` directory:

```apache
# Fallback to index.html for client-side routing
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /theperfectcircle/
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /theperfectcircle/index.html [L]
</IfModule>
```

### Nginx
If using Nginx, add this to your server block:

```nginx
location /theperfectcircle/ {
    alias /path/to/public/theperfectcircle/;
    try_files $uri $uri/ /theperfectcircle/index.html;
}
```

## Rebuilding

To rebuild the static export after making changes:

```bash
npm run build
```

The updated files will be in the `out/` folder.

## File Size

Total build size: 940KB (all static assets included)

## Notes

- No server-side processing required
- All assets are pre-rendered
- Works on any static file hosting service
- Mobile-optimized and responsive
- Touch-friendly for mobile devices
- HTML5 Canvas-based drawing
