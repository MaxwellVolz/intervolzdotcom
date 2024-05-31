@@Title: Home Server Setup
@@URL: home-server-setup
@@Date: 5/25/2024
@@TLDR: Setting up a homeserver with Ubuntu 24, basic tooling, and hosting a website behind Cloudflare with Nginx
@@Tags: unix
@@WordCount: 151
@@ReadEstimate: 12

# Ubuntu Home Webserver

## What is it?

A home server for our websites! And hosting whatever we want! Free from the shackles (heh) of AWS. AWS is amazing. I just don't wanna pay...

We will be setting up a homeserver from scratch on an old box we have laying around.

Let's get to it.

## Install Ubuntu

### Download Ubuntu ISO:

Visit [Ubuntu Downloads](https://ubuntu.com/download).
Choose the version you want and download the ISO file.

### On Linux

Double check your volumes.

```sh
sudo dd bs=4M if=/path/to/ubuntu.iso of=/dev/sdX status=progress oflag=sync
```
Replace **/path/to/ubuntu.iso** with the path to the ISO file and **/dev/sdX** with the USB drive (be very careful with this command as it can overwrite data).

### On Windows & Mac

1. Use Rufus
2. Use Disk Partition

### Boot from USB Drive:

1. Insert the bootable USB drive into the computer where you want to install Ubuntu.
2. Restart the computer and enter the BIOS/UEFI settings (usually by pressing a key like F2, F12, DEL, or ESC during boot).
3. Change the boot order to prioritize the USB drive.
4. Save changes and exit.

## System Setup


### Google Chrome
```sh
sudo apt update

# chrome
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo dpkg -i google-chrome-stable_current_amd64.deb
sudo apt-get install -f
sudo apt update
sudo apt upgrade google-chrome-stable
```

### Git, zsh, oh my zsh

```sh
sudo apt install git
sudo apt update

sudo apt install zsh
chsh -s $(which zsh)

# open zsh
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

```

## Serving a Website

### Cloudflare

Sign Up and Add Your Site:

1. Go to Cloudflare and sign up for an account.
2. Once logged in, click on "Add a Site" and enter your domain name.
3. Cloudflare will provide you with `nameservers` you will need to update wherever you registered your `website name`

### DNS

1. Locate the DNS settings or nameserver settings.
2. Replace the existing nameservers with the nameservers provided by Cloudflare or your hosting provider.
3.Save the changes.

> DNS propagation can take up to 24 hours. Once complete, your traffic will start routing through Cloudflare.

### Nginx Setup

- sites-available: This directory contains configuration files for all available sites.
- sites-enabled: This directory contains symlinks to the configuration files in sites-available for the sites that are currently enabled.

```sh
├── /etc/nginx/
│   ├── sites-available/
│   │   └── intervolz.com
│   ├── sites-enabled/
│   │   └── intervolz.com
```

To enable a site, you need to create a `symlink` from `sites-available` to `sites-enabled`. 

Here’s how to do it:

``sh
sudo ln -s /etc/nginx/sites-available/intervolz.com /etc/nginx/sites-enabled/
```

Here’s an example of the Nginx configuration file for this website, including a reverse proxy for Jenkins:

```sh
# sudo vim /etc/nginx/sites-available
server{
  listen 80;
  server_name intervolz.com www.intervolz.com

  root /var/ww/intervolz.com/html;
  index index.html

  location /{
    try_files $uri $uri/ =404;
  }

  # Jenkins
  location /jenkins {
    proxy_pass http://localhost:8080;
    ...
  }
}

```

Verify your changes and restart the nginx service

```sh
sudo nginx -t
sudo systemctl restart nginx
```

That's a wrap! Check back for more on adding Jenkins and CI/CD!
