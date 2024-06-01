@@Title: Webhosting from Home
@@URL: webhosting-from-home
@@Date: 5/31/2024
@@TLDR: Setting up web hosting from a home computer to save costs and own your content
@@Tags: nodejs
@@WordCount: 400
@@ReadEstimate: 14

- [Webhosting from Home](#webhosting-from-home)
  - [Local Testing](#local-testing)
    - [Install Node.js](#install-nodejs)
    - [Serving a Website](#serving-a-website)
  - [Buy a Domain](#buy-a-domain)
    - [Cloudflare](#cloudflare)
    - [Update DNS Settings](#update-dns-settings)
      - [Quick Guide to AWS](#quick-guide-to-aws)
      - [Cloudflare Alias to homeserver](#cloudflare-alias-to-homeserver)
  - [Nginx Setup](#nginx-setup)
    - [Install Nginx on Ubuntu](#install-nginx-on-ubuntu)
    - [Directory Structure](#directory-structure)
    - [Nginx Configuration](#nginx-configuration)
    - [Install Nginx on Windows](#install-nginx-on-windows)
    - [Directory Structure](#directory-structure-1)
    - [Verify and Restart Nginx](#verify-and-restart-nginx)


# Webhosting from Home

Setting up a web server at home can be a rewarding experience. Not only does it give you complete control over your website, but it also offers a great way to learn about web technologies, server management, and networking. Let's walk through the steps to get your home web server up and running.

## Local Testing

Before deploying your website to the internet, it's crucial to test it locally. This ensures that everything works as expected in a controlled environment.

### Install Node.js

To serve your website locally, you'll need Node.js, a JavaScript runtime built on Chrome's V8 JavaScript engine. You can download and install Node.js from [the official website](https://nodejs.org/en).

> This can be achieved in many ways, if you're here for python `python3 -m http.server` does the same.

After installation, verify that Node.js and npm (Node Package Manager) are correctly installed by running the following commands in your terminal:

```sh
> node -v
v20.11.1
> npm -v
10.2.4
```

There's a handy package called `serve` I like to use. You can install it globally (for usage in any folder) like this:

```sh
npm install -g serve
```

### Serving a Website

Let's create a simple website and serve it locally.

1. Open your terminal and navigate to your documents directory:
```sh
cd ~/Documents
```

2. Create a new folder for your test site and navigate into it:
```sh
mkdir test_site
cd test_site
```

3. Open folder in file explorer:
4. 
```sh
# Powershell - open folder
start .
```

4. Create an `index.html` file in the `test_site` directory with the following content:

```html
<!DOCTYPE html>
<html lang="en">

<body>
    Hello!
</body>

</html>
```

Back in your terminal, make sure you're in the test_site directory:

```sh
serve
```

Read the output to find the local address (usually http://localhost:5000) and open it in your browser. You should see your "Hello!" message. Great job! Your local server is up and running.

Looks ready for primetime.

## Buy a Domain

To make your website accessible on the internet, you'll need a domain name. This is your website's address (e.g., your-site.com). Pick a domain name vendor. I recommend AWS and GoDaddy because I've used them and they are reputable.

### Cloudflare

Using Cloudflare can help manage your DNS settings and improve your site's performance and security. Here's how to set it up:
Sign Up and Add Your Site:

1. Go to Cloudflare and sign up for an account.
2. Once logged in, click on "Add a Site" and enter your domain name.
3. Cloudflare will provide you with `nameservers` you will need to update wherever you registered your `website name`

### Update DNS Settings

Next, you'll need to update your domain's DNS settings to point to Cloudflare:

1. Log in to your domain name vendor's website (e.g., AWS, GoDaddy).
2. Locate the DNS settings or nameserver settings for your domain.
3. Replace the existing nameservers with the nameservers provided by Cloudflare.
5. Save the changes.
   
#### Quick Guide to AWS

1. Register domain name with `Route53`
2. Wait for registration
3. Go to `Hosted Zones` and select your new domain name
4. Select the `NS` Record and `Edit Record`
5. Replace `Value` with nameservers from `Cloudflare`

#### Cloudflare Alias to homeserver

1. Log in to `Cloudflare`
2. Select new domain name > `DNS`
3. Add an `A` type record with name `@` and your IPv4 address
4. Add an `A` type record with name `www` and your IPv4 address

> Note: DNS propagation can take up to 24 hours. Once complete, your traffic will start routing through Cloudflare.



## Nginx Setup

This part skips into 2 sections. Windows Users need to scroll down a bit.

Nginx is a high-performance web server that can handle a large number of simultaneous connections. Let's install it!

### Install Nginx on Ubuntu

```sh
sudo apt update
sudo apt install nginx
sudo systemctl status nginx
sudo systemctl enable nginx
```

### Directory Structure

Nginx uses a directory structure to manage site configurations:
- sites-available: Contains configuration files for all available sites.
- sites-enabled: Contains symlinks to the configuration files in sites-available for the sites that are currently enabled.
  
Here's how it looks:
```sh
├── /etc/nginx/
│   ├── sites-available/
│   │   └── your-site.com
│   ├── sites-enabled/
│   │   └── your-site.com
```

To enable a site, you need to create a `symlink` from `sites-available` to `sites-enabled`. 

Here’s how to do it:

```sh
sudo ln -s /etc/nginx/sites-available/your-site.com /etc/nginx/sites-enabled/
```

### Nginx Configuration

Here’s an example of the Nginx configuration file for this website:


```sh
# sudo vim /etc/nginx/sites-available
server{
  listen 80;
  server_name your-site.com www.your-site.com

  root /var/ww/your-site.com/html;
  index index.html

  location /{
    try_files $uri $uri/ =404;
  }
}

```

Verify your changes and restart the nginx service

```sh
sudo nginx -t
sudo systemctl restart nginx
```

And that's a wrap! `Ubuntu finishes 1st`. Your home web server is now set up and ready to serve your website to the world. 


### Install Nginx on Windows


Download and Install the Stable version from: [Nginx](https://nginx.org/en/download.html)

Extract the downloaded `ZIP` file to a directory of your choice, for example, `C:\nginx`.

Open a Command Prompt as Administrator and navigate to the Nginx directory:

```sh
cd C:\nginx

# Start nginx
start nginx
```
After starting Nginx, you can verify the installation by opening your web browser and navigating to `http://localhost`. You should see the default Nginx welcome page, indicating that Nginx is running correctly.

### Directory Structure

Nginx on Windows uses a similar directory structure to manage site configurations. 

For this tutorial, we'll use the following structure:
- conf: Contains configuration files.
- html: The root directory for your website files.
  
Here's how it looks in the C:\nginx directory:

```sh
C:\nginx\
├── conf\
│   ├── nginx.conf
│   ├── sites-available\
│   │   └── your-site.com
│   ├── sites-enabled\
│   │   └── your-site.com
├── html\your-site.com
│   ├── index.html

```

To enable a site, create a symlink from sites-available to sites-enabled. On Windows, you can create a symlink using the mklink command.

1. Open a Command Prompt as Administrator.

Run the following command to create the symlink:
```sh
mklink C:\nginx\conf\sites-enabled\your-site.com.conf C:\nginx\conf\sites-available\your-site.com.conf
```

Here’s an example of the Nginx configuration file for your website

```sh
# C:\nginx\conf\sites-available\intervolz.com.conf

server {
    listen 80;
    server_name your-site.com www.your-site.com;

    root C:\nginx\html\your-site.com;
    index index.html;

    location / {
        try_files $uri /index.html;
    }
}

```

### Verify and Restart Nginx
After making changes, verify your configuration and restart the Nginx service. You can stop and start Nginx using the Command Prompt:


```sh
#  stop nginx
nginx -s stop

# start nginx
start nginx
```

And that's a wrap! Your home web server is now set up and ready to serve your website to the world. 

Stay tuned for more on adding Jenkins and setting up CI/CD pipelines!
