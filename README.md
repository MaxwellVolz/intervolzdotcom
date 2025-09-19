# intervolzdotcom — Next.js + MDX + Decap CMS

A modern blog setup with Git-backed content, visual editing, automated Jenkins deployment, and NGINX hosting via Cloudflare Tunnel.
- [intervolzdotcom — Next.js + MDX + Decap CMS](#intervolzdotcom--nextjs--mdx--decap-cms)
  - [Stack Overview](#stack-overview)
  - [Development](#development)
    - [Install dependencies](#install-dependencies)
    - [Run dev server](#run-dev-server)
  - [Writing Posts](#writing-posts)
    - [Option 1: Use Decap CMS](#option-1-use-decap-cms)
    - [Option 2: Manually edit or create `.mdx` files in `/content/posts`](#option-2-manually-edit-or-create-mdx-files-in-contentposts)
  - [Deployment Architecture](#deployment-architecture)
    - [1. Jenkins Pipeline](#1-jenkins-pipeline)
    - [2. NGINX Setup (Ubuntu)](#2-nginx-setup-ubuntu)
    - [3. Cloudflare Tunnel](#3-cloudflare-tunnel)
  - [Build \& Export](#build--export)
  - [References](#references)
  - [Earth](#earth)

---

## Stack Overview

| Tech          | Desc                                       |
| ------------- | ------------------------------------------ |
| Next.js + MDX | static site generation                     |
| Decap         | CMS at `/admin` for visual editing         |
| Git           | as the content store (no DB)               |
| Github Auth   | Auth for CMS (via token or OAuth)          |
| Jenkins       | Pipeline for CI/CD on push                 |
| NGINX         | to serve static assets                     |
| Cloudflare    | Tunnel to expose port 80 without public IP |

---

## Development

### Install dependencies

```bash
npm install
```

### Run dev server

```bash
npm run dev
```

Preview Site: [http://localhost:3000](http://localhost:3000)

---

## Writing Posts

### Option 1: Use Decap CMS

1. Visit [http://localhost:3000/admin](http://localhost:3000/admin)
2. Log in with GitHub (OAuth or token)
3. Create/edit posts
4. Publish → Git commit → CI triggers deploy

### Option 2: Manually edit or create `.mdx` files in `/content/posts`

## Deployment Architecture

### 1. Jenkins Pipeline

Defined in `Jenkinsfile`, runs on push:

* Installs deps
* Builds site to `out/`
* Calls `deploy_blog.sh` to copy files to NGINX root
  * visudo permissions: `jenkins ALL=(ALL) NOPASSWD: /usr/local/bin/deploy_blog.sh`

### 2. NGINX Setup (Ubuntu)

Site config in `/etc/nginx/sites-available/intervolz.com`:

```nginx
server {
  listen 80;
  server_name intervolz.com www.intervolz.com;
  root /var/www/intervolz;
  index index.html;

  location / {
    try_files $uri $uri/ =404;
  }
}
```

Enable with:

```bash
sudo ln -s /etc/nginx/sites-available/intervolz.com /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 3. Cloudflare Tunnel

Exposes local port 80 securely without public IP.

Tunnel Config (`~/.cloudflared/config.yml`):

```yaml
tunnel: YOUR_TUNNEL_ID
credentials-file: /home/YOU/.cloudflared/YOUR_TUNNEL_ID.json

ingress:
  - hostname: intervolz.com
    service: http://localhost:80
  - service: http_status:404
```

One-time DNS Setup

```bash
cloudflared tunnel route dns intervolz-tunnel intervolz.com

```

Run at boot:

```bash
sudo cloudflared service install
sudo systemctl enable --now cloudflared
```

Check Status

```bash
sudo systemctl status cloudflared
```

---

## Build & Export

```bash
npm run build
```

Output is in `/out`. Jenkins uses this for deploy.

---

## References

* [Next.js Docs](https://nextjs.org/docs)
* [MDX Docs](https://mdxjs.com/)
* [Decap CMS](https://decapcms.org/docs/)
* [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)


## Earth

[NASA Image Links](https://visibleearth.nasa.gov/collection/1484/blue-marble)

